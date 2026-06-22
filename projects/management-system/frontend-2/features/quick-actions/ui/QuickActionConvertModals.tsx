"use client";

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Loader } from "@fieldflow360/org-ui";

import type { QuickAction } from "@/api/types";
import { ResourceType } from "@/constants";
import { ConvertToContactContent } from "@/features/quick-actions/ConvertToContactContent";
import { ConvertToJobContent } from "@/features/quick-actions/ConvertToJobContent";
import { ConvertToLeadContent } from "@/features/quick-actions/ConvertToLeadContent";
import type { QuickActionConvertFlow } from "@/features/quick-actions/hooks/useQuickActionConvertFlow";
import type { ConvertModalRegistration } from "@/features/quick-actions/model/convertModalRegistration";
import { ConvertRequiresContactNotice } from "@/features/quick-actions/ui/ConvertRequiresContactNotice";
import { QuickActionConvertModal } from "@/features/quick-actions/ui/QuickActionConvertModal";

export interface QuickActionConvertModalsProps {
  quickAction: QuickAction;
  flow: QuickActionConvertFlow;
}

const DEFAULT_MODAL_ACTION: ConvertModalRegistration = {
  submit: () => {},
  submitDisabled: true,
  submitLabel: "Convert",
  showCancel: true,
};

export function QuickActionConvertModals({
  quickAction,
  flow,
}: QuickActionConvertModalsProps) {
  const { mode, modalCopy, close } = flow;
  const [modalAction, setModalAction] =
    useState<ConvertModalRegistration>(DEFAULT_MODAL_ACTION);

  const registerModal = useCallback(
    (config: ConvertModalRegistration | null) => {
      setModalAction(config ?? DEFAULT_MODAL_ACTION);
    },
    []
  );

  useEffect(() => {
    if (!mode) {
      setModalAction(DEFAULT_MODAL_ACTION);
    }
  }, [mode]);

  const handleModalSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      modalAction.submit();
    },
    [modalAction]
  );

  if (!mode || !modalCopy) {
    return null;
  }

  let body: ReactNode = null;
  let isSubmitting = false;

  if (mode === "contact") {
    body = (
      <ContactConvertBody
        flow={flow}
        quickAction={quickAction}
        registerModal={registerModal}
      />
    );
    isSubmitting = flow.convertToContactMutation.isPending;
  } else if (mode === ResourceType.JOB) {
    body = (
      <JobConvertBody
        flow={flow}
        quickAction={quickAction}
        registerModal={registerModal}
      />
    );
    isSubmitting = flow.convertToJobMutation.isPending;
  } else if (mode === ResourceType.LEAD) {
    body = (
      <LeadConvertBody
        flow={flow}
        quickAction={quickAction}
        registerModal={registerModal}
      />
    );
    isSubmitting = flow.convertToLeadMutation.isPending;
  }

  return (
    <QuickActionConvertModal
      open
      isSubmitting={isSubmitting}
      showCancel={modalAction.showCancel ?? true}
      submitDisabled={modalAction.submitDisabled ?? true}
      submitLabel={modalAction.submitLabel ?? "Convert"}
      subtitle={modalCopy.subtitle}
      title={modalCopy.title}
      onClose={close}
      onSubmit={handleModalSubmit}
    >
      {body}
    </QuickActionConvertModal>
  );
}

function ContactConvertBody({
  quickAction,
  flow,
  registerModal,
}: {
  quickAction: QuickAction;
  flow: QuickActionConvertFlow;
  registerModal: (config: ConvertModalRegistration | null) => void;
}) {
  const {
    close,
    contactLookup,
    contactLookupMatches,
    handleConnectContact,
    handleCreateContact,
  } = flow;

  useEffect(() => {
    if (contactLookup.isLoading) {
      registerModal({
        submit: () => {},
        submitDisabled: true,
        submitLabel: "Convert",
      });
      return;
    }

    if (contactLookup.data?.done === true) {
      registerModal({
        submit: close,
        submitDisabled: false,
        submitLabel: "Close",
        showCancel: false,
      });
      return;
    }
  }, [close, contactLookup.data?.done, contactLookup.isLoading, registerModal]);

  if (contactLookup.isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader centerInContainer={false} text="Loading contacts…" />
      </div>
    );
  }

  if (contactLookup.data?.done === true) {
    return (
      <p className="text-text-muted text-sm">
        This quick action is already linked to a contact.
      </p>
    );
  }

  return (
    <ConvertToContactContent
      matchingContacts={contactLookupMatches ?? undefined}
      quickAction={quickAction}
      registerModal={registerModal}
      onConnectContact={handleConnectContact}
      onCreateContact={handleCreateContact}
    />
  );
}

function JobConvertBody({
  quickAction,
  flow,
  registerModal,
}: {
  quickAction: QuickAction;
  flow: QuickActionConvertFlow;
  registerModal: (config: ConvertModalRegistration | null) => void;
}) {
  const {
    hasContact,
    leadFarms,

    handleConvertJob,
    requestContactForConversion,
  } = flow;

  useEffect(() => {
    if (!hasContact) {
      registerModal({
        submit: () => requestContactForConversion(ResourceType.JOB),
        submitDisabled: false,
        submitLabel: "Convert to Contact",
        showCancel: true,
      });
    }
  }, [hasContact, registerModal, requestContactForConversion]);

  if (!hasContact) {
    return <ConvertRequiresContactNotice target={ResourceType.JOB} />;
  }

  return (
    <ConvertToJobContent
      farms={leadFarms}
      quickAction={quickAction}
      registerModal={registerModal}
      onConvertJob={handleConvertJob}
    />
  );
}

function LeadConvertBody({
  quickAction,
  flow,
  registerModal,
}: {
  quickAction: QuickAction;
  flow: QuickActionConvertFlow;
  registerModal: (config: ConvertModalRegistration | null) => void;
}) {
  const {
    hasContact,
    leadFarms,
    handleConvertLead,
    requestContactForConversion,
  } = flow;

  useEffect(() => {
    if (!hasContact) {
      registerModal({
        submit: () => requestContactForConversion(ResourceType.LEAD),
        submitDisabled: false,
        submitLabel: "Convert to Contact",
        showCancel: true,
      });
    }
  }, [hasContact, registerModal, requestContactForConversion]);

  if (!hasContact) {
    return <ConvertRequiresContactNotice target={ResourceType.LEAD} />;
  }

  return (
    <ConvertToLeadContent
      farms={leadFarms}
      quickAction={quickAction}
      registerModal={registerModal}
      onConvertLead={handleConvertLead}
    />
  );
}
