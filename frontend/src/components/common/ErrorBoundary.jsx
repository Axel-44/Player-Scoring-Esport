/**
 * frontend/src/components/common/ErrorBoundary.jsx
 * Error Boundary komponen untuk menangkap runtime exception pada level React tree
 * agar aplikasi tidak mengalami layar hitam total (blank screen).
 */

import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
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

  handleReload = () => {
    try {
      if (
        this.state.error?.name === "QuotaExceededError" ||
        this.state.error?.message?.includes("quota") ||
        this.state.error?.message?.includes("pulse_scout_compared_players")
      ) {
        localStorage.removeItem("pulse_scout_compared_players");
      }
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30 shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-gaming font-bold text-white mb-2">
            TERJADI KENDALA PADA TAMPILAN
          </h2>
          <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
            Terjadi kesalahan saat memuat komponen ini ({this.state.error?.message || "Render Error"}). Silakan muat ulang halaman.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-gaming font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>MUAT ULANG HALAMAN</span>
            </button>
            <a
              href="/"
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-gaming font-bold text-xs uppercase flex items-center gap-1.5 transition-all border border-gray-700"
            >
              <Home className="w-3.5 h-3.5" />
              <span>BERANDA</span>
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
