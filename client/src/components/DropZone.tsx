import { useDropzone } from "react-dropzone";
import { useState, useEffect } from "react";
import { UploadCloud, Video, CheckCircle, AlertCircle } from "lucide-react";

export default function DropZone({
  onUploadStart,
}: {
  onUploadStart: (id: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  // Fake progress animation while uploading
  useEffect(() => {
    if (uploading) {
      let interval = setInterval(() => {
        setProgress((p) => (p < 95 ? p + Math.random() * 10 : p));
      }, 300);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [uploading]);

  const uploadFile = async (file: File) => {
    try {
      setUploadStatus("uploading");
      setUploading(true);

      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, fileId } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");

      setProgress(100);
      setUploadStatus("success");
      onUploadStart(fileId);
    } catch (error) {
      setUploadStatus("error");
      alert("Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 250 * 1024 * 1024) {
      alert("File must be ≤ 250 MB");
      return;
    }

    setFileInfo(file);
    uploadFile(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-2xl p-10 border-2 border-dashed text-center transition-all duration-300 ease-in-out ${
        isDragActive
          ? "border-blue-500 bg-blue-50 scale-[1.02]"
          : uploading
          ? "border-gray-300 bg-gray-50 cursor-not-allowed"
          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
      }`}
    >
      <input {...getInputProps()} />

      {/* Idle / Dragging */}
      {!uploading && uploadStatus === "idle" && (
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <UploadCloud className="h-12 w-12 text-blue-500" />
          <p className="text-lg font-medium">
            {isDragActive
              ? "Drop the video here..."
              : "Drag & drop a video (≤ 250 MB)"}
          </p>
          <p className="text-sm text-gray-500">or click to browse</p>
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="flex flex-col items-center gap-3 text-blue-600 animate-fadeIn">
          <Video className="h-10 w-10 animate-bounce" />
          <p className="font-medium">Uploading... Please wait</p>
          <div className="w-2/3 bg-gray-200 rounded-full h-3 mt-2">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{Math.round(progress)}%</p>
        </div>
      )}

      {/* Upload Success */}
      {uploadStatus === "success" && !uploading && fileInfo && (
        <div className="flex flex-col items-center gap-3 text-green-600 animate-fadeIn">
          <CheckCircle className="h-10 w-10" />
          <p className="font-medium">Upload successful!</p>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{fileInfo.name}</p>
            <p className="text-xs">
              {(fileInfo.size / (1024 * 1024)).toFixed(2)} MB •{" "}
              {fileInfo.type.split("/")[1].toUpperCase()}
            </p>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadStatus === "error" && (
        <div className="flex flex-col items-center gap-3 text-red-600 animate-fadeIn">
          <AlertCircle className="h-10 w-10" />
          <p className="font-medium">Upload failed. Try again.</p>
        </div>
      )}
    </div>
  );
}
