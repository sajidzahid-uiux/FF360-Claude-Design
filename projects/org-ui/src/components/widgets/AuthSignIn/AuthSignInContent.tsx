'use client';

import { useEffect, useRef } from 'react';
import { AppleIcon, MailCheck } from 'lucide-react';

import { Button } from '../../ui-components/Button';
import { ButtonVariantEnum, ComponentSizeEnum } from '../../../constants';
import type { AuthSignInBrandProps } from './authSignInBrandTypes';
import { SignInForm } from './SignInForm';
import type { SignInFormData } from './schemas';

export interface AuthSignInErrorPayload {
  error: string;
  errorDescription?: string | null;
}

export interface AuthSignInContentProps extends AuthSignInBrandProps {
  onEmailSubmit: (data: SignInFormData) => void | Promise<void>;
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
  isRedirecting?: boolean;
  initialEmail?: string;
  signUpHref?: string;
  onSignUpClick?: () => void;
  showEmailNotVerified?: boolean;
  loginHintEmail?: string | null;
  onVerifiedRetry?: () => void;
  onUseDifferentEmail?: () => void;
  isFreshEmailFlow?: boolean;
  error?: string | null;
  errorDescription?: string | null;
  onAuthError?: (payload: AuthSignInErrorPayload) => void;
  /** When false, omits the centered logo/title block (e.g. when using `AuthSignInLayout` `cornerBrand`). */
  showBrandHeader?: boolean;
}

export function AuthSignInContent({
  onEmailSubmit,
  onGoogleSignIn,
  onAppleSignIn,
  isRedirecting = false,
  initialEmail,
  signUpHref = '/sign-up',
  onSignUpClick,
  showEmailNotVerified = false,
  loginHintEmail = null,
  onVerifiedRetry,
  onUseDifferentEmail,
  isFreshEmailFlow = false,
  error,
  errorDescription,
  onAuthError,
  appTitle,
  title,
  description,
  info,
  logo,
  logoSrc,
  logoAlt,
  animateDefaultLogo,
  showBrandHeader = true,
}: AuthSignInContentProps) {
  const lastErrorToastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!error || !onAuthError) return;

    const signature = `${error}|${errorDescription ?? ''}`;
    if (lastErrorToastRef.current === signature) return;
    lastErrorToastRef.current = signature;

    onAuthError({ error, errorDescription });
  }, [error, errorDescription, onAuthError]);

  return (
    <div className="w-full space-y-6">
      {showEmailNotVerified ? (
        <div className="text-text-primary x-4 py-4">
          <div className="space-y-4">
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold">
                Please verify your email before signing in.
              </h1>
              <p className="text-text-muted">
                {loginHintEmail ? (
                  <>
                    We sent a verification link to{' '}
                    <strong className="text-text-secondary font-semibold">
                      {loginHintEmail}
                    </strong>
                    .
                  </>
                ) : (
                  'Check your inbox and spam folder for the verification link.'
                )}
              </p>
            </div>
            <div className="flex w-full justify-center gap-2">
              <Button
                title={isRedirecting ? 'Redirecting...' : 'I verified, try again'}
                onClick={onVerifiedRetry}
                disabled={isRedirecting || !onVerifiedRetry}
                fullWidth
              />
              <Button
                variant={ButtonVariantEnum.SURFACE}
                title="Use different email"
                onClick={onUseDifferentEmail}
                disabled={isRedirecting || !onUseDifferentEmail}
                fullWidth
              />
            </div>
            <p className="text-text-muted text-center text-sm">
              If you already verified, click &quot;{' '}
              <strong>I verified, try again</strong> &quot; to refresh your Auth0
              session.
            </p>
          </div>
        </div>
      ) : (
        <SignInForm
          key={`${isFreshEmailFlow ? 'fresh' : 'default'}-${initialEmail ?? 'empty-email'}`}
          onSubmit={onEmailSubmit}
          externalSubmitting={isRedirecting}
          initialEmail={initialEmail}
          signUpHref={signUpHref}
          onSignUpClick={onSignUpClick}
          appTitle={appTitle}
          title={title}
          description={description}
          info={info}
          logo={logo}
          logoSrc={logoSrc}
          logoAlt={logoAlt}
          animateDefaultLogo={animateDefaultLogo}
          showBrandHeader={showBrandHeader}
        />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border-strong w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-bg-surface-elevated text-text-muted px-2">
            or continue with
          </span>
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-row gap-2">
        <Button
          onClick={onGoogleSignIn}
          fullWidth
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.ACCENT}
          title={isRedirecting ? 'Redirecting...' : 'Sign in with Google'}
          disabled={isRedirecting}
          leftIcon={<MailCheck className="h-4 w-4 shrink-0" />}
        />
        <Button
          onClick={onAppleSignIn}
          fullWidth
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.ACCENT}
          title={isRedirecting ? 'Redirecting...' : 'Sign in with Apple'}
          disabled={isRedirecting}
          leftIcon={<AppleIcon className="h-4 w-4 shrink-0" />}
        />
      </div>
    </div>
  );
}
