import React from "react";

type State = {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // you could log to an external service here
    console.error("Uncaught error in component tree:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#111",
          color: "white",
          padding: 20,
          boxSizing: "border-box",
        }}>
          <div>
            <h1>Une erreur est survenue</h1>
            <p>Un composant a planté — l'application a été protégée par un Error Boundary.</p>
            <pre style={{whiteSpace: "pre-wrap", maxWidth: "60ch", color: "#f88"}}>{this.state.error?.toString()}</pre>
            <div style={{marginTop: 12}}>
              <button onClick={() => window.location.reload()}>Recharger</button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children as React.ReactElement
  }
}
