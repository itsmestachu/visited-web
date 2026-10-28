import styled from "styled-components";
import { touch } from "../../theme/theme";

export const Remove = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 12px;
  background: rgba(36, 22, 14, 0.75);
  color: ${({ theme }) => theme.colors.paper};
  opacity: 0;
  transition:
    opacity 120ms,
    background 120ms;

  &:hover {
    background: ${({ theme }) => theme.colors.red};
  }

  ${touch} {
    opacity: 1;
  }
`;

export const Frame = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radius.sm};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.line};

  &:hover ${Remove}, &:focus-within ${Remove} {
    opacity: 1;
  }
`;

export const Open = styled.button`
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  background: transparent;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 200ms;
  }

  &:hover img {
    transform: scale(1.06);
  }
`;

export const Overlay = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(36, 22, 14, 0.55);
  color: ${({ theme }) => theme.colors.paper};
  font-size: 16px;
  font-weight: 700;
  pointer-events: none;
`;
