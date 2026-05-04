import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import App from './App';

const queryClient = new QueryClient();

test('renders ClearSky header', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );

  expect(screen.getByText(/clearsky/i)).toBeInTheDocument();
});
