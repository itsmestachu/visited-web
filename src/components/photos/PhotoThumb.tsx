import { usePhotoUrl } from "../../hooks/usePhotoUrl";
import "./PhotoThumb.css";

type Props = {
  id: string;
  onClick: () => void;
  overlay?: string;
};

export function PhotoThumb({ id, onClick, overlay }: Props) {
  const url = usePhotoUrl(id, "thumb");
  return (
    <button type="button" className="photo-thumb" onClick={onClick}>
      {url && <img src={url} alt="" loading="lazy" />}
      {overlay && <span className="photo-thumb-overlay">{overlay}</span>}
    </button>
  );
}
