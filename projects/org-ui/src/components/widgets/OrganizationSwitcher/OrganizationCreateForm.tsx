import { type FormEvent, useEffect, useId, useState } from 'react';
import { Upload } from 'lucide-react';
import type { Point } from '../../map-components';
import { LocationPicker } from '../../map-components';
import { AppFormModal } from '../../system-components/AppFormModal';
import { Button } from '../../ui-components/Button';
import { ButtonVariantEnum } from '../../../constants';
import { Input } from '../../ui-components/Input';
import { OrganizationLogoMark } from './OrganizationLogoMark';

export interface OrganizationCreateFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  logo?: File | null;
}

export type OrganizationCreateFieldErrors = Partial<
  Record<
    | keyof OrganizationCreateFormValues
    | 'phone_number'
    | 'general'
    | 'latitude'
    | 'longitude',
    string[]
  >
>;

export type OrganizationCreateFormInitialValues = Partial<OrganizationCreateFormValues> & {
  /** Existing logo URL when editing (preview only; pass a new `logo` file on submit to replace). */
  existingLogoUrl?: string | null;
};

export interface OrganizationCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  primaryLabel?: string;
  isSubmitting?: boolean;
  initialValues?: OrganizationCreateFormInitialValues;
  disableWhenPristine?: boolean;
  onSubmit: (values: OrganizationCreateFormValues) => void | Promise<void>;
  /** `modal` (default) or full-page inline layout inside a host shell (e.g. welcome hero). */
  layout?: 'modal' | 'inline';
  fieldErrors?: OrganizationCreateFieldErrors;
  /** When false, logo upload is hidden (Tile Design). Default true. */
  showLogo?: boolean;
  renderLocation?: (args: {
    location?: Point;
    onLocationChange: (location: Point | undefined) => void;
    address: string;
    onAddressChange: (address: string) => void;
  }) => React.ReactNode;
}

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

