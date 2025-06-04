/**
 * Triggers a file download
 * @param {Blob|string} content - File content
 * @param {string} fileName - Download filename
 * @param {string} [mimeType] - MIME type
 */
export const downloadFile = (content, fileName, mimeType = 'application/octet-stream') => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Optimizes PDF download by checking size and potentially compressing
 * @param {Blob} pdfBlob - Original PDF blob
 * @returns {Promise<Blob>} Optimized PDF blob
 */
export const optimizePDF = async (pdfBlob) => {
  // In a real app, you might want to do client-side optimization here
  // For now, we'll just return the original blob
  return pdfBlob;
};