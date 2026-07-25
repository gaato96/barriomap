"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateBusinessContact, type BusinessContactInput } from "@/app/panel/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function BusinessContactForm({ initial }: { initial: BusinessContactInput }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof BusinessContactInput>(key: K, value: BusinessContactInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateBusinessContact(values);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Dirección</label>
          <Input value={values.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Barrio / Zona</label>
          <Input value={values.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">WhatsApp</label>
          <Input value={values.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Instagram</label>
          <Input
            value={values.instagram ?? ""}
            onChange={(e) => set("instagram", e.target.value || null)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Teléfono</label>
          <Input value={values.phone ?? ""} onChange={(e) => set("phone", e.target.value || null)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea
          rows={4}
          className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Guardado
          </span>
        )}
      </div>
    </form>
  );
}
