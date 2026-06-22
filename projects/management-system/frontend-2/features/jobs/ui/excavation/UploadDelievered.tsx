import { FC, useState } from "react";

import { Button, ButtonVariantEnum, FileUpload } from "@fieldflow360/org-ui";

import { useFileUpload } from "@/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SanitizedTextarea,
} from "@/shared/ui/primitives";

interface UploadFileProps {
  onCancel?: () => void;
  onUpload?: (data: {
    fileName: string;
    description: string;
    file: File | null;
  }) => void;
}

export const UploadDelievered: FC<UploadFileProps> = ({
  onCancel,
  onUpload,
}) => {
  const [description, setDescription] = useState("");
  const [disabled, setDisabled] = useState(false);

  const {
    file,
    error: uploadError,
    handleFileSelect,
    resetFile,
  } = useFileUpload({});

  const handleUpload = () => {
    if (onUpload) {
      setDisabled(true);
      onUpload({ fileName: file?.name || "", description, file });
      resetFile();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div
        style={{
          width: 480,
          height: 427,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card className="flex h-full w-full flex-col justify-between p-6">
          <div>
            <CardHeader className="mb-4 p-0">
              <CardTitle className="text-3xl font-semibold">
                Upload File
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-0">
              <div>
                <label className="mb-1 block text-lg font-medium">
                  Description
                </label>
                <SanitizedTextarea
                  className="min-h-[80px] resize-none"
                  placeholder="Enter file description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <FileUpload
                disableDragDrop={false}
                error={uploadError}
                file={file}
                uploadSubtitle="or click Upload File to browse your device"
                uploadTitle="Drag & Drop Files Here"
                onFileChange={handleFileSelect}
              />
            </CardContent>
          </div>
          <div className="mt-auto flex justify-between gap-2">
            <Button
              aria-label="Cancel"
              title="Cancel"
              variant={ButtonVariantEnum.SURFACE}
              onClick={onCancel}
            />
            <Button
              aria-label="Upload"
              disabled={disabled || !!uploadError}
              loading={disabled}
              title="Upload"
              onClick={handleUpload}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UploadDelievered;
