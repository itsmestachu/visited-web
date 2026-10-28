import styled from "styled-components";

export const Track = styled.div`
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.line};
`;

export const Fill = styled.div<{ $color?: string }>`
  height: 100%;
  border-radius: 4px;
  background: ${({ $color, theme }) => $color ?? theme.colors.red};
  transition: width 300ms;
`;
