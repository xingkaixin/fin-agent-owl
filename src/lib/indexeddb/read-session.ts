import { buildAgentDumpCommand } from "@/lib/command/agent-dump";
import type {
  ConversationRecord,
  QueryErrorCode,
  SessionLookupFailure,
  SessionLookupResult,
} from "@/types/session";

type SerializableLookupResult =
  | {
      ok: true;
      record: ConversationRecord;
    }
  | {
      ok: false;
      code: "DB_OPEN_FAILED" | "STORE_MISSING" | "NOT_FOUND" | "SESSION_ID_MISSING";
      message: string;
    };

function pageLookupConversation(targetChannelId: string): Promise<SerializableLookupResult> {
  return new Promise((resolve) => {
    const dbRequest = indexedDB.open("FinAgentDB");

    dbRequest.onerror = () => {
      resolve({
        ok: false,
        code: "DB_OPEN_FAILED",
        message: "Unable to open FinAgentDB.",
      });
    };

    dbRequest.onsuccess = async (event) => {
      const db = event.target instanceof IDBOpenDBRequest ? event.target.result : dbRequest.result;

      if (!db.objectStoreNames.contains("conversations")) {
        resolve({
          ok: false,
          code: "STORE_MISSING",
          message: "The conversations store is missing in FinAgentDB.",
        });
        return;
      }

      try {
        const transaction = db.transaction("conversations", "readonly");
        const store = transaction.objectStore("conversations");
        const allRecords = await new Promise<ConversationRecord[]>((innerResolve, innerReject) => {
          const getAllRequest = store.getAll();

          getAllRequest.onerror = () => {
            innerReject(new Error("getAll failed"));
          };

          getAllRequest.onsuccess = () => {
            innerResolve((getAllRequest.result as ConversationRecord[]) ?? []);
          };
        });

        const matchedRecord = allRecords.find((record) => record.channelId === targetChannelId);

        if (!matchedRecord) {
          resolve({
            ok: false,
            code: "NOT_FOUND",
            message: "No conversation matched the current channel ID.",
          });
          return;
        }

        if (!matchedRecord.sessionId) {
          resolve({
            ok: false,
            code: "SESSION_ID_MISSING",
            message: "A matching conversation was found, but sessionId is missing.",
          });
          return;
        }

        resolve({
          ok: true,
          record: {
            channelId: matchedRecord.channelId,
            sessionId: matchedRecord.sessionId,
            title: matchedRecord.title,
            updatedAt: matchedRecord.updatedAt ?? matchedRecord.timestamp,
            timestamp: matchedRecord.timestamp,
          },
        });
      } catch {
        resolve({
          ok: false,
          code: "DB_OPEN_FAILED",
          message: "Unable to read from the conversations store.",
        });
      } finally {
        db.close();
      }
    };
  });
}

function buildLookupFailure(code: QueryErrorCode, message: string): SessionLookupFailure {
  return {
    ok: false,
    code,
    message,
  };
}

export async function readSessionIdFromPage(
  tabId: number,
  channelId: string,
): Promise<SessionLookupResult> {
  try {
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      args: [channelId],
      func: pageLookupConversation,
    });

    const result = injectionResults[0]?.result;

    if (!result) {
      return buildLookupFailure(
        "INJECTION_FAILED",
        "The lookup script ran, but returned no result.",
      );
    }

    if (!result.ok) {
      return buildLookupFailure(result.code, result.message);
    }

    const { record } = result;
    const sessionId = record.sessionId?.trim();

    if (!sessionId) {
      return buildLookupFailure(
        "SESSION_ID_MISSING",
        "A matching conversation was found, but sessionId is empty.",
      );
    }

    return {
      ok: true,
      channelId,
      sessionId,
      command: buildAgentDumpCommand(sessionId),
      title: record.title,
      updatedAt: record.updatedAt,
    };
  } catch {
    return buildLookupFailure(
      "INJECTION_FAILED",
      "Unable to run the lookup script on this page. Open the target page and try again.",
    );
  }
}
