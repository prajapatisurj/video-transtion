import { useDropzone } from "react-dropzone";
import { useState } from "react";

export default function DropZone({
  onUploadStart,
}: {
  onUploadStart: (id: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    try {
      const res = await fetch("/api/upload", {
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

      onUploadStart(fileId);
    } catch (error) {
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

    setUploading(true);
    uploadFile(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [],
      "video/webm": [],
      "video/ogg": [],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-4 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : uploading
          ? "border-gray-400 bg-gray-50 cursor-not-allowed"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-blue-600 font-medium">Uploading... Please wait</p>
        </div>
      ) : isDragActive ? (
        <p className="text-blue-600 font-medium">Drop the video here...</p>
      ) : (
        <div>
          <p className="text-lg font-medium text-gray-700">
            Drag & drop a video (≤ 250 MB)
          </p>
          <p className="text-sm text-gray-500 mt-1">or click to select</p>
        </div>
      )}
    </div>
  );
}
