/**
 * Validates canvas dimensions
 */
export const validateCanvasDimensions = (width, height) => {
  return (
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width >= 100 &&
    width <= 5000 &&
    height >= 100 &&
    height <= 5000
  );
};

/**
 * Validates element position
 */
export const validatePosition = (x, y, canvasWidth, canvasHeight) => {
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= 0 &&
    y >= 0 &&
    x <= canvasWidth &&
    y <= canvasHeight
  );
};

/**
 * Validates rectangle parameters
 */
export const validateRectangle = (width, height) => {
  return (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  );
};

/**
 * Validates circle parameters
 */
export const validateCircle = (radius) => {
  return Number.isFinite(radius) && radius > 0;
};

/**
 * Validates text parameters
 */
export const validateText = (text, size) => {
  return (
    typeof text === 'string' &&
    text.trim().length > 0 &&
    Number.isFinite(size) &&
    size > 0
  );
};

/**
 * Validates image file
 */
// Canvas helper functions

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
};

export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export const downloadFile = (blob, filename, mimeType = 'application/octet-stream') => {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};


/**
 * Check if device is mobile
 */
export const isMobile = () => {
  return window.innerWidth <= 768;
};

/**
 * Get optimal canvas dimensions for device
 */
export const getOptimalCanvasDimensions = () => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  if (isMobile()) {
    return {
      width: Math.min(400, screenWidth - 40),
      height: Math.min(300, screenHeight - 200)
    };
  }
  
  return {
    width: Math.min(800, screenWidth - 400),
    height: Math.min(600, screenHeight - 200)
  };
};

/**
 * Color utilities
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
