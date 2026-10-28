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
