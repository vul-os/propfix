import React, { useState, useEffect, useRef } from 'react';
import * as PDFJS from 'pdfjs-dist/webpack';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

PDFJS.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';

const ElementTypes = {
  RECTANGLE: 'rectangle',
  TEXT: 'text',
};

// DraggableText component
const DraggableText = ({ text, position, size, index, updateElementPosition, onSelect, isSelected }) => {
    const [, drag] = useDrag({
      type: ElementTypes.TEXT,
      item: { index },
    });
  
    const handleMouseDown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect();
    };
  
    const handleMouseMove = (e) => {
      if (isSelected) {
        if (e.ctrlKey) {
          // Resize the element if Ctrl key is pressed
          const newSize = {
            width: size.width + e.movementX,
            height: size.height + e.movementY,
          };
          updateElementPosition(index, position, newSize);
        } else {
          // Move the element if Ctrl key is not pressed
          const newPosition = {
            x: position.x + e.movementX,
            y: position.y + e.movementY,
          };
          updateElementPosition(index, newPosition, size);
        }
      }
    };
  
    const handleMouseUp = () => {
      // Deselect the element when the mouse button is released
      onSelect(null);
    };
  
    return (
      <div
        role="button"
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => handleMouseMove(e)} // Pass the event object to handleMouseMove
        onMouseUp={handleMouseUp}
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: size?.width,
          height: size?.height,
          cursor: isSelected ? (1 ? 'nwse-resize' : 'move') : 'pointer',
          border: isSelected ? '2px solid blue' : 'none',
          outline: 'none',
        }}
      >
        {text}
      </div>
    );
  };
  

const PDFViewer = ({ pdfData }) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  const [isRendering, setIsRendering] = useState(false);
  const [addingText, setAddingText] = useState(false);
  const canvasRef = useRef(null);

  const renderPage = (num) => {
    if (!pdfDoc || isRendering) return;

    pdfDoc.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      setIsRendering(true);
      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        setIsRendering(false);
        // Render elements on top of the PDF page
        elements?.forEach((element) => {
          switch (element.type) {
            case 'text':
              context.font = `${element.fontSize}px Arial`; // Modify font as needed
              context.fillStyle = 'black';
              context.fillText(
                element.content,
                element.position.x,
                element.position.y
              );
              break;
            case 'rectangle':
              context.fillStyle = 'red';
              context.fillRect(
                element.position.x,
                element.position.y,
                element.width,
                element.height
              );
              break;
            default:
              break;
          }
        });
      });
    });
  };

  useEffect(() => {
    if (!pdfData) return;

    const clonedBuffer = pdfData.slice(0);
    const loadingTask = PDFJS.getDocument({ data: clonedBuffer });

    loadingTask.promise.then((pdf) => {
      setPdfDoc(pdf);
      renderPage(1);
    });
  }, [pdfData]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum);
    }
  }, [pageNum, pdfDoc, elements]);

  const handleCanvasClick = (e) => {
    // Handle click to add text element
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    // Check if the "Add Text" button was clicked
    if (addingText) {
      addTextElement({
        type: ElementTypes.TEXT,
        content: 'New Text',
        position: { x, y },
      });
    }
  };

  const addTextElement = (newTextElement) => {
    // Create a copy of the existing elements array and add the new text element to it
    const updatedElements = [...elements, newTextElement];

    // Update the state with the new elements array
    setElements(updatedElements);
  };

  const handleElementSelect = (index) => {
    // Handle selecting an element for resizing and moving
    setSelectedElement(index);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{ cursor: addingText ? 'crosshair' : 'auto' }}
        />
        <div>
          <button
            onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
            disabled={pageNum <= 1}
          >
            Previous
          </button>
          <span>
            Page: {pageNum} / {pdfDoc?.numPages}
          </span>
          <button
            onClick={() =>
              setPageNum((prev) => Math.min(prev + 1, pdfDoc?.numPages))
            }
            disabled={pageNum >= pdfDoc?.numPages}
          >
            Next
          </button>
          <button onClick={() => setAddingText(!addingText)}>
            {addingText ? 'Cancel Adding Text' : 'Add Text'}
          </button>
        </div>
        <div>
          {/* Render draggable text elements */}
          {elements && elements?.map((element, index) => (
            <DraggableText
              key={index}
              text={element.content}
              position={element.position}
              index={index}
              updateElementPosition={handleElementSelect}
              onSelect={() => handleElementSelect(index)} // Select element on click
              isSelected={selectedElement === index}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default PDFViewer;
