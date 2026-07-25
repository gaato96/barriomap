"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ArrowLeft, MapPin } from "lucide-react";
import { repository } from "@/lib/data";
import { HOUSE_STYLES, CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationPicker } from "@/components/form/LocationPicker";

const schema = z.object({
  name: z.string().min(2, "Ingresá el nombre del negocio"),
  category: z.enum(["gastronomia", "indumentaria", "servicios", "showrooms"]),
  houseStyle: z.enum(["clasica", "moderna", "local_comercial", "showroom", "esquina"]),
  address: z.string().min(3, "Ingresá la dirección"),
  neighborhood: z.string().min(2, "Ingresá el barrio o zona"),
  whatsapp: z
    .string()
    .min(8, "Ingresá un WhatsApp válido")
    .regex(/^[0-9+\s-]+$/, "Solo números"),
  instagram: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().min(10, "Contanos un poco más (mín. 10 caracteres)"),
});

type FormValues = z.infer<typeof schema>;

const inputClass = "";
const labelClass = "mb-1 block text-sm font-medium";
const errClass = "mt-1 text-xs text-red-600";

export default function SumarNegocioPage() {
  const [location, setLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [locError, setLocError] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "gastronomia", houseStyle: "clasica" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!location) {
      setLocError(true);
      return;
    }
    await repository.addLead({
      ...values,
      whatsapp: values.whatsapp.replace(/[^0-9]/g, ""),
      lat: location.lat,
      lng: location.lng,
    });
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="h-full overflow-y-auto scroll-slim">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold">¡Recibimos tu negocio!</h1>
          <p className="mt-2 text-muted-foreground">
            Lo vamos a revisar y en breve va a aparecer en el mapa de tu barrio. Gracias por
            sumarte a BarrioMap. 🎉
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button>Volver al mapa</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scroll-slim">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al mapa
        </Link>

        <h1 className="text-2xl font-bold">Sumá tu negocio a BarrioMap</h1>
        <p className="mt-1 text-muted-foreground">
          Vendés desde tu casa o tenés un showroom? Cargá tus datos y que tus vecinos te
          encuentren. Es gratis y sin vueltas.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <label className={labelClass}>Nombre del negocio</label>
            <Input className={inputClass} placeholder="Ej. Dulce Hogar Tortas" {...register("name")} />
            {errors.name && <p className={errClass}>{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Rubro</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("category")}
              >
                {(["gastronomia", "indumentaria", "servicios", "showrooms"] as const).map(
                  (c) => (
                    <option key={c} value={c}>
                      {CATEGORIES[c].emoji} {CATEGORIES[c].label}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className={labelClass}>Estilo de casita en el mapa</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("houseStyle")}
              >
                {HOUSE_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Dirección</label>
              <Input placeholder="Ej. Laprida 1220" {...register("address")} />
              {errors.address && <p className={errClass}>{errors.address.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Barrio / Zona</label>
              <Input placeholder="Ej. Barrio Norte" {...register("neighborhood")} />
              {errors.neighborhood && (
                <p className={errClass}>{errors.neighborhood.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={cn(labelClass, "flex items-center gap-1")}>
              <MapPin className="h-4 w-4" />
              Ubicación exacta en el mapa
            </label>
            <p className="mb-2 text-xs text-muted-foreground">
              Tocá el mapa para poner el pin donde está tu negocio (podés arrastrarlo).
            </p>
            <LocationPicker
              value={location}
              onChange={(loc) => {
                setLocation(loc);
                setLocError(false);
              }}
            />
            {locError && <p className={errClass}>Marcá la ubicación en el mapa.</p>}
            {location && (
              <p className="mt-1 text-xs text-green-600">
                Ubicación fijada ✓ ({location.lat.toFixed(5)}, {location.lng.toFixed(5)})
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>WhatsApp</label>
              <Input placeholder="381 555 1234" {...register("whatsapp")} />
              {errors.whatsapp && <p className={errClass}>{errors.whatsapp.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Instagram (opcional)</label>
              <Input placeholder="usuario" {...register("instagram")} />
            </div>
            <div>
              <label className={labelClass}>Teléfono (opcional)</label>
              <Input placeholder="381 555 1234" {...register("phone")} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Contanos qué ofrecés</label>
            <textarea
              rows={4}
              className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Productos, servicios, horarios, formas de pago…"
              {...register("description")}
            />
            {errors.description && <p className={errClass}>{errors.description.message}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando…" : "Sumar mi negocio"}
          </Button>
        </form>
      </div>
    </div>
  );
}
