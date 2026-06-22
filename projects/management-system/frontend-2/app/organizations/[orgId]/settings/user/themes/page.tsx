"use client";

import {
  SurfaceVariantEnum,
  ThemeControls,
  ThemeControlsAppearanceStyleEnum,
  ThemeControlsOrientationEnum,
} from "@fieldflow360/org-ui";

export default function UserThemesPage() {
  return (
    <div className="w-full min-w-0">
      <ThemeControls
        appearanceStyle={ThemeControlsAppearanceStyleEnum.SEGMENTED}
        className="w-full max-w-none"
        orientation={ThemeControlsOrientationEnum.HORIZONTAL}
        showHexInput={false}
        surface={SurfaceVariantEnum.ELEVATED}
      />
    </div>
  );
}
