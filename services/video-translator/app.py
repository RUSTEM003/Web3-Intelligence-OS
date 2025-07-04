import os
import asyncio
import logging
import json
import uuid
from datetime import datetime
from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import redis
import boto3
import openai
import whisper
from moviepy.editor import VideoFileClip
import aiofiles
from elevenlabs import generate, set_api_key
from pydub import AudioSegment

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MEDTOUR Video Translator Service", version="1.0.0")

redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))

openai.api_key = os.getenv("OPENAI_API_KEY")
elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
if elevenlabs_api_key:
    set_api_key(elevenlabs_api_key)

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1")
)

S3_BUCKET = os.getenv("S3_BUCKET")

whisper_model = None

@app.on_event("startup")
async def startup_event():
    global whisper_model
    try:
        whisper_model = whisper.load_model("base")
        logger.info("Whisper model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading Whisper model: {e}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "whisper_loaded": whisper_model is not None,
        "openai_configured": bool(openai.api_key),
        "elevenlabs_configured": bool(elevenlabs_api_key),
        "s3_configured": bool(S3_BUCKET),
        "redis_connected": redis_client.ping(),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/translate/video")
async def translate_video(
    background_tasks: BackgroundTasks,
    target_language: str = Form(...),
    voice_id: str = Form(default="21m00Tcm4TlvDq8ikWAM"),
    file: UploadFile = File(...)
):
    task_id = str(uuid.uuid4())
    
    file_path = f"/app/uploads/{task_id}_{file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    task_data = {
        "task_id": task_id,
        "type": "video_translation",
        "input": file_path,
        "target_language": target_language,
        "voice_id": voice_id,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat()
    }
    
    redis_client.setex(f"task:{task_id}", 7200, json.dumps(task_data))
    background_tasks.add_task(process_video_translation, task_id, file_path, target_language, voice_id)
    
    return {"task_id": task_id, "status": "queued"}

async def process_video_translation(task_id: str, file_path: str, target_language: str, voice_id: str):
    try:
        task_data = json.loads(redis_client.get(f"task:{task_id}"))
        task_data["status"] = "processing"
        task_data["progress"] = "extracting_audio"
        redis_client.setex(f"task:{task_id}", 7200, json.dumps(task_data))
        
        video = VideoFileClip(file_path)
        audio_path = f"/app/uploads/{task_id}_audio.wav"
        video.audio.write_audiofile(audio_path, verbose=False, logger=None)
        
        task_data["progress"] = "transcribing"
        redis_client.setex(f"task:{task_id}", 7200, json.dumps(task_data))
        
        if whisper_model:
            result = whisper_model.transcribe(audio_path)
            original_text = result["text"]
        else:
            raise Exception("Whisper model not available")
        
        task_data["progress"] = "translating"
        redis_client.setex(f"task:{task_id}", 7200, json.dumps(task_data))
        
        if openai.api_key:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"Translate the following medical content to {target_language}. Maintain medical accuracy and terminology."},
                    {"role": "user", "content": original_text}
                ],
                max_tokens=1000
            )
            translated_text = response.choices[0].message.content
        else:
            translated_text = f"Translation to {target_language}: {original_text}"
        
        task_data["progress"] = "generating_voice"
        redis_client.setex(f"task:{task_id}", 7200, json.dumps(task_data))
        
        if elevenlabs_api_key:
            audio_data = generate(
                text=translated_text,
                voice=voice_id,
                model="eleven_multilingual_v2"
            )
            
            translated_audio_path = f"/app/videos/{task_id}_translated.mp3"
            with open(translated_audio_path, 'wb') as f:
                f.write(audio_data)
        else:
            translated_audio_path = audio_path
        
        task_data["progress"] = "combining_video"
        redis_client.setex(f"task:{task_id}", 7200, json.dumps(task_data))
        
        translated_audio = AudioSegment.from_file(translated_audio_path)
        original_duration = len(video.audio.to_soundarray(fps=22050)) / 22050
        translated_duration = len(translated_audio) / 1000
        
        if translated_duration != original_duration:
            speed_factor = translated_duration / original_duration
            translated_audio = translated_audio.speedup(playback_speed=speed_factor)
        
        final_audio_path = f"/app/videos/{task_id}_final_audio.wav"
        translated_audio.export(final_audio_path, format="wav")
        
        final_video_path = f"/app/videos/{task_id}_translated.mp4"
        final_video = video.set_audio(VideoFileClip(final_audio_path).audio)
        final_video.write_videofile(final_video_path, verbose=False, logger=None)
        
        task_data["progress"] = "uploading_to_s3"
        redis_client.setex(f"task:{task_id}", 7200, json.dumps(task_data))
        
        if S3_BUCKET:
            s3_key = f"translated-videos/{task_id}_translated.mp4"
            s3_client.upload_file(final_video_path, S3_BUCKET, s3_key)
            s3_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"
        else:
            s3_url = f"/videos/{task_id}_translated.mp4"
        
        result = {
            "original_text": original_text,
            "translated_text": translated_text,
            "target_language": target_language,
            "video_url": s3_url,
            "duration": original_duration,
            "processed_at": datetime.utcnow().isoformat()
        }
        
        task_data["status"] = "completed"
        task_data["result"] = result
        task_data["progress"] = "completed"
        redis_client.setex(f"task:{task_id}", 7200, json.dumps(task_data))
        
        for temp_file in [file_path, audio_path, translated_audio_path, final_audio_path]:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        
        video.close()
        final_video.close()
        
    except Exception as e:
        logger.error(f"Error processing video translation task {task_id}: {e}")
        task_data = json.loads(redis_client.get(f"task:{task_id}"))
        task_data["status"] = "failed"
        task_data["error"] = str(e)
        redis_client.setex(f"task:{task_id}", 7200, json.dumps(task_data))

