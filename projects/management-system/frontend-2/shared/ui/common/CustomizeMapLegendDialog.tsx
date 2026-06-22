"use client";

import { type FormEvent, useEffect, useState } from "react";

import { AppFormModal, ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import {
  JobLeadTypeSegment,
  JobType,
  isJobLeadTypeSegment,
  jobLeadTypeSegmentToJobType,
} from "@/constants";
import { useUpdateMapLegendMutation } from "@/hooks/mutations";
import { useMapLegends } from "@/hooks/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

import ColorPicker from "./ColorPicker";
import { Dropdown } from "./Dropdown";
import { getIconOptions } from "./MapIcons";

const formatTypeLabel = (type: string): string => {
  if (type === JobType.TILING) return "Tiling";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

interface CustomizeMapLegendDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEGEND_TYPES = [
  { value: JobType.REPAIR, label: "Repair Lead - Repair Job" },
  { value: JobType.EXCAVATION, label: "Excavation Lead - Excavation Job" },
  {
    value: JobLeadTypeSegment.TILING,
    label: "Tiling Lead - Tiling Job",
  },
];

export default function CustomizeMapLegendDialog({
  isOpen,
  onClose,
}: CustomizeMapLegendDialogProps) {
  const {
    data: mapLegends,
    isLoading: isMapLegendsLoading,
    error: mapLegendsError,
  } = useMapLegends();
  const updateMapLegend = useUpdateMapLegendMutation();
  const [selectedType, setSelectedType] = useState<string>(JobType.REPAIR);
  const [selectedIcon, setSelectedIcon] = useState<string>("1");
  const [leadColor, setLeadColor] = useState<string>("#ef4444");
  const [jobColor, setJobColor] = useState<string>("#3b82f6");
  const [isLoading, setIsLoading] = useState(false);

  const leadLegend = mapLegends?.find(
    (legend) => legend.legend_type === `${selectedType}_leads`
  );
  const jobLegend = mapLegends?.find(
    (legend) => legend.legend_type === `${selectedType}_jobs`
  );

  useEffect(() => {
    if (leadLegend) {
      setLeadColor(leadLegend.color);
      const iconNumber = leadLegend.icon_svg || "1";
      setSelectedIcon(iconNumber);
    }
    if (jobLegend) {
      setJobColor(jobLegend.color);
    }
  }, [selectedType, leadLegend, jobLegend]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      if (isMapLegendsLoading) {
        toast.error(
          "Legend data is still loading. Please wait a moment and try again."
        );
        setIsLoading(false);
        return;
      }

      if (!leadLegend && !jobLegend) {
        toast.error(
          `No legend entries found for "${selectedType}" type. Available types: ${
            mapLegends?.map((l) => l.legend_type).join(", ") || "none"
          }`
        );
        setIsLoading(false);
        return;
      }

      if (leadLegend) {
        await updateMapLegend.mutateAsync({
          id: leadLegend.id,
          data: {
            color: leadColor,
            icon_svg: selectedIcon,
          },
        });
      }

      if (jobLegend) {
        await updateMapLegend.mutateAsync({
          id: jobLegend.id,
          data: {
            color: jobColor,
            icon_svg: selectedIcon,
          },
        });
      }

      onClose();
    } catch (error) {
      console.error("Failed to save map legend:", error);
      toast.error("Failed to save map legend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleSaveChanges();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const iconType = isJobLeadTypeSegment(selectedType)
    ? jobLeadTypeSegmentToJobType(selectedType)
    : selectedType;
  const currentIconOptions = getIconOptions(iconType);

  if (!isOpen) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={isOpen}
      isSubmitting={isLoading}
      maxHeight="calc(100vh - 4rem)"
      submitLabel="Save Changes"
      title="Customize Map's Legend"
      width={896}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      {isMapLegendsLoading && (
        <Loader
          centerInContainer={false}
          className="py-8"
          size={ComponentSizeEnum.SM}
          text="Loading legend data..."
        />
      )}

      {mapLegendsError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 shrink-0 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clipRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                fillRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Legend Data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Failed to load map legend data. Please check the console for
                  details.
                </p>
                <p className="mt-1 font-mono text-xs">
                  {mapLegendsError?.message || "Unknown error"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <label className="text-text-primary text-sm font-medium">
            Lead and Job Type *
          </label>
          <Dropdown
            items={LEGEND_TYPES.map((type) => ({
              id: type.value,
              label: type.label,
            }))}
            mode="select"
            placeholder="Select type"
            selectedValue={selectedType}
            width="full"
            onValueChange={setSelectedType}
          />
        </div>

        <div className="space-y-3">
          <label className="text-text-primary text-sm font-medium">
            {formatTypeLabel(selectedType)} Icon
          </label>
          <div className="flex gap-2 sm:gap-4">
            {currentIconOptions.map((option) => (
              <Card
                key={option.value}
                className={`aspect-square flex-1 cursor-pointer transition-all ${
                  selectedIcon === option.value
                    ? "ring-accent border-accent bg-accent-light ring-2"
                    : "hover:border-muted-foreground/50 hover:bg-bg-surface/50"
                }`}
                onClick={() => setSelectedIcon(option.value)}
              >
                <CardContent className="flex min-h-[80px] flex-col items-center space-y-1 p-2 sm:min-h-[100px] sm:space-y-2 sm:p-4">
                  <div className="bg-text-accent dark:bg-bg-surface night:bg-bg-surface flex h-8 w-8 items-center justify-center rounded-full p-2 sm:h-12 sm:w-12 sm:p-3">
                    <div className="scale-75 sm:scale-100">{option.icon}</div>
                  </div>
                  <span className="text-center text-xs leading-tight font-medium sm:text-sm">
                    {option.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-border-subtle">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-text-primary text-sm font-medium">
                {formatTypeLabel(selectedType)} Leads Color
              </CardTitle>
            </CardHeader>
            <CardContent className="h-48 sm:h-64">
              <ColorPicker
                color={leadColor}
                setColor={setLeadColor}
                size="large"
              />
            </CardContent>
          </Card>

          <Card className="border-border-subtle">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-text-primary text-sm font-medium">
                {formatTypeLabel(selectedType)} Jobs Color
              </CardTitle>
            </CardHeader>
            <CardContent className="h-48 sm:h-64">
              <ColorPicker
                color={jobColor}
                setColor={setJobColor}
                size="large"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppFormModal>
  );
}
