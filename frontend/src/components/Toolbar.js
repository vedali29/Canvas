import React from 'react';

function Toolbar({ 
  activeTool, 
  setActiveTool, 
  canvas, 
  setCanvas, 
  initializeCanvas,
  exportPDF,
  setBackgroundColor,
  backgroundColor
}) {
  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setCanvas({
      ...canvas,
      [name]: parseInt(value) || 0
    });
  };

  const handleBackgroundChange = (e) => {
    setBackgroundColor(e.target.value);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Canvas Settings</h3>
        <div className="dimension-controls">
          <label>
            Width:
            <input
              type="number"
              name="width"
              value={canvas.width}
              onChange={handleDimensionChange}
              min="100"
              max="2000"
            />
          </label>
          <label>
            Height:
            <input
              type="number"
              name="height"
              value={canvas.height}
              onChange={handleDimensionChange}
              min="100"
              max="2000"
            />
          </label>
          <label>
            Background:
            <input
              type="color"
              value={backgroundColor}
              onChange={handleBackgroundChange}
            />
          </label>
          <button onClick={initializeCanvas}>Apply</button>
        </div>
      </div>
      
      <div className="toolbar-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          <button
            className={activeTool === 'rectangle' ? 'active' : ''}
            onClick={() => setActiveTool('rectangle')}
          >
            Rectangle
          </button>
          <button
            className={activeTool === 'circle' ? 'active' : ''}
            onClick={() => setActiveTool('circle')}
          >
            Circle
          </button>
          <button
            className={activeTool === 'text' ? 'active' : ''}
            onClick={() => setActiveTool('text')}
          >
            Text
          </button>
          <button
            className={activeTool === 'image' ? 'active' : ''}
            onClick={() => setActiveTool('image')}
          >
            Image
          </button>
        </div>
      </div>
      
      <div className="toolbar-section">
        <button className="export-button" onClick={exportPDF}>
          Export PDF
        </button>
      </div>
    </div>
  );
}

export default Toolbar;