"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { deleteProduct } from "@/app/panel/actions";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./ProductForm";

interface Props {
  businessId: string;
  products: Product[];
}

export function ProductManager({ businessId, products }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "new" | string>("idle"); // string = editing product id
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const editingProduct = mode !== "idle" && mode !== "new" ? products.find((p) => p.id === mode) : undefined;

  const onDelete = (id: string) => {
    if (!confirm("¿Eliminar este producto? No se puede deshacer.")) return;
    setPendingDelete(id);
    startTransition(async () => {
      await deleteProduct(id);
      setPendingDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {mode === "idle" && (
        <Button onClick={() => setMode("new")}>
          <Plus className="h-4 w-4" />
          Agregar producto
        </Button>
      )}

      {mode === "new" && (
        <ProductForm businessId={businessId} onDone={() => setMode("idle")} onCancel={() => setMode("idle")} />
      )}

      <div className="space-y-3">
        {products.map((p) =>
          mode === p.id ? (
            <ProductForm
              key={p.id}
              businessId={businessId}
              product={p}
              onDone={() => setMode("idle")}
              onCancel={() => setMode("idle")}
            />
          ) : (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card"
            >
              {p.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photoUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-lg bg-secondary" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-medium">{p.name}</p>
                  {p.isOffer && (
                    <Badge style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                      🔥 {p.offerLabel || "Oferta"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-primary">{formatPrice(p.price)}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => setMode(p.id)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={pendingDelete === p.id}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-50"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        )}
        {products.length === 0 && mode === "idle" && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Todavía no cargaste productos. ¡Agregá el primero!
          </p>
        )}
      </div>
    </div>
  );
}
