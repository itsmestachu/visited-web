import styled from "styled-components";

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const SectionBox = styled.section`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const SectionHead = styled.h3`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 400;
  font-size: 22px;

  small {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 13px;
    color: ${({ theme }) => theme.colors.inkSoft};
  }
`;

export const Muted = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.red};
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;

  & > button {
    flex: 1;
  }
`;
