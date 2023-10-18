import React, { useState, useEffect, useRef } from 'react';
import * as PDFJS from 'pdfjs-dist/webpack';

PDFJS.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';

const PDFViewer = ({ pdfData, elements }) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef(null);

  const renderPage = num => {
    if (!pdfDoc || isRendering) return;

    pdfDoc.getPage(num).then(page => {
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
        const img = new Image();

        // Render elements on top of the PDF
        elements.forEach(element => {
          switch (element.type) {
            case 'text':
              context.fillText(element.content, element.position.x, element.position.y);
              break;
            case 'image':
              img.src = element.content;
              img.onload = () => {
                context.drawImage(img, element.position.x, element.position.y);
              };
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

    loadingTask.promise.then(pdf => {
      setPdfDoc(pdf);
      renderPage(1);
    });
  }, [pdfData]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum);
    }
  }, [pageNum, pdfDoc, elements]);  // Added elements to dependency array

  return (
    <div>
      <canvas ref={canvasRef} />
      <div>
        <button onClick={() => setPageNum(prev => Math.max(prev - 1, 1))} disabled={pageNum <= 1}>
          Previous
        </button>
        <span>Page: {pageNum} / {pdfDoc?.numPages}</span>
        <button onClick={() => setPageNum(prev => Math.min(prev + 1, pdfDoc?.numPages))} disabled={pageNum >= pdfDoc?.numPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
