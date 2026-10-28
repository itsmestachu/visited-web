import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 400;
  font-size: 34px;
  line-height: 1;
`;

export const Subtitle = styled.div`
  margin-top: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Tools = styled.div`
  display: flex;
  gap: 6px;
`;
