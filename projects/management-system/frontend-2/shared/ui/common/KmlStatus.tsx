/**
 * KML Status component for displaying loading and error states
 */
interface KmlStatusProps {
  loading: boolean;
  error: string | null;
}

export function KmlStatus({ loading, error }: KmlStatusProps) {
  if (loading) {
    return (
      <div className="absolute top-4 left-4 z-10 rounded-lg bg-blue-500/90 px-3 py-2 text-white shadow-lg">
        Processing KML data...
      </div>
    );
  }
  if (error) {
    return (
      <div className="absolute top-4 left-4 z-10 rounded-lg bg-red-500/90 px-3 py-2 text-white shadow-lg">
        {error}
      </div>
    );
  }
  return null;
}
