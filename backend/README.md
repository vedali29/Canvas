# Canvas Builder API

A Node.js backend API for creating and exporting canvas drawings as PDFs.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

- **POST /api/canvas/init**
  - Body: `{ width, height }`
  - Initializes a new canvas.

- **POST /api/canvas/element**
  - Body: `{ type, properties }`
  - Adds a shape, text, or image to the canvas.

- **POST /api/canvas/image-upload**
  - Form-data: `image` (file)
  - Uploads an image and returns a URL.

- **GET /api/canvas/preview**
  - Returns a PNG preview of the current canvas.

- **GET /api/canvas/export**
  - Returns a downloadable PDF of the canvas.

## Notes

- The canvas state is stored in memory (for demo purposes).
- Uploaded images are stored in the `uploads/` directory. 