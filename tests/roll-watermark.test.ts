import { describe, expect, it } from "vitest";
import { watermarkFromRollNumber } from "@/components/student/student-home";

describe("watermarkFromRollNumber", () => {
  it("uses the last 4 digits of the roll number", () => {
    expect(watermarkFromRollNumber("CSE21001")).toBe("1001");
    expect(watermarkFromRollNumber("IT-2024-8842")).toBe("8842");
  });

  it("pads shorter digit runs", () => {
    expect(watermarkFromRollNumber("AB12")).toBe("0012");
  });

  it("falls back when missing", () => {
    expect(watermarkFromRollNumber(null)).toBe("0000");
    expect(watermarkFromRollNumber("ABC")).toBe("0000");
  });
});
