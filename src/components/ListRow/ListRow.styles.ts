import styled from "styled-components";
import { touch } from "../../theme/theme";

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const DeleteButton = styled.button`
  flex: none;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.inkSoft};
  font-size: 16px;
  opacity: 0;
  transition: opacity 120ms;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.red};
    color: ${({ theme }) => theme.colors.paper};
  }

  ${touch} {
    opacity: 1;
  }
`;

export const Row = styled.li`
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: ${({ theme }) => theme.radius.sm};

  & + & {
    border-top: 1px dashed ${({ theme }) => theme.colors.line};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.paper};
  }

  &:hover ${DeleteButton}, &:focus-within ${DeleteButton} {
    opacity: 1;
  }
`;

export const Main = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  padding: 10px 6px;
  text-align: left;
  font-size: 15px;
`;

export const Texts = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.span`
  font-weight: 500;
`;

export const Sub = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Meta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkSoft};
  white-space: nowrap;
`;
