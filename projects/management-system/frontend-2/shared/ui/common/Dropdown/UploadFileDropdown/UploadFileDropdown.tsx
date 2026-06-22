"use client";

import { memo, useMemo } from "react";

import { Button, Dropdown, type DropdownOption } from "@fieldflow360/org-ui";
import { Upload } from "lucide-react";

import { JobType, ResourceType } from "@/constants";

import { BASE_ITEMS } from "./constants";
import { createTilingSpecialItem } from "./helpers";
import type { FileTypePayload, UploadFileDropdownProps } from "./types";

function UploadFileDropdown({
  entityType,
  jobType,
  fileTypesConfig,
  uploading,
  disabled,
  onFileTypeSelect,
}: UploadFileDropdownProps) {
  const { options, payloadByValue } = useMemo(() => {
    const payloadByValue = new Map<string, FileTypePayload>();
    const items: DropdownOption<string>[] = [];

    const register = (
      value: string,
      payload: FileTypePayload,
      label: string
    ) => {
      payloadByValue.set(value, payload);
      items.push({ value, label });
    };

    const hasMapSpecial =
      fileTypesConfig.special?.some(
        (s: { uploadType?: string }) => s?.uploadType === "map"
      ) ?? false;

    const isTiling = jobType === JobType.TILING;
    const isRepairOrExcavationWithMaps =
      hasMapSpecial &&
      (jobType === JobType.REPAIR || jobType === JobType.EXCAVATION);
    const isLeadLimited =
      entityType === ResourceType.LEAD &&
      (jobType === JobType.REPAIR || jobType === JobType.EXCAVATION) &&
      !hasMapSpecial;

    if (isTiling || isRepairOrExcavationWithMaps) {
      fileTypesConfig.special?.forEach((special) => {
        const item = createTilingSpecialItem(special);
        if (item) {
          register(item.id, item.payload, item.label);
        }
      });

      if (fileTypesConfig.regular?.includes("one_call")) {
        register(
          BASE_ITEMS.one_call.id,
          BASE_ITEMS.one_call.payload,
          BASE_ITEMS.one_call.label
        );
      }

      register(
        BASE_ITEMS.other.id,
        BASE_ITEMS.other.payload,
        BASE_ITEMS.other.label
      );

      return { options: items, payloadByValue };
    }

    if (isLeadLimited) {
      if (fileTypesConfig.regular?.includes("one_call")) {
        register(
          BASE_ITEMS.one_call.id,
          BASE_ITEMS.one_call.payload,
          BASE_ITEMS.one_call.label
        );
      }

      register(
        BASE_ITEMS.other.id,
        BASE_ITEMS.other.payload,
        BASE_ITEMS.other.label
      );

      return { options: items, payloadByValue };
    }

    (fileTypesConfig.regular ?? []).forEach((type) => {
      const base = BASE_ITEMS[type as keyof typeof BASE_ITEMS];
      if (base) {
        register(base.id, base.payload, base.label);
      }
    });

    register(
      BASE_ITEMS.other.id,
      BASE_ITEMS.other.payload,
      BASE_ITEMS.other.label
    );

    return { options: items, payloadByValue };
  }, [entityType, jobType, fileTypesConfig]);

  return (
    <Dropdown
      fullWidth={false}
      menuMinWidth={200}
      options={options}
      placeholder="Upload file"
      trigger={
        <Button
          disabled={uploading || disabled}
          leftIcon={<Upload aria-hidden className="h-4 w-4" strokeWidth={2} />}
          title={uploading ? "Uploading…" : "Upload file"}
        />
      }
      onChange={(value) => {
        const payload = payloadByValue.get(value);
        if (payload) {
          onFileTypeSelect(payload);
        }
      }}
    />
  );
}

export default memo(UploadFileDropdown);
