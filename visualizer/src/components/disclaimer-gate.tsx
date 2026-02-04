"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "polymarket-app-disclaimer-accepted";

export function useDisclaimerAccepted() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setAccepted(raw === "true");
    } catch {
      setAccepted(false);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      setAccepted(true);
    } catch {
      // ignore
    }
  };

  return { accepted, accept };
}

export function DisclaimerGate({ children }: { children: React.ReactNode }) {
  const { accepted, accept } = useDisclaimerAccepted();
  const router = useRouter();

  if (accepted === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!accepted) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Disclaimer</DialogTitle>
            <DialogDescription>
              This dashboard displays analytics for Polymarket Bitcoin Up or Down 15-minute markets. It is for research and education only. Not financial advice. Past performance does not guarantee future results. Use at your own risk. The tool does not execute trades.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push("/")}>
              Decline
            </Button>
            <Button onClick={accept}>
              I understand, continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return <>{children}</>;
}
