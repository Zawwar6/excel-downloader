from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from utils.download_images import process_file

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development: any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads folder exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/")
def home():
    return {"status": "running"}

@app.post("/upload")
async def upload_excel(file: UploadFile = File(...)):
    try:
        file_location = f"{UPLOAD_FOLDER}/{file.filename}"

        # Save uploaded Excel
        with open(file_location, "wb") as f:
            f.write(await file.read())

        # Process file: download all images + zip
        zip_path = await process_file(file_location)

        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename="images.zip"
        )
    except Exception as e:
        print("ERROR:", e)
        return {"error": str(e)}
