interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Ładowanie...' }: LoadingStateProps) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-500"
      data-testid="loading-state"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
