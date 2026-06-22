'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../../ui-components/Button';
import { Checkbox } from '../../ui-components/Checkbox';
import { Input } from '../../ui-components/Input';
import { AuthFormDivider } from './AuthFormDivider';
import { AuthFormFooter } from './AuthFormFooter';
import type { AuthFormFooterProps } from './AuthFormFooter';
import { AuthFormHeader } from './AuthFormHeader';
import type { AuthSignInBrandProps } from './authSignInBrandTypes';
import { SignInFormData, signInSchema } from './schemas';

export interface SignInFormProps extends AuthSignInBrandProps {
  onSubmit: (data: SignInFormData) => void | Promise<void>;
  externalSubmitting?: boolean;
  initialEmail?: string;
  signUpHref?: string;
  onSignUpClick?: AuthFormFooterProps['onSignUpClick'];
  /** When false, omits the centered logo/title block (e.g. when using `AuthSignInLayout` `cornerBrand`). */
  showBrandHeader?: boolean;
}

export function SignInForm({
  onSubmit,
  externalSubmitting = false,
  initialEmail,
  signUpHref = '/sign-up',
  onSignUpClick,
  appTitle,
  title,
  description,
  info,
  logo,
  logoSrc,
  logoAlt,
  animateDefaultLogo,
  showBrandHeader = true,
}: SignInFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: initialEmail ?? '',
      keepSignedIn: false,
    },
  });

  const email = watch('email');

  const isFormEmpty = !email;
  const hasErrors = Object.keys(errors).length > 0;
  const isButtonDisabled =
    isSubmitting || externalSubmitting || isFormEmpty || hasErrors;

  return (
    <div className="w-full space-y-8">
      {showBrandHeader ? (
        <>
          <AuthFormHeader
            appTitle={appTitle}
            title={title}
            description={description}
            info={info}
            logo={logo}
            logoSrc={logoSrc}
            logoAlt={logoAlt}
            animateDefaultLogo={animateDefaultLogo}
          />
          <AuthFormDivider />
        </>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          {...register('email')}
          type="email"
          placeholder="Email"
          error={errors.email?.message}
          autoComplete="email"
        />
        <div className="flex items-center justify-between">
          <Checkbox {...register('keepSignedIn')} label="Keep me signed in" />
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={isButtonDisabled}
          title={
            isSubmitting || externalSubmitting ? 'Redirecting...' : 'Continue'
          }
        />
      </form>

      <AuthFormFooter
        href={signUpHref}
        onSignUpClick={onSignUpClick}
      />
    </div>
  );
}
