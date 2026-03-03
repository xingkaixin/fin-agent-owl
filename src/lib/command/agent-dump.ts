export type AgentDumpCommandOptionId = "installed" | "npx" | "bunx" | "uvx" | "pipx";

export type AgentDumpCommandOption = {
  id: AgentDumpCommandOptionId;
  label: string;
  command: string;
};

const commandPrefixes: Array<{
  id: AgentDumpCommandOptionId;
  label: string;
  prefix: string;
}> = [
  { id: "installed", label: "installed", prefix: "agent-dump" },
  { id: "npx", label: "npx", prefix: "npx agent-dump" },
  { id: "bunx", label: "bunx", prefix: "bunx agent-dump" },
  { id: "uvx", label: "uvx", prefix: "uvx agent-dump" },
  { id: "pipx", label: "pipx", prefix: "pipx run agent-dump" },
];

function buildAgentDumpCommandArgs(sessionId: string): string {
  return `claude://${sessionId.trim()} -output . -format json,markdown,raw`;
}

export function buildAgentDumpCommandOptions(sessionId: string): AgentDumpCommandOption[] {
  const args = buildAgentDumpCommandArgs(sessionId);

  return commandPrefixes.map(({ id, label, prefix }) => ({
    id,
    label,
    command: `${prefix} ${args}`,
  }));
}

export function buildAgentDumpCommand(sessionId: string): string {
  return buildAgentDumpCommandOptions(sessionId)[0]!.command;
}
