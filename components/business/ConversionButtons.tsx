import { MessageCircle, Instagram, Phone } from "lucide-react";
import type { Business } from "@/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  business: Business;
  className?: string;
  /** Compacto: solo íconos (para tarjetas). */
  compact?: boolean;
}

export function ConversionButtons({ business, className, compact }: Props) {
  const waText = encodeURIComponent(
    `¡Hola ${business.name}! Te encontré en BarrioMap y quería consultarte.`
  );

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <a
        href={`https://wa.me/${business.whatsapp}?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "whatsapp", size: compact ? "sm" : "default" }))}
      >
        <MessageCircle className="h-4 w-4" />
        {!compact && "WhatsApp"}
      </a>

      {business.instagram && (
        <a
          href={`https://instagram.com/${business.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: compact ? "sm" : "default" }))}
          aria-label="Instagram"
        >
          <Instagram className="h-4 w-4" />
          {!compact && "Instagram"}
        </a>
      )}

      {business.phone && (
        <a
          href={`tel:${business.phone}`}
          className={cn(buttonVariants({ variant: "outline", size: compact ? "sm" : "default" }))}
          aria-label="Llamar"
        >
          <Phone className="h-4 w-4" />
          {!compact && "Llamar"}
        </a>
      )}
    </div>
  );
}
