interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'Brak danych.' }: EmptyStateProps) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400"
      data-testid="empty-state"
    >
      <svg
        className="h-10 w-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}
