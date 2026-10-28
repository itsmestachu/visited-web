import styled, { keyframes } from "styled-components";
import { mobile } from "../../theme/theme";

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 12px);
  }
`;

const shrink = keyframes`
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
`;

export const Wrapper = styled.div`
  position: fixed;
  left: 50%;
  bottom: 84px;
  z-index: 60;
  transform: translateX(-50%);
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: calc(100% - 32px);
  padding: 10px 10px 10px 16px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.ink};
  color: ${({ theme }) => theme.colors.paper};
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 14px;
  animation: ${slideUp} 180ms ease;

  ${mobile} {
    bottom: 16px;
  }
`;

export const Message = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const UndoButton = styled.button`
  flex: none;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.mustard};
  color: ${({ theme }) => theme.colors.ink};
  font-weight: 700;

  &:hover {
    filter: brightness(1.08);
  }
`;

export const CloseButton = styled.button`
  flex: none;
  border: 0;
  background: transparent;
  color: inherit;
  opacity: 0.6;
  padding: 4px;

  &:hover {
    opacity: 1;
  }
`;

export const Timer = styled.span<{ $duration: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: ${({ theme }) => theme.colors.mustard};
  transform-origin: left;
  animation: ${shrink} ${({ $duration }) => $duration}ms linear forwards;
`;
