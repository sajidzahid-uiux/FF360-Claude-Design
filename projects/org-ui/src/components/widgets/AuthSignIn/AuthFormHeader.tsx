import { cn } from '../../../utils/cn';
import { FieldFlowLogoMark } from '../OrganizationWelcome/FieldFlowLogoMark';
import {
  resolveAuthSignInDescription,
  type AuthSignInBrandProps,
} from './authSignInBrandTypes';

export type AuthFormHeaderProps = AuthSignInBrandProps;

export const AuthFormHeader = ({
  appTitle,
  title = 'Sign in',
  description,
  info,
  logo,
  logoSrc,
  logoAlt = '',
  animateDefaultLogo = true,
}: AuthFormHeaderProps) => {
  const resolvedDescription = resolveAuthSignInDescription(
    { description, info },
    'Continue to your workspace with a secure, personalized sign-in experience.'
  );

  const logoContent =
    logo ??
    (logoSrc ? (
      <img
        src={logoSrc}
        alt={logoAlt}
        className="h-8 w-8 object-contain"
        width={32}
        height={32}
      />
    ) : (
      <FieldFlowLogoMark animated={animateDefaultLogo} className="h-8 w-8" />
    ));

  return (
    <div className="space-y-4 text-center">
      {appTitle ? (
        <p className="text-text-muted text-xs font-semibold tracking-[0.18em] uppercase">
          {appTitle}
        </p>
      ) : null}
      <div className="ff-auth-logo-shell border-border-subtle bg-bg-surface-elevated text-text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
        {logoContent}
      </div>
      <h1 className="text-text-primary text-4xl font-semibold tracking-tight">{title}</h1>
      <p className={cn('text-text-muted text-base leading-relaxed')}>
        {resolvedDescription}
      </p>
    </div>
  );
};
