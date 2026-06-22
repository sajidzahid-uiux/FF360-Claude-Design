import { describe, expect, it } from "vitest";

import {
  canAddCommentsOnTerminalJob,
  isTerminalCoCaJob,
  resolveCommentsReadOnly,
} from "../resolveCommentsReadOnly";

const baseTerminal = {
  fromCompleted: true,
  completedJob: true,
  hasJobWrite: true,
  hasCompletedCanceledPageWrite: true,
};

describe("isTerminalCoCaJob", () => {
  it("is true when opened from Completed & Canceled page", () => {
    expect(isTerminalCoCaJob({ fromCompleted: true })).toBe(true);
  });

  it("is true when job is completed or canceled", () => {
    expect(isTerminalCoCaJob({ completedJob: true })).toBe(true);
    expect(isTerminalCoCaJob({ cancelled: true })).toBe(true);
  });

  it("is false for active jobs outside CO&CA", () => {
    expect(isTerminalCoCaJob({})).toBe(false);
  });

  it("is true when entity payload shows cancelled or Completed status", () => {
    expect(isTerminalCoCaJob({ entityCancelled: true })).toBe(true);
    expect(isTerminalCoCaJob({ jobStatusTitle: "Completed" })).toBe(true);
  });
});

describe("canAddCommentsOnTerminalJob", () => {
  it("allows comment when user has job write on a non-terminal job", () => {
    expect(
      canAddCommentsOnTerminalJob({
        hasJobWrite: true,
        hasCompletedCanceledPageWrite: false,
      })
    ).toBe(true);
  });

  it("allows comment on CO&CA job only when user has both job write and CO&CA page write", () => {
    expect(canAddCommentsOnTerminalJob(baseTerminal)).toBe(true);
    expect(
      canAddCommentsOnTerminalJob({
        ...baseTerminal,
        hasJobWrite: true,
        hasCompletedCanceledPageWrite: true,
      })
    ).toBe(true);
  });

  it("denies comment on CO&CA job with only job-type write", () => {
    expect(
      canAddCommentsOnTerminalJob({
        ...baseTerminal,
        hasJobWrite: true,
        hasCompletedCanceledPageWrite: false,
      })
    ).toBe(false);
  });

  it("denies comment on CO&CA job with only completed_canceled_page write", () => {
    expect(
      canAddCommentsOnTerminalJob({
        ...baseTerminal,
        hasJobWrite: false,
        hasCompletedCanceledPageWrite: true,
      })
    ).toBe(false);
  });

  it("denies comment on CO&CA job without either write permission", () => {
    expect(
      canAddCommentsOnTerminalJob({
        ...baseTerminal,
        hasJobWrite: false,
        hasCompletedCanceledPageWrite: false,
      })
    ).toBe(false);
  });

  it("denies comment when job is trashed", () => {
    expect(
      canAddCommentsOnTerminalJob({
        ...baseTerminal,
        isTrashed: true,
      })
    ).toBe(false);
  });

  it("denies comment when viewing archived tab", () => {
    expect(
      canAddCommentsOnTerminalJob({
        ...baseTerminal,
        toggleArchive: true,
      })
    ).toBe(false);
  });
});

describe("resolveCommentsReadOnly", () => {
  it("is the inverse of canAddCommentsOnTerminalJob", () => {
    expect(resolveCommentsReadOnly(baseTerminal)).toBe(false);
    expect(
      resolveCommentsReadOnly({
        ...baseTerminal,
        hasJobWrite: false,
      })
    ).toBe(true);
  });
});
