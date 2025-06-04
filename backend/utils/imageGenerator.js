const sharp = require('sharp');

class ImageGenerator {
  static async createThumbnail(canvasData) {
    try {
      // Create a simple colored rectangle as thumbnail
      const { width = 200, height = 150 } = canvasData;
      
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#666">
            Canvas Preview
          </text>
        </svg>
      `;
      
      const buffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
      
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  static async generatePreview(elements, width = 400, height = 300) {
    try {
      // Generate SVG from canvas elements
      let svgElements = '';
      
      elements.forEach(element => {
        switch (element.type) {
          case 'rectangle':
            svgElements += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.fill || '#000'}" stroke="${element.stroke || 'none'}"/>`;
            break;
          case 'circle':
            svgElements += `<circle cx="${element.x}" cy="${element.y}" r="${element.radius || 50}" fill="${element.fill || '#000'}" stroke="${element.stroke || 'none'}"/>`;
            break;
          case 'text':
            svgElements += `<text x="${element.x}" y="${element.y}" font-size="${element.fontSize || 16}" fill="${element.fill || '#000'}">${element.text || ''}</text>`;
            break;
        }
      });

      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="white"/>
          ${svgElements}
        </svg>
      `;

      const buffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();

      return buffer.toString('base64');
    } catch (error) {
      console.error('Error generating preview:', error);
      return null;
    }
  }
}

module.exports = ImageGenerator;
