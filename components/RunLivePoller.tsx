"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  runId: string;
  status: string;
  intervalMs?: number;
};

export function RunLivePoller({ runId, status, intervalMs = 4000 }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [runId, status, intervalMs, router]);

  if (status !== "running") return null;

  return (
    <p className="live-indicator muted">
      <span className="live-dot" /> Pipeline running — auto-refreshing
    </p>
  );
}
