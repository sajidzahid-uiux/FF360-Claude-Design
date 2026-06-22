import { describe, expect, it } from "vitest";

import {
  calendarItemTitleDuplicatesContact,
  formatCalendarClientCardLine,
  formatCalendarItemPrimaryLabel,
  getCalendarItemCardDisplayLines,
} from "../ClientCardLine";

describe("formatCalendarClientCardLine", () => {
  it("joins contact and farm when both exist", () => {
    expect(
      formatCalendarClientCardLine({
        client: "Jane Farmer",
        farmName: "North Field",
        location: "North Field",
      })
    ).toBe("Jane Farmer - North Field");
  });

  it("falls back to location and em dash placeholder", () => {
    expect(
      formatCalendarClientCardLine({
        client: undefined,
        farmName: undefined,
        location: "123 County Rd",
      })
    ).toBe("123 County Rd");
    expect(
      formatCalendarClientCardLine({
        client: undefined,
        farmName: undefined,
        location: "",
      })
    ).toBe("—");
  });
});

describe("calendarItemTitleDuplicatesContact", () => {
  it("detects matching trimmed title and client", () => {
    expect(
      calendarItemTitleDuplicatesContact({
        title: " Jane Farmer ",
        client: "Jane Farmer",
      })
    ).toBe(true);
    expect(
      calendarItemTitleDuplicatesContact({
        title: "Different",
        client: "Jane Farmer",
      })
    ).toBe(false);
  });
});

describe("formatCalendarItemPrimaryLabel", () => {
  it("prefers client/farm card line over API title", () => {
    expect(
      formatCalendarItemPrimaryLabel({
        title: "Complex trench scope",
        client: "Jane Farmer",
        farmName: "North Field",
        location: "North Field",
      })
    ).toBe("Jane Farmer - North Field");
  });
});

describe("getCalendarItemCardDisplayLines", () => {
  it("omits subtitle when location repeats the primary line", () => {
    expect(
      getCalendarItemCardDisplayLines({
        title: "Job",
        client: "Jane Farmer",
        farmName: "North Field",
        location: "North Field",
      })
    ).toEqual({
      primaryLine: "Jane Farmer - North Field",
      subtitleLine: "",
    });
  });

  it("shows address subtitle when it adds information", () => {
    expect(
      getCalendarItemCardDisplayLines({
        title: "Job",
        client: "Jane Farmer",
        farmName: undefined,
        location: "123 County Rd",
      })
    ).toEqual({
      primaryLine: "Jane Farmer",
      subtitleLine: "123 County Rd",
    });
  });
});
