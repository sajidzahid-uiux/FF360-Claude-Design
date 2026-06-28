"use client";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import {
  Avatar,
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import {
  Camera,
  CheckCircle2,
  Mail,
  Pencil,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFileUpload } from "@/hooks/useFileUpload";
import useUserData from "@/hooks/useUserData";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { PageRenderer } from "@/shared/ui/common/page-renderer";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SanitizedInput,
} from "@/shared/ui/primitives";
import { getErrorMessage } from "@/utils/apiError";

import { ChangeEmailModal } from "./ChangeEmailModal";

const validateField = (value: string, maxLength: number) => {
  if (value.length > maxLength) {
    toast.error(`Maximum ${maxLength} characters allowed`);
    return false;
  }
  return true;
};

function formatDisplayName(
  firstName: string,
  lastName: string,
  username: string
): string {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || username || "Your profile";
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-text-secondary text-sm">{label}</dt>
      <dd className="text-text-primary mt-1.5 truncate font-medium">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function UserProfilePage() {
  const { user: auth0User } = useAuth0();
  const { logout } = useAuth();
  const isSocial =
    auth0User?.sub?.startsWith("google-oauth2|") ||
    auth0User?.sub?.startsWith("apple|") ||
    auth0User?.sub?.startsWith("facebook|");
  const {
    data: thisUser,
    updateUser,
    updateUserEmailAndPassword,
    isLoading,
    error,
  } = useUserData();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    username: thisUser?.username || "",
    first_name: thisUser?.first_name || "",
    last_name: thisUser?.last_name || "",
    phone_number: thisUser?.phone_number || "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { stack, openModal, closeModalKey } = useModalStack();
  const showEmailModal = stack.some((f) => f.key === "change-email");

  const {
    file: profileImage,
    error: profileImageError,
    fileInputRef,
    handleFileChange,
  } = useFileUpload({
    onFileSelect: (file) => {
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    },
  });

  const displayName = useMemo(
    () => formatDisplayName(form.first_name, form.last_name, form.username),
    [form.first_name, form.last_name, form.username]
  );

  const avatarSrc =
    previewUrl || thisUser?.profile_image || auth0User?.picture || undefined;

  useEffect(() => {
    if (thisUser) {
      setForm({
        username: thisUser.username || "",
        first_name: thisUser.first_name || "",
        last_name: thisUser.last_name || "",
        phone_number: thisUser.phone_number || "",
      });
      setPreviewUrl(thisUser.profile_image || null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [thisUser, fileInputRef]);

  useEffect(() => {
    if (profileImageError) {
      toast.error(profileImageError);
    }
  }, [profileImageError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (form.username && form.username.length > 50) return;
    if (form.first_name && form.first_name.length > 150) return;
    if (form.last_name && form.last_name.length > 150) return;
    if (form.phone_number && form.phone_number.length > 15) return;

    const filteredData = Object.fromEntries(
      // eslint-disable-next-line unused-imports/no-unused-vars
      Object.entries(form).filter(([_, value]) => value !== "")
    );

    const onSuccess = () => {
      toast.success("Profile updated successfully");
      setEditMode(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewUrl(null);
    };

    const onError = (saveError: unknown) => {
      toast.error(getErrorMessage(saveError, "Failed to update profile"));
    };

    try {
      if (profileImage) {
        const formData = new FormData();
        Object.entries(filteredData).forEach(([key, value]) =>
          formData.append(key, value as string)
        );
        formData.append("profile_image", profileImage);
        updateUser.mutate(
          {
            updatedUser:
              formData as unknown as import("@/api/types").AuthUserUpdatePayload,
          },
          { onSuccess, onError }
        );
      } else {
        updateUser.mutate(
          { updatedUser: filteredData },
          { onSuccess, onError }
        );
      }
    } catch (saveError: unknown) {
      toast.error(getErrorMessage(saveError, "Failed to update profile"));
    }
  };

  const handleCancel = () => {
    setForm({
      username: thisUser?.username || "",
      first_name: thisUser?.first_name || "",
      last_name: thisUser?.last_name || "",
      phone_number: thisUser?.phone_number || "",
    });
    setEditMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreviewUrl(null);
  };

  const handleUpdateEmail = async (email: string) => {
    await updateUserEmailAndPassword.mutateAsync({
      updatedUser: { email },
    });
    logout();
  };

  const actionButtons = editMode ? (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        leftIcon={<X className="h-4 w-4" />}
        size={ComponentSizeEnum.SM}
        title="Cancel"
        variant={ButtonVariantEnum.SURFACE}
        onClick={handleCancel}
      />
      <Button
        leftIcon={<CheckCircle2 className="h-4 w-4" />}
        loading={updateUser.isPending}
        size={ComponentSizeEnum.SM}
        title="Save changes"
        onClick={handleSave}
      />
    </div>
  ) : (
    <Button
      leftIcon={<Pencil className="h-4 w-4" />}
      size={ComponentSizeEnum.SM}
      title="Edit profile"
      variant={ButtonVariantEnum.SURFACE}
      onClick={() => setEditMode(true)}
    />
  );

  return (
    <PageRenderer
      data={thisUser ? [thisUser] : []}
      emptyState={{
        title: "No profile data",
        description: "Your profile information will appear here.",
      }}
      error={
        error ? new Error(error.message || "Failed to load user data") : null
      }
      isLoading={isLoading || false}
      loadingMessage="Loading profile..."
      padding="none"
      renderChildrenWhenEmpty={true}
      title=""
    >
      {() => (
        <div className="w-full min-w-0 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader className="border-border-subtle border-b pb-6">
              <CardTitle className="text-lg">Personal details</CardTitle>
              <CardDescription>
                {editMode
                  ? "Update your photo and account information."
                  : "Your name, username, and contact details."}
              </CardDescription>
              <CardAction className="max-sm:col-span-2 max-sm:row-start-3 max-sm:w-full max-sm:justify-self-stretch sm:justify-self-end">
                {actionButtons}
              </CardAction>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <Avatar
                    alt={displayName}
                    className="ring-border-subtle ring-2 ring-offset-2 ring-offset-[var(--color-bg-surface-elevated)]"
                    fallback={
                      auth0User?.name?.[0] || auth0User?.email?.[0] || "U"
                    }
                    size={96}
                    src={avatarSrc}
                  />
                  {editMode && (
                    <>
                      <SanitizedInput
                        ref={fileInputRef}
                        unstyled
                        accept="image/*"
                        className="hidden"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <button
                        aria-label="Change profile photo"
                        className="bg-bg-surface-elevated/95 border-border-subtle absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition hover:bg-[var(--color-bg-app)]"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="text-text-primary h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-text-primary truncate text-xl font-semibold tracking-tight">
                    {displayName}
                  </p>
                  <p className="text-text-secondary mt-1 truncate text-sm">
                    {form.username || auth0User?.email}
                  </p>
                  {editMode && profileImage ? (
                    <p className="text-text-muted mt-2 truncate text-xs">
                      {profileImage.name}
                    </p>
                  ) : null}
                </div>
              </div>

              {editMode ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <SanitizedInput
                    disabled={!editMode}
                    id="first_name"
                    label="First name"
                    name="first_name"
                    type="text"
                    value={form.first_name}
                    onBlur={(e) => validateField(e.target.value, 150)}
                    onChange={handleChange}
                  />
                  <SanitizedInput
                    disabled={!editMode}
                    id="last_name"
                    label="Last name"
                    name="last_name"
                    type="text"
                    value={form.last_name}
                    onBlur={(e) => validateField(e.target.value, 150)}
                    onChange={handleChange}
                  />
                  <SanitizedInput
                    disabled={!editMode}
                    id="username"
                    label="Username"
                    name="username"
                    type="text"
                    value={form.username}
                    onBlur={(e) => validateField(e.target.value, 50)}
                    onChange={handleChange}
                  />
                  <SanitizedInput
                    disabled={!editMode}
                    id="phone_number"
                    label="Phone number"
                    name="phone_number"
                    type="tel"
                    value={form.phone_number}
                    onBlur={(e) => validateField(e.target.value, 15)}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <dl className="grid gap-5 sm:grid-cols-2">
                  <ProfileField label="First name" value={form.first_name} />
                  <ProfileField label="Last name" value={form.last_name} />
                  <ProfileField label="Username" value={form.username} />
                  <ProfileField
                    label="Phone number"
                    value={form.phone_number}
                  />
                </dl>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="bg-bg-app text-text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">Email address</CardTitle>
                    <CardDescription>
                      Used for sign-in and account notifications.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-text-primary truncate font-medium">
                  {auth0User?.email}
                </p>
                <Button
                  disabled={isSocial}
                  size={ComponentSizeEnum.SM}
                  title="Change email"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={() => openModal("change-email")}
                />
                {isSocial ? (
                  <p className="text-text-muted text-xs">
                    Email cannot be changed for social logins.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="bg-bg-app text-text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">Account status</CardTitle>
                    <CardDescription>
                      Verification and account health.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
                    "bg-[var(--color-feedback-success-soft)] text-[var(--color-feedback-success-strong)]"
                  )}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Verified account
                </div>
                <p className="text-text-muted mt-3 text-sm">
                  Your account has been verified and is in good standing.
                </p>
              </CardContent>
            </Card>
          </div>

          <ChangeEmailModal
            open={showEmailModal}
            onOpenChange={(o) => {
              if (!o) closeModalKey("change-email");
            }}
            onUpdateEmail={handleUpdateEmail}
          />
        </div>
      )}
    </PageRenderer>
  );
}
