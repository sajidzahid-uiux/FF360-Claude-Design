import { describe, expect, it } from "vitest";

import { NoteSection } from "@/constants";
import { canWriteNoteSection } from "@/utils/notes";

import {
  getEquipmentNotesTabAccess,
  hasEquipmentPageReadPermission,
  hasEquipmentPageWritePermission,
  resolveEquipmentCommentPermissions,
} from "../useEquipmentPermissions";

describe("hasEquipmentPageReadPermission", () => {
  it("returns true for equipment_page_read", () => {
    expect(hasEquipmentPageReadPermission(["equipment_page_read"])).toBe(true);
  });

  it("returns true for equipment_page_write and equipment_page_delete", () => {
    expect(hasEquipmentPageReadPermission(["equipment_page_write"])).toBe(true);
    expect(hasEquipmentPageReadPermission(["equipment_page_delete"])).toBe(
      true
    );
  });

  it("returns false for legacy or unrelated codes", () => {
    expect(hasEquipmentPageReadPermission(["equipment_read"])).toBe(false);
    expect(hasEquipmentPageReadPermission([])).toBe(false);
  });
});

describe("hasEquipmentPageWritePermission", () => {
  it("returns true only for equipment_page_write", () => {
    expect(hasEquipmentPageWritePermission(["equipment_page_write"])).toBe(
      true
    );
    expect(hasEquipmentPageWritePermission(["equipment_page_read"])).toBe(
      false
    );
  });
});

describe("resolveEquipmentCommentPermissions", () => {
  it("grants admins full comment access", () => {
    expect(resolveEquipmentCommentPermissions(true, [])).toEqual({
      canReadComments: true,
      canWriteComments: true,
    });
  });

  it("allows read-only comment access with equipment_page_read only", () => {
    expect(
      resolveEquipmentCommentPermissions(false, ["equipment_page_read"])
    ).toEqual({
      canReadComments: true,
      canWriteComments: false,
    });
  });

  it("allows write access with equipment_page_write", () => {
    expect(
      resolveEquipmentCommentPermissions(false, [
        "equipment_page_read",
        "equipment_page_write",
      ])
    ).toEqual({
      canReadComments: true,
      canWriteComments: true,
    });
  });

  it("allows read via equipment_page_delete without write", () => {
    expect(
      resolveEquipmentCommentPermissions(false, ["equipment_page_delete"])
    ).toEqual({
      canReadComments: true,
      canWriteComments: false,
    });
  });

  it("allows write-only page access to view and post comments", () => {
    expect(
      resolveEquipmentCommentPermissions(false, ["equipment_page_write"])
    ).toEqual({
      canReadComments: true,
      canWriteComments: true,
    });
  });

  it("ignores legacy equipment_read and equipment_write codes", () => {
    expect(
      resolveEquipmentCommentPermissions(false, [
        "equipment_read",
        "equipment_write",
      ])
    ).toEqual({
      canReadComments: false,
      canWriteComments: false,
    });
  });

  it("denies comment access without any equipment page permission", () => {
    expect(resolveEquipmentCommentPermissions(false, [])).toEqual({
      canReadComments: false,
      canWriteComments: false,
    });
  });
});

describe("getEquipmentNotesTabAccess", () => {
  it("returns general-only access when user can read equipment notes", () => {
    expect(getEquipmentNotesTabAccess(true)).toEqual({
      general: true,
      office: false,
      onsite: false,
    });
  });

  it("returns undefined when user cannot read equipment notes", () => {
    expect(getEquipmentNotesTabAccess(false)).toBeUndefined();
  });

  it("allows write when equipment read and page write are granted", () => {
    const access = getEquipmentNotesTabAccess(true);
    expect(
      canWriteNoteSection(NoteSection.GENERAL, access, {
        hasPageWrite: true,
      })
    ).toBe(true);
  });

  it("blocks write when equipment is read-only", () => {
    const access = getEquipmentNotesTabAccess(true);
    expect(
      canWriteNoteSection(NoteSection.GENERAL, access, {
        hasPageWrite: false,
      })
    ).toBe(false);
  });
});
