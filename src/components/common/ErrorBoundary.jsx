import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 m-4 rounded-xl border border-red-500/50 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <AlertTriangle className="text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-['Orbitron'] font-bold text-red-400 mb-2">SYSTEM FAILURE</h2>
          <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
            The component encountered a critical error. The rest of the dashboard remains operational.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-6 py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/20 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all font-['Orbitron']"
          >
            <RefreshCw size={16} /> REBOOT PROTOCOL
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
