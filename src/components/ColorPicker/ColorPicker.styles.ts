import styled from "styled-components";

export const Swatches = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Swatch = styled.button<{ $active: boolean }>`
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  border: 2.5px solid ${({ theme }) => theme.colors.paper};
  box-shadow: 0 0 0 ${({ $active }) => ($active ? "2px" : "1px")}
    ${({ $active, theme }) => ($active ? theme.colors.ink : theme.colors.line)};
  transition: transform 120ms;

  &:hover {
    transform: scale(1.1);
  }
`;
