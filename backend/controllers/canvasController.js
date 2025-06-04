const Canvas = require('../models/Canvas');
const Element = require('../models/Element');
const path = require('path');
const fs = require('fs').promises;
const { createCanvas, loadImage } = require('canvas');
const PDFDocument = require('pdfkit');

// Initialize canvas
const initializeCanvas = async (req, res) => {
  try {
    const { width = 800, height = 600, backgroundColor = '#FFFFFF' } = req.body;

    let canvas = await Canvas.findOne();
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      canvas.backgroundColor = backgroundColor;
      await canvas.save();
    } else {
      canvas = new Canvas({
        width,
        height,
        backgroundColor,
        elements: []
      });
      await canvas.save();
    }

    res.json({ success: true, canvas });
  } catch (error) {
    console.error('Error initializing canvas:', error);
    res.status(500).json({ error: 'Failed to initialize canvas' });
  }
};

// Get canvas state
const getCanvasState = async (req, res) => {
  try {
    let canvas = await Canvas.findOne().populate('elements');
    if (!canvas) {
      canvas = new Canvas({
        width: 800,
        height: 600,
        backgroundColor: '#FFFFFF',
        elements: []
      });
      await canvas.save();
    }

    res.json(canvas);
  } catch (error) {
    console.error('Error getting canvas state:', error);
    res.status(500).json({ error: 'Failed to get canvas state' });
  }
};

// Add rectangle
const addRectangle = async (req, res) => {
  try {
    const { x = 0, y = 0, width = 100, height = 100, color = '#000000', fillColor, borderColor, borderWidth = 0 } = req.body;

    const element = new Element({
      type: 'rectangle',
      x,
      y,
      width,
      height,
      color,
      fillColor: fillColor || color,
      borderColor,
      borderWidth
    });

    await element.save();

    let canvas = await Canvas.findOne();
    if (!canvas) {
      canvas = new Canvas({ elements: [] });
    }
    canvas.elements.push(element._id);
    await canvas.save();

    res.json({ success: true, element });
  } catch (error) {
    console.error('Error adding rectangle:', error);
    res.status(500).json({ error: 'Failed to add rectangle' });
  }
};

// Add circle
const addCircle = async (req, res) => {
  try {
    const { x = 0, y = 0, radius = 50, color = '#000000', fillColor, borderColor, borderWidth = 0 } = req.body;

    const element = new Element({
      type: 'circle',
      x,
      y,
      radius,
      color,
      fillColor: fillColor || color,
      borderColor,
      borderWidth
    });

    await element.save();

    let canvas = await Canvas.findOne();
    if (!canvas) {
      canvas = new Canvas({ elements: [] });
    }
    canvas.elements.push(element._id);
    await canvas.save();

    res.json({ success: true, element });
  } catch (error) {
    console.error('Error adding circle:', error);
    res.status(500).json({ error: 'Failed to add circle' });
  }
};

// Add text
const addText = async (req, res) => {
  try {
    const { x = 0, y = 0, text = 'Sample Text', size = 16, color = '#000000', font = 'Arial' } = req.body;

    const element = new Element({
      type: 'text',
      x,
      y,
      text,
      size,
      color,
      font
    });

    await element.save();

    let canvas = await Canvas.findOne();
    if (!canvas) {
      canvas = new Canvas({ elements: [] });
    }
    canvas.elements.push(element._id);
    await canvas.save();

    res.json({ success: true, element });
  } catch (error) {
    console.error('Error adding text:', error);
    res.status(500).json({ error: 'Failed to add text' });
  }
};

// Add image
const addImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { x = 0, y = 0, width = 100, height = 100 } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const element = new Element({
      type: 'image',
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
      src: imageUrl,
      url: imageUrl
    });

    await element.save();

    let canvas = await Canvas.findOne();
    if (!canvas) {
      canvas = new Canvas({ elements: [] });
    }
    canvas.elements.push(element._id);
    await canvas.save();

    res.json({ success: true, element });
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
};

// Update element
const updateElement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const element = await Element.findByIdAndUpdate(id, updates, { new: true });
    if (!element) {
      return res.status(404).json({ error: 'Element not found' });
    }

    res.json({ success: true, element });
  } catch (error) {
    console.error('Error updating element:', error);
    res.status(500).json({ error: 'Failed to update element' });
  }
};

