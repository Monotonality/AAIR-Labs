"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUp, RotateCcw, Trash2, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";

const VIEW = 300;
const OUTPUT = 1080;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a photo, pan/zoom it inside a square viewport, and emit the cropped
 * square as a JPEG data URL.
 */
export function PhotoCropper({
  onChange,
}: {
  onChange: (dataUrl: string | null) => void;
}) {
  const [source, setSource] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imageElRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const base = natural ? Math.max(VIEW / natural.w, VIEW / natural.h) : 1;
  const scale = base * zoom;
  const dispW = natural ? natural.w * scale : VIEW;
  const dispH = natural ? natural.h * scale : VIEW;

  const handleFile = useCallback(async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    const image = new Image();
    image.onload = () => {
      const cover = Math.max(VIEW / image.naturalWidth, VIEW / image.naturalHeight);
      const w = image.naturalWidth * cover;
      const h = image.naturalHeight * cover;
      imageElRef.current = image;
      setNatural({ w: image.naturalWidth, h: image.naturalHeight });
      setZoom(1);
      setOffset({ x: (VIEW - w) / 2, y: (VIEW - h) / 2 });
      setSource(dataUrl);
    };
    image.src = dataUrl;
  }, []);

  useEffect(() => {
    const image = imageElRef.current;
    if (!source || !natural || !image) return;
    const timer = setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const current = Math.max(VIEW / natural.w, VIEW / natural.h) * zoom;
      const srcSize = VIEW / current;
      ctx.drawImage(
        image,
        -offset.x / current,
        -offset.y / current,
        srcSize,
        srcSize,
        0,
        0,
        OUTPUT,
        OUTPUT,
      );
      onChange(canvas.toDataURL("image/jpeg", 0.92));
    }, 150);
    return () => clearTimeout(timer);
  }, [source, natural, zoom, offset, onChange]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!natural) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d || !natural) return;
    const nx = Math.min(0, Math.max(VIEW - dispW, d.ox + (e.clientX - d.x)));
    const ny = Math.min(0, Math.max(VIEW - dispH, d.oy + (e.clientY - d.y)));
    setOffset({ x: nx, y: ny });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  }

  function changeZoom(next: number) {
    if (!natural) return;
    const cover = Math.max(VIEW / natural.w, VIEW / natural.h);
    const oldScale = cover * zoom;
    const newScale = cover * next;
    const cx = (VIEW / 2 - offset.x) / oldScale;
    const cy = (VIEW / 2 - offset.y) / oldScale;
    const w = natural.w * newScale;
    const h = natural.h * newScale;
    const nx = Math.min(0, Math.max(VIEW - w, VIEW / 2 - cx * newScale));
    const ny = Math.min(0, Math.max(VIEW - h, VIEW / 2 - cy * newScale));
    setZoom(next);
    setOffset({ x: nx, y: ny });
  }

  function reset() {
    if (!natural) return;
    const cover = Math.max(VIEW / natural.w, VIEW / natural.h);
    const w = natural.w * cover;
    const h = natural.h * cover;
    setZoom(1);
    setOffset({ x: (VIEW - w) / 2, y: (VIEW - h) / 2 });
  }

  function remove() {
    imageElRef.current = null;
    setSource(null);
    setNatural(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {!source ? (
        <div className="flex flex-col items-start gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <ImageUp />
            Upload photo
          </Button>
          <span className="text-xs text-ink-45">
            Use a square image for the best result. Drag to reposition.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              position: "relative",
              width: VIEW,
              height: VIEW,
              overflow: "hidden",
              touchAction: "none",
              cursor: "grab",
              background: "#111111",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={source}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: offset.x,
                top: offset.y,
                width: dispW,
                height: dispH,
                maxWidth: "none",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <ZoomIn className="size-4 text-ink-45" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => changeZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <ImageUp />
              Replace
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              <RotateCcw />
              Reset
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={remove}>
              <Trash2 />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
