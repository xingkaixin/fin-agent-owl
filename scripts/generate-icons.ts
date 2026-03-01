import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const projectRoot = import.meta.dir ? join(import.meta.dir, "..") : process.cwd();
const sourcePath = join(projectRoot, "public", "logo.svg");
const outputDirectory = join(projectRoot, "public", "icons");
const iconSizes = [16, 32, 48, 128] as const;

function buildSquareSvg(svgMarkup: string): string {
  const viewBoxMatch = svgMarkup.match(/viewBox="([^"]+)"/);
  const contentMatch = svgMarkup.match(/<svg[^>]*>([\s\S]*)<\/svg>/);

  if (!viewBoxMatch || !contentMatch) {
    throw new Error("logo.svg must contain a viewBox and SVG content.");
  }

  const [, viewBox] = viewBoxMatch;
  const viewBoxValues = viewBox.trim().split(/\s+/).map(Number);

  if (viewBoxValues.length !== 4 || viewBoxValues.some((value) => Number.isNaN(value))) {
    throw new Error("logo.svg viewBox is invalid.");
  }

  const [minX, minY, width, height] = viewBoxValues;
  const squareSize = Math.max(width, height);
  const offsetX = (squareSize - width) / 2 - minX;
  const offsetY = (squareSize - height) / 2 - minY;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${squareSize} ${squareSize}" fill="none">`,
    `<g transform="translate(${offsetX} ${offsetY})">`,
    contentMatch[1],
    "</g>",
    "</svg>",
  ].join("");
}

async function generateIcons(): Promise<void> {
  const rawSvg = await Bun.file(sourcePath).text();
  const squareSvg = buildSquareSvg(rawSvg);

  await mkdir(outputDirectory, { recursive: true });

  for (const size of iconSizes) {
    const resvg = new Resvg(squareSvg, {
      fitTo: {
        mode: "width",
        value: size,
      },
      background: "rgba(0, 0, 0, 0)",
    });

    const rendered = resvg.render();
    const outputPath = join(outputDirectory, `icon-${size}.png`);

    await mkdir(dirname(outputPath), { recursive: true });
    await Bun.write(outputPath, rendered.asPng());
    console.log(`Generated ${outputPath}`);
  }
}

await generateIcons();
