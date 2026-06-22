import { useCallback, useId, useRef, useState } from 'react';
import { ButtonVariantEnum, ComponentSizeEnum } from '../../../constants';
import { Button } from '../../ui-components/Button';
import { cn } from '../../../utils/cn';

export interface FileUploadProps {
  label?: string;
  required?: boolean;
  file?: File | null;
  files?: File[];
  onFileChange: (file: File | null) => void;
  accept?: string;
  progress?: number;
  error?: string;
  uploadTitle?: string;
  uploadSubtitle?: string;
  disableDragDrop?: boolean;
  onClose?: () => void;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  onRemoveFile?: (file: File) => void;
}

const XIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const CheckIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
const UploadIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V6m0 0-3.75 3.75M12 6l3.75 3.75M21 15v3.75A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V15" /></svg>;

export function FileUpload({
  label,
  required,
  file,
  files = [],
  onFileChange,
  accept,
  progress,
  error,
  uploadTitle = 'Upload File',
  uploadSubtitle = 'Click to browse or drag and drop',
  disableDragDrop = false,
  onClose,
  multiple = false,
  onFilesChange,
  onRemoveFile,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = useCallback(
    (selectedFile: File | null) => {
      if (selectedFile) {
        onFileChange(selectedFile);
      }
    },
    [onFileChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (multiple && onFilesChange) {
      onFilesChange(selectedFiles);
      return;
    }
    handleFileSelect(selectedFiles[0] || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (disableDragDrop) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (disableDragDrop) return;
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disableDragDrop) return;
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files ?? []);
    if (multiple && onFilesChange) {
      onFilesChange(droppedFiles);
      return;
    }
    const droppedFile = droppedFiles[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const openFilePicker = () => {
    if (progress !== undefined && progress < 100) return;
    inputRef.current?.click();
  };

  const selectedFiles = files.length > 0 ? files : file ? [file] : [];
  const hasSelectedFiles = selectedFiles.length > 0;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={inputId} className="text-text-secondary text-sm font-medium">
          {label}
          {required && (
            <span className="ml-1 text-[var(--color-feedback-error)]">*</span>
          )}
        </label>
      )}

      <div
        className={cn(
          'relative overflow-hidden rounded-xl border transition-colors',
          isDragging
            ? 'border-accent bg-accent-light'
            : error
              ? 'border-[var(--color-feedback-error)] bg-[var(--color-feedback-error-soft)]'
              : 'border-border-subtle bg-bg-surface-elevated border-dashed',
          !file && !progress && 'hover:border-accent hover:bg-accent/30'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          id={inputId}
          ref={inputRef}
          disabled={!!progress}
          multiple={multiple}
        />

        {onClose ? (
          <Button
            iconOnly
            variant={ButtonVariantEnum.GHOST}
            size={ComponentSizeEnum.SM}
            className="bg-bg-surface-elevated/90 absolute top-2 right-2 z-10 rounded-full"
            leftIcon={XIcon}
            aria-label="Close upload"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        ) : null}

        {progress !== undefined && progress < 100 ? (
          <div className="p-8">
            <div className="text-center">
              <p className="text-text-secondary mb-3 text-sm font-medium">
                In Progress {progress}% ...
              </p>
              <div className="bg-border-subtle relative h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-text-primary h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : hasSelectedFiles ? (
          <div className="flex flex-col items-center justify-center gap-6 px-12 py-6">
            <div className="bg-accent rounded-xl p-3 text-text-inverse">{CheckIcon}</div>
            <div className="text-text-primary text-center text-lg font-[500]">
              {uploadTitle}
            </div>

            <div className="border-accent/60 bg-bg-surface-elevated w-full rounded-xl border pr-1 pl-3">
              <div className="max-h-28 space-y-1 overflow-y-auto py-2">
                {selectedFiles.map((selectedFile) => (
                  <div
                    key={`${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}`}
                    className="flex items-center justify-between gap-3 pr-1"
                  >
                    <span className="text-text-primary truncate text-sm font-medium">
                      {selectedFile.name}
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRemoveFile) {
                          onRemoveFile(selectedFile);
                        } else {
                          onFileChange(null);
                        }
                      }}
                      className="hover:bg-bg-hover rounded-full p-1.5 transition-colors"
                      aria-label="Remove file"
                      iconOnly
                      variant={ButtonVariantEnum.GHOST}
                      leftIcon={XIcon}
                    />
                  </div>
                ))}
              </div>
            </div>

            {multiple ? (
              <Button
                onClick={openFilePicker}
                title="Upload File"
                variant={ButtonVariantEnum.SURFACE}
                size={ComponentSizeEnum.SM}
              />
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
            <button
              type="button"
              onClick={openFilePicker}
              className="bg-bg-hover hover:bg-border-subtle rounded-xl p-3 transition-colors"
              aria-label="Select file"
            >
              <span className="text-text-primary">{UploadIcon}</span>
            </button>
            <span className="text-text-primary text-lg font-[500]">{uploadTitle}</span>
            <span className="text-text-muted text-sm md:text-[20px]">{uploadSubtitle}</span>
            <Button
              onClick={openFilePicker}
              title="Upload File"
              variant={ButtonVariantEnum.SURFACE}
              size={ComponentSizeEnum.SM}
              className="mt-8"
            />
          </div>
        )}
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-feedback-error)]">{error}</p>
      ) : null}
    </div>
  );
}
