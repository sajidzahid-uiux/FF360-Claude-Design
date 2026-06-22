export interface AuthFormFooterProps {
  href?: string;
  question?: string;
  action?: string;
  onSignUpClick?: () => void;
}

export const AuthFormFooter = ({
  href = '/sign-up',
  question = `Don't have an account?`,
  action = 'Sign up',
  onSignUpClick,
}: AuthFormFooterProps) => {
  const actionClassName = 'text-text-primary font-semibold hover:underline';

  return (
    <div className="text-text-secondary text-center text-sm">
      {question}{' '}
      {onSignUpClick ? (
        <button type="button" className={actionClassName} onClick={onSignUpClick}>
          {action}
        </button>
      ) : (
        <a href={href} className={actionClassName}>
          {action}
        </a>
      )}
    </div>
  );
};
