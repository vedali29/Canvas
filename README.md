# Canvas Editor

A full-stack web application for creating and editing canvas elements with drag-and-drop functionality, real-time updates, and export capabilities.

## Features

### Canvas Operations
- **Interactive Canvas**: Create and manipulate elements on a resizable canvas
- **Drag & Drop**: Move elements around the canvas with mouse or touch
- **Real-time Updates**: All changes are saved automatically to the database
- **Responsive Design**: Works on desktop and mobile devices

### Element Types
- **Rectangles**: Customizable width, height, fill color, and borders
- **Circles**: Adjustable radius, fill color, and borders
- **Text**: Multiple fonts, sizes, colors, and formatting options
- **Images**: Upload and position images with custom dimensions

### Export Options
- **PDF Export**: Generate high-quality PDF files
- **Image Export**: Export as PNG or JPG formats
- **Batch Operations**: Clear canvas or delete multiple elements

### Advanced Features
- **Element Selection**: Click to select and modify elements
- **Property Panel**: Real-time editing of element properties
- **Canvas Settings**: Customizable canvas size and background color
- **File Upload**: Support for image uploads with validation
- **Error Handling**: Comprehensive error boundaries and validation

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icon library
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload middleware
- **Canvas** - Server-side canvas rendering
- **PDFKit** - PDF generation library

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd canvas-editor
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/canvas-editor
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

5. **Create uploads directory**
```bash
mkdir uploads
```

6. **Start MongoDB service**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

7. **Start the backend server**
```bash
npm run dev
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_UPLOAD_URL=http://localhost:5000
```

5. **Start the development server**
```bash
npm start
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## API Documentation

### Canvas Endpoints

#### Initialize Canvas
```http
POST /api/canvas/initialize
Content-Type: application/json

{
  "width": 800,
  "height": 600,
  "backgroundColor": "#FFFFFF"
}
```

#### Get Canvas State
```http
GET /api/canvas/state
```

#### Clear Canvas
```http
DELETE /api/canvas/clear
```

### Element Endpoints

#### Add Rectangle
```http
POST /api/canvas/elements/rectangle
Content-Type: application/json

{
  "x": 50,
  "y": 50,
  "width": 100,
  "height": 100,
  "fillColor": "#FF0000",
  "borderWidth": 2,
  "borderColor": "#000000"
}
```

#### Add Circle
```http
POST /api/canvas/elements/circle
Content-Type: application/json

{
  "x": 100,
  "y": 100,
  "radius": 50,
  "fillColor": "#00FF00",
  "borderWidth": 1,
  "borderColor": "#000000"
}
```

#### Add Text
```http
POST /api/canvas/elements/text
Content-Type: application/json

{
  "x": 150,
  "y": 150,
  "text": "Hello World",
  "size": 24,
  "color": "#0000FF",
  "font": "Arial"
}
```

#### Add Image
```http
POST /api/canvas/elements/image
Content-Type: multipart/form-data

image: [file]
x: 200
y: 200
width: 150
height: 150
```

#### Update Element
```http
PUT /api/canvas/elements/:id
Content-Type: application/json

{
  "x": 75,
  "y": 75,
  "width": 120
}
```

#### Delete Element
```http
DELETE /api/canvas/elements/:id
```

### Export Endpoints

#### Export to PDF
```http
GET /api/canvas/export/pdf
```

#### Export to Image
```http
GET /api/canvas/export/image/png
GET /api/canvas/export/image/jpg
```

## Project Structure

```
canvas-editor/
├── backend/
│   ├── controllers/
│   │   └── canvasController.js
│   ├── models/
│   │   ├── Canvas.js
│   │   └── Element.js
│   ├── routes/
│   │   └── canvasRoutes.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CanvasEditor.js
│   │   │   ├── ElementForm.js
│   │   │   ├── SelectedElementControls.js
│   │   │   └── ErrorBoundary.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Usage Guide

### Creating Elements

1. **Select Tool**: Click on Rectangle, Circle, Text, or Image in the sidebar
2. **Configure Properties**: Set position, size, colors, and other properties
3. **Add Element**: Click "Add [Element]" to create the element on canvas

### Editing Elements

1. **Select Element**: Click on any element on the canvas
2. **Modify Properties**: Use the sidebar controls to change properties
3. **Update**: Changes are applied automatically
4. **Delete**: Use the delete button to remove elements

### Canvas Management

1. **Resize Canvas**: Adjust width and height in Canvas Settings
2. **Change Background**: Select background color
3. **Clear Canvas**: Remove all elements at once

### Exporting

1. **PDF Export**: Click "PDF" button to download PDF file
2. **Image Export**: Click "PNG" or "JPG" for image formats
3. **File Naming**: Files are automatically named with timestamps

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/canvas-editor
NODE_ENV=production
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_UPLOAD_URL=http://localhost:5000
```

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB service
sudo systemctl start mongod
```

#### File Upload Issues
```bash
# Check uploads directory permissions
chmod 755 backend/uploads
```

#### CORS Errors
- Ensure backend CORS_ORIGIN matches frontend URL
- Check that both servers are running on correct ports

#### Canvas Not Loading
- Verify API endpoints are accessible
- Check browser console for JavaScript errors
- Ensure MongoDB connection is established

### Performance Optimization

#### Large Canvas Performance
- Limit canvas size to reasonable dimensions (max 2000x2000)
- Optimize image sizes before upload
- Use appropriate image formats (PNG for transparency, JPG for photos)

#### Memory Usage
- Clear unused elements regularly
- Monitor MongoDB storage usage
- Implement element limits if needed

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

