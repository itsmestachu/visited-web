import styled from "styled-components";
import { mobile } from "../../theme/theme";

export const Bar = styled.header`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 14px 22px;
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.line};

  ${mobile} {
    grid-template-columns: 1fr auto;
    padding: 12px 14px;
  }
`;

export const Logo = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1;
`;

export const LogoKicker = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.red};
`;

export const LogoWord = styled.span`
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

export const LogoDot = styled.span`
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin: 0 0.02em;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.mustard};
  border: 0.09em solid ${({ theme }) => theme.colors.ink};
  vertical-align: -0.02em;
`;

export const Tabs = styled.nav`
  display: flex;
  gap: 22px;
`;

export const Tab = styled.button<{ $active: boolean }>`
  border: 0;
  background: transparent;
  padding: 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.ink : theme.colors.inkSoft)};
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.red : "transparent")};

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

export const Counter = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.inkSoft};

  strong {
    font-size: 20px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.ink};
  }

  ${mobile} {
    display: none;
  }
`;

export const CounterItem = styled.span`
  display: flex;
  align-items: baseline;
  gap: 5px;
`;
