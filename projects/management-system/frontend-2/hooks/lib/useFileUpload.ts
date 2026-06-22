"use client";
import { ChangeEvent, RefObject, useRef, useState } from "react";

interface UseFileUploadProps {
  maxSizeInMB?: number;
  onFileSelect?: (file: File | null) => void;
}

interface UseFileUploadReturn {
  file: File | null;
  error: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFileSelect: (selectedFile: File | null) => void;
  resetFile: () => void;
}

export const useFileUpload = ({
  maxSizeInMB = 50,
  onFileSelect,
}: UseFileUploadProps = {}): UseFileUploadReturn => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const MAX_FILE_SIZE = maxSizeInMB * 1024 * 1024; // Convert MB to bytes

  const handleFileSelect = (selectedFile: File | null) => {
    setError("");
    if (!selectedFile) {
      setFile(null);
      onFileSelect?.(null);
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${maxSizeInMB}MB`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setFile(selectedFile);
    onFileSelect?.(selectedFile);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const resetFile = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    file,
    error,
    fileInputRef,
    handleFileChange,
    handleFileSelect,
    resetFile,
  };
};
