import { CardDescription, CardTitle } from "@/shared/ui/primitives";

const DELETE_CONSEQUENCES = [
  "Your profile and personal information will be permanently deleted.",
  "If you own an organization, all related data — projects, files, and settings — will be removed.",
  "You will lose access to every service linked to this account.",
  "Your username will become available for others to claim.",
  "This action cannot be undone.",
] as const;

const DeleteAccountInfo = () => (
  <div className="space-y-4">
    <div>
      <CardTitle className="text-lg text-[var(--color-feedback-error-strong)]">
        Delete your account
      </CardTitle>
      <CardDescription className="mt-1.5">
        Before proceeding, understand what account deletion means.
      </CardDescription>
    </div>

    <div className="space-y-2">
      <p className="text-text-primary text-sm font-medium">
        What happens when you delete your account?
      </p>
      <ul className="text-text-secondary space-y-2 text-sm leading-relaxed">
        {DELETE_CONSEQUENCES.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-feedback-error)]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default DeleteAccountInfo;
