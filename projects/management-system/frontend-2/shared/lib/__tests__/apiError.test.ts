import { describe, expect, it } from "vitest";

import {
  NOTE_MENTION_SECTION_ACCESS_ERROR,
  getErrorMessage,
  getSimpleErrorMessage,
} from "@/utils/apiError";

describe("getErrorMessage", () => {
  it("maps mentioned_members validation to a clear note-section message", () => {
    const apiError = {
      name: "ApiError",
      message: "An unexpected error occurred",
      status: 400,
      data: {
        mentioned_members: "Member 42 cannot access this note section.",
      },
    };

    expect(getErrorMessage(apiError, "Failed to post comment")).toBe(
      NOTE_MENTION_SECTION_ACCESS_ERROR
    );
  });

  it("handles nested error details when details is a string", () => {
    const subContactMessage =
      "Sub-contact 96849 is already linked to another Farm Management contact.";
    const error = {
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed. Please check your input data.",
            details: subContactMessage,
          },
        },
      },
    };

    expect(getErrorMessage(error, "Failed to link sub-contact")).toBe(
      `Validation failed. Please check your input data. — ${subContactMessage}`
    );
  });

  it("maps mentioned_members array validation errors", () => {
    const error = {
      response: {
        status: 400,
        data: {
          mentioned_members: ["Member 7 cannot access this note section."],
        },
      },
    };

    expect(getErrorMessage(error, "Failed to post comment")).toBe(
      NOTE_MENTION_SECTION_ACCESS_ERROR
    );
  });

  it("maps primary_farm_id validation error to client deletion error message", () => {
    const error = {
      response: {
        status: 400,
        data: {
          primary_farm_id: ["Primary farm must be included in farm_ids."],
        },
      },
    };

    expect(getErrorMessage(error)).toBe(
      "Before deleting this client, change the farm primary to another contact."
    );

    const simpleError = {
      response: {
        data: {
          primary_farm_id: ["Primary farm must be included in farm_ids."],
        },
      },
    };
    expect(getSimpleErrorMessage(simpleError)).toBe(
      "Before deleting this client, change the farm primary to another contact."
    );
  });
});
