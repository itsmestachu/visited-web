import styled from "styled-components";

export const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

export const Tile = styled.div<{ $big: boolean }>`
  grid-column: ${({ $big }) => ($big ? "1 / -1" : "auto")};
  display: flex;
  flex-direction: column;
  gap: ${({ $big }) => ($big ? "8px" : "2px")};
  padding: 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $big, theme }) => ($big ? theme.colors.mustard : theme.colors.paper)};
`;

export const TileValue = styled.span<{ $big: boolean }>`
  font-size: ${({ $big }) => ($big ? "44px" : "26px")};
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
`;

export const TileLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.ink};
  opacity: 0.75;
`;

export const Bar = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  font-size: 14px;
`;

export const BarLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BarTrack = styled.div`
  height: 10px;
  overflow: hidden;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.paper};

  div {
    height: 100%;
    background: ${({ theme }) => theme.colors.red};
  }
`;

export const BarCaption = styled.span`
  font-size: 12px;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Chip = styled.button`
  border: 1.5px dashed ${({ theme }) => theme.colors.wish};
  border-radius: 999px;
  padding: 5px 12px;
  background: ${({ theme }) => theme.colors.wishFill};
  font-size: 13px;
  font-weight: 500;

  &:hover {
    border-style: solid;
  }
`;
