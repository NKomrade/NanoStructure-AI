import numpy as np
import tensorflow as tf
import pickle
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import logging
import time
import json
import sys
from dotenv import load_dotenv

# Set up logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get environment variables
PORT = int(os.getenv('PORT', 8000))
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')
MODEL_PATH = os.getenv('MODEL_PATH', 'model/cnt_predictor_model.keras')
SCALER_X_PATH = os.getenv('SCALER_X_PATH', 'model/scaler_X.pkl')
SCALER_Y_PATH = os.getenv('SCALER_Y_PATH', 'model/scaler_y.pkl')

# Get absolute path for model directory
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
MODEL_INFO_PATH = os.path.join(MODEL_DIR, 'model_info.json')

def initialize_model_directory():
    """Create model directory and check for model files"""
    os.makedirs(MODEL_DIR, exist_ok=True)
    required_files = ['cnt_predictor_model.keras', 'scaler_X.pkl', 'scaler_y.pkl']
    
    # Check if files exist in MODEL_DIR
    missing_files = [f for f in required_files if not os.path.exists(os.path.join(MODEL_DIR, f))]
    
    if missing_files:
        logger.error(f"Missing model files: {missing_files}")
        logger.info(f"Please place the following files in {MODEL_DIR}:")
        for file in missing_files:
            logger.info(f"  - {file}")
        return False
    return True

# --- Pydantic Model for Input Validation ---
class CNTInput(BaseModel):
    n: int
    m: int
    u: float
    v: float
    w: float

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Carbon Nanotube Predictor API",
    description="An API to predict atomic coordinates of carbon nanotubes using a deep learning model.",
    version="1.0.0"
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- Model Loading Function ---
def load_ml_components(max_retries=3, retry_delay=2):
    """Load model and scalers with retry mechanism"""
    if not initialize_model_directory():
        return None, None, None

    model_path = os.path.join(MODEL_DIR, 'cnt_predictor_model.keras')
    scaler_x_path = os.path.join(MODEL_DIR, 'scaler_X.pkl')
    scaler_y_path = os.path.join(MODEL_DIR, 'scaler_y.pkl')
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Loading model attempt {attempt + 1}/{max_retries}")
            # Load components
            model = tf.keras.models.load_model(model_path)
            with open(scaler_x_path, 'rb') as f:
                scaler_X = pickle.load(f)
            with open(scaler_y_path, 'rb') as f:
                scaler_y = pickle.load(f)
            logger.info("All components loaded successfully!")
            return model, scaler_X, scaler_y
        except Exception as e:
            logger.error(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
    
    return None, None, None

# --- Load Models and Scalers at Startup ---
model, scaler_X, scaler_y = None, None, None

@app.on_event("startup")
async def startup_event():
    """Load models on startup in background"""
    global model, scaler_X, scaler_y
    logger.info("=" * 50)
    logger.info("Starting CNT Predictor API...")
    logger.info(f"Model directory: {MODEL_DIR}")
    logger.info("=" * 50)
    
    # Load components (this may take time on free tier)
    model, scaler_X, scaler_y = load_ml_components()
    
    if all([model, scaler_X, scaler_y]):
        logger.info("✓ All ML components loaded successfully")
    else:
        logger.error("✗ Failed to load some components")

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the CNT Predictor API"}

@app.get("/status")
def get_status():
    """Check if the model and scalers are properly loaded"""
    components = {
        "model": model is not None,
        "scaler_X": scaler_X is not None,
        "scaler_y": scaler_y is not None
    }
    return {
        "status": "ready" if all(components.values()) else "not_ready",
        "components": components
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scalers_loaded": all([scaler_X is not None, scaler_y is not None])
    }

@app.post("/predict")
async def predict_coordinates(data: CNTInput):
    """
    Predicts the calculated atomic coordinates based on input chiral indices
    and initial coordinates.
    """
    try:
        logger.info(f"Received data: {data.dict()}")
        
        # Enhanced input validation
        if data.m > data.n:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid chiral indices: m ({data.m}) must be ≤ n ({data.n})"
            )

        if not (-10 <= data.n <= 10) or not (-10 <= data.m <= 10):
            return JSONResponse(
                status_code=400,
                content={"error": "Chiral indices must be between -10 and 10"}
            )

        if not all([model, scaler_X, scaler_y]):
            logger.error("Model components not loaded. Components status: "
                        f"model={model is not None}, "
                        f"scaler_X={scaler_X is not None}, "
                        f"scaler_y={scaler_y is not None}")
            return JSONResponse(
                status_code=503,
                content={"error": "Model components not loaded. Please check server logs."}
            )

        input_data = np.array([[data.n, data.m, data.u, data.v, data.w]])
        logger.info(f"Input array shape: {input_data.shape}")

        try:
            scaled_input = scaler_X.transform(input_data)
        except Exception as e:
            logger.error(f"Error in scaling input: {str(e)}")
            raise ValueError("Error in scaling input data")

        try:
            prediction_scaled = model.predict(scaled_input, verbose=0)
        except Exception as e:
            logger.error(f"Error in model prediction: {str(e)}")
            raise ValueError("Error in model prediction")

        try:
            prediction_unscaled = scaler_y.inverse_transform(prediction_scaled)
        except Exception as e:
            logger.error(f"Error in inverse scaling: {str(e)}")
            raise ValueError("Error in processing model output")

        result = {
            "initial": {"u": float(data.u), "v": float(data.v), "w": float(data.w)},
            "calculated": {
                "u": float(prediction_unscaled[0][0]),
                "v": float(prediction_unscaled[0][1]),
                "w": float(prediction_unscaled[0][2]),
            },
        }
        
        logger.info(f"Successful prediction: {result}")
        return JSONResponse(content=result)

    except Exception as e:
        import traceback
        logger.error("Error in /predict: " + str(e))
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"error": f"Prediction failed: {str(e)}"}
        )

