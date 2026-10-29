import styled from "styled-components";
import type { Status } from "../../store/store.types";

export const Rows = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Row = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.line};
  }
`;

export const Texts = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Name = styled.span`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
`;

export const Meta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Toggles = styled.div`
  display: flex;
  flex: none;
  gap: 4px;
`;

export const Toggle = styled.button<{ $tone: Status; $on: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1.5px ${({ $tone }) => ($tone === "wish" ? "dashed" : "solid")}
    ${({ $tone, theme }) => ($tone === "wish" ? theme.colors.wish : theme.colors.red)};
  background: ${({ $tone, $on, theme }) => ($on ? ($tone === "wish" ? theme.colors.wish : theme.colors.red) : theme.colors.paper)};
  color: ${({ $tone, $on, theme }) => ($on ? theme.colors.paper : $tone === "wish" ? theme.colors.wish : theme.colors.red)};
  font-size: 14px;
  font-weight: 700;
`;