@app.post("/translate/audio")
async def translate_audio(
    background_tasks: BackgroundTasks,
    target_language: str = Form(...),
    voice_id: str = Form(default="21m00Tcm4TlvDq8ikWAM"),
    file: UploadFile = File(...)
):
    task_id = str(uuid.uuid4())
    
    file_path = f"/app/uploads/{task_id}_{file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    task_data = {
        "task_id": task_id,
        "type": "audio_translation",
        "input": file_path,
        "target_language": target_language,
        "voice_id": voice_id,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat()
    }
    
    redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))
    background_tasks.add_task(process_audio_translation, task_id, file_path, target_language, voice_id)
    
    return {"task_id": task_id, "status": "queued"}

async def process_audio_translation(task_id: str, file_path: str, target_language: str, voice_id: str):
    try:
        task_data = json.loads(redis_client.get(f"task:{task_id}"))
        task_data["status"] = "processing"
        redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))
        
        if whisper_model:
            result = whisper_model.transcribe(file_path)
            original_text = result["text"]
        else:
            raise Exception("Whisper model not available")
        
        if openai.api_key:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"Translate the following medical content to {target_language}. Maintain medical accuracy and terminology."},
                    {"role": "user", "content": original_text}
                ],
                max_tokens=1000
            )
            translated_text = response.choices[0].message.content
        else:
            translated_text = f"Translation to {target_language}: {original_text}"
        
        if elevenlabs_api_key:
            audio_data = generate(
                text=translated_text,
                voice=voice_id,
                model="eleven_multilingual_v2"
            )
            
            output_path = f"/app/videos/{task_id}_translated.mp3"
            with open(output_path, 'wb') as f:
                f.write(audio_data)
        else:
            output_path = file_path
        
        if S3_BUCKET:
            s3_key = f"translated-audio/{task_id}_translated.mp3"
            s3_client.upload_file(output_path, S3_BUCKET, s3_key)
            s3_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"
        else:
            s3_url = f"/videos/{task_id}_translated.mp3"
        
        result = {
            "original_text": original_text,
            "translated_text": translated_text,
            "target_language": target_language,
            "audio_url": s3_url,
            "processed_at": datetime.utcnow().isoformat()
        }
        
        task_data["status"] = "completed"
        task_data["result"] = result
        redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data))
        
        if os.path.exists(file_path):
            os.remove(file_path)
        
    except Exception as e:
        logger.error(f"Error processing audio translation task {task_id}: {e}")
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

@app.get("/languages")
async def get_supported_languages():
    return {
        "supported_languages": [
            {"code": "en", "name": "English"},
            {"code": "tr", "name": "Turkish"},
            {"code": "ar", "name": "Arabic"},
            {"code": "ru", "name": "Russian"},
            {"code": "de", "name": "German"},
            {"code": "fr", "name": "French"},
            {"code": "es", "name": "Spanish"},
            {"code": "it", "name": "Italian"},
            {"code": "pt", "name": "Portuguese"},
            {"code": "zh", "name": "Chinese"},
            {"code": "ja", "name": "Japanese"},
            {"code": "ko", "name": "Korean"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
