import styled, { keyframes } from "styled-components";
import { mobile } from "../../theme/theme";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.985);
  }
`;

const grow = keyframes`
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.overlay};
  color: ${({ theme }) => theme.colors.paper};
`;

export const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
`;

export const Title = styled.div`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 24px;
  line-height: 1.1;
`;

export const Subtitle = styled.div`
  font-size: 13px;
  opacity: 0.7;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Count = styled.span`
  font-size: 13px;
  opacity: 0.7;
  margin-right: 4px;
`;

export const TopButton = styled.button<{ $danger?: boolean; $active?: boolean }>`
  border: 1.5px solid ${({ $active, theme }) => ($active ? theme.colors.mustard : "rgba(253, 248, 236, 0.3)")};
  background: ${({ $active }) => ($active ? "rgba(241, 194, 63, 0.18)" : "transparent")};
  color: ${({ $active, theme }) => ($active ? theme.colors.mustard : "inherit")};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;

  &:hover {
    background: ${({ $danger, theme }) => ($danger ? theme.colors.red : "rgba(253, 248, 236, 0.15)")};
    border-color: ${({ $danger, theme }) => ($danger ? theme.colors.red : "rgba(253, 248, 236, 0.5)")};
  }

  ${mobile} {
    padding: 6px 8px;
  }
`;

export const Stage = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 72px 24px;

  ${mobile} {
    padding: 0 0 16px;
  }
`;

export const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  border: 6px solid ${({ theme }) => theme.colors.paper};
  animation: ${fadeIn} 400ms ease;
`;

export const Nav = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === "left" ? "left: 16px;" : "right: 16px;")}
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1.5px solid rgba(253, 248, 236, 0.3);
  background: rgba(36, 22, 14, 0.6);
  color: inherit;
  font-size: 26px;
  line-height: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.red};
    border-color: ${({ theme }) => theme.colors.red};
  }
`;

export const Progress = styled.div<{ $duration: number }>`
  height: 3px;
  background: ${({ theme }) => theme.colors.mustard};
  transform-origin: left;
  animation: ${grow} ${({ $duration }) => $duration}ms linear forwards;
`;
