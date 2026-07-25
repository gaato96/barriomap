"use client";

import { useTransition } from "react";
import { Check, MessageCircle } from "lucide-react";
import { markLeadReviewed } from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";

interface Props {
  lead: {
    id: string;
    name: string;
    category: keyof typeof CATEGORIES;
    neighborhood: string | null;
    whatsapp: string;
    description: string | null;
    status: string;
    created_at: string;
  };
}

export function LeadRow({ lead }: Props) {
  const [pending, startTransition] = useTransition();
  const cat = CATEGORIES[lead.category];
  const reviewed = lead.status === "reviewed";

  return (
    <div className="flex items-start justify-between gap-3 border-b border-border p-4 last:border-0">
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <Badge color={cat?.color}>
            {cat?.emoji} {cat?.label}
          </Badge>
          {reviewed && <Badge style={{ backgroundColor: "#dcfce7", color: "#166534" }}>Revisado</Badge>}
        </div>
        <p className="font-medium">{lead.name}</p>
        <p className="text-sm text-muted-foreground">
          {lead.neighborhood} · {new Date(lead.created_at).toLocaleDateString("es-AR")}
        </p>
        {lead.description && (
          <p className="mt-1 text-sm text-foreground/80">{lead.description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-[#25D366] hover:bg-secondary"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
        {!reviewed && (
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await markLeadReviewed(lead.id);
              })
            }
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Marcar revisado
          </button>
        )}
      </div>
    </div>
  );
}
