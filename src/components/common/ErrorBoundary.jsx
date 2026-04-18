import React from 'react';
import './ErrorBoundary.css';
import Button from './Button';

/**
 * ErrorBoundary — Global error handler to catch rendering exceptions
 * Shows a premium "Onyx & Snow" stylized fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorMessage: error.message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__container container">
            <div className="error-boundary__content">
              <span className="error-boundary__icon">⚠️</span>
              <h1 className="error-boundary__title">We encountered a problem.</h1>
              <p className="error-boundary__desc">
                An unexpected error occurred while rendering this page. 
                Our systems have logged the issue and we apologize for any inconvenience.
              </p>
              
              {this.state.errorMessage && (
                <div className="error-boundary__code">
                  <code>{this.state.errorMessage}</code>
                </div>
              )}

              <div className="error-boundary__actions">
                <Button 
                  variant="primary" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/'}
                >
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
