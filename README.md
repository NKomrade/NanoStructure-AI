# NanoStructure AI: Full-Stack Carbon Nanotube Predictor

A modern web application that uses deep learning to predict carbon nanotube atomic coordinates, featuring real-time 3D visualization and interactive parameter adjustment.

## Prerequisites

- Python 3.8+ for backend
- Node.js 16+ for frontend
- Git (optional)
- Modern web browser (Chrome/Firefox/Safari)

## Project Structure

```
chiral/
├── backend/
│   ├── model/              # Model and scalers
│   │   ├── cnt_predictor_model.keras
│   │   ├── scaler_X.pkl
│   │   ├── scaler_y.pkl
│   │   └── model_info.json
│   ├── main.py            # FastAPI server
│   └── requirements.txt    # Python dependencies
│
└── frontend/
    ├── app/
    │   ├── components/    # React components
    │   ├── hooks/        # Custom React hooks
    │   ├── utils/        # Utility functions
    │   └── page.tsx      # Main page
    ├── package.json
    └── tailwind.config.js
```

## Installation

### Backend Setup

1. Create and activate Python virtual environment:
```bash
cd backend

# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install fastapi uvicorn numpy tensorflow scikit-learn python-multipart
# or
pip install -r requirements.txt
```

3. Prepare model files:
   - Place required files in `backend/model/` directory:
     - cnt_predictor_model.keras
     - scaler_X.pkl
     - scaler_y.pkl
     - model_info.json (optional)

### Frontend Setup

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

## Development

1. Start the backend server (from backend directory):
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. Start the frontend development server (from frontend directory):
```bash
npm run dev
```

3. Access the application at http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Input parameters:
   - Choose a preset CNT configuration or
   - Enter custom chiral indices (n, m)
   - Specify initial atomic coordinates (u, v, w)
3. Click "Predict Coordinates" to get results
4. View the 3D visualization:
   - Orange sphere: Initial position
   - Cyan sphere: Calculated position
   - Dashed line: Displacement
   - Use mouse to rotate and zoom

## Troubleshooting

### Backend Issues
- Ensure all model files are present in `backend/model/`
- Check Python version compatibility
- Verify TensorFlow installation
- Check port 8000 is available

### Frontend Issues
- Clear browser cache if visualization not updating
- Ensure backend is running and accessible
- Check browser console for errors
- Verify Node.js version compatibility

## API Documentation

Access the API documentation at http://localhost:8000/docs when the backend server is running.