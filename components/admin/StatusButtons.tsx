"use client";

import { useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setBusinessStatus } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

interface Props {
  businessId: string;
  status: "published" | "hidden" | "pending";
}

export function StatusButtons({ businessId, status }: Props) {
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = status === "published" ? "hidden" : "published";
    startTransition(async () => {
      await setBusinessStatus(businessId, next);
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-secondary disabled:opacity-50",
        status === "published" ? "text-green-700" : "text-muted-foreground"
      )}
    >
      {status === "published" ? (
        <>
          <Eye className="h-3.5 w-3.5" /> Publicado
        </>
      ) : (
        <>
          <EyeOff className="h-3.5 w-3.5" /> Oculto
        </>
      )}
    </button>
  );
}
