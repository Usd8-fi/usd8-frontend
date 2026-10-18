import { Component } from 'react';
import { reportError } from '../lib/errorReporting.js';

/// Last-resort crash screen: reports the render error and offers a reload
/// instead of leaving a blank page.
export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    reportError(error, 'render-crash', { componentStack: info?.componentStack?.slice(0, 2000) });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="app-crash" role="alert">
        <p>Something went wrong while showing this page.</p>
        <button type="button" onClick={() => window.location.reload()}>Reload</button>
      </main>
    );
  }
}
