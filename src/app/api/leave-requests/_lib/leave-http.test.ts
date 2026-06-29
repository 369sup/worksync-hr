import { describe, expect, it } from "vitest";

import { LeaveApplicationError } from "@/modules/leave/application/errors/leave-application-error";

import {
  HttpValidationError,
  offsetDate,
  parseSearchCriteria,
  toErrorResponse,
} from "./leave-http";

describe("Leave HTTP adapter", () => {
  it("parses supported search filters and bounded pagination", () => {
    const criteria = parseSearchCriteria(
      "https://example.test/api/leave-requests?status=pending&employeeId=EMP-001&page=2&pageSize=50&periodStart=2026-07-01T00%3A00%3A00%2B08%3A00",
    );

    expect(criteria).toMatchObject({
      status: "pending",
      employeeId: "EMP-001",
      page: 2,
      pageSize: 50,
    });
    expect(criteria.periodStart?.toISOString()).toBe(
      "2026-06-30T16:00:00.000Z",
    );
  });

  it("rejects invalid pagination and timestamps without an offset", () => {
    expect(() =>
      parseSearchCriteria(
        "https://example.test/api/leave-requests?pageSize=101",
      ),
    ).toThrow(HttpValidationError);
    expect(() => offsetDate("2026-07-01T09:00:00", "startAt")).toThrow(
      HttpValidationError,
    );
  });

  it("maps stable application errors to the shared HTTP envelope", async () => {
    const response = toErrorResponse(
      new LeaveApplicationError("NOT_FOUND", "Leave request was not found."),
      "correlation-1",
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Leave request was not found.",
        correlationId: "correlation-1",
      },
    });
  });
});
