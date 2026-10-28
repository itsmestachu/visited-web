import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
`;

export const InputWrap = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.paper};

  &:focus-within {
    box-shadow: 3px 3px 0 ${({ theme }) => theme.colors.ink};
  }
`;

export const SearchIcon = styled.span`
  display: grid;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  padding: 11px 0;
  font-size: 15px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.inkSoft};
  }
`;

export const Results = styled.ul`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 10;
  margin: 0;
  padding: 4px;
  list-style: none;
  max-height: 60vh;
  overflow-y: auto;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.ink};
`;

export const Empty = styled.li`
  padding: 9px 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const ResultItem = styled.li<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background: ${({ $active, theme }) => ($active ? theme.colors.line : "transparent")};
`;

export const Kind = styled.span`
  width: 14px;
  text-align: center;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Main = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Sub = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Tag = styled.span<{ $tone: "red" | "wish" }>`
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ $tone, theme }) => ($tone === "red" ? theme.colors.red : theme.colors.wish)};
`;
