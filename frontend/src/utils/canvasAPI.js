import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/canvas';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const initializeCanvas = async (width, height, backgroundColor = '#FFFFFF') => {
  try {
    const response = await api.post('/initialize', { width, height, backgroundColor });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to initialize canvas');
  }
};

export const getCanvasState = async () => {
  try {
    const response = await api.get('/state');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get canvas state');
  }
};

export const addRectangle = async (params) => {
  try {
    const response = await api.post('/add/rectangle', params);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add rectangle');
  }
};

export const addCircle = async (params) => {
  try {
    const response = await api.post('/add/circle', params);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add circle');
  }
};

export const addText = async (params) => {
  try {
    const response = await api.post('/add/text', params);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add text');
  }
};

export const addImage = async (params, file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && key !== 'file') {
        formData.append(key, params[key]);
      }
    });

    const response = await api.post('/add/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add image');
  }
};

export const updateElement = async (elementId, updates) => {
  try {
    const response = await api.put(`/element/${elementId}`, updates);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update element');
  }
};

export const deleteElement = async (elementId) => {
  try {
    const response = await api.delete(`/element/${elementId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete element');
  }
};

export const clearCanvas = async () => {
  try {
    const response = await api.delete('/clear');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to clear canvas');
  }
};

export const exportPDF = async () => {
  try {
    const response = await api.get('/export/pdf', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to export PDF');
  }
};

export const exportImage = async (format = 'png') => {
  try {
    const response = await api.get(`/export/image/${format}`, { responseType: 'blob' });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to export image');
  }
};

export const saveCanvas = async (name) => {
  try {
    const response = await api.post('/save', { name });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to save canvas');
  }
};

export const loadCanvas = async (canvasId) => {
  try {
    const response = await api.get(`/load/${canvasId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to load canvas');
  }
};

export const getSavedCanvases = async () => {
  try {
    const response = await api.get('/saved');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get saved canvases');
  }
};