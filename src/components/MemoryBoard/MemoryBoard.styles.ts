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

export const StampFigure = styled.div`
  position: relative;
  flex: none;
  width: 136px;
  height: 136px;
  margin-right: 6px;
  transform: rotate(3deg);

  & > svg:first-child {
    display: block;
    width: 100%;
    height: 100%;
    filter: drop-shadow(2px 4px 2px rgba(36, 22, 14, 0.35));
  }

  .paper {
    fill: #fffdf6;
  }

  .window {
    fill: ${({ theme }) => theme.colors.mustard};
  }

  .initial {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-size: 70px;
    fill: ${({ theme }) => theme.colors.ink};
  }

  .ink {
    fill: ${({ theme }) => theme.colors.ink};
  }

  ${mobile} {
    order: -1;
  }
`;

export const Marks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin-top: 12px;

  ${mobile} {
    justify-content: center;
  }
`;

// Passport-style rubber stamp for one statistic.
export const Mark = styled.span<{ $tone: string; $tilt: number }>`
  padding: 3px 8px;
  border: 2px solid ${({ $tone }) => $tone};
  outline: 1px solid ${({ $tone }) => $tone};
  outline-offset: 2px;
  border-radius: 4px;
  color: ${({ $tone }) => $tone};
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  transform: rotate(${({ $tilt }) => $tilt}deg);
  opacity: 0.85;

  strong {
    font-size: 14px;
    margin-right: 4px;
  }
`;

export const SectionLabel = styled.h3`
  display: inline-block;
  margin: 8px 0 22px;
  padding: 4px 16px 6px;
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 2px 4px 8px rgba(36, 22, 14, 0.35);
  transform: rotate(-1.5deg);
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 28px;
  font-weight: 700;
  line-height: 1;

  small {
    margin-left: 8px;
    font-size: 20px;
    color: ${({ theme }) => theme.colors.inkSoft};
  }
`;

export const Section = styled.section`
  & + & {
    margin-top: 40px;
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
  background: ${({ theme }) => theme.colors.ocean};
`;

export const SketchCountry = styled.path`
  fill: ${({ theme }) => theme.colors.land};
  stroke: ${({ theme }) => theme.colors.border};
  stroke-width: 0.8px;
`;

export const SketchHome = styled.path`
  fill: ${({ theme }) => theme.colors.landHover};
  stroke: ${({ theme }) => theme.colors.inkSoft};
  stroke-width: 1.2px;
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
