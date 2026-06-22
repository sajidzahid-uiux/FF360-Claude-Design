import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

import { WALL_TYPE_LABELS, WallType } from "@/constants";
import { useMainPipeSizes } from "@/hooks";
import { Card, SanitizedInput } from "@/shared/ui/primitives";

interface DailyProgressPopUpProps {
  isLateral: boolean;
  isMain: boolean;
  installedformData: {
    footage: string;
    pipeSize: string;
    wallType: WallType;
  };
  setInstalledformData: (data: {
    footage: string;
    pipeSize: string;
    wallType: WallType;
  }) => void;
  setShowFootageForm: (show: boolean) => void;
  handleUpdateLateralFootage: (data: { footage: number; date: string }) => void;
  handleUpdateMainFootage: (data: {
    footage: number;
    date: string;
    size: string;
    pipe_wall_type: WallType;
  }) => void;
  card?: { data: Array<{ key: string; value: unknown }> };
  setFormData?: (data: Record<string, unknown>) => void;
}

export default function DailyProgressPopUp({
  isLateral,
  isMain,
  installedformData,
  setInstalledformData,
  setShowFootageForm,
  handleUpdateLateralFootage,
  handleUpdateMainFootage,
  card,
  setFormData,
}: DailyProgressPopUpProps) {
  const { data: mainPipeSizes } = useMainPipeSizes(
    installedformData.wallType as WallType
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 py-8 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Card className="bg-bg-surface-elevated w-[500px] max-w-full">
        <div className="flex w-full flex-col items-center justify-center p-6">
          <h2 className="mb-6 text-center text-2xl font-bold">
            {isLateral ? "Lateral Footage Installed" : "Main Footage Installed"}
          </h2>
          {isLateral && (
            <div className="mb-8 flex w-full flex-col items-start">
              <label className="mb-2 text-[16px] font-medium">
                Footage Installed (ft)
              </label>
              <SanitizedInput
                className="bg-bg-app border-border-subtle min-h-[40px] w-full rounded-[5px] border pt-2 pl-2 text-[16px]"
                placeholder="Enter footage"
                type="number"
                value={installedformData.footage || ""}
                onChange={(e) =>
                  setInstalledformData({
                    ...installedformData,
                    footage: e.target.value,
                  })
                }
              />
            </div>
          )}
          {isMain && (
            <div className="mb-8 flex w-full flex-col gap-4">
              <div className="flex w-full flex-col">
                <label className="mb-2 text-[16px] font-medium">
                  Wall Type
                </label>
                <select
                  className="bg-bg-app border-border-subtle min-h-[40px] w-full rounded-[5px] border pt-2 pl-2 text-[16px] focus:outline-none"
                  value={installedformData.wallType || WallType.SINGLE_WALL}
                  onChange={(e) =>
                    setInstalledformData({
                      ...installedformData,
                      wallType: e.target.value as WallType,
                      pipeSize: "",
                    })
                  }
                >
                  <option value={WallType.SINGLE_WALL}>
                    {WALL_TYPE_LABELS[WallType.SINGLE_WALL]}
                  </option>
                  <option value={WallType.DUAL_WALL}>
                    {WALL_TYPE_LABELS[WallType.DUAL_WALL]}
                  </option>
                </select>
              </div>
              <div className="flex w-full flex-row gap-4">
                <div className="flex w-1/2 flex-col">
                  <label className="mb-2 text-[16px] font-medium">
                    Pipe Size
                  </label>
                  <select
                    className="bg-bg-app border-border-subtle min-h-[40px] w-full rounded-[5px] border pt-2 pl-2 text-[16px] focus:outline-none"
                    value={installedformData.pipeSize || ""}
                    onChange={(e) =>
                      setInstalledformData({
                        ...installedformData,
                        pipeSize: e.target.value,
                      })
                    }
                  >
                    <option disabled value="">
                      Select Pipe Size
                    </option>
                    {mainPipeSizes?.map(([value, label]: [string, string]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex w-1/2 flex-col">
                  <label className="mb-2 text-[16px] font-medium">
                    Footage Installed (ft)
                  </label>
                  <SanitizedInput
                    className="bg-bg-app border-border-subtle min-h-[40px] w-full rounded-[5px] border pt-2 pl-2 text-[16px]"
                    placeholder="Enter footage"
                    type="number"
                    value={installedformData.footage || ""}
                    onChange={(e) =>
                      setInstalledformData({
                        ...installedformData,
                        footage: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <div className="mt-2 flex w-full justify-between">
            <Button
              aria-label="Cancel"
              title="Cancel"
              variant={ButtonVariantEnum.SURFACE}
              onClick={() => {
                setShowFootageForm(false);
                setInstalledformData({
                  footage: "",
                  pipeSize: "",
                  wallType: WallType.SINGLE_WALL,
                });
              }}
            />
            <Button
              aria-label="Add"
              title="Add"
              onClick={() => {
                if (isLateral) {
                  handleUpdateLateralFootage({
                    footage: Number(installedformData.footage),
                    date: new Date().toISOString().split("T")[0],
                  });
                  setInstalledformData({
                    footage: "",
                    pipeSize: "",
                    wallType: WallType.SINGLE_WALL,
                  });
                } else if (isMain) {
                  handleUpdateMainFootage({
                    footage: Number(installedformData.footage),
                    size: installedformData.pipeSize,
                    pipe_wall_type: installedformData.wallType as WallType,
                    date: new Date().toISOString().split("T")[0],
                  });
                  setInstalledformData({
                    footage: "",
                    pipeSize: "",
                    wallType: WallType.SINGLE_WALL,
                  });
                }
                setFormData?.({
                  ...Object.fromEntries(
                    (card?.data || [])
                      .filter(
                        (item) =>
                          item.key != "designers" && item.key != "job_status"
                      )
                      .map((item) => [item.key, item.value])
                  ),
                });
                setShowFootageForm(false);
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
