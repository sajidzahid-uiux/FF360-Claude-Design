import { ChangeEvent, InputHTMLAttributes, forwardRef } from "react";

import { SanitizedInput } from "@/shared/ui/primitives";

interface FileInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  accept?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ accept, onChange, className = "", ...props }, ref) => {
    return (
      <SanitizedInput
        ref={ref}
        unstyled
        accept={accept}
        className={`border-border-subtle focus:ring-accent bg-bg-app text-text-primary file:bg-accent file:text-text-inverse hover:file:bg-accent/90 w-full cursor-pointer rounded-lg border px-3 py-1 text-base file:mr-4 file:rounded file:border-0 file:px-4 file:py-1 file:text-sm file:font-semibold focus:ring-2 focus:outline-none ${className}`}
        type="file"
        onChange={onChange}
        {...props}
      />
    );
  }
);

FileInput.displayName = "FileInput";

export default FileInput;
