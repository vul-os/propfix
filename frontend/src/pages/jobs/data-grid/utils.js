import * as XLSX from 'xlsx-style'; // Import xlsx-style library

// Helper function to convert an array to a comma-separated string
const arrayToString = (arr) => {
  return arr.join(', '); // Customize the delimiter as needed
};

export const exportToCSV = (dataToExport, fileName) => {
  // Convert arrays in the data to strings
  const dataWithArraysConverted = dataToExport.map((item) => ({
    ...item,
    // Convert specific properties containing arrays to strings
    propertyWithArray: Array.isArray(item.propertyWithArray)
      ? arrayToString(item.propertyWithArray)
      : item.propertyWithArray,
    // Add more properties as needed
  }));

  // Create a worksheet
  const ws = XLSX.utils.json_to_sheet(dataWithArraysConverted);

  // Generate a CSV string from the worksheet
  const csvData = XLSX.utils.sheet_to_csv(ws);

  // Create a Blob containing the CSV data
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
};

export const exportToExcel = (dataToExport, fileName) => {
  // Convert arrays in the data to strings
  const dataWithArraysConverted = dataToExport.map((item) => ({
    ...item,
    // Convert specific properties containing arrays to strings
    propertyWithArray: Array.isArray(item.propertyWithArray)
      ? arrayToString(item.propertyWithArray)
      : item.propertyWithArray,
    // Add more properties as needed
  }));

  // Create a worksheet
  const ws = XLSX.utils.json_to_sheet(dataWithArraysConverted);

  // Create a workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Generate a blob containing the Excel data (using xlsx-style)
  const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'blob' });

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xlsx`;
  link.click();
};
