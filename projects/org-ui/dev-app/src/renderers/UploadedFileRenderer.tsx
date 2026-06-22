import { DownloadedFile } from '@fieldflow360/org-ui';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

const DEMO_UPLOADED_DATE = '2026-05-01T10:30:00.000Z';

export const UploadedFileRenderer = () => {
  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        Uploaded File
      </h2>
      <CodePreview
        title="DownloadedFile usage"
        code={`<DownloadedFile
  fileName="boundary.geojson"
  fileSizeBytes={84322}
  uploadedDate="${DEMO_UPLOADED_DATE}"
  isActive
  onView={() => {}}
  onDownload={() => {}}
  onDelete={() => {}}
/>`}
      />
      <div className="space-y-3">
        <DownloadedFile
          fileName="boundary.geojson"
          fileSizeBytes={84322}
          uploadedDate={DEMO_UPLOADED_DATE}
          isActive
          onView={() => undefined}
          onDownload={() => undefined}
          onDelete={() => undefined}
        />
        <DownloadedFile
          fileName="layers-export.json"
          fileSizeBytes={1430000}
          uploadedDate={DEMO_UPLOADED_DATE}
          isProcessing
          onInfo={() => undefined}
        />
      </div>
    </Section>
  );
};
