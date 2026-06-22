import { describe, expect, it } from 'vitest';
import * as OrgUI from '../src';

describe('library exports', () => {
  it('exports core components and utils for consumers', () => {
    expect(OrgUI.Button).toBeDefined();
    expect(OrgUI.Input).toBeDefined();
    expect(OrgUI.Textarea).toBeDefined();
    expect(OrgUI.Slider).toBeDefined();
    expect(OrgUI.ColorPicker).toBeDefined();
    expect(OrgUI.Dropdown).toBeDefined();
    expect(OrgUI.ThemeControls).toBeDefined();
    expect(OrgUI.OrganizationInfo).toBeDefined();
    expect(OrgUI.DeleteOrganization).toBeDefined();

    expect(OrgUI.cn).toBeDefined();
    expect(OrgUI.getAccentTextColor).toBeDefined();
    expect(OrgUI.toAccentLight).toBeDefined();
    expect(OrgUI.ThemeProvider).toBeDefined();
    expect(OrgUI.useTheme).toBeDefined();
    expect(OrgUI.NavExpandableMenuItem).toBeDefined();
    expect(OrgUI.Table).toBeDefined();
    expect(OrgUI.TableReveal).toBeDefined();
    expect(OrgUI.TableGridView).toBeDefined();
    expect(OrgUI.TableKanbanView).toBeDefined();
    expect(OrgUI.TableListView).toBeDefined();
    expect(OrgUI.TableToolbar).toBeDefined();
    expect(OrgUI.TableViewSwitcher).toBeDefined();
    expect(OrgUI.TableGridCard).toBeDefined();
    expect(OrgUI.TableViewModeEnum).toBeDefined();
    expect(OrgUI.groupTableItemsByStatus).toBeDefined();
    expect(OrgUI.tableActionIcons).toBeDefined();
    expect(OrgUI.applyTableSearch).toBeDefined();
    expect(OrgUI.AuthSignInContent).toBeDefined();
    expect(OrgUI.AuthSignInLayout).toBeDefined();
    expect(OrgUI.SignInForm).toBeDefined();
    expect(OrgUI.signInSchema).toBeDefined();
  });
});
