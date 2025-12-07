import pandas as pd
import aiohttp
import asyncio
import os
import zipfile

# Download single image
async def download_image(session, url, folder, index):
    try:
        async with session.get(url) as resp:
            if resp.status == 200:
                img_data = await resp.read()
                ext = url.split(".")[-1].split("?")[0][:4]  # detect extension
                file_path = f"{folder}/image_{index}.{ext}"
                with open(file_path, "wb") as f:
                    f.write(img_data)
    except:
        pass

# Download all images async
async def download_all(urls, folder):
    async with aiohttp.ClientSession() as session:
        tasks = [download_image(session, url, folder, idx) for idx, url in enumerate(urls)]
        await asyncio.gather(*tasks)

# Main process function
async def process_file(excel_path):
    df = pd.read_excel(excel_path)

    # 1st column should have image URLs
    urls = df.iloc[:, 0].dropna().tolist()

    folder = "downloads"
    os.makedirs(folder, exist_ok=True)

    await download_all(urls, folder)

    zip_path = "images.zip"
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for img in os.listdir(folder):
            zipf.write(f"{folder}/{img}", img)

    # Cleanup downloaded images
    for img in os.listdir(folder):
        os.remove(f"{folder}/{img}")

    return zip_path
