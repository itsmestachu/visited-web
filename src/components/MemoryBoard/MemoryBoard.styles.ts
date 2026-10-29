import styled from "styled-components";
import { mobile } from "../../theme/theme";

const CORK = "#b8875a";

export const Wall = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  /* Cork: a warm base with two offset speckle layers. */
  background-color: ${CORK};
  background-image:
    radial-gradient(rgba(58, 36, 24, 0.22) 1px, transparent 1.4px),
    radial-gradient(rgba(253, 248, 236, 0.18) 1px, transparent 1.5px);
  background-size:
    9px 9px,
    13px 13px;
  background-position:
    0 0,
    4px 6px;
  box-shadow: inset 0 0 40px rgba(58, 36, 24, 0.35);
  padding: 28px;

  ${mobile} {
    padding: 16px;
  }
`;

export const Card = styled.div`
  position: relative;
  display: flex;
  gap: 22px;
  align-items: center;
  max-width: 720px;
  margin: 0 auto 30px;
  padding: 22px 26px;
  background: ${({ theme }) => theme.colors.paper};
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  box-shadow: 5px 5px 0 rgba(58, 36, 24, 0.55);
  transform: rotate(-0.6deg);

  ${mobile} {
    flex-direction: column;
    text-align: center;
    gap: 14px;
  }
`;

export const Avatar = styled.div`
  flex: none;
  width: 112px;
  height: 112px;
  padding: 5px;
  border: 2px dashed ${({ theme }) => theme.colors.red};
  border-radius: 50%;

  img,
  span {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: ${({ theme }) => theme.colors.mustard};
    font-family: ${({ theme }) => theme.fonts.serif};
    font-size: 46px;
    color: ${({ theme }) => theme.colors.ink};
  }
`;

export const Who = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Kicker = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Name = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 400;
  font-size: 38px;
  line-height: 1.05;
`;

export const Bio = styled.p`
  margin: 2px 0 0;
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 23px;
  line-height: 1.15;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Stamps = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  max-width: 820px;
  margin: 0 auto 34px;
`;

// Postage stamp: the outer layer is a grid of holes, the inner face covers all of it except a thin perforated rim.
export const Stamp = styled.div<{ $tone: string }>`
  padding: 5px;
  background: radial-gradient(circle at 5px 5px, transparent 2.6px, ${({ $tone }) => $tone} 3px) -5px -5px / 10px 10px;
  filter: drop-shadow(2px 3px 0 rgba(58, 36, 24, 0.4));
`;

export const StampFace = styled.div<{ $tone: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  padding: 10px 10px 8px;
  background: ${({ $tone }) => $tone};
  outline: 1px dashed rgba(58, 36, 24, 0.35);
  outline-offset: -5px;
  color: ${({ theme }) => theme.colors.ink};

  strong {
    font-size: 30px;
    font-weight: 800;
    line-height: 1;
  }

  small {
    margin-top: 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 34px 26px;
  align-items: start;

  ${mobile} {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 24px 16px;
  }
`;

export const Polaroid = styled.button<{ $tilt: number }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 10px 10px 12px;
  border: 0;
  background: #fffdf6;
  text-align: left;
  box-shadow:
    0 1px 0 rgba(58, 36, 24, 0.1),
    3px 6px 10px rgba(36, 22, 14, 0.38);
  transform: rotate(${({ $tilt }) => $tilt}deg);
  transition:
    transform 160ms,
    box-shadow 160ms;

  &:hover,
  &:focus-visible {
    transform: rotate(0deg) scale(1.04);
    box-shadow: 5px 12px 22px rgba(36, 22, 14, 0.45);
    z-index: 1;
  }
`;

export const Tape = styled.span<{ $tilt: number }>`
  position: absolute;
  top: -11px;
  left: 50%;
  width: 78px;
  height: 22px;
  background: rgba(241, 194, 63, 0.55);
  box-shadow: 0 1px 2px rgba(58, 36, 24, 0.2);
  transform: translateX(-50%) rotate(${({ $tilt }) => -$tilt * 1.6}deg);
`;

export const Picture = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.ocean};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: sepia(0.18) saturate(0.95);
  }
`;

export const Count = styled.span`
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(36, 22, 14, 0.78);
  color: ${({ theme }) => theme.colors.paper};
  font-size: 12px;
  font-weight: 700;
`;

export const PlannedStamp = styled.span`
  position: absolute;
  top: 10px;
  right: 8px;
  padding: 3px 9px;
  border: 2.5px solid ${({ theme }) => theme.colors.red};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.red};
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transform: rotate(-12deg);
  opacity: 0.85;
`;

export const Caption = styled.span`
  margin-top: 8px;
  font-family: ${({ theme }) => theme.fonts.hand};
  font-weight: 700;
  font-size: 24px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.ink};
`;

export const Sub = styled.span`
  margin-top: 3px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Empty = styled.div`
  max-width: 420px;
  margin: 10px auto;
  padding: 18px 22px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 3px 6px 10px rgba(36, 22, 14, 0.35);
  transform: rotate(1deg);
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 24px;
  line-height: 1.2;
  text-align: center;
`;

export const SketchSvg = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.card};
`;

export const SketchCountry = styled.path`
  fill: ${({ theme }) => theme.colors.land};
  stroke: ${({ theme }) => theme.colors.inkSoft};
  stroke-width: 1px;
`;

export const SketchRoute = styled.path`
  fill: none;
  stroke: ${({ theme }) => theme.colors.red};
  stroke-width: 2px;
  stroke-dasharray: 5 4;
`;

export const SketchDot = styled.circle`
  fill: ${({ theme }) => theme.colors.red};
  stroke: ${({ theme }) => theme.colors.paper};
  stroke-width: 1.5px;
`;
