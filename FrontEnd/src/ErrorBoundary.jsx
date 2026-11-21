import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <pre
        style={{
          margin: 0,
          padding: 24,
          minHeight: "100vh",
          whiteSpace: "pre-wrap",
          background: "#1b1b1b",
          color: "#ff9c85",
          font: "13px/1.5 ui-monospace, Consolas, monospace",
        }}
      >
        {"Terjadi error:\n\n" + String(this.state.error?.stack || this.state.error)}
      </pre>
    );
  }
}