import { contactSchema } from "../../validators/contactValidators.js";

describe("contactSchema", () => {
  it("accepts a valid public contact payload", () => {
    const result = contactSchema.safeParse({
      name: "Sumit Pandey",
      email: "SUMIT@example.com",
      category: "Product question",
      subject: "Launch question",
      message: "I want to ask about CreatorIQ product access.",
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe("sumit@example.com");
  });

  it("rejects invalid email, category, and short message values", () => {
    const result = contactSchema.safeParse({
      name: "S",
      email: "not-email",
      category: "Sales pipeline",
      subject: "No",
      message: "Too short",
    });

    expect(result.success).toBe(false);
    expect(
      result.error.issues.map((issue) => issue.path[0])
    ).toEqual(
      expect.arrayContaining([
        "name",
        "email",
        "category",
        "subject",
        "message",
      ])
    );
  });
});
