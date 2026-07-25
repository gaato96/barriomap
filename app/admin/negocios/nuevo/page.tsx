"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Dices, MapPin } from "lucide-react";
import { createBusinessWithOwner } from "@/app/admin/actions";
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
  whatsapp: z.string().min(8, "Ingresá un WhatsApp válido"),
  instagram: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().min(10, "Contanos un poco más (mín. 10 caracteres)"),
  ownerName: z.string().min(2, "Ingresá el nombre del dueño"),
  ownerEmail: z.string().email("Email inválido"),
  ownerPassword: z.string().min(8, "Mínimo 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

const labelClass = "mb-1 block text-sm font-medium";
const errClass = "mt-1 text-xs text-red-600";

export default function NuevoNegocioPage() {
  const [location, setLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [locError, setLocError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; email: string; password: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "gastronomia", houseStyle: "local_comercial" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!location) {
      setLocError(true);
      return;
    }
    setServerError(null);
    try {
      const result = await createBusinessWithOwner({ ...values, ...location });
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setSuccess({ name: values.name, email: values.ownerEmail, password: values.ownerPassword });
    } catch {
      setServerError("Ocurrió un error inesperado. Probá de nuevo.");
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">¡{success.name} está en el mapa!</h1>
        <p className="mt-2 text-muted-foreground">
          Compartile estos datos de acceso al dueño (guardalos, no se muestran de nuevo):
        </p>
        <div className="mt-4 space-y-2 rounded-xl border border-border bg-card p-4 text-left">
          <p>
            <span className="text-muted-foreground">Email: </span>
            <span className="font-mono font-medium">{success.email}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Contraseña: </span>
            <span className="font-mono font-medium">{success.password}</span>
          </p>
          <p className="text-xs text-muted-foreground">Ingresan en /login</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/admin" className="inline-block">
            <Button variant="outline">Ver negocios</Button>
          </Link>
          <Button
            onClick={() => {
              reset({ category: "gastronomia", houseStyle: "local_comercial" });
              setLocation(null);
              setSuccess(null);
            }}
          >
            Cargar otro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <h1 className="text-2xl font-bold">Nuevo negocio</h1>
      <p className="mt-1 text-muted-foreground">
        Cargá el negocio y creá la cuenta con la que su dueño va a poder editar precios,
        productos y ofertas.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className={labelClass}>Nombre del negocio</label>
          <Input placeholder="Ej. Dulce Hogar Tortas" {...register("name")} />
          {errors.name && <p className={errClass}>{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Rubro</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("category")}
            >
              {(["gastronomia", "indumentaria", "servicios", "showrooms"] as const).map((c) => (
                <option key={c} value={c}>
                  {CATEGORIES[c].emoji} {CATEGORIES[c].label}
                </option>
              ))}
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
            {errors.neighborhood && <p className={errClass}>{errors.neighborhood.message}</p>}
          </div>
        </div>

        <div>
          <label className={cn("flex items-center gap-1", labelClass)}>
            <MapPin className="h-4 w-4" />
            Ubicación exacta en el mapa
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            Tocá el mapa para poner el pin (podés arrastrarlo).
          </p>
          <LocationPicker
            value={location}
            onChange={(loc) => {
              setLocation(loc);
              setLocError(false);
            }}
          />
          {locError && <p className={errClass}>Marcá la ubicación en el mapa.</p>}
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
          <label className={labelClass}>Descripción</label>
          <textarea
            rows={3}
            className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Productos, servicios, horarios…"
            {...register("description")}
          />
          {errors.description && <p className={errClass}>{errors.description.message}</p>}
        </div>

        <div className="rounded-xl border border-border bg-secondary/50 p-4">
          <h3 className="mb-3 text-sm font-semibold">Cuenta de acceso del dueño</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nombre del dueño</label>
              <Input placeholder="Ej. María Pérez" {...register("ownerName")} />
              {errors.ownerName && <p className={errClass}>{errors.ownerName.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email (usuario de acceso)</label>
              <Input type="email" placeholder="maria@email.com" {...register("ownerEmail")} />
              {errors.ownerEmail && <p className={errClass}>{errors.ownerEmail.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Contraseña</label>
              <div className="flex gap-2">
                <Input
                  value={watch("ownerPassword") ?? ""}
                  onChange={(e) => setValue("ownerPassword", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue("ownerPassword", randomPassword())}
                >
                  <Dices className="h-4 w-4" />
                  Generar
                </Button>
              </div>
              {errors.ownerPassword && <p className={errClass}>{errors.ownerPassword.message}</p>}
            </div>
          </div>
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creando…" : "Crear negocio y cuenta"}
        </Button>
      </form>
    </div>
  );
}
