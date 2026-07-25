"use client";

import type { Business, BusinessWithProducts, Product } from "@/types";
import { MapCanvas } from "./MapCanvas";
import { SearchBar } from "./SearchBar";
import { QuickFilters } from "./QuickFilters";
import { OffersHub } from "./OffersHub";
import { BusinessDrawer } from "@/components/business/BusinessDrawer";

interface Props {
  businesses: BusinessWithProducts[];
  offers: { business: Business; product: Product }[];
}

/** Compone el mapa 3D y todos sus overlays (todo del lado cliente). */
export function MapExperience({ businesses, offers }: Props) {
  return (
    <div className="absolute inset-0">
      <MapCanvas businesses={businesses} />

      {/* Overlays: no bloquean el mapa salvo sus controles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-3 flex w-full -translate-x-1/2 justify-center px-4">
          <SearchBar />
        </div>

        <div className="absolute left-3 top-[4.5rem] sm:top-16">
          <QuickFilters />
        </div>

        <div className="absolute bottom-4 left-3">
          <OffersHub offers={offers} />
        </div>
      </div>

      <BusinessDrawer businesses={businesses} />
    </div>
  );
}