@app.get("/debug")
async def debug_info():
    """Return debug information about the environment and model loading"""
    try:
        return JSONResponse({
            "environment": {
                "python_version": sys.version,
                "tensorflow_version": tf.__version__,
                "numpy_version": np.__version__,
                "working_directory": os.getcwd(),
                "model_directory": MODEL_DIR,
                "model_directory_exists": os.path.exists(MODEL_DIR),
                "model_directory_contents": os.listdir(MODEL_DIR) if os.path.exists(MODEL_DIR) else [],
            },
            "model_files": {
                "model_keras": {
                    "path": os.path.join(MODEL_DIR, 'cnt_predictor_model.keras'),
                    "exists": os.path.exists(os.path.join(MODEL_DIR, 'cnt_predictor_model.keras')),
                    "size": os.path.getsize(os.path.join(MODEL_DIR, 'cnt_predictor_model.keras')) if os.path.exists(os.path.join(MODEL_DIR, 'cnt_predictor_model.keras')) else None
                },
                "scaler_X": {
                    "path": os.path.join(MODEL_DIR, 'scaler_X.pkl'),
                    "exists": os.path.exists(os.path.join(MODEL_DIR, 'scaler_X.pkl')),
                    "size": os.path.getsize(os.path.join(MODEL_DIR, 'scaler_X.pkl')) if os.path.exists(os.path.join(MODEL_DIR, 'scaler_X.pkl')) else None
                },
                "scaler_y": {
                    "path": os.path.join(MODEL_DIR, 'scaler_y.pkl'),
                    "exists": os.path.exists(os.path.join(MODEL_DIR, 'scaler_y.pkl')),
                    "size": os.path.getsize(os.path.join(MODEL_DIR, 'scaler_y.pkl')) if os.path.exists(os.path.join(MODEL_DIR, 'scaler_y.pkl')) else None
                }
            },
            "model_status": {
                "model_loaded": model is not None,
                "scaler_X_loaded": scaler_X is not None,
                "scaler_y_loaded": scaler_y is not None
            }
        })
    except Exception as e:
        return JSONResponse({
            "error": str(e),
            "traceback": str(sys.exc_info())
        })

# Add new function to load model info
def load_model_info():
    """Load model metadata from JSON file"""
    try:
        with open(MODEL_INFO_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading model info: {str(e)}")
        return None

# Add new endpoint after other endpoints
@app.get("/model-info")
def get_model_info():
    """Return model metadata and performance metrics"""
    model_info = load_model_info()
    if not model_info:
        return JSONResponse(
            status_code=500,
            content={"error": "Could not load model information"}
        )
    return model_info
