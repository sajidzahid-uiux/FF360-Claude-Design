"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { ExternalLink, Map as MapIcon, Plus, Trash2 } from "lucide-react";

import { StakeholderContact, StakeholderFarm } from "@/api/types/jobs";
import { JobLeadTypeSegment } from "@/constants";
import { ResourceType } from "@/constants/enums";
import {
  ON_SITE_OPERATIONS_LABEL,
  ON_SITE_OPERATION_LABEL,
} from "@/features/contacts/model/constants";
import { useContactPermissions, useFarmPermissions } from "@/hooks/permissions";
import { useRecordFarmsForContacts } from "@/hooks/useRecordData";
import { useRouteIds } from "@/hooks/useRouteIds";
import { StakeholderPrimaryButton } from "@/shared/ui/common/StakeholderPrimaryButton";
import { DialogTemplate } from "@/shared/ui/common/dialogs";
import { SanitizedInput } from "@/shared/ui/primitives";

interface FarmAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "job" | "lead";
  recordJobType: JobLeadTypeSegment;
  contacts?: StakeholderContact[];
  farms?: StakeholderFarm[];
  primaryFarmId?: number;
  readOnly?: boolean;
  onSave: (farmIds: number[], primaryFarmId: number | null) => Promise<void>;
  isSaving?: boolean;
}