// Delete element
const deleteElement = async (req, res) => {
  try {
    const { id } = req.params;

    const element = await Element.findByIdAndDelete(id);
    if (!element) {
      return res.status(404).json({ error: 'Element not found' });
    }

    // Remove from canvas
    const canvas = await Canvas.findOne();
    if (canvas) {
      canvas.elements = canvas.elements.filter(elementId => elementId.toString() !== id);
      await canvas.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting element:', error);
    res.status(500).json({ error: 'Failed to delete element' });
  }
};

// Clear canvas
const clearCanvas = async (req, res) => {
  try {
    // Delete all elements
    await Element.deleteMany({});

    // Clear canvas elements array
    const canvas = await Canvas.findOne();
    if (canvas) {
      canvas.elements = [];
      await canvas.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing canvas:', error);
    res.status(500).json({ error: 'Failed to clear canvas' });
  }
};

// Export to PDF
const exportToPDF = async (req, res) => {
  try {
    const canvas = await Canvas.findOne().populate('elements');
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }

    const doc = new PDFDocument({
      size: [canvas.width, canvas.height]
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=canvas-export.pdf');

    doc.pipe(res);

    // Set background color
    if (canvas.backgroundColor && canvas.backgroundColor !== '#FFFFFF') {
      doc.rect(0, 0, canvas.width, canvas.height)
         .fill(canvas.backgroundColor);
    }

    // Add elements to PDF
    for (const element of canvas.elements) {
      try {
        switch (element.type) {
          case 'rectangle':
            doc.rect(element.x, element.y, element.width, element.height)
               .fill(element.fillColor || element.color);
            if (element.borderWidth > 0) {
              doc.rect(element.x, element.y, element.width, element.height)
                 .stroke(element.borderColor || '#000000');
            }
            break;

          case 'circle':
            doc.circle(element.x + element.radius, element.y + element.radius, element.radius)
               .fill(element.fillColor || element.color);
            if (element.borderWidth > 0) {
              doc.circle(element.x + element.radius, element.y + element.radius, element.radius)
                 .stroke(element.borderColor || '#000000');
            }
            break;

          case 'text':
            doc.fillColor(element.color || '#000000')
               .fontSize(element.size || 16)
               .text(element.text || '', element.x, element.y);
            break;

          case 'image':
            if (element.src && element.src.startsWith('/uploads/')) {
              const imagePath = path.join(__dirname, '..', 'uploads', path.basename(element.src));
              try {
                await fs.access(imagePath);
                doc.image(imagePath, element.x, element.y, {
                  width: element.width,
                  height: element.height
                });
              } catch (err) {
                console.error('Image not found:', imagePath);
              }
            }
            break;
        }
      } catch (err) {
        console.error('Error adding element to PDF:', err);
      }
    }

    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
};

// Export to image
const exportToImage = async (req, res) => {
  try {
    const { format = 'png' } = req.params;
    const canvas = await Canvas.findOne().populate('elements');

    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }

    const canvasNode = createCanvas(canvas.width, canvas.height);
    const ctx = canvasNode.getContext('2d');

    // Set background
    ctx.fillStyle = canvas.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render elements
    for (const element of canvas.elements) {
      try {
        switch (element.type) {
          case 'rectangle':
            ctx.fillStyle = element.fillColor || element.color || '#000000';
            ctx.fillRect(element.x, element.y, element.width, element.height);
            if (element.borderWidth > 0) {
              ctx.strokeStyle = element.borderColor || '#000000';
              ctx.lineWidth = element.borderWidth;
              ctx.strokeRect(element.x, element.y, element.width, element.height);
            }
            break;

          case 'circle':
            ctx.beginPath();
            ctx.arc(element.x + element.radius, element.y + element.radius, element.radius, 0, 2 * Math.PI);
            ctx.fillStyle = element.fillColor || element.color || '#000000';
            ctx.fill();
            if (element.borderWidth > 0) {
              ctx.strokeStyle = element.borderColor || '#000000';
              ctx.lineWidth = element.borderWidth;
              ctx.stroke();
            }
            break;

          case 'text':
            ctx.fillStyle = element.color || '#000000';
            ctx.font = `${element.size || 16}px ${element.font || 'Arial'}`;
            ctx.fillText(element.text || '', element.x, element.y + (element.size || 16));
            break;

          case 'image':
            if (element.src && element.src.startsWith('/uploads/')) {
              const imagePath = path.join(__dirname, '..', 'uploads', path.basename(element.src));
              try {
                const image = await loadImage(imagePath);
                ctx.drawImage(image, element.x, element.y, element.width, element.height);
              } catch (err) {
                console.error('Error loading image:', err);
              }
            }
            break;
        }
      } catch (err) {
        console.error('Error rendering element:', err);
      }
    }

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const buffer = canvasNode.toBuffer(mimeType);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=canvas-export.${format}`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting image:', error);
    res.status(500).json({ error: 'Failed to export image' });
  }
};

module.exports = {
  initializeCanvas,
  getCanvasState,
  addRectangle,
  addCircle,
  addText,
  addImage,
  updateElement,
  deleteElement,
  clearCanvas,
  exportToPDF,
  exportToImage,
};