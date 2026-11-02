import React from 'react';
export class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { console.error('interface_render_failed'); }
  render() {
    if (this.state.failed) return <main><h1>The interface could not be displayed</h1><p>Reload to restore your session. Unsaved input may be lost.</p><button onClick={() => window.location.reload()}>Reload page</button></main>;
    return this.props.children;
  }
}
