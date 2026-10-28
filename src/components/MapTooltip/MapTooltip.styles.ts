import styled from "styled-components";

export const Tip = styled.div`
  position: fixed;
  z-index: 20;
  transform: translate(14px, -130%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.ink};
  color: ${({ theme }) => theme.colors.paper};
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
`;

export const Badge = styled.span`
  font-size: 11px;
  font-weight: 500;
  opacity: 0.75;
`;
