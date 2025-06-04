const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Processes and optimizes an image file
 * @param {string} filePath - Path to the original image
 * @param {number} [width] - Optional width
 * @param {number} [height] - Optional height
 * @returns {Promise<Buffer>} Optimized image buffer
 */
const processImage = async (filePath, width, height) => {
  try {
    const optimizedImage = await sharp(filePath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        mozjpeg: true
      })
      .toBuffer();

    return optimizedImage;
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
};

/**
 * Deletes temporary files
 * @param {Array<string>} filePaths - Array of file paths to delete
 */
const cleanupFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Error deleting file:', filePath, err);
    }
  });
};

module.exports = {
  processImage,
  cleanupFiles
};