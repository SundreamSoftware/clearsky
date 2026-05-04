interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Wystąpił błąd podczas ładowania danych.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-red-600">
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded bg-red-100 px-4 py-2 text-sm transition-colors hover:bg-red-200"
        >
          Spróbuj ponownie
        </button>
      )}
    </div>
  );
}
