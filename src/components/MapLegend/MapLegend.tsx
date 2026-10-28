import { useTheme } from "styled-components";
import type { Status } from "../../store/store.types";
import { PALETTE } from "../../theme/palette";
import { Bar, Hint, Item, Swatch } from "./MapLegend.styles";

const PIN = "M0 0C-2-4-7.6-8-7.6-13.3a7.6 7.6 0 1 1 15.2 0C7.6-8 2-4 0 0Z";

const HINT: Record<Status, string> = {
  visited: "Klikaj kraje i miasta, w których byłeś",
  wish: "Klikaj miejsca, do których chcesz pojechać",
};

export function MapLegend({ mode }: { mode: Status }) {
  const { colors } = useTheme();
  return (
    <Bar>
      <Item>
        <Swatch width="30" height="14" viewBox="0 0 30 14">
          {PALETTE.slice(0, 3).map((c, i) => (
            <rect key={c} x={i * 10} y="0" width="10" height="14" fill={c} stroke={colors.ink} strokeOpacity="0.45" />
          ))}
        </Swatch>
        Odwiedzony kraj
      </Item>
      <Item>
        <Swatch width="20" height="14" viewBox="0 0 20 14">
          <rect x="0.5" y="0.5" width="19" height="13" fill={colors.wishFill} stroke={colors.wish} strokeDasharray="3 2" />
        </Swatch>
        Chcę odwiedzić
      </Item>
      <Item>
        <Swatch width="16" height="18" viewBox="-8 -21 16 21">
          <path d={PIN} fill={colors.red} stroke={colors.paper} strokeWidth="1.6" />
          <circle cy="-13.3" r="2.9" fill={colors.paper} />
        </Swatch>
        Odwiedzone miasto
      </Item>
      <Item>
        <Swatch width="16" height="18" viewBox="-8 -21 16 21">
          <path d={PIN} fill={colors.paper} stroke={colors.red} strokeWidth="2.2" strokeDasharray="3 2" />
          <circle cy="-13.3" r="2.9" fill={colors.red} />
        </Swatch>
        Miasto na liście
      </Item>
      <Item>
        <Swatch width="10" height="10" viewBox="-5 -5 10 10">
          <circle r="3.4" fill={colors.paper} stroke={colors.ink} strokeWidth="1.6" />
        </Swatch>
        Miasto do zaznaczenia
      </Item>
      <Item>
        <Swatch width="14" height="14" viewBox="-7 -7 14 14">
          <circle r="6.2" fill={colors.mustard} stroke={colors.ink} strokeWidth="1.2" />
          <text fontSize="8" fontWeight="800" textAnchor="middle" dominantBaseline="central" fill={colors.ink}>
            3
          </text>
        </Swatch>
        Liczba zdjęć
      </Item>
      <Hint>{HINT[mode]}</Hint>
    </Bar>
  );
}
