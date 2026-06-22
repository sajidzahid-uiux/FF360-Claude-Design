"use client";

import { useCallback, useEffect, useState } from "react";

import { Input, Radio } from "@fieldflow360/org-ui";
import { Mail, Phone } from "lucide-react";

import type { QuickAction, QuickActionContactMatch } from "@/api/types";
import type { ConvertModalRegistration } from "@/features/quick-actions/model/convertModalRegistration";

import { QuickActionConvertBase } from "./QuickActionConvertBase";

export function ConvertToContactContent({
  quickAction,
  matchingContacts,
  onConnectContact,
  onCreateContact,
  registerModal,
}: {
  quickAction: QuickAction;
  matchingContacts?: QuickActionContactMatch[] | null;
  onConnectContact?: (contactId: number) => void;
  onCreateContact?: (payload: {
    name: string;
    email?: string;
    phone_number?: string;
  }) => void;
  registerModal?: (config: ConvertModalRegistration | null) => void;
}) {
  const [name, setName] = useState(quickAction.name ?? "");
  const [email, setEmail] = useState(quickAction.email ?? "");
  const [phone, setPhone] = useState(quickAction.phone_number ?? "");
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    matchingContacts?.[0]?.id ?? null
  );

  const hasMatches = matchingContacts && matchingContacts.length > 0;

  const handleConnectSubmit = useCallback(() => {
    if (selectedContactId != null && onConnectContact) {
      onConnectContact(selectedContactId);
    }
  }, [onConnectContact, selectedContactId]);

  const handleCreateSubmit = useCallback(() => {
    if (!name.trim() || !onCreateContact) {
      return;
    }
    onCreateContact({
      name: name.trim(),
      email: email.trim() || undefined,
      phone_number: phone.trim() || undefined,
    });
  }, [email, name, onCreateContact, phone]);

  useEffect(() => {
    if (!registerModal) {
      return;
    }

    if (hasMatches) {
      registerModal({
        submit: handleConnectSubmit,
        submitDisabled: selectedContactId == null,
        submitLabel: "Connect",
      });
      return;
    }

    registerModal({
      submit: handleCreateSubmit,
      submitDisabled: !name.trim(),
      submitLabel: "Convert",
    });
  }, [
    handleConnectSubmit,
    handleCreateSubmit,
    hasMatches,
    name,
    registerModal,
    selectedContactId,
  ]);

  if (hasMatches) {
    return (
      <QuickActionConvertBase>
        <p className="text-text-muted text-sm">
          This contact was found in your saved contacts. Are you sure this is
          the one you want to convert?
        </p>
        <div className="space-y-2">
          {matchingContacts!.map((c) => (
            <div
              key={c.id}
              className="border-border-subtle hover:bg-bg-surface/50 rounded-lg border p-3"
            >
              <Radio
                checked={selectedContactId === c.id}
                label={c.full_name}
                name="convert-contact"
                onChange={() => setSelectedContactId(c.id)}
              />
              <div className="text-text-muted mt-2 flex flex-wrap gap-3 pl-6 text-sm">
                {c.email != null && c.email !== "" && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {c.email}
                  </span>
                )}
                {c.phone_number != null && c.phone_number !== "" && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {c.phone_number}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </QuickActionConvertBase>
    );
  }

  return (
    <QuickActionConvertBase>
      <p className="text-text-muted bg-bg-surface/30 rounded-md border p-3 text-sm">
        This record wasn&apos;t found in your saved contacts. Please convert the
        record to contacts first.
      </p>
      <div className="grid gap-4 sm:grid-cols-1">
        <Input
          required
          id="convert-contact-name"
          label="Name *"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          id="convert-contact-email"
          label="Email"
          placeholder="Enter email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="convert-contact-phone"
          label="Phone Number"
          maxLength={15}
          placeholder="Enter phone number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
    </QuickActionConvertBase>
  );
}
