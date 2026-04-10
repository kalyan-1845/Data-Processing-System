import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ui/ErrorBoundary';

function ThrowingComponent(): React.JSX.Element {
  throw new Error('Test crash');
}

function GoodComponent() {
  return <div data-testid="good">All good</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary moduleName="Test">
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('good')).toBeInTheDocument();
  });

  it('renders error UI when a child throws', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary moduleName="Summarizer">
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Summarizer encountered an error/i)).toBeInTheDocument();
    expect(screen.getByText(/Test crash/i)).toBeInTheDocument();
    expect(screen.getByText(/Retry Module/i)).toBeInTheDocument();
    
    spy.mockRestore();
  });

  it('shows a retry button in the error state', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary moduleName="PDF Compress">
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByText(/Retry Module/i);
    expect(retryButton).toBeInTheDocument();
    expect(retryButton.tagName).toBe('BUTTON');
    
    spy.mockRestore();
  });
});
