export const AccessDeniedView = ({
  message = "You are not authorized to view this page.",
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold text-red-600">Access Denied</h1>
      <p className="text-text-muted">{message}</p>
    </div>
  );
};
