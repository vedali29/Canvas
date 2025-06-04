import React, { useState } from 'react';

function SelectedElementControls({
  element,
  updateElement,
  deleteElement,    // Make sure this prop is correctly passed from parent!
  onDeselect,
  isLoading
}) {
  const [localElement, setLocalElement] = useState(element);

  const handleUpdate = async (field, value) => {
    const updatedElement = { ...localElement, [field]: value };
    setLocalElement(updatedElement);

    try {
      await updateElement(element.id, { [field]: value });
    } catch (error) {
      console.error('Error updating element:', error);
      // Revert local state on error
      setLocalElement(element);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this element?')) {
      try {
        await deleteElement(element.id);
        if (onDeselect) onDeselect();
      } catch (error) {
        console.error('Error deleting element:', error);
        alert('Error deleting element: ' + error.message);
      }
    }
  };

  if (!element) return null;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900 capitalize">{element.type} Element</h4>
        <button
          onClick={onDeselect}
          className="text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Position Controls */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X</label>
            <input
              type="number"
              value={localElement.x || 0}
              onChange={(e) => handleUpdate('x', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y</label>
            <input
              type="number"
              value={localElement.y || 0}
              onChange={(e) => handleUpdate('y', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Size Controls */}
      {(element.type === 'rectangle' || element.type === 'image') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Width</label>
              <input
                type="number"
                value={localElement.width || 100}
                onChange={(e) => handleUpdate('width', parseInt(e.target.value) || 100)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height</label>
              <input
                type="number"
                value={localElement.height || 100}
                onChange={(e) => handleUpdate('height', parseInt(e.target.value) || 100)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Circle Radius */}
      {element.type === 'circle' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Radius</label>
          <input
            type="number"
            value={localElement.radius || 50}
            onChange={(e) => handleUpdate('radius', parseInt(e.target.value) || 50)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            min="1"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Text Content */}
      {element.type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
          <textarea
            value={localElement.text || ''}
            onChange={(e) => handleUpdate('text', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            rows="3"
            disabled={isLoading}
          />
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Font Size</label>
            <input
              type="number"
              value={localElement.size || 16}
              onChange={(e) => handleUpdate('size', parseInt(e.target.value) || 16)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="8"
              max="72"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Color Controls */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {element.type === 'text' ? 'Text Color' : 'Fill Color'}
        </label>
        <div className="flex space-x-2">
          <input
            type="color"
            value={localElement.color || localElement.fillColor || '#000000'}
            onChange={(e) => handleUpdate(element.type === 'text' ? 'color' : 'fillColor', e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            disabled={isLoading}
          />
          <input
            type="text"
            value={localElement.color || localElement.fillColor || '#000000'}
            onChange={(e) => handleUpdate(element.type === 'text' ? 'color' : 'fillColor', e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="#000000"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
      >
        <i className="fas fa-trash mr-2"></i>Delete Element
      </button>
    </div>
  );
}

export default SelectedElementControls;