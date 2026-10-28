import styled from "styled-components";
import { mobile } from "../../theme/theme";

export const ToggleButton = styled.button<{ $on: boolean }>`
  position: absolute;
  left: 14px;
  bottom: 14px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ $on, theme }) => ($on ? theme.colors.mustard : theme.colors.paper)};
  box-shadow: 3px 3px 0 ${({ theme }) => theme.colors.ink};
  font-size: 14px;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.mustard};
  }

  small {
    font-weight: 500;
    opacity: 0.7;
  }

  ${mobile} {
    left: 8px;
    bottom: 8px;
    height: 32px;
    font-size: 13px;
  }
`;

export const Diamond = styled.span`
  width: 9px;
  height: 9px;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  background: ${({ theme }) => theme.colors.paper};
  transform: rotate(45deg);
`;
