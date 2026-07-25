import { repository } from "@/lib/data";
import { DirectoryView } from "@/components/directory/DirectoryGrid";

export const metadata = {
  title: "Directorio de comercios | BarrioMap",
};

export default async function DirectorioPage() {
  const businesses = await repository.getWithProducts();
  const neighborhoods = Array.from(
    new Set(businesses.map((b) => b.neighborhood))
  ).sort();

  return <DirectoryView businesses={businesses} neighborhoods={neighborhoods} />;
}
