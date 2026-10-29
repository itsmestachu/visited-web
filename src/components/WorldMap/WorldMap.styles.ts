import styled, { css } from "styled-components";
import type { Status } from "../../store/store.types";

export const MapWrap = styled.div<{ $mode: Status }>`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.card};
  --hover-accent: ${({ $mode, theme }) => ($mode === "visited" ? theme.colors.red : theme.colors.wish)};
`;

export const Svg = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
  touch-action: none;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;

export const Sphere = styled.path`
  fill: ${({ theme }) => theme.colors.ocean};
  stroke: ${({ theme }) => theme.colors.border};
  stroke-width: 1.2px;
  vector-effect: non-scaling-stroke;
`;

const countryStatus = {
  none: css`
    fill: ${({ theme }) => theme.colors.land};

    &:hover {
      fill: ${({ theme }) => theme.colors.landHover};
    }
  `,
  visited: css`
    stroke: ${({ theme }) => theme.colors.ink};
    stroke-opacity: 0.45;

    &:hover {
      filter: brightness(0.92);
    }
  `,
  wish: css`
    fill: ${({ theme }) => theme.colors.wishFill};
    stroke: ${({ theme }) => theme.colors.wish};
    stroke-width: 1.2px;
    stroke-dasharray: 3 2;

    &:hover {
      fill: rgba(77, 113, 148, 0.36);
    }
  `,
};

export const CountryPath = styled.path<{ $status: Status | "none" }>`
  stroke: ${({ theme }) => theme.colors.border};
  stroke-width: 0.6px;
  vector-effect: non-scaling-stroke;
  cursor: pointer;
  transition: fill 120ms;
  ${({ $status }) => countryStatus[$status]}
`;

export const InertPath = styled.path`
  fill: ${({ theme }) => theme.colors.land};
  stroke: ${({ theme }) => theme.colors.border};
  stroke-width: 0.6px;
  vector-effect: non-scaling-stroke;
  pointer-events: none;
`;

const halo = css`
  paint-order: stroke;
  stroke: ${({ theme }) => theme.colors.paper};
  stroke-width: 3px;
  stroke-linejoin: round;
`;

export const CountryText = styled.text`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  fill: ${({ theme }) => theme.colors.inkSoft};
  pointer-events: none;
  ${halo}
`;

export const CityDot = styled.circle`
  fill: ${({ theme }) => theme.colors.paper};
  stroke: ${({ theme }) => theme.colors.ink};
  stroke-width: 1.6px;
  transition: r 120ms;
`;

export const CityText = styled.text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 500;
  fill: ${({ theme }) => theme.colors.ink};
  ${halo}
`;

export const CityGroup = styled.g`
  cursor: pointer;

  .hit {
    fill: transparent;
  }

  &:hover ${CityDot} {
    fill: var(--hover-accent);
    stroke: var(--hover-accent);
    r: 5px;
  }

  &:hover ${CityText} {
    fill: var(--hover-accent);
    font-weight: 700;
  }
`;

export const PinBody = styled.path`
  stroke: ${({ theme }) => theme.colors.paper};
  stroke-width: 1.8px;
  filter: drop-shadow(0 1.5px 1px rgba(58, 36, 24, 0.4));
  transition: transform 120ms;
`;

export const PinDot = styled.circle``;

export const PinText = styled.text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  fill: ${({ theme }) => theme.colors.ink};
  ${halo}
`;

export const PinBadge = styled.g`
  circle {
    fill: ${({ theme }) => theme.colors.mustard};
    stroke: ${({ theme }) => theme.colors.ink};
    stroke-width: 1.2px;
  }

  text {
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: 800;
    fill: ${({ theme }) => theme.colors.ink};
  }
`;

export const PinGroup = styled.g<{ $status: Status; $active: boolean }>`
  cursor: pointer;

  ${PinBody} {
    fill: ${({ $status, theme }) => ($status === "visited" ? theme.colors.red : theme.colors.paper)};
    stroke: ${({ $status, $active, theme }) =>
      $active ? theme.colors.ink : $status === "visited" ? theme.colors.paper : theme.colors.red};
    stroke-width: ${({ $status, $active }) => ($active ? "2.4px" : $status === "visited" ? "1.8px" : "2.4px")};
    stroke-dasharray: ${({ $status }) => ($status === "wish" ? "3 2" : "none")};
    transform: scale(${({ $active }) => ($active ? 1.2 : 1)});
  }

  ${PinDot} {
    fill: ${({ $status, theme }) => ($status === "visited" ? theme.colors.paper : theme.colors.red)};
  }

  &:hover ${PinBody} {
    transform: scale(1.2);
  }
`;

export const SiteMark = styled.g<{ $status: Status | "none" }>`
  cursor: pointer;

  .hit {
    fill: transparent;
  }

  path {
    fill: ${({ $status, theme }) => ($status === "visited" ? theme.colors.mustard : theme.colors.paper)};
    stroke: ${({ $status, theme }) => ($status === "wish" ? theme.colors.wish : theme.colors.ink)};
    stroke-width: ${({ $status }) => ($status === "none" ? "1.2px" : "1.8px")};
    opacity: ${({ $status }) => ($status === "none" ? 0.75 : 1)};
    transition: transform 120ms;
  }

  &:hover path {
    fill: var(--hover-accent);
    stroke: var(--hover-accent);
    opacity: 1;
    transform: scale(1.4);
  }
`;

export const LandmarkMark = styled.g<{ $status: Status | "none" }>`
  cursor: pointer;

  circle {
    fill: ${({ $status, theme }) => ($status === "visited" ? theme.colors.red : theme.colors.paper)};
    stroke: ${({ $status, theme }) => ($status === "wish" ? theme.colors.wish : theme.colors.ink)};
    stroke-width: ${({ $status }) => ($status === "wish" ? "2px" : "1.4px")};
    stroke-dasharray: ${({ $status }) => ($status === "wish" ? "3 2" : "none")};
    transition: transform 120ms;
  }

  .icon {
    fill: ${({ $status, theme }) => ($status === "visited" ? theme.colors.paper : $status === "wish" ? theme.colors.wish : theme.colors.ink)};
    pointer-events: none;
  }

  text {
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: 700;
    fill: ${({ theme }) => theme.colors.ink};
    ${halo}
  }

  &:hover circle {
    transform: scale(1.18);
    stroke: var(--hover-accent);
  }

  &:hover text {
    fill: var(--hover-accent);
  }
`;

export const RouteLine = styled.path`
  fill: none;
  stroke: ${({ theme }) => theme.colors.red};
  stroke-width: 2.6px;
  stroke-dasharray: 7 5;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
`;

export const RouteMark = styled.g`
  circle,
  rect {
    fill: ${({ theme }) => theme.colors.red};
    stroke: ${({ theme }) => theme.colors.paper};
    stroke-width: 2.4px;
  }

  text {
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: 800;
    fill: ${({ theme }) => theme.colors.paper};
  }

  .label {
    font-weight: 700;
    fill: ${({ theme }) => theme.colors.ink};
    ${halo}
  }
`;

export const ScreenScale = styled.g`
  transform: scale(var(--inv, 1));
`;

export const CardAnchor = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  will-change: transform;

  & > * {
    pointer-events: auto;
  }
`;
