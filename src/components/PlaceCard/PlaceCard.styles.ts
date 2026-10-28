import styled, { keyframes } from "styled-components";
import type { Status } from "../../store/store.types";

const popIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
`;

export const Card = styled.div`
  position: absolute;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.ink};
  animation: ${popIn} 160ms ease;
`;

export const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

export const Title = styled.div`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 22px;
  line-height: 1.05;
`;

export const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Chip = styled.span<{ $status: Status }>`
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.paper};
  background: ${({ $status, theme }) => ($status === "visited" ? theme.colors.red : theme.colors.wish)};
`;

export const Close = styled.button`
  flex: none;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.inkSoft};

  &:hover {
    background: ${({ theme }) => theme.colors.line};
    color: ${({ theme }) => theme.colors.ink};
  }
`;

export const Photos = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
`;

export const Empty = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
  border: 1.5px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.inkSoft};
  font-size: 13px;
  font-weight: 600;

  span {
    font-size: 22px;
    line-height: 1;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.red};
    color: ${({ theme }) => theme.colors.red};
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 6px;

  & > button:first-child {
    flex: 1;
  }
`;

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const DateLine = styled.div`
  display: flex;
  gap: 6px;
  font-size: 13px;

  span:first-child {
    color: ${({ theme }) => theme.colors.inkSoft};
  }

  span:last-child {
    font-weight: 600;
  }
`;

export const Note = styled.p`
  margin: 0;
  padding: 6px 0 6px 10px;
  border-left: 3px solid ${({ theme }) => theme.colors.mustard};
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-size: 15px;
  line-height: 1.35;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
