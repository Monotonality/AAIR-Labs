const FONT_FILES = [
  { family: "Archivo", weight: 900, file: "/marketing/fonts/archivo-900.woff2" },
  {
    family: "Space Mono",
    weight: 400,
    file: "/marketing/fonts/space-mono-400.woff2",
  },
  {
    family: "Space Mono",
    weight: 700,
    file: "/marketing/fonts/space-mono-700.woff2",
  },
] as const;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

let fontCssPromise: Promise<string> | null = null;

async function buildFontCss(): Promise<string> {
  const faces = await Promise.all(
    FONT_FILES.map(async (font) => {
      const res = await fetch(font.file);
      if (!res.ok) throw new Error(`Could not load font ${font.file}.`);
      const base64 = bytesToBase64(new Uint8Array(await res.arrayBuffer()));
      return `@font-face{font-family:'${font.family}';font-style:normal;font-weight:${font.weight};src:url(data:font/woff2;base64,${base64}) format('woff2');}`;
    }),
  );
  return faces.join("\n");
}

/** Base64-inlined @font-face rules so the standalone SVG can render our fonts. */
export function getMarketingFontCss(): Promise<string> {
  if (!fontCssPromise) {
    fontCssPromise = buildFontCss().catch((error) => {
      fontCssPromise = null;
      throw error;
    });
  }
  return fontCssPromise;
}

export async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}.`);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${url}.`));
    reader.readAsDataURL(blob);
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not render the image."));
    img.src = url;
  });
}

/**
 * Rasterize an inline-styled DOM node to a PNG by embedding it in an SVG
 * <foreignObject>. Images must already be data URLs and fonts must be supplied
 * as inlined @font-face rules, since an SVG loaded as an image cannot fetch
 * external resources.
 */
export async function renderNodeToPng(
  node: HTMLElement,
  width: number,
  height: number,
  fontCss: string,
): Promise<Blob> {
  const serialized = new XMLSerializer().serializeToString(node);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    (fontCss ? `<style>${fontCss}</style>` : "") +
    `<foreignObject x="0" y="0" width="${width}" height="${height}">` +
    `<div xmlns="http://www.w3.org/1999/xhtml">` +
    serialized +
    `</div></foreignObject></svg>`;

  // Chrome taints a canvas when it draws an SVG containing <foreignObject> that
  // was loaded from a blob: URL. A base64 data: URL is treated as origin-clean,
  // so embed the standalone SVG that way instead.
  const svgUrl = `data:image/svg+xml;base64,${bytesToBase64(new TextEncoder().encode(svg))}`;

  const image = await loadImage(svgUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(image, 0, 0, width, height);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not export the PNG.")),
      "image/png",
    );
  });
}
