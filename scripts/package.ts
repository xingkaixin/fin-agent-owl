import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

type PackageJson = {
  name?: string;
  version?: string;
};

const projectRoot = import.meta.dir ? join(import.meta.dir, "..") : process.cwd();
const releaseDirectory = join(projectRoot, "release");
const packageJsonPath = join(projectRoot, "package.json");
const zipBinary = "/usr/bin/zip";

async function runCommand(command: string[], label: string): Promise<void> {
  console.log(`\n${label}`);

  const process = Bun.spawn(command, {
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await process.exited;

  if (exitCode !== 0) {
    throw new Error(`${label} failed with exit code ${exitCode}.`);
  }
}

async function createArchive(): Promise<void> {
  const packageJson = (await Bun.file(packageJsonPath).json()) as PackageJson;
  const packageName = packageJson.name ?? "fin-agent-owl";
  const version = packageJson.version ?? "0.0.0";
  const archivePath = join(releaseDirectory, `${packageName}-v${version}.zip`);

  await mkdir(releaseDirectory, { recursive: true });
  await rm(archivePath, { force: true });

  await runCommand(["bun", "run", "icons"], "Generating icons");
  await runCommand(["bun", "run", "build"], "Building extension");
  await runCommand([zipBinary, "-r", archivePath, "dist"], "Creating release archive");

  console.log(`\nArchive ready: ${archivePath}`);
}

await createArchive();
