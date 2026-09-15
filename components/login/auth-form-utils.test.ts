import { describe, expect, it } from "vitest";
import { isValidEmail } from "./auth-form-utils";

describe("isValidEmail", () => {
  it("should return true for valid email addresses", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  it("should return true for email addresses with a dot in username", () => {
    expect(isValidEmail("hello.world@example.com")).toBe(true);
  });

  it("should return true for email addresses with a plus sign", () => {
    expect(isValidEmail("hello+world@example.com")).toBe(true);
  });

  it("should return true for email addresses with a subdomain", () => {
    expect(isValidEmail("test@mail.example.com")).toBe(true);
  });

  it("should return true for email addresses with multiple domain parts", () => {
    expect(isValidEmail("test@example.com.vn")).toBe(true);
  });

  it("should return true for email addresses with uppercase characters", () => {
    expect(isValidEmail("Test@Example.COM")).toBe(true);
  });

  it("should return true for email addresses with sepcial characters in the username", () => {
    expect(isValidEmail("test%$&@example.com")).toBe(true);
  });

  it("should return false for email addresses with no at sign", () => {
    expect(isValidEmail("testexample.com")).toBe(false);
  });

  it("should return false for email addresses with no username", () => {
    expect(isValidEmail("@example.com")).toBe(false);
  });

  it("should return false for email addresses with no domain", () => {
    expect(isValidEmail("test@")).toBe(false);
  });

  it("should return false for email addresses with no dots in the domain", () => {
    expect(isValidEmail("test@example")).toBe(false);
  });

  it("should return false for email addresses with spaces in the username", () => {
    expect(isValidEmail("hello world@example.com")).toBe(false);
  });

  it("should return false for email addresses with spaces in the domain", () => {
    expect(isValidEmail("test@ex ample.com")).toBe(false);
  });

  it("should return false for an empty email address", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("should return false for email addresses with invalid characters in the domain", () => {
    expect(isValidEmail("test@ex&ample.com")).toBe(false);
  });
});