export const OrganizationCreateForm = ({
  isOpen,
  onClose,
  title = 'Create Organization',
  primaryLabel = 'Create Organization',
  isSubmitting = false,
  initialValues,
  disableWhenPristine = false,
  onSubmit,
  layout = 'modal',
  fieldErrors,
  showLogo = true,
  renderLocation,
}: OrganizationCreateFormProps) => {
  const logoInputId = useId();

  const sanitizePhoneNumber = (value: string): string =>
    value.replace(/[^0-9+()\- ]/g, '');

  const [name, setName] = useState(initialValues?.name ?? '');
  const [email, setEmail] = useState(initialValues?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(initialValues?.phoneNumber ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [logoFile, setLogoFile] = useState<File | null>(initialValues?.logo ?? null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(
    initialValues?.existingLogoUrl?.trim() || null
  );
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<Point | undefined>(
    initialValues?.latitude != null && initialValues?.longitude != null
      ? { type: 'Point', coordinates: [initialValues.longitude, initialValues.latitude] }
      : undefined
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setName(initialValues?.name ?? '');
    setEmail(initialValues?.email ?? '');
    setPhoneNumber(initialValues?.phoneNumber ?? '');
    setAddress(initialValues?.address ?? '');
    setLogoFile(initialValues?.logo ?? null);
    setExistingLogoUrl(initialValues?.existingLogoUrl?.trim() || null);
    setLocation(
      initialValues?.latitude != null && initialValues?.longitude != null
        ? { type: 'Point', coordinates: [initialValues.longitude, initialValues.latitude] }
        : undefined
    );
  }, [
    initialValues?.address,
    initialValues?.email,
    initialValues?.latitude,
    initialValues?.longitude,
    initialValues?.existingLogoUrl,
    initialValues?.logo,
    initialValues?.name,
    initialValues?.phoneNumber,
    isOpen,
  ]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const displayLogoUrl = logoPreviewUrl ?? existingLogoUrl;

  const isPristine =
    name === (initialValues?.name ?? '') &&
    email === (initialValues?.email ?? '') &&
    phoneNumber === (initialValues?.phoneNumber ?? '') &&
    address === (initialValues?.address ?? '') &&
    logoFile === (initialValues?.logo ?? null) &&
    (location?.coordinates[1] ?? null) === (initialValues?.latitude ?? null) &&
    (location?.coordinates[0] ?? null) === (initialValues?.longitude ?? null);

  const isFormEmpty =
    !name.trim() || !email.trim() || !phoneNumber.trim() || !address.trim();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isFormEmpty) {
      return;
    }
    await onSubmit({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      latitude: location?.coordinates[1] ?? null,
      longitude: location?.coordinates[0] ?? null,
      logo: logoFile,
    });
  };

  const handleLogoChange = (file: File | undefined) => {
    if (!file) {
      setLogoFile(null);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      return;
    }
    setLogoFile(file);
  };

  const nameErrors = fieldErrors?.name;
  const emailErrors = fieldErrors?.email;
  const phoneErrors = fieldErrors?.phoneNumber ?? fieldErrors?.phone_number;
  const addressErrors = fieldErrors?.address;
  const locationErrors = fieldErrors?.latitude ?? fieldErrors?.longitude;
  const generalErrors = fieldErrors?.general;

  const formBody = (
    <div className="space-y-4">
      {generalErrors && generalErrors.length > 0 ? (
        <div className="rounded border border-[var(--color-feedback-error)]/30 bg-[var(--color-feedback-error)]/10 px-4 py-3 text-sm text-[var(--color-feedback-error)]">
          {generalErrors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <h3 className="text-text-primary text-base font-semibold">Organization Details</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Input
            placeholder="Enter organization name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={nameErrors?.[0]}
            required
          />
        </div>
        <div className="space-y-1">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailErrors?.[0]}
            required
          />
        </div>
        <div className="space-y-1">
          <Input
            type="tel"
            inputMode="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(event) =>
              setPhoneNumber(sanitizePhoneNumber(event.target.value))
            }
            error={phoneErrors?.[0]}
            required
          />
        </div>
        <div className="space-y-1">
          <Input
            placeholder="Enter organization address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            error={addressErrors?.[0]}
            required
          />
        </div>
      </div>

      {showLogo ? (
        <div className="space-y-3">
          <h3 className="text-text-primary text-base font-semibold">Organization logo</h3>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="focus-visible:ring-accent rounded-2xl focus:outline-none focus-visible:ring-2"
              onClick={() => document.getElementById(logoInputId)?.click()}
              aria-label="Change organization logo"
            >
              <OrganizationLogoMark
                name={name.trim() || 'Organization'}
                logo={displayLogoUrl}
                size={96}
              />
            </button>
            <div className="flex min-w-[160px] flex-1 flex-col gap-2">
              <input
                id={logoInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleLogoChange(event.target.files?.[0])}
              />
              <Button
                type="button"
                variant={ButtonVariantEnum.SURFACE}
                title={logoFile ? logoFile.name : displayLogoUrl ? 'Change logo' : 'Upload logo'}
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={() => document.getElementById(logoInputId)?.click()}
              />
              <p className="text-text-muted text-xs">
                Optional. Maximum file size: 5MB. Click the preview or button to replace.
              </p>
            </div>
          </div>
          {fieldErrors?.logo?.[0] ? (
            <p className="text-sm text-[var(--color-feedback-error)]">{fieldErrors.logo[0]}</p>
          ) : null}
        </div>
      ) : null}

      {renderLocation ? (
        <div>
          {renderLocation({
            location,
            onLocationChange: setLocation,
            address,
            onAddressChange: setAddress,
          })}
        </div>
      ) : (
        <LocationPicker
          location={location}
          onLocationChange={setLocation}
          mapHeight={300}
          error={locationErrors?.[0]}
        />
      )}
      {locationErrors?.[0] && renderLocation ? (
        <p className="text-sm text-[var(--color-feedback-error)]">{locationErrors[0]}</p>
      ) : null}
    </div>
  );

  const submitDisabled =
    isSubmitting || isFormEmpty || (disableWhenPristine && isPristine);

  if (layout === 'inline') {
    if (!isOpen) return null;

    return (
      <div className="m-auto w-full max-w-lg space-y-6">
        <div className="relative flex items-center justify-center">
          <Button
            aria-label="Back"
            variant={ButtonVariantEnum.GHOST}
            iconOnly
            className="absolute left-0"
            onClick={onClose}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
                style={{ transform: 'scaleX(-1)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            }
          />
          <h1 className="text-text-primary text-3xl font-extrabold">{title}</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {formBody}
          <Button
            type="submit"
            fullWidth
            disabled={submitDisabled}
            title={isSubmitting ? 'Creating...' : primaryLabel}
          />
        </form>
      </div>
    );
  }

  return (
    <AppFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={primaryLabel}
      submitDisabled={submitDisabled}
      width={1120}
      maxHeight="calc(100% - 36px)"
    >
      {formBody}
    </AppFormModal>
  );
};
