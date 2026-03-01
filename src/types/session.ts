export type QueryErrorCode =
  | "NO_ACTIVE_TAB"
  | "INVALID_URL"
  | "UNSUPPORTED_PAGE"
  | "INJECTION_FAILED"
  | "DB_OPEN_FAILED"
  | "STORE_MISSING"
  | "NOT_FOUND"
  | "SESSION_ID_MISSING"
  | "CLIPBOARD_FAILED";

export type ConversationRecord = {
  channelId: string;
  sessionId?: string;
  title?: string;
  updatedAt?: string;
  timestamp?: string;
};

export type SessionLookupSuccess = {
  ok: true;
  channelId: string;
  sessionId: string;
  command: string;
  title?: string;
  updatedAt?: string;
};

export type SessionLookupFailure = {
  ok: false;
  code: QueryErrorCode;
  message: string;
};

export type SessionLookupResult = SessionLookupSuccess | SessionLookupFailure;
