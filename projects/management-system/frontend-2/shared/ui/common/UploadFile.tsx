"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import {
  AppFormModal,
  FileUpload,
  Input,
  Textarea,
} from "@fieldflow360/org-ui";

import { useFileUpload } from "@/hooks";
import {
  getMapUploadAccept,
  isMapUploadFileName,
} from "@/shared/lib/mapUploadFileName";

const MAX_MAP_FILE_SIZE_BYTES = 50 * 1024 * 1024;

interface UploadFileProps {
  onCancel?: () => void;
  onUpload?: (data: {
    fileName: string;
    description: string;
    file: File | File[] | null;
    fileType: "farmer" | "contractor" | "one_call";
  }) => void;
  initialFile?: File | null;
  initialFileType?: "farmer" | "contractor" | "one_call";
  initialFileName?: string;
  isFixedTitle?: boolean;
  uploadProgress?: number | null;
}

export function UploadFile({
  onCancel,
  onUpload,
  initialFile = null,
  initialFileType = "contractor",
  initialFileName = "",
  isFixedTitle = false,
  uploadProgress = null,
}: UploadFileProps) {
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState<
    "farmer" | "contractor" | "one_call"
  >(initialFileType);
  const [mapFiles, setMapFiles] = useState<File[]>([]);

  const { file, error, handleFileSelect } = useFileUpload({
    maxSizeInMB: 50,
  });

  const isMapUpload = isFixedTitle && isMapUploadFileName(initialFileName);

  const validateMapExtension = (f: File): boolean => {
    if (!isMapUpload) return true;
    const lower = initialFileName.toLowerCase();
    if (lower.includes("xml_file")) {
      return f.name.toLowerCase().endsWith(".xml");
    }
    if (lower.includes("shape_file")) {
      return f.name.toLowerCase().endsWith(".shp");
    }
    if (lower.includes("kml_file")) {
      return f.name.toLowerCase().endsWith(".kml");
    }
    return true;
  };

  const selectedFiles = isMapUpload ? mapFiles : file ? [file] : [];
  const invalidMapFile = selectedFiles.find((f) => !validateMapExtension(f));
  const fileTypeMismatch = !!invalidMapFile;

  const invalidMapFileSize = selectedFiles.find(
    (f) => isMapUpload && f.size > MAX_MAP_FILE_SIZE_BYTES
  );
  const sizeErrorHint = invalidMapFileSize
    ? `File size must be less than 50MB`
    : undefined;
  const extensionHint = (() => {
    if (!fileTypeMismatch || !invalidMapFile) return undefined;
    const lower = initialFileName.toLowerCase();
    if (lower.includes("xml_file")) {
      return `${invalidMapFile.name}: Please select a .xml file.`;
    }
    if (lower.includes("shape_file")) {
      return `${invalidMapFile.name}: Please select a .shp file.`;
    }
    if (lower.includes("kml_file")) {
      return `${invalidMapFile.name}: Please select a .kml file.`;
    }
    return undefined;
  })();

  const fileUploadError = error || sizeErrorHint || extensionHint;

  const isFormValid = isFixedTitle
    ? isMapUpload
      ? selectedFiles.length > 0 && !fileTypeMismatch && !sizeErrorHint
      : file !== null
    : fileName.trim() !== "" && file !== null && !fileTypeMismatch;

  const accept = useMemo(() => {
    if (isMapUpload) {
      return getMapUploadAccept(initialFileName);
    }
    return undefined;
  }, [initialFileName, isMapUpload]);

  useEffect(() => {
    if (initialFileType) {
      setFileType(initialFileType);
    }
  }, [initialFileType]);

  useEffect(() => {
    if (!initialFile) return;
    if (isMapUpload) {
      setMapFiles([initialFile]);
    } else {
      handleFileSelect(initialFile);
    }
    if (!isFixedTitle && !initialFileName) {
      setFileName(initialFile.name.replace(/\.[^/.]+$/, ""));
    }
    // Only prefill when the inline drop zone passes a new file.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile]);

  const isUploading = uploadProgress !== null;

  const handleClose = () => {
    if (isUploading) return;
    onCancel?.();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!onUpload || !isFormValid || isUploading) return;

    const finalFileName = isFixedTitle
      ? initialFileName
      : initialFileName
        ? `${initialFileName}_${fileName}`
        : fileName;

    onUpload({
      fileName: finalFileName,
      description,
      file: isMapUpload
        ? selectedFiles.length === 1
          ? selectedFiles[0]
          : selectedFiles
        : file,
      fileType,
    });
  };

  return (
    <AppFormModal
      isOpen
      showCancel
      cancelLabel="Cancel"
      isSubmitting={isUploading}
      submitDisabled={!!fileUploadError || !isFormValid || fileTypeMismatch}
      submitLabel={isUploading ? "Uploading…" : "Upload"}
      title="Upload file"
      width={480}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        {isFixedTitle ? (
          <Input disabled required label="File name" value={initialFileName} />
        ) : (
          <Input
            required
            label="File name"
            placeholder="Enter file name"
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
          />
        )}

        {!isMapUpload ? (
          <Textarea
            label="Description (Optional)"
            placeholder="Enter file description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        ) : null}

        <FileUpload
          required
          accept={accept}
          disableDragDrop={false}
          error={fileUploadError}
          file={isMapUpload ? null : file}
          files={isMapUpload ? mapFiles : undefined}
          label="File"
          multiple={isMapUpload}
          progress={uploadProgress ?? undefined}
          uploadSubtitle="or click Upload File to browse your device"
          uploadTitle="Drag & Drop Files Here"
          onFileChange={handleFileSelect}
          onFilesChange={isMapUpload ? setMapFiles : undefined}
        />
      </div>
    </AppFormModal>
  );
}

export default UploadFile;
