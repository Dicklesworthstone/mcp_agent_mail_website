"use client";

import dynamic from "next/dynamic";

const SpecViewer = dynamic(
  () => import("@/components/spec-explorer/spec-viewer"),
  { ssr: false }
);

export default function SpecViewerLoader() {
  return <SpecViewer />;
}
