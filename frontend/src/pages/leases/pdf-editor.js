import React, { useState, useEffect } from 'react';
import PDFViewer from './pdf-viewer';

const PDFAreaEditor = () => {
  const pdfUrl = 'https://storage.googleapis.com/exo-public-bucket/LEASE-AGREEMENT-RESIDENTIAL-October-2019.pdf';
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    fetch(pdfUrl)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const uint8Array = new Uint8Array(buffer);
        setPdfData(uint8Array);
      })
      .catch((error) => {
        console.error('There was an error fetching the PDF', error);
      });
  }, [pdfUrl]);

  return (
    <div>
      <h1>PDF Area Editor</h1>
      <PDFViewer pdfData={pdfData} />
    </div>
  );
};

export default PDFAreaEditor;
