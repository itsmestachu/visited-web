import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 22px;
`;

export const Label = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

const control = css`
  width: 100%;
  padding: 9px 11px;
  border: 1.5px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.paper};
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.ink};
  }
`;

export const Input = styled.input`
  ${control}
`;

export const TextArea = styled.textarea`
  ${control}
  min-height: 72px;
  resize: vertical;
`;
