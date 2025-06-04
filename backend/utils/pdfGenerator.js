const PDFDocument = require('pdfkit');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF from canvas elements with optimization
 * @param {Array} elements - Array of canvas elements
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateOptimizedPDF = async (elements, width, height) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({
        size: [width, height],
        margin: 0,
        compress: true  // Enable compression
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Create a canvas to render elements
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      // Render elements
      elements.forEach(element => {
        switch (element.type) {
          case 'rectangle':
            ctx.fillStyle = element.color;
            ctx.fillRect(element.x, element.y, element.width, element.height);
            break;
          case 'circle':
            ctx.beginPath();
            ctx.fillStyle = element.color;
            ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'text':
            ctx.font = `${element.size}px ${element.font || 'Arial'}`;
            ctx.fillStyle = element.color;
            ctx.fillText(element.text, element.x, element.y);
            break;
          case 'image':
            // Note: Image handling is done in the controller with sharp optimization
            break;
        }
      });

      // Add canvas to PDF
      const imageData = canvas.toDataURL('image/jpeg', 0.8); // 80% quality for optimization
      doc.image(imageData, 0, 0, { width, height });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateOptimizedPDF
};