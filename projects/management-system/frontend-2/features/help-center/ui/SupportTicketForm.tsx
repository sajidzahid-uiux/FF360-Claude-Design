"use client";

import { type FormEvent, useCallback, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  Dropdown,
  Input,
  Textarea,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { usePostSupportTicket } from "@/hooks/mutations/usePostSupportTicket";

import { SUPPORT_SUBJECT_OPTIONS } from "../model/contactSupport";
import type {
  SupportTicketFormValues,
  SupportTicketPayload,
  SupportTicketSubject,
} from "../model/types";

const EMPTY_FORM: SupportTicketFormValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SupportTicketForm() {
  const postSupportTicket = usePostSupportTicket();
  const [form, setForm] = useState<SupportTicketFormValues>(EMPTY_FORM);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!form.name || !form.email || !form.subject || !form.message) {
        toast.error("Please fill in all fields");
        return;
      }

      if (!isValidEmail(form.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const payload: SupportTicketPayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject as SupportTicketSubject,
        message: form.message.trim(),
      };

      try {
        await postSupportTicket.mutateAsync(payload);
        toast.success(
          "Your ticket has been received. Our team will reply soon."
        );
        setForm(EMPTY_FORM);
      } catch {
        toast.error("Failed to submit support ticket. Please try again.");
      }
    },
    [form, postSupportTicket]
  );

  return (
    <form
      className="bg-bg-surface-elevated border-border-subtle flex w-full flex-col gap-6 rounded-xl border p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Name"
          placeholder="Enter your name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
        />
        <Input
          label="Email"
          placeholder="Enter your email"
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
      </div>

      <Dropdown
        label="Subject"
        options={SUPPORT_SUBJECT_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          description: option.description,
        }))}
        placeholder="Select subject"
        value={form.subject || undefined}
        onChange={(subject) => setForm((current) => ({ ...current, subject }))}
      />

      <Textarea
        label="Message"
        placeholder="Describe your question or issue"
        rows={5}
        value={form.message}
        onChange={(event) =>
          setForm((current) => ({ ...current, message: event.target.value }))
        }
      />

      <div className="flex justify-end">
        <Button
          aria-label={
            postSupportTicket.isPending ? "Submitting..." : "Submit Request"
          }
          disabled={postSupportTicket.isPending}
          title={
            postSupportTicket.isPending ? "Submitting..." : "Submit Request"
          }
          type="submit"
          variant={ButtonVariantEnum.ACCENT}
        />
      </div>
    </form>
  );
}
