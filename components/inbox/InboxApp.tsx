"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/app/AppState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextArea, TextInput } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { ANALYTICS_EVENTS, capture } from "@/lib/analytics";
import { newId } from "@/lib/ids";
import {
  DOCUMENT_TYPE_LABEL,
  MAX_DOCUMENT_CHARS,
  SAMPLE_DOCUMENTS,
  customDeadlineFromExtraction,
  shareStructureFromExtraction,
  type ExtractOutcome,
  type ExtractionResult,
} from "@/lib/llm";
import type { InboxDocument } from "@/lib/storage";

type ReviewDraft = {
  document: InboxDocument;
  fields: ExtractionResult["fields"];
  shareClasses: ExtractionResult["shareClasses"];
  deadlineTitle: string;
  deadlineDate: string;
  deadlineAction: string;
};

export function InboxApp() {
  const {
    state,
    saveProfile,
    upsertDocument,
    upsertCustomDeadline,
  } = useAppState();
  const { notify } = useToast();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [review, setReview] = useState<ReviewDraft | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/extract")
      .then((response) => response.json())
      .then((payload: { demoMode?: boolean }) => {
        if (!cancelled) {
          setDemoMode(Boolean(payload.demoMode));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDemoMode(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedDocuments = useMemo(
    () =>
      [...state.documents].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.documents],
  );

  async function readDocument(source = text) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source }),
      });
      const payload = (await response.json()) as ExtractOutcome;
      if (!(payload.ok && payload.sampleResult)) {
        setDemoMode(payload.demoMode);
      }
      if (!payload.ok) {
        setError(payload.error);
        return;
      }
      const document: InboxDocument = {
        id: newId("doc"),
        createdAt: new Date().toISOString(),
        status: "needs_review",
        rawText: source,
        extraction: payload.result,
        demoMode: payload.demoMode,
        sampleResult: payload.sampleResult,
        provider: payload.provider,
        deadlineId: null,
        shareDataSent: false,
      };
      setReview(draftFromDocument(document));
      setText(source);
      capture(ANALYTICS_EVENTS.documentExtracted, {
        documentType: payload.result.documentType,
        provider: payload.provider,
        demoMode: payload.demoMode,
      });
    } catch {
      setError("The reader is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  function saveReview(nextStatus: InboxDocument["status"] = "needs_review") {
    if (!review) {
      return;
    }
    const document = documentFromDraft(review, nextStatus);
    upsertDocument(document);
    setReview({ ...review, document });
    notify(nextStatus === "done" ? "Marked as reviewed" : "Saved to inbox");
  }

  function addDeadline() {
    if (!review) {
      return;
    }
    const extraction = {
      ...review.document.extraction,
      fields: review.fields,
      shareClasses: review.shareClasses,
    };
    const deadline = customDeadlineFromExtraction(
      extraction,
      review.document.id,
      {
        title: review.deadlineTitle,
        isoDate: review.deadlineDate,
        action: review.deadlineAction,
      },
    );
    if (!deadline) {
      setError("Add a title and a date before putting this on the calendar.");
      return;
    }
    upsertCustomDeadline(deadline);
    const document = documentFromDraft(
      {
        ...review,
        document: { ...review.document, deadlineId: deadline.id },
      },
      review.document.status,
    );
    upsertDocument(document);
    setReview({ ...review, document });
    notify("Deadline added to the calendar", {
      href: "/calendar",
      label: "View in calendar",
    });
    capture(ANALYTICS_EVENTS.documentAddedToCalendar);
  }

  function sendShareData() {
    if (!review || !state.profile) {
      return;
    }
    const extraction = {
      ...review.document.extraction,
      shareClasses: review.shareClasses,
    };
    const shareStructure = shareStructureFromExtraction(
      extraction,
      state.profile.shareStructure,
    );
    if (!shareStructure) {
      setError("No share classes to send.");
      return;
    }
    saveProfile({ ...state.profile, shareStructure });
    const document = documentFromDraft(
      {
        ...review,
        document: { ...review.document, shareDataSent: true },
      },
      review.document.status,
    );
    upsertDocument(document);
    setReview({ ...review, document });
    notify("Share classes sent to Franchise Tax Checker");
  }

  if (review) {
    return (
      <ReviewScreen
        review={review}
        demoMode={review.document.demoMode || demoMode}
        sampleResult={review.document.sampleResult}
        onChange={setReview}
        onBack={() => setReview(null)}
        onSave={() => saveReview("needs_review")}
        onReviewed={() => saveReview("done")}
        onAddDeadline={addDeadline}
        onSendShareData={sendShareData}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">
            Inbox
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Paste a notice. Nothing is saved or added to the calendar until you
            confirm it.
          </p>
        </div>
        {demoMode ? <Badge>Demo mode</Badge> : null}
      </div>

      <Card className="mt-8">
        <TextArea
          id="document-text"
          label="Document text"
          hint="Text is sent to an AI model to read it. Don't paste anything confidential. Paste the text — uploading a PDF is not available yet."
          value={text}
          maxLength={MAX_DOCUMENT_CHARS}
          onChange={(event) => setText(event.target.value)}
          error={error}
        />
        <p className="mt-1 text-xs tabular-nums text-muted">
          {text.length.toLocaleString()} / {MAX_DOCUMENT_CHARS.toLocaleString()}
        </p>
        <div className="mt-4">
          <Button onClick={() => void readDocument()} disabled={busy}>
            {busy ? "Reading…" : "Read document"}
          </Button>
        </div>
      </Card>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-medium">Try a sample document</h2>
        <p className="mt-1 text-sm text-muted">
          Fictional notices. These use a saved sample result and do not call the
          live AI.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <Button
              key={sample.id}
              variant="secondary"
              className="h-auto min-h-11 justify-start py-2 text-left"
              disabled={busy}
              onClick={() => {
                setText(sample.text);
                void readDocument(sample.text);
              }}
            >
              {sample.title}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium">Saved documents</h2>
        {sortedDocuments.length === 0 ? (
          <Card className="mt-3">
            <EmptyState
              title="No documents yet"
              body="Paste a notice or certificate here and it will show up after you review it."
            />
          </Card>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {sortedDocuments.map((document) => (
              <li key={document.id}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 rounded-md border border-line bg-card px-3 py-3 text-left hover:bg-paper"
                  onClick={() => setReview(draftFromDocument(document))}
                >
                  <div>
                    <p className="font-medium">
                      {DOCUMENT_TYPE_LABEL[document.extraction.documentType]}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {document.extraction.summary}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      tone={
                        document.status === "needs_review" ? "warn" : "neutral"
                      }
                    >
                      {document.status === "needs_review"
                        ? "Needs review"
                        : "Done"}
                    </Badge>
                    {document.sampleResult ? (
                      <Badge>Sample result</Badge>
                    ) : document.demoMode ? (
                      <Badge>Demo mode</Badge>
                    ) : null}
                    {document.extraction.deadline ? (
                      <span className="font-mono text-xs tabular-nums text-muted">
                        {document.extraction.deadline.isoDate}
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function ReviewScreen({
  review,
  demoMode,
  sampleResult,
  onChange,
  onBack,
  onSave,
  onReviewed,
  onAddDeadline,
  onSendShareData,
}: {
  review: ReviewDraft;
  demoMode: boolean;
  sampleResult: boolean;
  onChange: (next: ReviewDraft) => void;
  onBack: () => void;
  onSave: () => void;
  onReviewed: () => void;
  onAddDeadline: () => void;
  onSendShareData: () => void;
}) {
  const extraction = review.document.extraction;
  const hasShares = review.shareClasses.length > 0;
  const hasDeadline = Boolean(review.deadlineDate);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Review before anything is saved</p>
          <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight">
            {DOCUMENT_TYPE_LABEL[extraction.documentType]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleResult ? (
            <Badge>Sample result</Badge>
          ) : demoMode ? (
            <Badge>Demo mode</Badge>
          ) : null}
          <Badge
            tone={
              review.document.status === "needs_review" ? "warn" : "neutral"
            }
          >
            {review.document.status === "needs_review"
              ? "Needs review"
              : "Done"}
          </Badge>
        </div>
      </div>

      <Card className="mt-6">
        <p className="text-sm leading-6">{extraction.summary}</p>
        <p className="mt-2 text-sm text-muted">Issuer: {extraction.issuer}</p>
      </Card>

      <Card className="mt-4">
        <h2 className="font-serif text-xl font-medium">Extracted fields</h2>
        <p className="mt-1 text-sm text-muted">
          Edit anything that looks wrong. Low-confidence rows are marked.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Field</th>
                <th className="pb-2 font-medium">Value</th>
                <th className="pb-2 font-medium">Source quote</th>
                <th className="pb-2 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {review.fields.map((field, index) => (
                <tr
                  key={`${field.key}-${index}`}
                  className={
                    field.confidence === "low" ? "bg-warn-soft/60" : undefined
                  }
                >
                  <td className="py-2 pr-3 align-top">{field.label}</td>
                  <td className="py-2 pr-3 align-top">
                    <input
                      aria-label={field.label}
                      value={field.value}
                      onChange={(event) =>
                        onChange({
                          ...review,
                          fields: review.fields.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, value: event.target.value }
                              : item,
                          ),
                        })
                      }
                      className="h-10 w-full rounded-md border border-line bg-card px-2 font-mono tabular-nums"
                    />
                  </td>
                  <td className="py-2 pr-3 align-top text-muted">
                    “{field.quote}”
                  </td>
                  <td className="py-2 align-top">
                    <span className="sr-only">
                      {field.confidence} confidence
                    </span>
                    <Badge
                      tone={field.confidence === "low" ? "warn" : "neutral"}
                    >
                      {field.confidence}
                    </Badge>
                  </td>
                </tr>
              ))}
              {review.shareClasses.map((share, index) => (
                <tr
                  key={`share-${index}`}
                  className={
                    share.confidence === "low" ? "bg-warn-soft/60" : undefined
                  }
                >
                  <td className="py-2 pr-3 align-top">{share.name}</td>
                  <td className="py-2 pr-3 align-top">
                    <div className="flex flex-col gap-2">
                      <input
                        aria-label={`${share.name} authorized`}
                        value={share.authorized}
                        onChange={(event) =>
                          onChange({
                            ...review,
                            shareClasses: review.shareClasses.map(
                              (item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, authorized: event.target.value }
                                  : item,
                            ),
                          })
                        }
                        className="h-10 w-full rounded-md border border-line bg-card px-2 font-mono tabular-nums"
                      />
                      <input
                        aria-label={`${share.name} par value`}
                        value={share.parValue}
                        onChange={(event) =>
                          onChange({
                            ...review,
                            shareClasses: review.shareClasses.map(
                              (item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, parValue: event.target.value }
                                  : item,
                            ),
                          })
                        }
                        className="h-10 w-full rounded-md border border-line bg-card px-2 font-mono tabular-nums"
                      />
                    </div>
                  </td>
                  <td className="py-2 pr-3 align-top text-muted">
                    “{share.quote}”
                  </td>
                  <td className="py-2 align-top">
                    <Badge
                      tone={share.confidence === "low" ? "warn" : "neutral"}
                    >
                      {share.confidence}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-serif text-xl font-medium">Deadline and action</h2>
        <p className="mt-1 text-sm text-muted">
          {hasDeadline
            ? "This becomes a custom calendar item with the statutory date only."
            : "No date was found. You can still save the document."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <TextInput
            id="deadline-title"
            label="Title"
            value={review.deadlineTitle}
            onChange={(event) =>
              onChange({ ...review, deadlineTitle: event.target.value })
            }
          />
          <TextInput
            id="deadline-date"
            label="Statutory date"
            type="date"
            value={review.deadlineDate}
            onChange={(event) =>
              onChange({ ...review, deadlineDate: event.target.value })
            }
          />
        </div>
        <div className="mt-3">
          <TextArea
            id="deadline-action"
            label="Required action"
            className="min-h-24"
            value={review.deadlineAction}
            onChange={(event) =>
              onChange({ ...review, deadlineAction: event.target.value })
            }
          />
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={onSave}>Save to inbox</Button>
        <Button variant="secondary" onClick={onAddDeadline} disabled={!hasDeadline}>
          Add deadline to calendar
        </Button>
        {hasShares ? (
          <Button variant="secondary" onClick={onSendShareData}>
            Send share data to Franchise Tax Checker
          </Button>
        ) : null}
        <Button variant="secondary" onClick={onReviewed}>
          Mark as reviewed
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>
    </main>
  );
}

function draftFromDocument(document: InboxDocument): ReviewDraft {
  const deadline = document.extraction.deadline;
  return {
    document,
    fields: document.extraction.fields.map((field) => ({ ...field })),
    shareClasses: document.extraction.shareClasses.map((share) => ({
      ...share,
    })),
    deadlineTitle: deadline?.title ?? "",
    deadlineDate: deadline?.isoDate ?? "",
    deadlineAction: deadline?.action ?? document.extraction.requiredAction,
  };
}

function documentFromDraft(
  review: ReviewDraft,
  status: InboxDocument["status"],
): InboxDocument {
  return {
    ...review.document,
    status,
    extraction: {
      ...review.document.extraction,
      fields: review.fields,
      shareClasses: review.shareClasses,
      deadline: review.deadlineDate
        ? {
            title: review.deadlineTitle || "Custom deadline",
            isoDate: review.deadlineDate,
            action: review.deadlineAction,
            quote: review.document.extraction.deadline?.quote ?? "Edited by you",
            confidence:
              review.document.extraction.deadline?.confidence ?? "medium",
          }
        : null,
      requiredAction: review.deadlineAction,
    },
  };
}
