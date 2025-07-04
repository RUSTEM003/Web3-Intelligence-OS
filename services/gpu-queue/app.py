import os
import asyncio
import logging
from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import redis
import json
import torch
from transformers import pipeline
import uuid
from datetime import datetime
import aiofiles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MEDTOUR GPU Queue Service", version="1.0.0")

redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))

device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Using device: {device}")

ai_models = {}

def load_models():
    global ai_models
    try:
        ai_models["text_generator"] = pipeline(
            "text-generation",
            model="microsoft/DialoGPT-medium",
            device=0 if torch.cuda.is_available() else -1
        )
        
        ai_models["image_classifier"] = pipeline(
            "image-classification",
            model="google/vit-base-patch16-224",
            device=0 if torch.cuda.is_available() else -1
        )
        
        ai_models["medical_ner"] = pipeline(
            "ner",
            model="d4data/biomedical-ner-all",
            device=0 if torch.cuda.is_available() else -1
        )
        
        logger.info("AI models loaded successfully")
    except Exception as e:
        logger.error(f"Error loading models: {e}")

@app.on_event("startup")
async def startup_event():
    load_models()

@app.get("/health")
async def health_check():
    gpu_available = torch.cuda.is_available()
    gpu_count = torch.cuda.device_count() if gpu_available else 0
    
    return {
        "status": "healthy",
        "gpu_available": gpu_available,
        "gpu_count": gpu_count,
        "models_loaded": len(ai_models),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/process/medical-text")
async def process_medical_text(
    text: str,
    background_tasks: BackgroundTasks
):
    task_id = str(uuid.uuid4())
    
    task_data = {
        "task_id": task_id,
        "type": "medical_text",
        "input": text,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat()
    }
    
    redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))
    background_tasks.add_task(process_medical_text_task, task_id, text)
    
    return {"task_id": task_id, "status": "queued"}

async def process_medical_text_task(task_id: str, text: str):
    try:
        task_data = json.loads(redis_client.get(f"task:{task_id}"))
        task_data["status"] = "processing"
        redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))
        
        if "medical_ner" in ai_models:
            entities = ai_models["medical_ner"](text)
            
            if "text_generator" in ai_models:
                response = ai_models["text_generator"](
                    f"Medical consultation: {text}",
                    max_length=200,
                    num_return_sequences=1,
                    temperature=0.7
                )
                generated_text = response[0]["generated_text"]
            else:
                generated_text = "AI text generation not available"
        else:
            entities = []
            generated_text = "Medical NER not available"
        
        result = {
            "entities": entities,
            "generated_response": generated_text,
            "processed_at": datetime.utcnow().isoformat()
        }
        
        task_data["status"] = "completed"
        task_data["result"] = result
        redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))
        
    except Exception as e:
        logger.error(f"Error processing medical text task {task_id}: {e}")
        task_data = json.loads(redis_client.get(f"task:{task_id}"))
        task_data["status"] = "failed"
        task_data["error"] = str(e)
        redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))

@app.post("/process/medical-image")
async def process_medical_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    task_id = str(uuid.uuid4())
    
    file_path = f"/app/uploads/{task_id}_{file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    task_data = {
        "task_id": task_id,
        "type": "medical_image",
        "input": file_path,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat()
    }
    
    redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))
    background_tasks.add_task(process_medical_image_task, task_id, file_path)
    
    return {"task_id": task_id, "status": "queued"}

async def process_medical_image_task(task_id: str, file_path: str):
    try:
        task_data = json.loads(redis_client.get(f"task:{task_id}"))
        task_data["status"] = "processing"
        redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))
        
        if "image_classifier" in ai_models:
            from PIL import Image
            image = Image.open(file_path)
            classification = ai_models["image_classifier"](image)
        else:
            classification = [{"label": "unavailable", "score": 0.0}]
        
        result = {
            "classification": classification,
            "processed_at": datetime.utcnow().isoformat()
        }
        
        task_data["status"] = "completed"
        task_data["result"] = result
        redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))
        
        os.remove(file_path)
        
    except Exception as e:
        logger.error(f"Error processing medical image task {task_id}: {e}")
        task_data = json.loads(redis_client.get(f"task:{task_id}"))
        task_data["status"] = "failed"
        task_data["error"] = str(e)
        redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))

@app.get("/task/{task_id}")
async def get_task_status(task_id: str):
    task_data = redis_client.get(f"task:{task_id}")
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return json.loads(task_data)

@app.get("/queue/status")
async def get_queue_status():
    gpu_memory = {}
    if torch.cuda.is_available():
        for i in range(torch.cuda.device_count()):
            gpu_memory[f"gpu_{i}"] = {
                "allocated": torch.cuda.memory_allocated(i),
                "cached": torch.cuda.memory_reserved(i),
                "total": torch.cuda.get_device_properties(i).total_memory
            }
    
    return {
        "gpu_memory": gpu_memory,
        "models_loaded": list(ai_models.keys()),
        "redis_connected": redis_client.ping(),
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
