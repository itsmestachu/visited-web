import styled from "styled-components";

export const Row = styled.div`
  display: flex;
  gap: 8px;

  & > * {
    flex: 1;
    min-width: 0;
  }
`;

export const DayStepper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;

  strong {
    min-width: 2ch;
    text-align: center;
    font-size: 16px;
  }
`;

export const DayBox = styled.section`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const DayHead = styled.h4`
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Stops = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Stop = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.line};
  }
`;

export const StopNumber = styled.span<{ $site: boolean }>`
  flex: none;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: ${({ $site }) => ($site ? "4px" : "50%")};
  background: ${({ theme }) => theme.colors.red};
  color: ${({ theme }) => theme.colors.paper};
  font-size: 12px;
  font-weight: 800;
`;

export const StopText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  span {
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.inkSoft};
  }
`;

export const NearbyLink = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.red};

  &:hover {
    text-decoration: underline;
  }
`;

export const StopTools = styled.div`
  flex: none;
  display: flex;
  align-items: center;
  gap: 2px;

  select {
    padding: 3px 4px;
    border: 1.5px solid ${({ theme }) => theme.colors.line};
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.paper};
    font: inherit;
    font-size: 12px;
  }
`;

export const ToolButton = styled.button`
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.inkSoft};
  font-size: 13px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.line};
    color: ${({ theme }) => theme.colors.ink};
  }

  &:disabled {
    visibility: hidden;
  }
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Chip = styled.button`
  border: 1.5px dashed ${({ theme }) => theme.colors.wish};
  border-radius: 999px;
  padding: 4px 11px;
  background: ${({ theme }) => theme.colors.wishFill};
  font-size: 13px;
  font-weight: 500;

  &:hover {
    border-style: solid;
  }
`;

export const Check = styled.label<{ $done: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  text-decoration: ${({ $done }) => ($done ? "line-through" : "none")};
  color: ${({ $done, theme }) => ($done ? theme.colors.inkSoft : theme.colors.ink)};

  input {
    accent-color: ${({ theme }) => theme.colors.red};
    width: 16px;
    height: 16px;
  }
`;

export const Banner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px dashed ${({ theme }) => theme.colors.wish};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.wishFill};
  font-size: 14px;
`;

export const Note = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
`;
