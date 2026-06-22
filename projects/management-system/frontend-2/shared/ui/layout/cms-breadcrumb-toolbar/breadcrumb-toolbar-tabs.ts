import { ComponentSizeEnum, TabsSwitcherViewEnum } from "@fieldflow360/org-ui";

/** Shared TabsSwitcher props for CMS breadcrumb toolbar tab rows. */
export const BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS = {
  size: ComponentSizeEnum.SM,
  view: TabsSwitcherViewEnum.UNDERLINED,
} as const;

/** Repair / Excavation / Tile (and other category) switchers in the toolbar. */
export const BREADCRUMB_TOOLBAR_CATEGORY_TABS_SWITCHER_PROPS = {
  size: ComponentSizeEnum.SM,
  view: TabsSwitcherViewEnum.PILL,
} as const;
