import styled from "styled-components";
import { mobile } from "../../theme/theme";

export const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  padding: 12px 4px 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.inkSoft};

  ${mobile} {
    gap: 4px 12px;
    padding-top: 8px;
    font-size: 11px;
  }
`;

export const Item = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
`;

export const Swatch = styled.svg`
  flex: none;
  overflow: visible;
`;

export const Hint = styled.span`
  margin-left: auto;
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.ink};

  ${mobile} {
    display: none;
  }
`;
