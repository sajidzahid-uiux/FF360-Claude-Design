import { FileUpload } from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app-components';
import { Section } from '../ui-app-components/Section';

export const FileUploadRenderer = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        File Upload
      </h2>
      <CodePreview
        title="FileUpload usage"
        code={`const [file, setFile] = useState<File | null>(null);

<FileUpload
  file={file}
  onFileChange={setFile}
  uploadTitle="Upload File"
  uploadSubtitle="Click to browse or drag and drop"
/>`}
      />
      <FileUpload
        file={file}
        onFileChange={setFile}
        uploadTitle="Upload File"
        uploadSubtitle="Click to browse or drag and drop"
      />
    </Section>
  );
};
