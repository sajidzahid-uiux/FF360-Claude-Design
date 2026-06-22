export function PermissionsEmptyState() {
  return (
    <div className="space-y-2 py-8 text-center">
      <p className="text-text-muted font-medium">
        No permissions available in the system.
      </p>
      <p className="text-text-muted text-sm">
        Permissions need to be created in the backend. Please run the management
        command:
      </p>
      <code className="bg-bg-surface block rounded p-2 text-xs">
        python manage.py populate_permissions
      </code>
      <p className="text-text-muted mt-2 text-sm">
        Then assign default permissions to roles:
      </p>
      <code className="bg-bg-surface block rounded p-2 text-xs">
        python manage.py assign_default_permissions
      </code>
    </div>
  );
}
