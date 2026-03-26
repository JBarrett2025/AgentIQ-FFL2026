import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import MainRouter from './MainRouter';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Sets up global error handlers to catch unhandled exceptions and promise rejections.
 * This acts as a safety net for errors outside of the React component tree.
 */
const setupGlobalErrorHandler = () => {
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
        console.error('Global unhandled error:', { message, source, lineno, colno, error });
        // Chain to any existing error handler to avoid breaking host environment scripts
        if (originalOnError) {
            originalOnError.call(window, message, source, lineno, colno, error);
        }
        // Return false to ensure default browser error handling still occurs
        return false;
    };

    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
        console.error('Global unhandled promise rejection:', event.reason);
        if (originalOnUnhandledRejection) {
            originalOnUnhandledRejection.call(window, event);
        }
    };
};

const MAX_INIT_RETRIES = 50; // 50 * 100ms = 5 seconds
let initRetryCount = 0;

const initializeApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    initRetryCount++;
    if (initRetryCount > MAX_INIT_RETRIES) {
        const errorMessage = `Fatal Error: Root element '#root' not found after ${MAX_INIT_RETRIES} attempts. The application cannot mount.`;
        console.error(errorMessage);
        // Display a fallback message directly in the body if mounting fails completely.
        document.body.innerHTML = `
          <div style="padding: 20px; text-align: center; font-family: sans-serif; background-color: #fff5f5; color: #c53030; border: 2px solid #f56565; margin: 2rem;">
            <h2>Application Mount Failed</h2>
            <p>The required HTML element '#root' could not be found on the page.</p>
            <p style="font-size: 0.9rem; margin-top: 1rem;">Please check the browser console for more details.</p>
          </div>
        `;
        return;
    }
    console.warn(`Root element not found. Retrying... (Attempt ${initRetryCount}/${MAX_INIT_RETRIES})`);
    setTimeout(initializeApp, 100);
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <MainRouter />
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// Setup the global handlers immediately as the script loads.
setupGlobalErrorHandler();

// Defer React initialization until the DOM is fully loaded to prevent race conditions.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOMContentLoaded has already fired, initialize immediately.
  initializeApp();
}
