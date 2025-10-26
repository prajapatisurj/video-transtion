import { useDropzone } from "react-dropzone";
import { useState } from "react";

export default function DropZone({
  onUploadStart,
}: {
  onUploadStart: (id: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const onDrop = async (files: File[]) => {
    const file = files[0];
    if (!file || file.size > 250 * 1024 * 1024) {
      alert("File must be ≤ 250 MB");
      return;
    }

    setUploading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    const { uploadUrl, fileId } = await res.json();

    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    setUploading(false);
    onUploadStart(fileId);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-4 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading...</p>
      ) : isDragActive ? (
        <p>Drop the video here...</p>
      ) : (
        <p>Drag & drop a video (≤ 250 MB), or click to select</p>
      )}
    </div>
  );
}
