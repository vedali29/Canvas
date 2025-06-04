import React, { useState } from 'react';

function ElementForm({ activeTool, addElement, canvasWidth, canvasHeight, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    radius: 50,
    color: '#000000',
    fillColor: '#000000',
    borderColor: '#000000',
    borderWidth: 0,
    text: 'Sample Text',
    size: 16,
    font: 'Arial, sans-serif',
    file: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const elementData = {
        type: activeTool,
        ...formData
      };

      // Ensure position is within canvas bounds
      elementData.x = Math.max(0, Math.min(canvasWidth - (elementData.width || 100), elementData.x));
      elementData.y = Math.max(0, Math.min(canvasHeight - (elementData.height || 100), elementData.y));

      await addElement(elementData);
      
      // Reset form
      setFormData({
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        radius: 50,
        color: '#000000',
        fillColor: '#000000',
        borderColor: '#000000',
        borderWidth: 0,
        text: 'Sample Text',
        size: 16,
        font: 'Arial, sans-serif',
        file: null
      });
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X</label>
            <input
              type="number"
              value={formData.x}
              onChange={(e) => handleInputChange('x', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="0"
              max={canvasWidth}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y</label>
            <input
              type="number"
              value={formData.y}
              onChange={(e) => handleInputChange('y', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="0"
              max={canvasHeight}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Rectangle/Image specific fields */}
      {(activeTool === 'rectangle' || activeTool === 'image') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Width</label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 100)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 100)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Circle specific fields */}
      {activeTool === 'circle' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Radius</label>
          <input
            type="number"
            value={formData.radius}
            onChange={(e) => handleInputChange('radius', parseInt(e.target.value) || 50)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            min="1"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Text specific fields */}
      {activeTool === 'text' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
            <textarea
              value={formData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              rows="3"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <input
              type="number"
              value={formData.size}
              onChange={(e) => handleInputChange('size', parseInt(e.target.value) || 16)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="8"
              max="72"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
            <select
              value={formData.font}
              onChange={(e) => handleInputChange('font', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Courier New, monospace">Courier New</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Verdana, sans-serif">Verdana</option>
            </select>
          </div>
        </>
      )}

      {/* Image specific fields */}
      {activeTool === 'image' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image File</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            disabled={isLoading}
          />
          {formData.file && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.file.name}
            </p>
          )}
        </div>
      )}

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {activeTool === 'text' ? 'Text Color' : 'Fill Color'}
        </label>
        <div className="flex space-x-2">
          <input
            type="color"
            value={activeTool === 'text' ? formData.color : formData.fillColor}
            onChange={(e) => handleInputChange(activeTool === 'text' ? 'color' : 'fillColor', e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            disabled={isLoading}
          />
          <input
            type="text"
            value={activeTool === 'text' ? formData.color : formData.fillColor}
            onChange={(e) => handleInputChange(activeTool === 'text' ? 'color' : 'fillColor', e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="#000000"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Border (for shapes) */}
      {(activeTool === 'rectangle' || activeTool === 'circle') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Border Width</label>
            <input
              type="number"
              value={formData.borderWidth}
              onChange={(e) => handleInputChange('borderWidth', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="0"
              max="20"
              disabled={isLoading}
            />
          </div>
          {formData.borderWidth > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={formData.borderColor}
                  onChange={(e) => handleInputChange('borderColor', e.target.value)}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  value={formData.borderColor}
                  onChange={(e) => handleInputChange('borderColor', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="#000000"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Form Actions */}
      <div className="flex space-x-2 pt-4">
        <button
          type="submit"
          disabled={isLoading || (activeTool === 'image' && !formData.file)}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Adding...
            </>
          ) : (
            <>
              <i className="fas fa-plus mr-2"></i>
              Add {activeTool}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {/* Validation Messages */}
      {activeTool === 'image' && !formData.file && (
        <p className="text-xs text-red-500 mt-1">
          Please select an image file to continue.
        </p>
      )}
    </form>
  );
}

export default ElementForm;
