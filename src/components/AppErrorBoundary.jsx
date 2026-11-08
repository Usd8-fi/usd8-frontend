import { Component } from 'react';
import { reportError } from '../lib/errorReporting.js';
import { useTranslation } from '../lib/i18n.js';

// A function component so the crash screen follows language changes.
function CrashScreen() {
  const { t } = useTranslation();
  return (
    <main className="app-crash" role="alert">
      <p>{t('errorBoundary.crash.message')}</p>
      <button type="button" onClick={() => window.location.reload()}>{t('errorBoundary.crash.reload')}</button>
    </main>
  );
}

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
    return <CrashScreen />;
  }
}
