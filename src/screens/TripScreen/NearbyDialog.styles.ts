import styled from "styled-components";
import { Button } from "../../components/Button/Button";

export const Toggles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Toggle = styled.button<{ $on: boolean }>`
  padding: 6px 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  border-radius: 999px;
  background: ${({ $on, theme }) => ($on ? theme.colors.ink : theme.colors.paper)};
  color: ${({ $on, theme }) => ($on ? theme.colors.paper : theme.colors.ink)};
  font-size: 13px;
  font-weight: 600;
`;

export const Scroll = styled.div`
  flex: 1;
  min-height: 0;
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 4px;
`;

export const Group = styled.section`
  display: flex;
  flex-direction: column;
`;

export const GroupHead = styled.h3`
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Item = styled.article`
  display: flex;
  gap: 10px;
  padding: 10px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.line};
  }
`;

export const Thumb = styled.img`
  flex: none;
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1.5px solid ${({ theme }) => theme.colors.line};
`;

export const Body = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const Name = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

export const Meta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Desc = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  margin-top: 3px;
  font-size: 13px;

  a {
    color: ${({ theme }) => theme.colors.inkSoft};
    font-weight: 600;
  }

  a:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

export const AddButton = styled.button<{ $added: boolean }>`
  padding: 3px 10px;
  border: 1.5px solid ${({ theme }) => theme.colors.red};
  border-radius: 999px;
  background: ${({ $added, theme }) => ($added ? theme.colors.red : theme.colors.paper)};
  color: ${({ $added, theme }) => ($added ? theme.colors.paper : theme.colors.red)};
  font-size: 12px;
  font-weight: 700;
`;

export const Credit = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const MoreButton = styled(Button)`
  align-self: center;
  margin-top: 10px;
`;