export function FarmAssignmentDialog({
  open,
  onOpenChange,
  entityType,
  recordJobType,
  contacts = [],
  farms = [],
  primaryFarmId,
  readOnly = false,
  onSave,
  isSaving = false,
}: FarmAssignmentDialogProps) {
  const router = useRouter();
  const { orgId } = useRouteIds();

  const { canRead: canAccessContact } = useContactPermissions();
  const { canEdit: canEditFarm, canRead: canReadFarm } = useFarmPermissions();
  const canCreateNewFarm = canAccessContact && canEditFarm;

  const [selectedFarmIds, setSelectedFarmIds] = useState<number[]>([]);
  const [selectedPrimaryFarmId, setSelectedPrimaryFarmId] = useState<
    number | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSelectingContact, setIsSelectingContact] = useState(false);

  const contactIds = useMemo(() => contacts.map((c) => c.id), [contacts]);

  const { farms: availableFarmsData, isLoading: farmsLoading } =
    useRecordFarmsForContacts(contactIds, {
      resourceType: entityType === "job" ? ResourceType.JOB : ResourceType.LEAD,
      jobType: recordJobType,
    });

  const contactMap = useMemo(() => {
    const map = new Map<number, string>();
    contacts.forEach((c) => {
      map.set(c.id, c.full_name);
    });
    return map;
  }, [contacts]);

  useEffect(() => {
    if (open) {
      setSelectedFarmIds(farms.map((f) => f.id));
      const initialPrimary =
        primaryFarmId ?? farms.find((f) => f.is_primary)?.id ?? null;
      setSelectedPrimaryFarmId(initialPrimary);
      setSearchTerm("");
      setIsSelectingContact(false);
    }
  }, [open, farms, primaryFarmId]);

  const farmMap = useMemo(() => {
    const map = new Map<
      number,
      { name: string; contact_id: number; acreage?: number | string | null }
    >();
    farms.forEach((f) => {
      map.set(f.id, {
        name: f.name,
        contact_id: f.contact_id,
        acreage: f.acreage,
      });
    });
    if (availableFarmsData) {
      availableFarmsData.forEach((f) => {
        map.set(f.id, {
          name: f.name,
          contact_id: f.contact_id,
          acreage: f.acreage,
        });
      });
    }
    return map;
  }, [farms, availableFarmsData]);

  const availableFarms = useMemo(() => {
    if (!availableFarmsData) return [];
    return availableFarmsData.filter((f) => {
      const isAlreadySelected = selectedFarmIds.includes(f.id);
      if (isAlreadySelected) return false;
      if (!searchTerm) return true;
      return f.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [availableFarmsData, selectedFarmIds, searchTerm]);

  const isUnchanged = useMemo(() => {
    const initialIds = farms.map((f) => f.id);
    const hasIdsChanged =
      initialIds.length !== selectedFarmIds.length ||
      selectedFarmIds.some((id, idx) => initialIds[idx] !== id);
    const initialPrimary =
      primaryFarmId ?? farms.find((f) => f.is_primary)?.id ?? null;
    const hasPrimaryChanged = selectedPrimaryFarmId !== initialPrimary;

    return !hasIdsChanged && !hasPrimaryChanged;
  }, [farms, selectedFarmIds, primaryFarmId, selectedPrimaryFarmId]);

  const handleSave = useCallback(async () => {
    if (readOnly) return;
    await onSave(selectedFarmIds, selectedPrimaryFarmId);
  }, [readOnly, onSave, selectedFarmIds, selectedPrimaryFarmId]);

  const handleAddFarm = useCallback(
    (id: number) => {
      setSelectedFarmIds((prev) => {
        const updated = [...prev, id];
        if (!selectedPrimaryFarmId || prev.length === 0) {
          setSelectedPrimaryFarmId(id);
        }
        return updated;
      });
    },
    [selectedPrimaryFarmId]
  );

  const handleRemoveFarm = useCallback(
    (id: number) => {
      setSelectedFarmIds((prev) => {
        const updated = prev.filter((fid) => fid !== id);
        if (selectedPrimaryFarmId === id) {
          setSelectedPrimaryFarmId(updated.length > 0 ? updated[0] : null);
        }
        return updated;
      });
    },
    [selectedPrimaryFarmId]
  );

  const handleSetPrimary = useCallback((id: number) => {
    setSelectedPrimaryFarmId(id);
  }, []);

  const handleCreateNewFarm = useCallback(() => {
    if (!orgId) return;
    if (contacts.length === 1) {
      router.push(`/${orgId}/contact/${contacts[0].id}?action=add`);
      onOpenChange(false);
    } else if (contacts.length > 1) {
      setIsSelectingContact(true);
    }
  }, [contacts, orgId, router, onOpenChange]);

  const handleSelectContactForNewFarm = useCallback(
    (contactId: number) => {
      if (!orgId) return;
      router.push(`/${orgId}/contact/${contactId}?action=add`);
      onOpenChange(false);
    },
    [orgId, router, onOpenChange]
  );

  const handleGoBackToFarms = useCallback(() => {
    setIsSelectingContact(false);
  }, []);

  const entityLabel = entityType === "job" ? "job" : "lead";

  return (
    <DialogTemplate
      description={
        isSelectingContact
          ? `Select which assigned client to create a new ${ON_SITE_OPERATION_LABEL.toLowerCase()} for.`
          : readOnly
            ? `Assigned ${ON_SITE_OPERATIONS_LABEL.toLowerCase()} for this ${entityLabel}.`
            : `Assign multiple ${ON_SITE_OPERATIONS_LABEL.toLowerCase()} to this ${entityLabel} and select one as primary.`
      }
      footer={
        <div className="flex w-full items-center justify-end gap-2 border-t pt-4">
          {isSelectingContact ? (
            <Button
              aria-label="Back"
              title="Back"
              variant={ButtonVariantEnum.SURFACE}
              onClick={handleGoBackToFarms}
            />
          ) : (
            <>
              <Button
                aria-label={readOnly ? "Close" : "Cancel"}
                title={readOnly ? "Close" : "Cancel"}
                variant={ButtonVariantEnum.SURFACE}
                onClick={() => onOpenChange(false)}
              />
              {!readOnly ? (
                <Button
                  aria-label={isSaving ? "Saving..." : "Save changes"}
                  disabled={isSaving || isUnchanged}
                  loading={isSaving}
                  title={isSaving ? "Saving..." : "Save changes"}
                  onClick={handleSave}
                />
              ) : null}
            </>
          )}
        </div>
      }
      maxWidth="512px"
      open={open}
      title={
        isSelectingContact
          ? "Select Client"
          : readOnly
            ? `View ${ON_SITE_OPERATIONS_LABEL}`
            : `Manage ${ON_SITE_OPERATIONS_LABEL}`
      }
      onOpenChange={onOpenChange}
    >
      {isSelectingContact ? (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              className="border-border-subtle hover:bg-bg-hover bg-bg-surface-elevated flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors"
              type="button"
              onClick={() => handleSelectContactForNewFarm(contact.id)}
            >
              <span className="text-text-primary text-sm font-medium">
                {contact.full_name}
              </span>
              <ExternalLink className="text-text-muted h-4 w-4" />
            </button>
          ))}
        </div>
      ) : (
        <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
          {/* Section 1: Assigned Farms */}
          <div>
            <h3 className="text-text-primary mb-3 text-sm font-semibold">
              {`Assigned ${ON_SITE_OPERATIONS_LABEL}`}
            </h3>
            {selectedFarmIds.length === 0 ? (
              <p className="text-text-muted text-xs italic">
                {`No ${ON_SITE_OPERATIONS_LABEL.toLowerCase()} assigned`}
              </p>
            ) : (
              <div className="space-y-2">
                {selectedFarmIds.map((id) => {
                  const farm = farmMap.get(id);
                  const isPrimary = selectedPrimaryFarmId === id;
                  const displayName =
                    farm?.name ?? `${ON_SITE_OPERATION_LABEL} #${id}`;
                  const clientName = farm
                    ? contactMap.get(farm.contact_id)
                    : undefined;
                  const acreage = farm?.acreage;
                  const acresText =
                    acreage && acreage !== "" ? ` (${acreage} acres)` : "";

                  return (
                    <div
                      key={id}
                      className={cn(
                        "bg-bg-surface-elevated flex items-center justify-between rounded-lg border p-3 transition-colors",
                        isPrimary
                          ? "border-accent bg-accent-light"
                          : "border-border-subtle"
                      )}
                    >
                      <div className="mr-4 flex min-w-0 items-center gap-2.5">
                        <MapIcon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isPrimary ? "text-accent" : "text-text-muted"
                          )}
                        />
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "truncate text-sm",
                              isPrimary ? "font-semibold" : "font-medium"
                            )}
                          >
                            {displayName}
                          </p>
                          <p className="text-text-muted truncate text-xs">
                            {clientName ?? `Client #${farm?.contact_id}`}
                            {acresText}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {/* Primary Toggle */}
                        <StakeholderPrimaryButton
                          disabled={readOnly}
                          isPrimary={isPrimary}
                          onClick={() => handleSetPrimary(id)}
                        />

                        {/* External Link */}
                        {orgId && farm && canReadFarm ? (
                          <a
                            className="hover:bg-bg-surface text-text-muted rounded-md p-1.5 transition-colors"
                            href={`/${orgId}/contact/${farm.contact_id}?farmId=${id}`}
                            rel="noopener noreferrer"
                            target="_blank"
                            onClick={() => onOpenChange(false)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}

                        {/* Remove Button */}
                        {!readOnly ? (
                          <button
                            className="hover:bg-feedback-error/15 text-feedback-error rounded-md p-1.5 transition-colors"
                            type="button"
                            onClick={() => handleRemoveFarm(id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Available Farms */}
          {!readOnly ? (
            <div className="border-border-subtle space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-text-primary text-sm font-semibold">
                  {`Available ${ON_SITE_OPERATIONS_LABEL}`}
                </h3>
                {contacts.length > 0 && canCreateNewFarm ? (
                  <Button
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    size={ComponentSizeEnum.SM}
                    title={`Create New ${ON_SITE_OPERATION_LABEL}`}
                    variant={ButtonVariantEnum.SURFACE}
                    onClick={handleCreateNewFarm}
                  />
                ) : null}
              </div>

              <SanitizedInput
                placeholder={`Search available ${ON_SITE_OPERATIONS_LABEL.toLowerCase()} by name...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {farmsLoading ? (
                <div className="text-text-muted py-4 text-center text-xs">
                  {`Loading ${ON_SITE_OPERATIONS_LABEL.toLowerCase()}...`}
                </div>
              ) : availableFarms.length === 0 ? (
                <p className="text-text-muted py-4 text-center text-xs italic">
                  {searchTerm
                    ? `No ${ON_SITE_OPERATIONS_LABEL.toLowerCase()} match search query`
                    : `No available ${ON_SITE_OPERATIONS_LABEL.toLowerCase()} found for assigned clients`}
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {availableFarms.map((farm) => {
                    const clientName = contactMap.get(farm.contact_id);
                    const acres =
                      farm.acreage && farm.acreage !== ""
                        ? ` (${farm.acreage} acres)`
                        : "";

                    return (
                      <div
                        key={farm.id}
                        className="border-border-subtle bg-bg-surface-elevated flex items-center justify-between rounded-lg border p-2.5"
                      >
                        <div className="mr-4 flex min-w-0 items-center gap-2.5">
                          <MapIcon className="text-text-muted h-4 w-4 shrink-0" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {farm.name}
                            </p>
                            <p className="text-text-muted truncate text-xs">
                              {clientName ?? `Client #${farm.contact_id}`}
                              {acres}
                            </p>
                          </div>
                        </div>

                        <button
                          className="hover:bg-accent/15 text-accent shrink-0 rounded-md p-1.5 transition-colors"
                          type="button"
                          onClick={() => handleAddFarm(farm.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </DialogTemplate>
  );
}
