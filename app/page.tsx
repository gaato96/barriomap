import { repository } from "@/lib/data";
import { MapExperience } from "@/components/map/MapExperience";

export default async function MapaPage() {
  const businesses = await repository.getWithProducts();
  const offers = await repository.getOffers();

  return <MapExperience businesses={businesses} offers={offers} />;
}
