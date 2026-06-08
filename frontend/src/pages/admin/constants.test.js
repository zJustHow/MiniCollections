import {
  STATUS_COLOR,
  TYPE_COLOR,
  useStatusLabel,
  useTypeLabel,
} from "./constants";

describe("admin constants", () => {
  const t = (key) => `t:${key}`;

  test("STATUS_COLOR maps submission statuses", () => {
    expect(STATUS_COLOR.PENDING).toBe("orange");
    expect(STATUS_COLOR.APPROVED).toBe("green");
    expect(STATUS_COLOR.REJECTED).toBe("red");
  });

  test("TYPE_COLOR maps feedback types", () => {
    expect(TYPE_COLOR.MISSING_MODEL).toBe("blue");
    expect(TYPE_COLOR.BUG_REPORT).toBe("volcano");
    expect(TYPE_COLOR.DATA_CORRECTION).toBe("purple");
  });

  test("useStatusLabel translates known statuses", () => {
    const label = useStatusLabel(t);
    expect(label("PENDING")).toBe("t:statusPending");
    expect(label("APPROVED")).toBe("t:statusApproved");
    expect(label("REJECTED")).toBe("t:statusRejected");
    expect(label("RESOLVED")).toBe("t:statusResolved");
    expect(label("CLOSED")).toBe("t:statusClosed");
    expect(label("UNKNOWN")).toBe("UNKNOWN");
  });

  test("useTypeLabel translates known types", () => {
    const label = useTypeLabel(t);
    expect(label("MISSING_MODEL")).toBe("t:feedbackTypeMissingModel");
    expect(label("BUG_REPORT")).toBe("t:feedbackTypeBugReport");
    expect(label("DATA_CORRECTION")).toBe("t:feedbackTypeDataCorrection");
    expect(label("OTHER")).toBe("OTHER");
  });
});
