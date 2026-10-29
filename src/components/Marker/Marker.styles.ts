import styled from "styled-components";
import type { Status } from "../../store/store.types";

export const Dot = styled.span<{ $status: Status }>`
  width: 12px;
  height: 12px;
  flex: none;
  border-radius: 50%;
  background: ${({ $status, theme }) => ($status === "wish" ? theme.colors.wishFill : theme.colors.mustard)};
  border: ${({ $status, theme }) => ($status === "wish" ? `1.5px dashed ${theme.colors.wish}` : `1.5px solid ${theme.colors.ink}`)};
`;

export const IconBadge = styled.span<{ $status: Status }>`
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  flex: none;
  border-radius: 50%;
  background: ${({ $status, theme }) => ($status === "visited" ? theme.colors.red : theme.colors.paper)};
  border: 1.5px ${({ $status }) => ($status === "wish" ? "dashed" : "solid")}
    ${({ $status, theme }) => ($status === "wish" ? theme.colors.wish : theme.colors.red)};

  svg {
    width: 11px;
    height: 11px;
    fill: ${({ $status, theme }) => ($status === "visited" ? theme.colors.paper : theme.colors.wish)};
  }
`;

export const DiamondMark = styled.span<{ $status: Status }>`
  width: 10px;
  height: 10px;
  flex: none;
  margin: 0 4px;
  transform: rotate(45deg);
  background: ${({ $status, theme }) => ($status === "visited" ? theme.colors.mustard : theme.colors.paper)};
  border: 1.6px solid ${({ $status, theme }) => ($status === "wish" ? theme.colors.wish : theme.colors.ink)};
`;

export const Pin = styled.span<{ $status: Status }>`
  width: 11px;
  height: 11px;
  flex: none;
  margin: 0 1px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: ${({ $status, theme }) => ($status === "wish" ? theme.colors.paper : theme.colors.red)};
  border: 2px solid ${({ $status, theme }) => ($status === "wish" ? theme.colors.wish : theme.colors.red)};
`;
