import React, { useState, useEffect } from 'react';
import { fileToDataURL } from '../utils/canvasHelpers';

function CanvasPreview({ elements, width, height, backgroundColor }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scale = 0.3; // Scale down for preview
  const previewWidth = width * scale;
  const previewHeight = height * scale;

  useEffect(() => {
    renderPreview();
  }, [elements, width, height, backgroundColor]);

  const renderPreview = async () => {
    setIsLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Render elements
      for (const element of elements) {
        await renderElement(ctx, element);
      }

      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.8));
    } catch (error) {
      console.error('Error rendering preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderElement = async (ctx, element) => {
    switch (element.type) {
      case 'rectangle':
        ctx.fillStyle = element.color;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        if (element.borderWidth > 0) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = element.borderWidth;
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;

      case 'circle':
        ctx.beginPath();
        ctx.fillStyle = element.color;
        ctx.arc(element.x + element.radius, element.y + element.radius, element.radius, 0, Math.PI * 2);
        ctx.fill();
        if (element.borderWidth > 0) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = element.borderWidth;
          ctx.stroke();
        }
        break;

      case 'text':
        ctx.font = `${element.size}px ${element.font}`;
        ctx.fillStyle = element.color;
        ctx.fillText(element.text, element.x, element.y + element.size, element.maxWidth);
        break;

      case 'image':
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          if (element.file) {
            img.src = await fileToDataURL(element.file);
          } else if (element.src || element.imagePath) {
            img.src = element.src || element.imagePath;
          }

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(reject, 5000); // 5 second timeout
          });

          ctx.drawImage(
            img,
            element.x,
            element.y,
            element.width || img.width,
            element.height || img.height
          );
        } catch (error) {
          console.error('Error rendering image:', error);
          // Draw placeholder rectangle
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(element.x, element.y, element.width || 100, element.height || 100);
          ctx.fillStyle = '#666';
          ctx.font = '12px Arial';
          ctx.fillText('Image Error', element.x + 5, element.y + 20);
        }
        break;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Canvas Preview</h3>
      <div
        className="preview-container border-2 border-gray-200 rounded-lg overflow-hidden"
        style={{
          width: `${previewWidth}px`,
          height: `${previewHeight}px`,
          backgroundColor: backgroundColor || '#FFFFFF',
          minWidth: '200px',
          minHeight: '150px'
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="Canvas Preview"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No preview available</p>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Preview (30% scale)
      </div>
    </div>
  );
}

export default CanvasPreview;
