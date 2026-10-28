import styled from "styled-components";
import { mobile } from "../../theme/theme";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: ${({ theme }) => theme.colors.overlay};
`;

export const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(520px, 100%);
  max-height: 100%;
  padding: 18px;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.card};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.ink};

  ${mobile} {
    padding: 14px;
  }
`;

export const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 24px;
  font-weight: 400;
`;

export const Preview = styled.div`
  display: flex;
  justify-content: center;
  min-height: 0;
  flex: 1;

  canvas {
    display: block;
    max-width: 100%;
    max-height: 62vh;
    height: auto;
    border-radius: ${({ theme }) => theme.radius.md};
  }
`;
