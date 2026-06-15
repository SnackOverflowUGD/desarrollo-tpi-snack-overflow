import { describe, it, expect } from "vitest";
import { toDisplay, toISO } from "@/components/ui/date-input";

describe("toDisplay — ISO to dd/mm/yyyy", () => {
  it("converts a standard ISO date", () => {
    expect(toDisplay("2025-12-31")).toBe("31/12/2025");
  });

  it("converts a date with leading-zero month and day", () => {
    expect(toDisplay("2026-01-05")).toBe("05/01/2026");
  });

  it("returns empty string for an empty input", () => {
    expect(toDisplay("")).toBe("");
  });

  it("returns empty string for an invalid format", () => {
    expect(toDisplay("31/12/2025")).toBe("");
    expect(toDisplay("2025/12/31")).toBe("");
    expect(toDisplay("not-a-date")).toBe("");
  });
});

describe("toISO — dd/mm/yyyy to ISO", () => {
  it("converts a standard display date", () => {
    expect(toISO("31/12/2025")).toBe("2025-12-31");
  });

  it("converts a date with leading-zero month and day", () => {
    expect(toISO("05/01/2026")).toBe("2026-01-05");
  });

  it("returns empty string for an empty input", () => {
    expect(toISO("")).toBe("");
  });

  it("returns empty string for an invalid format", () => {
    expect(toISO("2025-12-31")).toBe("");
    expect(toISO("31-12-2025")).toBe("");
    expect(toISO("not-a-date")).toBe("");
    expect(toISO("1/1/2025")).toBe(""); // no zero-padding → no match
  });
});

describe("round-trip conversion", () => {
  it("ISO → display → ISO is lossless", () => {
    const iso = "2026-07-04";
    expect(toISO(toDisplay(iso))).toBe(iso);
  });

  it("display → ISO → display is lossless", () => {
    const display = "04/07/2026";
    expect(toDisplay(toISO(display))).toBe(display);
  });

  it("empty string round-trips as empty", () => {
    expect(toISO(toDisplay(""))).toBe("");
    expect(toDisplay(toISO(""))).toBe("");
  });
});
