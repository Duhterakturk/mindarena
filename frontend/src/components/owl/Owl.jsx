import { useTranslation } from "react-i18next";

const PHOTO = {
  egg: "owlet.webp",
  chick: "little.webp",
  young: "barn.webp",
  wise: "snowy.webp",
  legend: "eagle.webp",
};

export default function Owl({ stage = "egg", caption = true, className = "w-40", equipped: _equipped, ...rest }) {
  const { t } = useTranslation();
  const file = PHOTO[stage] || PHOTO.egg;
  const name = t(`stages.${stage}`);
  return (
    <figure className={className} data-testid="owl" data-stage={stage} {...rest}>
      <img
        src={`/owls/${file}`}
        alt={caption ? "" : name}
        className="w-full aspect-square rounded-full object-cover border-4 border-amber-200 bg-amber-50"
      />
      {caption && <figcaption className="mt-1 text-center text-sm font-semibold">{name}</figcaption>}
    </figure>
  );
}
