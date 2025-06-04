import React, { useState, useEffect, useRef, useCallback } from "react";
import * as canvasAPI from "../utils/canvasAPI";
import { downloadFile } from "../utils/canvasHelpers";
import SelectedElementControls from "./SelectedElementControls";
import ElementForm from "./ElementForm";
import ErrorBoundary from "./ErrorBoundary";

function CanvasEditor() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState({ width: 800, height: 600 });
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback((error, context) => {
    console.error(`Error in ${context}:`, error);
    setError({ message: error.message, context });
    setTimeout(() => setError(null), 5000);
  }, []);

  const loadCanvasState = useCallback(async () => {
    try {
      const state = await canvasAPI.getCanvasState();
      setElements(Array.isArray(state.elements) ? state.elements : []);
      if (state.backgroundColor) {
        setBackgroundColor(state.backgroundColor);
      }
    } catch (error) {
      handleError(error, "loading canvas state");
      setElements([]);
    }
  }, [handleError]);

  const initializeCanvas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await canvasAPI.initializeCanvas(
        canvas.width,
        canvas.height,
        backgroundColor
      );
      await loadCanvasState();
    } catch (error) {
      handleError(error, "initializing canvas");
    } finally {
      setIsLoading(false);
    }
  }, [
    canvas.width,
    canvas.height,
    backgroundColor,
    loadCanvasState,
    handleError
  ]);

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  useEffect(() => {
    if (canvas.width && canvas.height) {
      loadCanvasState();
    }
  }, [canvas, loadCanvasState]);

  const addElement = async (elementData) => {
    if (!elementData || !elementData.type) {
      handleError(new Error("Invalid element data"), "adding element");
      return;
    }

    setIsLoading(true);
    try {
      let response;
      switch (elementData.type) {
        case "rectangle":
          response = await canvasAPI.addRectangle(elementData);
          break;
        case "circle":
          response = await canvasAPI.addCircle(elementData);
          break;
        case "text":
          response = await canvasAPI.addText(elementData);
          break;
        case "image":
          if (!elementData.file) {
            throw new Error("Image file is required");
          }
          response = await canvasAPI.addImage(elementData, elementData.file);
          break;
        default:
          throw new Error(`Unknown element type: ${elementData.type}`);
      }

      if (response && (response.id || response.element)) {
        await loadCanvasState();
        setActiveTool(null);
      }
    } catch (error) {
      handleError(error, "adding element");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteElement = async (elementId) => {
    if (!elementId) {
      handleError(new Error("Element ID is required"), "deleting element");
      return;
    }

    try {
      await canvasAPI.deleteElement(elementId);
      await loadCanvasState();
      setSelectedElement(null);
    } catch (error) {
      handleError(error, "deleting element");
    }
  };

  const updateElement = async (elementId, updates) => {
    if (!elementId || !updates) {
      handleError(
        new Error("Element ID and updates are required"),
        "updating element"
      );
      return;
    }

    try {
      await canvasAPI.updateElement(elementId, updates);
      await loadCanvasState();
    } catch (error) {
      handleError(error, "updating element");
    }
  };

  const handleCanvasClick = (e) => {
    if (isDragging || isResizing) return;

    try {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedElement = findElementAtPosition(x, y);
      setSelectedElement(clickedElement);
    } catch (error) {
      handleError(error, "handling canvas click");
    }
  };

  const handleMouseDown = (e) => {
    if (!selectedElement) return;

    try {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setDragStart({
        x: x - (selectedElement.x || 0),
        y: y - (selectedElement.y || 0)
      });
      setIsDragging(true);
      e.preventDefault();
    } catch (error) {
      handleError(error, "handling mouse down");
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;

    try {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const elementWidth =
        selectedElement.width || selectedElement.radius * 2 || 100;
      const elementHeight =
        selectedElement.height || selectedElement.radius * 2 || 50;

      const newX = Math.max(
        0,
        Math.min(canvas.width - elementWidth, x - dragStart.x)
      );
      const newY = Math.max(
        0,
        Math.min(canvas.height - elementHeight, y - dragStart.y)
      );

      setSelectedElement((prev) => ({ ...prev, x: newX, y: newY }));
    } catch (error) {
      handleError(error, "handling mouse move");
    }
  };

  const handleMouseUp = async () => {
    try {
      if (isDragging && selectedElement) {
        await updateElement(selectedElement.id, {
          x: selectedElement.x,
          y: selectedElement.y
        });
      }
    } catch (error) {
      handleError(error, "handling mouse up");
    } finally {
      setIsDragging(false);
      setIsResizing(false);
    }
  };

  const handleTouchStart = (e) => {
    try {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      handleMouseDown(mouseEvent);
    } catch (error) {
      handleError(error, "handling touch start");
    }
  };

  const handleTouchMove = (e) => {
    try {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      handleMouseMove(mouseEvent);
    } catch (error) {
      handleError(error, "handling touch move");
    }
  };

  const handleTouchEnd = (e) => {
    try {
      e.preventDefault();
      handleMouseUp();
    } catch (error) {
      handleError(error, "handling touch end");
    }
  };

  const findElementAtPosition = (x, y) => {
    if (!Array.isArray(elements)) return null;

    const reversedElements = [...elements].reverse();

    return reversedElements.find((element) => {
      if (!element || typeof element !== "object") return false;

      try {
        switch (element.type) {
          case "rectangle":
            return (
              x >= (element.x || 0) &&
              x <= (element.x || 0) + (element.width || 100) &&
              y >= (element.y || 0) &&
              y <= (element.y || 0) + (element.height || 100)
            );
          case "circle":
            const centerX = (element.x || 0) + (element.radius || 50);
            const centerY = (element.y || 0) + (element.radius || 50);
            const distance = Math.sqrt(
              Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
            );
            return distance <= (element.radius || 50);
          case "text":
            const textWidth = element.text
              ? element.text.length * (element.size || 16) * 0.6
              : 100;
            return (
              x >= (element.x || 0) &&
              x <= (element.x || 0) + textWidth &&
              y >= (element.y || 0) - (element.size || 16) &&
              y <= (element.y || 0)
            );
          case "image":
            return (
              x >= (element.x || 0) &&
              x <= (element.x || 0) + (element.width || 100) &&
              y >= (element.y || 0) &&
              y <= (element.y || 0) + (element.height || 100)
            );
          default:
            return false;
        }
      } catch (error) {
        console.error("Error in findElementAtPosition:", error);
        return false;
      }
    });
  };

  const exportToPDF = async () => {
    setIsLoading(true);
    try {
      const pdfBlob = await canvasAPI.exportPDF();
      downloadFile(pdfBlob, "canvas-export.pdf", "application/pdf");
    } catch (error) {
      handleError(error, "exporting PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const exportImage = async (format = "png") => {
    setIsLoading(true);
    try {
      const imageBlob = await canvasAPI.exportImage(format);
      downloadFile(imageBlob, `canvas-export.${format}`, `image/${format}`);
    } catch (error) {
      handleError(error, "exporting image");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCanvas = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear the canvas? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        await canvasAPI.clearCanvas();
        await loadCanvasState();
        setSelectedElement(null);
      } catch (error) {
        handleError(error, "clearing canvas");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              <div>
                <strong>Error {error.context}:</strong>
                <p className="text-sm">{error.message}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Canvas Editor</h1>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <i className={`fas ${showMobileMenu ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div
            className={`${
              showMobileMenu ? "block" : "hidden"
            } lg:block w-full lg:w-80 bg-white shadow-lg p-4 lg:h-screen overflow-y-auto`}
          >
            <CanvasSidebar
              canvas={canvas}
              setCanvas={setCanvas}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              addElement={addElement}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              deleteElement={deleteElement}
              updateElement={updateElement}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              initializeCanvas={initializeCanvas}
              exportToPDF={exportToPDF}
              exportImage={exportImage}
              clearCanvas={clearCanvas}
              isLoading={isLoading}
              elements={elements}
            />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <h2 className="text-lg font-medium">
                  Canvas ({canvas.width} × {canvas.height})
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportToPDF}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                  >
                    <i className="fas fa-file-pdf mr-2"></i>PDF
                  </button>
                  <button
                    onClick={() => exportImage("png")}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                  >
                    <i className="fas fa-image mr-2"></i>PNG
                  </button>
                  <button
                    onClick={() => exportImage("jpg")}
                    disabled={isLoading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                  >
                    <i className="fas fa-image mr-2"></i>JPG
                  </button>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div
                  ref={canvasRef}
                  className="relative cursor-crosshair"
                  style={{
                    width: canvas.width,
                    height: canvas.height,
                    backgroundColor: backgroundColor,
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    overflow: "auto"
                  }}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Render Elements */}
                  {Array.isArray(elements) &&
                    elements.map((element) => (
                      <CanvasElement
                        key={element.id}
                        element={element}
                        isSelected={selectedElement?.id === element.id}
                        isDragging={
                          isDragging && selectedElement?.id === element.id
                        }
                      />
                    ))}

                  {/* Selection Indicator */}
                  {selectedElement && (
                    <SelectionIndicator
                      element={selectedElement}
                      canvasWidth={canvas.width}
                      canvasHeight={canvas.height}
                    />
                  )}
                </div>
              </div>

              {/* Canvas Info */}
              <div className="mt-4 text-sm text-gray-600 flex flex-wrap gap-4">
                <span>
                  Elements: {Array.isArray(elements) ? elements.length : 0}
                </span>
                <span>
                  Selected: {selectedElement ? selectedElement.type : "None"}
                </span>
                {selectedElement && (
                  <span>
                    Position: ({Math.round(selectedElement.x || 0)},{" "}
                    {Math.round(selectedElement.y || 0)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Canvas Sidebar Component
function CanvasSidebar({
  canvas,
  setCanvas,
  activeTool,
  setActiveTool,
  addElement,
  selectedElement,
  setSelectedElement,
  deleteElement,
  updateElement,
  backgroundColor,
  setBackgroundColor,
  initializeCanvas,
  exportToPDF,
  exportImage,
  clearCanvas,
  isLoading,
  elements
}) {
  const handleCanvasSizeChange = (dimension, value) => {
    const newValue = Math.max(100, Math.min(2000, parseInt(value) || 100));
    setCanvas((prev) => ({ ...prev, [dimension]: newValue }));
  };

  const handleBackgroundColorChange = async (color) => {
    setBackgroundColor(color);
    try {
      await initializeCanvas();
    } catch (error) {
      console.error("Error updating background color:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Canvas Editor</h1>
        <p className="text-sm text-gray-600">Create and edit canvas elements</p>
      </div>

      {/* Canvas Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Canvas Settings
        </h3>

        {/* Canvas Size */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              type="number"
              value={canvas.width}
              onChange={(e) => handleCanvasSizeChange("width", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="100"
              max="2000"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              type="number"
              value={canvas.height}
              onChange={(e) => handleCanvasSizeChange("height", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="100"
              max="2000"
              disabled={isLoading}
            />
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                disabled={isLoading}
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="#FFFFFF"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Add Elements</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { tool: "rectangle", icon: "fa-square", label: "Rectangle" },
            { tool: "circle", icon: "fa-circle", label: "Circle" },
            { tool: "text", icon: "fa-font", label: "Text" },
            { tool: "image", icon: "fa-image", label: "Image" }
          ].map(({ tool, icon, label }) => (
            <button
              key={tool}
              onClick={() => setActiveTool(activeTool === tool ? null : tool)}
              className={`p-3 rounded-lg border-2 transition-all text-sm ${
                activeTool === tool
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading}
            >
              <i className={`fas ${icon} mb-1 block`}></i>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Element Form */}
      {activeTool && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Add {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
          </h3>
          <ElementForm
            activeTool={activeTool}
            addElement={addElement}
            canvasWidth={canvas.width}
            canvasHeight={canvas.height}
            onCancel={() => setActiveTool(null)}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Selected Element Controls */}
      {selectedElement && !activeTool && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Selected Element
          </h3>
           <SelectedElementControls
            element={selectedElement}
            updateElement={updateElement}          
            deleteElement={deleteElement}          
            onDeselect={() => setSelectedElement(null)}
            canvasWidth={canvas.width}
            canvasHeight={canvas.height}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Actions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
        <div className="space-y-2">
          <button
            onClick={clearCanvas}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
          >
            <i className="fas fa-trash mr-2"></i>Clear Canvas
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportToPDF}
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              <i className="fas fa-file-pdf mr-1"></i>PDF
            </button>
            <button
              onClick={() => exportImage("png")}
              disabled={isLoading}
              className="bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
            >
              <i className="fas fa-image mr-1"></i>PNG
            </button>
          </div>
        </div>
      </div>

      {/* Element List */}
      {Array.isArray(elements) && elements.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Elements ({elements.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {elements.map((element, index) => (
              <div
                key={element.id}
                className={`p-2 rounded border text-sm cursor-pointer transition-colors ${
                  selectedElement?.id === element.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedElement(element)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    <i
                      className={`fas ${getElementIcon(element.type)} mr-2`}
                    ></i>
                    {element.type}
                  </span>
                  <span className="text-gray-500">#{index + 1}</span>
                </div>
                {element.text && (
                  <div className="text-gray-600 truncate mt-1">
                    "{element.text}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Canvas Element Component
function CanvasElement({ element, isSelected, isDragging }) {
  if (!element || !element.type) return null;

  const baseStyle = {
    position: "absolute",
    left: element.x || 0,
    top: element.y || 0,
    cursor: isSelected ? (isDragging ? "grabbing" : "grab") : "pointer",
    transition: isDragging ? "none" : "all 0.1s ease",
    zIndex: isSelected ? 10 : 1
  };

  switch (element.type) {
    case "rectangle":
      return (
        <div
          style={{
            ...baseStyle,
            width: element.width || 100,
            height: element.height || 100,
            backgroundColor: element.fillColor || element.color || "#000000",
            border:
              element.borderWidth > 0
                ? `${element.borderWidth}px solid ${
                    element.borderColor || "#000000"
                  }`
                : "none"
          }}
        />
      );

    case "circle":
      return (
        <div
          style={{
            ...baseStyle,
            width: (element.radius || 50) * 2,
            height: (element.radius || 50) * 2,
            borderRadius: "50%",
            backgroundColor: element.fillColor || element.color || "#000000",
            border:
              element.borderWidth > 0
                ? `${element.borderWidth}px solid ${
                    element.borderColor || "#000000"
                  }`
                : "none"
          }}
        />
      );

    case "text":
      return (
        <div
          style={{
            ...baseStyle,
            color: element.color || "#000000",
            fontSize: `${element.size || 16}px`,
            fontFamily: element.font || "Arial, sans-serif",
            whiteSpace: "pre-wrap",
            userSelect: "none"
          }}
        >
          {element.text || "Sample Text"}
        </div>
      );

    case "image":
      return (
        <img
          src={element.src || element.url}
          alt="Canvas element"
          style={{
            ...baseStyle,
            width: element.width || 100,
            height: element.height || 100,
            objectFit: "contain"
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      );

    default:
      return null;
  }
}

// Selection Indicator Component
function SelectionIndicator({ element, canvasWidth, canvasHeight }) {
  if (!element) return null;

  let width, height;

  switch (element.type) {
    case "rectangle":
    case "image":
      width = element.width || 100;
      height = element.height || 100;
      break;
    case "circle":
      width = height = (element.radius || 50) * 2;
      break;
    case "text":
      width = element.text
        ? element.text.length * (element.size || 16) * 0.6
        : 100;
      height = element.size || 16;
      break;
    default:
      width = height = 100;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: (element.x || 0) - 2,
        top: (element.y || 0) - 2,
        width: width + 4,
        height: height + 4,
        border: "2px dashed #3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        pointerEvents: "none",
        zIndex: 20
      }}
    >
      {/* Resize handles */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-600 rounded-full"></div>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-600 rounded-full"></div>
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>

      {/* Middle handles for larger elements */}
      {width > 50 && (
        <>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
        </>
      )}
      {height > 50 && (
        <>
          <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
        </>
      )}
    </div>
  );
}

// Helper function to get element icon
function getElementIcon(type) {
  switch (type) {
    case "rectangle":
      return "fa-square";
    case "circle":
      return "fa-circle";
    case "text":
      return "fa-font";
    case "image":
      return "fa-image";
    default:
      return "fa-question";
  }
}

export default CanvasEditor;
