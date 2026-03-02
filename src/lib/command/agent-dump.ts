export function buildAgentDumpCommand(sessionId: string): string {
  return `agent-dump claude://${sessionId.trim()} -output . -format json,markdown,raw`;
}
