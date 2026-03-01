import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildFailure, getActiveTab, isInjectablePage } from "@/lib/chrome/active-tab";
import { copyToClipboard } from "@/lib/clipboard/copy";
import { readSessionIdFromPage } from "@/lib/indexeddb/read-session";
import { parseChannelIdFromUrl } from "@/lib/parsing/channel-id";
import type { SessionLookupFailure, SessionLookupResult } from "@/types/session";

type ViewState = { kind: "loading" } | { kind: "ready"; result: SessionLookupResult };

const successCopyLabelDurationMs = 3000;

function CopyIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <rect height="11" rx="2" stroke="currentColor" strokeWidth="1.8" width="11" x="9" y="9" />
      <path
        d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12 4.2 4.2L19 6.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function TerminalPromptIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className="mt-1 h-[22px] w-[22px] shrink-0 text-[#1fb85b]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m7 7 4 5-4 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <path d="M13 17h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
    </svg>
  );
}

function TitleInfoIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className="h-[20px] w-[20px] shrink-0 text-[var(--info-icon)]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M6 7h12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 7v10" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M9 17h6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ChannelInfoIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className="h-[20px] w-[20px] shrink-0 text-[var(--info-icon)]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      <path
        d="M12 3.5v3M12 17.5v3M20.5 12h-3M6.5 12h-3M17.66 6.34l-2.12 2.12M8.46 15.54l-2.12 2.12M17.66 17.66l-2.12-2.12M8.46 8.46 6.34 6.34"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SessionInfoIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className="h-[20px] w-[20px] shrink-0 text-[var(--info-icon)]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="8" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 12h8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M17 12v3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M19.5 12v2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function InfoBannerIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className="h-[20px] w-[20px] shrink-0 text-[var(--info-banner-accent)]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" fill="currentColor" r="10" opacity="0.18" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10v5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <circle cx="12" cy="7.2" fill="currentColor" r="1.1" />
    </svg>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.JSX.Element;
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-[20px_104px_minmax(0,1fr)] items-center gap-3 py-1.5">
      {icon}
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="break-all text-[12px] leading-6 text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function getLookupFailureFromTab(tab: chrome.tabs.Tab | null): SessionLookupFailure | null {
  if (!tab?.id) {
    return buildFailure("NO_ACTIVE_TAB", "No active tab was found.");
  }

  if (!tab.url) {
    return buildFailure("INVALID_URL", "The current page does not expose a valid URL.");
  }

  if (!isInjectablePage(tab.url)) {
    return buildFailure(
      "UNSUPPORTED_PAGE",
      "This page does not allow script injection. Open a FinAgent page and try again.",
    );
  }

  const channelId = parseChannelIdFromUrl(tab.url);

  if (!channelId) {
    return buildFailure("INVALID_URL", "The current page path must match /c/:channelId.");
  }

  return null;
}

