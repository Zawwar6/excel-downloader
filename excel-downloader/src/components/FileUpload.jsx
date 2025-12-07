import { useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import { FaCloudUploadAlt } from "react-icons/fa";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const onUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file first!");
      return;
    }

    setLoading(true);
    toast.loading("Processing... Please wait!", { id: "upload" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosClient.post("/upload", formData, {
        responseType: "blob",
      });

      toast.success("Images downloaded successfully!", { id: "upload" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.zip";
      a.click();
      a.remove();
    } catch (error) {
      toast.error("Something went wrong. Try again.", { id: "upload" });
    }

    setLoading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile?.name.endsWith(".xlsx") && !droppedFile?.name.endsWith(".xls")) {
      toast.error("Only Excel files allowed!");
      return;
    }

    setFile(droppedFile);
    toast.success("File added successfully!");
  };

  return (
    <div className="upload-box">
      <h2>Excel Image Downloader</h2>
      <p className="subtitle">
        Upload your Excel file containing image URLs & download all images in one ZIP instantly.
      </p>

      <div
        className={`drop-area ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <FaCloudUploadAlt size={60} color="#4f46e5" />
        <p>{file ? file.name : "Drag & Drop Excel Here"}</p>
        <span>or</span>
        <label className="browse-btn">
          Browse File
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={(e) => {
              const selected = e.target.files[0];
              if (!selected?.name.endsWith(".xlsx") && !selected?.name.endsWith(".xls")) {
                toast.error("Only Excel files allowed!");
                return;
              }
              setFile(selected);
              toast.success("File selected!");
            }}
          />
        </label>
      </div>

      <button className="upload-btn" onClick={onUpload} disabled={loading}>
        {loading ? "Processing..." : "Download Images ZIP"}
      </button>
    </div>
  );
};

export default FileUpload;
