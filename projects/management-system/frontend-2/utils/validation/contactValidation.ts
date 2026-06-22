import { z } from "zod";

export interface ContactValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  zip_code?: string;
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validateEmail = (email: string): string | undefined => {
  if (!email || !email.trim()) {
    return undefined;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  return undefined;
};

/**
 * Validates contact phone (matches backend: 7–15 digits, allowed formatting only).
 * Allowed: digits, +, -, space, ( )
 */
export const validatePhone = (phone: string): string | undefined => {
  if (!phone || !phone.trim()) {
    return undefined;
  }

  const t = phone.trim();
  if (t.length > 32) {
    return "Phone number must be at most 32 characters";
  }

  if (!/^[\d\s()+-]+$/.test(t)) {
    return "Use only digits, +, -, spaces, and parentheses in phone numbers";
  }

  const digitsOnly = t.replace(/\D/g, "");
  if (digitsOnly.length < 7) {
    return "Phone number must have between 7 and 15 digits";
  }
  if (digitsOnly.length > 15) {
    return "Phone number must have between 7 and 15 digits";
  }

  return undefined;
};

export const phoneNumberSchema = z
  .string()
  .optional()
  .superRefine((val, ctx) => {
    if (val == null || !val.trim()) return;
    const err = validatePhone(val);
    if (err) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
    }
  });

/**
 * Validates zip/postal code (matches backend: A–Z, a–z, 0–9, spaces, hyphen; at least one alnum; max 20).
 */
export const validateZipCode = (zipCode: string): string | undefined => {
  if (!zipCode || !zipCode.trim()) {
    return undefined;
  }

  const t = zipCode.trim();
  if (t.length > 20) {
    return "Postal/zip code must be at most 20 characters";
  }

  if (!/^[A-Za-z0-9\s-]+$/.test(t)) {
    return "Use only letters, numbers, spaces, and hyphens in postal/zip code";
  }

  if (!/[A-Za-z0-9]/.test(t)) {
    return "Postal/zip code must include at least one letter or number";
  }

  return undefined;
};

/**
 * Validates contact form data
 * @param data - Contact form data
 * @param requiredFields - Array of required field names
 * @returns Validation errors object
 */
export const validateContactForm = (
  data: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    zip_code?: string;
  },
  requiredFields: string[] = ["name", "email", "phone"]
): ContactValidationErrors => {
  const errors: ContactValidationErrors = {};

  requiredFields.forEach((field) => {
    if (
      !data[field as keyof typeof data] ||
      !data[field as keyof typeof data]?.trim()
    ) {
      errors[field as keyof ContactValidationErrors] = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } is required`;
    }
  });

  if (data.email) {
    const emailError = validateEmail(data.email);
    if (emailError) {
      errors.email = emailError;
    }
  }

  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) {
      errors.phone = phoneError;
    }
  }

  if (data.zip_code) {
    const zipCodeError = validateZipCode(data.zip_code);
    if (zipCodeError) {
      errors.zip_code = zipCodeError;
    }
  }

  return errors;
};
