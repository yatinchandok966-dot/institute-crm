import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2">
          <p className="font-bold text-sm">Component error encountered</p>
          <p className="text-slate-600 font-mono text-[11px]">{this.state.error?.message || 'Rendering error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
          >
            Retry View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
