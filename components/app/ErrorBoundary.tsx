"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-16">
          <h1 className="font-serif text-3xl font-medium">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            The desk hit an unexpected error. Your saved data is still in this
            browser. Try again, or export a backup from Settings if this keeps
            happening.
          </p>
          <div className="mt-6">
            <Button onClick={() => this.setState({ failed: false })}>
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
