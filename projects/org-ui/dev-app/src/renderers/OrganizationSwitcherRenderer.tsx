import {
  Button,
  ComponentSizeEnum,
  LocationPicker,
  type LocationPoint,
  OrganizationSwitcherItem,
  OrganizationSwitcherModal,
} from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

const demoOrganizations: OrganizationSwitcherItem[] = [
  { id: 101, name: 'FieldFlow Demo Org' },
  { id: 102, name: 'Tile Design Test' },
  { id: 103, name: 'CMS Playground', isActive: true },
];

export const OrganizationSwitcherRenderer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [location, setLocation] = useState<LocationPoint | undefined>(undefined);
  const [selectedOrg, setSelectedOrg] = useState<string | number>(
    demoOrganizations[0]?.id ?? 0
  );

  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Organization Switcher
        </h2>
        <CodePreview
          title="OrganizationSwitcherModal usage"
          code={`<OrganizationSwitcherModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  organizations={organizations}
  onSelectOrganization={(id) => setCurrentOrgId(id)}
  onCreateOrganization={() => openCreateFlow()}
/>`}
        />

        <div className="flex items-center gap-3">
          <Button
            title="Open org switcher"
            size={ComponentSizeEnum.SM}
            onClick={() => setIsOpen(true)}
          />
          <span className="text-text-secondary text-sm">
            Selected org id: <span className="font-semibold">{String(selectedOrg)}</span>
          </span>
        </div>
      </Section>

      <OrganizationSwitcherModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        organizations={demoOrganizations}
        onSelectOrganization={(organizationId) => {
          setSelectedOrg(organizationId);
          setIsOpen(false);
        }}
        createForm={{
          isOpen: true,
          onClose: () => setIsOpen(false),
          title: 'Create Organization',
          primaryLabel: 'Create Organization',
          isSubmitting: isSubmittingCreate,
          onSubmit: async () => {
            setIsSubmittingCreate(true);
            await new Promise((resolve) => setTimeout(resolve, 600));
            setIsSubmittingCreate(false);
            setIsOpen(false);
          },
          renderLocation: ({ location: pickerLocation, onLocationChange }) => (
            <LocationPicker
              location={pickerLocation ?? location}
              onLocationChange={(nextLocation) => {
                setLocation(nextLocation);
                onLocationChange(nextLocation);
              }}
              required
            />
          ),
        }}
      />
    </>
  );
};
