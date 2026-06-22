import { cn } from '../../../utils/cn';
import { FieldFlowLogoMark } from '../OrganizationWelcome/FieldFlowLogoMark';
import {
  resolveAuthSignInDescription,
  type AuthSignInBrandProps,
} from './authSignInBrandTypes';

export type AuthSignInCornerBrandProps = AuthSignInBrandProps;

export function AuthSignInCornerBrand({
  appTitle,
  title = 'Sign in',
  description,
  info,
  logo,
  logoSrc,
  logoAlt = '',
  animateDefaultLogo = true,
}: AuthSignInCornerBrandProps) {
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
    <div className="pointer-events-none max-w-[min(100%,18rem)] space-y-2 text-left sm:max-w-xs">
      {appTitle ? (
        <p className="text-text-muted text-[10px] font-semibold tracking-[0.16em] uppercase sm:text-xs">
          {appTitle}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <div className="ff-auth-logo-shell border-border-subtle bg-bg-surface-elevated text-text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border sm:h-12 sm:w-12 sm:rounded-2xl">
          {logoContent}
        </div>
        <h1 className="text-text-primary text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h1>
      </div>
      <p className={cn('text-text-muted hidden text-sm leading-relaxed sm:block')}>
        {resolvedDescription}
      </p>
    </div>
  );
}
