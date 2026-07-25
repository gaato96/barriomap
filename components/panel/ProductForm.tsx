"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import type { Product } from "@/types";
import { createProduct, updateProduct } from "@/app/panel/actions";
import { uploadProductPhoto } from "@/lib/supabase/uploadProductPhoto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Props {
  businessId: string;
  product?: Product;
  onDone: () => void;
  onCancel: () => void;
}

export function ProductForm({ businessId, product, onDone, onCancel }: Props) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [photoUrl, setPhotoUrl] = useState<string | null>(product?.photoUrl ?? null);
  const [isOffer, setIsOffer] = useState(product?.isOffer ?? false);
  const [offerLabel, setOfferLabel] = useState(product?.offerLabel ?? "");
  const [keywords, setKeywords] = useState(product?.keywords.join(", ") ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadProductPhoto(businessId, file);
      setPhotoUrl(url);
    } catch {
      setError("No se pudo subir la foto. Probá de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    if (!name.trim() || Number.isNaN(priceNum) || priceNum < 0) {
      setError("Completá nombre y precio válidos.");
      return;
    }
    setSaving(true);
    setError(null);

    const input = {
      name: name.trim(),
      price: priceNum,
      photoUrl,
      isOffer,
      offerLabel: isOffer ? offerLabel.trim() || null : null,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    };

    const result = product
      ? await updateProduct(product.id, input)
      : await createProduct(input);

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-secondary/40 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Torta de chocolate" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Precio</label>
          <Input
            type="number"
            min={0}
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Foto</label>
        <div className="flex items-center gap-3">
          {photoUrl && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-card p-0.5 shadow-card"
                aria-label="Quitar foto"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Subiendo…" : "Subir foto"}
            <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Palabras clave (para el buscador, separadas por coma)
        </label>
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="torta, cumpleaños, dulce"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={isOffer} onCheckedChange={setIsOffer} id="is-offer" />
        <label htmlFor="is-offer" className="cursor-pointer text-sm font-medium">
          🔥 Es una oferta
        </label>
      </div>
      {isOffer && (
        <Input
          value={offerLabel}
          onChange={(e) => setOfferLabel(e.target.value)}
          placeholder="Ej. 2x1, 15% off, envío gratis"
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Guardando…" : product ? "Guardar cambios" : "Agregar producto"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
