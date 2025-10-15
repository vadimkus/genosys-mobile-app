/**
 * ErrorBoundary Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '../../test/utils';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = true,
}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Custom fallback component
const CustomFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div>
    <div>Custom Error: {error.message}</div>
    <button onClick={retry}>Custom Retry</button>
  </div>
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeTruthy();
  });

  it('should render error fallback when child throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
    expect(
      screen.getByText(
        "We encountered an unexpected error. Don't worry, your data is safe."
      )
    ).toBeTruthy();
  });

  it('should render custom fallback component when provided', () => {
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error: Test error')).toBeTruthy();
    expect(screen.getByText('Custom Retry')).toBeTruthy();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should retry and render children after retry', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();

    // Click retry button
    fireEvent.press(screen.getByText('Try Again'));

    // Rerender with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeTruthy();
  });

  it('should show debug info in development mode', () => {
    const originalDev = __DEV__;
    // @ts-ignore
    global.__DEV__ = true;

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Debug Info:')).toBeTruthy();
    expect(screen.getByText('Test error')).toBeTruthy();

    // @ts-ignore
    global.__DEV__ = originalDev;
  });

  it('should not show debug info in production mode', () => {
    const originalDev = __DEV__;
    // @ts-ignore
    global.__DEV__ = false;

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Debug Info:')).toBeNull();

    // @ts-ignore
    global.__DEV__ = originalDev;
  });

  it('should handle report error action', () => {
    const alertSpy = jest
      .spyOn(require('react-native'), 'Alert')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.press(screen.getByText('Report'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Report Error',
      'Would you like to report this error to our support team?',
      expect.any(Array)
    );

    alertSpy.mockRestore();
  });
});
