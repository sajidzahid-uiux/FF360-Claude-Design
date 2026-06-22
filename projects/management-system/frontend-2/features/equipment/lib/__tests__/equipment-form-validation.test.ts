import { describe, expect, it } from "vitest";

import {
  EQUIPMENT_FIELD_LIMITS,
  defaultMachineFormData,
  defaultTrailerFormData,
  defaultVehicleFormData,
  isMachineFormSubmittable,
  isTrailerFormSubmittable,
  isVehicleFormSubmittable,
  machineFormValidation,
  trailerFormValidation,
  vehicleFormValidation,
} from "@/features/equipment/lib/equipment-form-validation";

describe("machineFormValidation", () => {
  it("requires make, assigned user, hours, and rate", () => {
    expect(
      machineFormValidation.safeParse(defaultMachineFormData).success
    ).toBe(false);
  });

  it("accepts valid machine payload", () => {
    const data = {
      ...defaultMachineFormData,
      make: "John Deere",
      assigned_team_member: "42",
      current_hours: "100",
      hour_rate: "85",
    };

    expect(isMachineFormSubmittable(data)).toBe(true);
  });

  it("rejects make longer than backend max_length=100", () => {
    const result = machineFormValidation.safeParse({
      ...defaultMachineFormData,
      make: "x".repeat(EQUIPMENT_FIELD_LIMITS.make + 1),
      assigned_team_member: "42",
      current_hours: "100",
      hour_rate: "85",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid year", () => {
    const result = machineFormValidation.safeParse({
      ...defaultMachineFormData,
      make: "Cat",
      year: "1800",
      assigned_team_member: "42",
      current_hours: "100",
      hour_rate: "85",
    });

    expect(result.success).toBe(false);
  });

  it("rejects partial filter maintenance pairs", () => {
    const filterName = Object.keys(defaultMachineFormData.filterState)[0];
    const data = {
      ...defaultMachineFormData,
      make: "Cat",
      assigned_team_member: "42",
      current_hours: "100",
      hour_rate: "85",
      filterState: {
        ...defaultMachineFormData.filterState,
        [filterName]: {
          ...defaultMachineFormData.filterState[filterName],
          last_changed: 100,
          threshold: "",
        },
      },
    };

    expect(machineFormValidation.safeParse(data).success).toBe(false);
  });
});

describe("trailerFormValidation", () => {
  it("requires make and assigned user", () => {
    expect(
      trailerFormValidation.safeParse(defaultTrailerFormData).success
    ).toBe(false);
  });

  it("accepts valid trailer payload", () => {
    const data = {
      ...defaultTrailerFormData,
      make: "Big Tex",
      assigned_team_member: "7",
    };

    expect(isTrailerFormSubmittable(data)).toBe(true);
  });

  it("rejects license plate longer than backend limit", () => {
    const result = trailerFormValidation.safeParse({
      ...defaultTrailerFormData,
      make: "Big Tex",
      assigned_team_member: "7",
      license_plate: "x".repeat(EQUIPMENT_FIELD_LIMITS.license_plate + 1),
    });

    expect(result.success).toBe(false);
  });
});

describe("vehicleFormValidation", () => {
  it("requires make, assigned user, and current miles", () => {
    expect(
      vehicleFormValidation.safeParse(defaultVehicleFormData).success
    ).toBe(false);
  });

  it("accepts valid vehicle payload", () => {
    const data = {
      ...defaultVehicleFormData,
      make: "Ford",
      assigned_team_member: "3",
      current_miles: "12000",
    };

    expect(isVehicleFormSubmittable(data)).toBe(true);
  });

  it("rejects serial number longer than backend max_length=40", () => {
    const result = vehicleFormValidation.safeParse({
      ...defaultVehicleFormData,
      make: "Ford",
      assigned_team_member: "3",
      current_miles: "12000",
      serial_number: "x".repeat(
        EQUIPMENT_FIELD_LIMITS.vehicle_serial_number + 1
      ),
    });

    expect(result.success).toBe(false);
  });
});
