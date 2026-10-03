import { LinkButton } from "@/components/ui/LinkButton";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col justify-center px-4 py-16">
      <p className="text-sm text-muted">404</p>
      <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
        That page is not on this desk
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        The link may be old, or the page was never here. Head back to the
        dashboard.
      </p>
      <div className="mt-6">
        <LinkButton href="/">Back to dashboard</LinkButton>
      </div>
    </main>
  );
}
