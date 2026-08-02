import { z } from "zod";

const contactCategories = [
  "Product question",
  "Technical support",
  "Feedback",
  "Partnership",
  "Plan or waitlist",
  "Other",
];

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(160, "Email cannot exceed 160 characters"),

  category: z.enum(contactCategories),

  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(120, "Subject cannot exceed 120 characters")
    .optional()
    .default("CreatorIQ contact message"),

  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1200, "Message cannot exceed 1,200 characters"),
});

export { contactCategories };
