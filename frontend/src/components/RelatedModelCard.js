import NeuCard from "./NeuCard";

export default function RelatedModelCard({ brandObject, onClick }) {
  const name = brandObject?.name ?? "";
  const meta = [brandObject?.category, brandObject?.scale]
    .filter(Boolean)
    .join(" · ");

  return (
    <NeuCard
      variant="row"
      name={name}
      imageUrl={brandObject?.image_url ?? brandObject?.imageUrl}
      meta={meta || undefined}
      onClick={onClick}
    />
  );
}
