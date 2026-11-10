"use client";

import { useSyncExternalStore } from "react";

import { formatDateTime } from "@/lib/dates";

const subscribe = () => () => {};

/**
 * Renders a timestamp in the viewer's own timezone. The server (and the
 * hydration pass) print UTC; the client then switches to local time.
 */
export function LocalTime({ value }: { value: string }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const date = new Date(value);
  const text = Number.isNaN(date.getTime())
    ? value
    : isClient
      ? (formatDateTime(value) ?? value)
      : `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;

  return <time dateTime={value}>{text}</time>;
}
