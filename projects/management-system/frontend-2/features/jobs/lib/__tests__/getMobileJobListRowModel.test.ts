import { describe, expect, it } from "vitest";

import { JobType } from "@/constants";
import type { TransformedJob } from "@/features/completed/model/types";
import type { JobTableRow } from "@/features/jobs/lib/columns/types";

import { getMobileJobListRowModel } from "../getMobileJobListRowModel";

describe("getMobileJobListRowModel", () => {
  it("builds active job row model with PO identifier", () => {
    const job = {
      id: 42,
      po_number: "PO-100",
      customer_name: "Acme",
      last_updated: "2024-06-01T12:00:00Z",
      update_by_username: "jane",
      on_hold: true,
      job_status: { id: 1, title: "In Progress", color: "#3b82f6" },
      contact_info: { phone_number: "555-0100" },
    } as unknown as JobTableRow;

    const model = getMobileJobListRowModel({
      variant: "active",
      job,
      jobType: JobType.TILING,
    });

    expect(model.identifier).toBe("PO-100");
    expect(model.onHoldHighlight).toBe(true);
    expect(model.phone).toBe("555-0100");
    expect(model.statusLabel).toBe("In Progress");
  });

  it("builds completed job row model with cancelled status", () => {
    const model = getMobileJobListRowModel({
      variant: "completed",
      job: {
        id: 7,
        estimate_number: "E-7",
        cancelled: true,
        created_at: "2024-01-15T00:00:00Z",
        last_updated_by: "admin",
        job_object_subclass: "RepairJob",
        customer_name: "Farm Co",
      } as unknown as TransformedJob,
    });

    expect(model.identifier).toBe("E-7");
    expect(model.statusLabel).toBe("Cancelled");
    expect(model.statusColor).toBe("#ef4444");
  });
});
