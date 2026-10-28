import styled from "styled-components";

export const Track = styled.div<{ $small: boolean }>`
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.line};
  font-size: ${({ $small }) => ($small ? "12px" : "13px")};
`;

export const Option = styled.button<{ $active: boolean; $tone?: "red" | "wish"; $small: boolean }>`
  flex: 1;
  border: 0;
  border-radius: 8px;
  padding: ${({ $small }) => ($small ? "3px 8px" : "7px 12px")};
  white-space: nowrap;
  font-weight: 600;
  background: ${({ $active, theme }) => ($active ? theme.colors.paper : "transparent")};
  color: ${({ $active, $tone, theme }) =>
    !$active ? theme.colors.inkSoft : $tone === "red" ? theme.colors.red : $tone === "wish" ? theme.colors.wish : theme.colors.ink};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadow.flat : "none")};
  transition: background 120ms;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.ink};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;
