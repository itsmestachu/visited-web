import styled from "styled-components";
import { mobile } from "../theme/theme";

export const Frame = styled.div`
  height: 100%;
  padding: 16px;

  ${mobile} {
    padding: 0;
  }
`;

export const Card = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.card};
  box-shadow: ${({ theme }) => theme.shadow.card};

  ${mobile} {
    border-radius: 0;
  }
`;

export const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: ${({ theme }) => theme.layout.sidebar} minmax(0, 1fr);

  ${mobile} {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 55%) minmax(0, 45%);
  }
`;

export const Panel = styled.aside`
  min-height: 0;
  overflow-y: auto;
  padding: 22px;
  border-right: 1.5px dashed ${({ theme }) => theme.colors.line};

  ${mobile} {
    order: 2;
    padding: 16px;
    border-right: 0;
    border-top: 1.5px dashed ${({ theme }) => theme.colors.line};
  }
`;

export const MapColumn = styled.main`
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 16px 14px 14px;

  ${mobile} {
    order: 1;
    padding: 8px;
  }
`;

export const MapArea = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
`;
