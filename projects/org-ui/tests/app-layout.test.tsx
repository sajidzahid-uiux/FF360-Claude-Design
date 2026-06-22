import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FieldFlowAppLayout } from "../src/components/system-components/AppLayout";
import { ThemeModeEnum } from "../src/constants";
import { ThemeProvider } from "../src/theme";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_event: string, listener: () => void) => {
        listener();
      },
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function renderWithTheme(ui: ReactElement) {
  return render(
    <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>{ui}</ThemeProvider>
  );
}

const defaultLayoutProps = {
  appTitle: "FieldFlow",
  logo: <span>FF</span>,
  user: { fullName: "Dev", subtitle: "UI Engineer" },
  userMenuActions: [] as { id: string; label: string; onSelect: () => void }[],
};

describe("FieldFlowAppLayout slots", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    localStorage.clear();
  });

  afterEach(() => {
    mockMatchMedia(false);
    localStorage.clear();
  });

  it("renders sidebarHeaderContent below header", () => {
    renderWithTheme(
      <FieldFlowAppLayout
        {...defaultLayoutProps}
        sidebarHeaderContent={<div>Sidebar Header Slot</div>}
      >
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    expect(screen.getByText("Sidebar Header Slot")).toBeInTheDocument();
  });

  it("renders mainTopBar before breadcrumbs", () => {
    const breadcrumbs = [{ id: "home", label: "Home", href: "/" }];

    renderWithTheme(
      <FieldFlowAppLayout
        {...defaultLayoutProps}
        mainTopBar={<div>CMS Top Bar</div>}
        breadcrumbs={breadcrumbs}
      >
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    const topBar = screen.getByText("CMS Top Bar");
    const crumbs = screen.getByText("Home");
    const topBarPosition = topBar.compareDocumentPosition(crumbs);
    expect(topBarPosition & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("passes breadcrumbToolbar into default AppBreadcrumbs", () => {
    const breadcrumbs = [{ id: "home", label: "Home", href: "/" }];

    renderWithTheme(
      <FieldFlowAppLayout
        {...defaultLayoutProps}
        breadcrumbs={breadcrumbs}
        breadcrumbToolbar={<span data-testid="tb">Status</span>}
      >
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    expect(screen.getByTestId("tb")).toHaveTextContent("Status");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("keeps existing content render intact", () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <FieldFlowAppLayout
        {...defaultLayoutProps}
        userMenuActions={[{ id: "profile", label: "Profile", onSelect }]}
      >
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );
    expect(screen.getByText("Page Content")).toBeInTheDocument();
  });

  it("renders landmark regions for app shell navigation and main", () => {
    renderWithTheme(
      <FieldFlowAppLayout {...defaultLayoutProps}>
        <div>Main region</div>
      </FieldFlowAppLayout>
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders default Tools group with User Settings when tools are enabled", async () => {
    renderWithTheme(
      <FieldFlowAppLayout {...defaultLayoutProps}>
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    await waitFor(() => {
      expect(screen.getByText("Tools")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: "User Settings" })).toBeInTheDocument();
  });

  it("shows ThemeControls on user settings appearance path", async () => {
    renderWithTheme(
      <FieldFlowAppLayout
        {...defaultLayoutProps}
        currentPath="/settings/user/appearance"
      >
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Theme Mode" })).toBeInTheDocument();
    });
    expect(screen.getByRole("tab", { name: "Light" })).toBeInTheDocument();
  });

  it("does not render ThemeControls when currentPath is outside theme controls prefix", () => {
    renderWithTheme(
      <FieldFlowAppLayout {...defaultLayoutProps} currentPath="/dashboard/maps">
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    expect(screen.queryByRole("heading", { name: "Appearance" })).not.toBeInTheDocument();
  });

  it("shows mobile shell bar and overlay sidebar on small viewports", async () => {
    mockMatchMedia(true);

    renderWithTheme(
      <FieldFlowAppLayout {...defaultLayoutProps}>
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Collapse sidebar" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Close navigation menu" })).toBeInTheDocument();
    });
    expect(screen.getByText("Tools")).toBeInTheDocument();
  });

  it("hides mobile shell bar when hideMobileShellTopBar is set", () => {
    mockMatchMedia(true);

    renderWithTheme(
      <FieldFlowAppLayout
        {...defaultLayoutProps}
        hideMobileShellTopBar
        mainTopBar={<div>CMS Top Bar</div>}
      >
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    expect(screen.queryByRole("button", { name: "Open navigation menu" })).not.toBeInTheDocument();
    expect(screen.getByText("CMS Top Bar")).toBeInTheDocument();
  });

  it("passes closeMobileSidebar to custom sidebarNav on mobile", async () => {
    mockMatchMedia(true);

    renderWithTheme(
      <FieldFlowAppLayout
        {...defaultLayoutProps}
        sidebarNav={({ closeMobileSidebar }) => (
          <button type="button" onClick={closeMobileSidebar}>
            Close From Nav
          </button>
        )}
      >
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Close From Nav" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Close From Nav" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Close navigation menu" })).not.toBeInTheDocument();
    });
  });

  it("hides breadcrumbs on mobile settings routes by default", () => {
    mockMatchMedia(true);

    renderWithTheme(
      <FieldFlowAppLayout
        {...defaultLayoutProps}
        currentPath="/settings/organization/organization-info"
        breadcrumbs={[{ id: "org", label: "Organization Settings", href: "/", isCurrent: true }]}
      >
        <div>Content</div>
      </FieldFlowAppLayout>
    );

    expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).not.toBeInTheDocument();
  });

  it("persists sidebar collapsed state under collapseStorageKey", async () => {
    const collapseKey = "test-app-layout-collapsed";

    renderWithTheme(
      <FieldFlowAppLayout {...defaultLayoutProps} collapseStorageKey={collapseKey}>
        <div>Page Content</div>
      </FieldFlowAppLayout>
    );

    expect(localStorage.getItem(collapseKey)).toBe("0");

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    await waitFor(() => {
      expect(localStorage.getItem(collapseKey)).toBe("1");
    });
  });
});