export function App(): React.JSX.Element {
  const [viewState, setViewState] = useState<ViewState>({ kind: "loading" });
  const [isCopying, setIsCopying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const tab = await getActiveTab();
      const tabFailure = getLookupFailureFromTab(tab);

      if (tabFailure) {
        if (active) {
          setViewState({ kind: "ready", result: tabFailure });
        }
        return;
      }

      const activeTab = tab as chrome.tabs.Tab;
      const channelId = parseChannelIdFromUrl(activeTab.url!);
      const result = await readSessionIdFromPage(activeTab.id!, channelId!);

      if (active) {
        setViewState({ kind: "ready", result });
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const handleCopy = async (command: string) => {
    setIsCopying(true);
    setIsCopied(false);

    const copied = await copyToClipboard(command);

    if (!copied) {
      setIsCopying(false);
      return;
    }

    setIsCopied(true);
    setIsCopying(false);

    window.setTimeout(() => {
      setIsCopied(false);
    }, successCopyLabelDurationMs);
  };

  const readyResult = viewState.kind === "ready" ? viewState.result : null;

  return (
    <main className="popup-canvas min-h-screen px-3 py-3">
      <Card className="panel-enter rounded-[24px] border-[var(--panel-border)] bg-[var(--panel-surface)] shadow-[0_18px_40px_rgba(69,81,98,0.08)]">
        <CardHeader className="gap-0 pb-0">
          <div className="flex items-center gap-4">
            <img
              alt="FinAgent Owl"
              className="h-[62px] w-[62px] shrink-0 object-contain"
              src="/logo.svg"
            />

            <div className="min-w-0 flex-1 self-center">
              <CardTitle className="text-[28px] leading-none tracking-[-0.04em]">
                FinAgent Owl
              </CardTitle>
              <p className="mt-3 text-[14px] leading-none tracking-[0.1em] text-[var(--muted-foreground)]">
                Export current thread context
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          {viewState.kind === "loading" ? (
            <section className="space-y-4">
              <div className="h-32 animate-pulse rounded-[20px] border border-[var(--panel-border)] bg-[var(--surface-muted)] motion-reduce:animate-none" />
              <div className="h-px bg-[var(--divider)]" />
              <div className="space-y-3">
                <div className="h-5 w-40 animate-pulse rounded-full bg-[var(--surface-muted)] motion-reduce:animate-none" />
                <div className="h-16 animate-pulse rounded-[16px] bg-[var(--surface-muted)] motion-reduce:animate-none" />
              </div>
            </section>
          ) : readyResult?.ok ? (
            <section className="space-y-4">
              <div className="relative rounded-[22px] border border-[var(--panel-border)] bg-[var(--surface-muted)] px-4 pb-4 pt-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                <div className="absolute left-5 top-0 -translate-y-1/2 bg-[var(--panel-surface)] px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#28c15c]">
                  Bash
                </div>

                <div className="flex items-start gap-3">
                  <TerminalPromptIcon />
                  <code className="min-w-0 flex-1 break-all whitespace-pre-wrap pt-0.5 text-[16px] leading-[1.5] tracking-[0.02em] text-[var(--foreground)]">
                    {readyResult.command}
                  </code>

                  <button
                    aria-label="Copy command"
                    className="inline-flex h-[60px] w-[60px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-[var(--panel-border)] bg-[var(--panel-surface)] text-[var(--muted-foreground)] shadow-[0_8px_18px_rgba(79,90,107,0.08)] transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[0_10px_20px_rgba(79,90,107,0.1)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isCopying}
                    onClick={() => void handleCopy(readyResult.command)}
                    type="button"
                  >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
              </div>

              <div className="h-px bg-[var(--divider)]" />

              <section className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                  Session Parameters
                </p>

                <div className="space-y-0.5">
                  {readyResult.title ? (
                    <InfoRow icon={<TitleInfoIcon />} label="Title" value={readyResult.title} />
                  ) : null}
                  <InfoRow
                    icon={<ChannelInfoIcon />}
                    label="Channel"
                    value={readyResult.channelId}
                  />
                  <InfoRow
                    icon={<SessionInfoIcon />}
                    label="Session"
                    value={readyResult.sessionId}
                  />
                </div>
              </section>

              <div className="rounded-[16px] border border-[rgba(68,127,228,0.18)] bg-[var(--info-banner)] px-4 py-4">
                <div className="flex items-start gap-3">
                  <InfoBannerIcon />
                  <p className="text-[12px] leading-[1.65] tracking-[0.03em] text-[var(--info-banner-foreground)]">
                    The extension only copies the command. It does not execute it. Paste into your
                    terminal to run.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-4">
              <div className="rounded-[18px] border border-[var(--destructive-border)] bg-[var(--destructive-bg)] px-4 py-4 text-sm">
                <p className="text-[14px] font-medium tracking-[-0.02em] text-[var(--destructive-foreground)]">
                  Unable to prepare command
                </p>
                <p className="mt-2 text-[12px] leading-6 text-[var(--destructive-foreground)] opacity-90">
                  {readyResult?.message}
                </p>
              </div>

              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  Expected Page
                </p>
                <p className="mt-2 text-[12px] leading-6 text-[var(--foreground)]">
                  Open a FinAgent conversation page with a URL that matches
                  <code className="mx-1 rounded bg-white px-2 py-1 text-[11px]">/c/:channelId</code>
                  and try again.
                </p>
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
