import styled, { css } from "styled-components";
import type { ButtonVariant } from "./Button.types";

const variants = {
  primary: css`
    border: 1.5px solid ${({ theme }) => theme.colors.red};
    background: ${({ theme }) => theme.colors.red};
    color: ${({ theme }) => theme.colors.paper};
    border-radius: ${({ theme }) => theme.radius.sm};
    padding: 9px 14px;
    font-size: 14px;
    font-weight: 600;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.redDark};
      border-color: ${({ theme }) => theme.colors.redDark};
    }
  `,
  outline: css`
    border: 1.5px solid ${({ theme }) => theme.colors.ink};
    background: transparent;
    border-radius: ${({ theme }) => theme.radius.sm};
    padding: 8px 13px;
    font-size: 14px;
    font-weight: 600;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.ink};
      color: ${({ theme }) => theme.colors.paper};
    }
  `,
  link: css`
    border: 0;
    background: transparent;
    padding: 0;
    color: ${({ theme }) => theme.colors.red};
    font-size: 13px;
    font-weight: 600;
    text-align: left;

    &:hover {
      text-decoration: underline;
    }
  `,
  icon: css`
    width: 36px;
    height: 36px;
    flex: none;
    display: grid;
    place-items: center;
    border: 1.5px solid ${({ theme }) => theme.colors.line};
    background: ${({ theme }) => theme.colors.paper};
    border-radius: ${({ theme }) => theme.radius.sm};
    font-size: 16px;

    &:hover {
      border-color: ${({ theme }) => theme.colors.ink};
    }
  `,
  back: css`
    align-self: flex-start;
    border: 0;
    background: transparent;
    padding: 0;
    color: ${({ theme }) => theme.colors.inkSoft};
    font-size: 13px;
    font-weight: 500;

    &:hover {
      color: ${({ theme }) => theme.colors.ink};
    }
  `,
} satisfies Record<ButtonVariant, ReturnType<typeof css>>;

const dangerStyle = css`
  color: ${({ theme }) => theme.colors.red};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.red};
    background: ${({ theme }) => theme.colors.red};
    color: ${({ theme }) => theme.colors.paper};
  }
`;

export const StyledButton = styled.button<{ $variant: ButtonVariant; $danger: boolean }>`
  font-family: inherit;
  transition:
    background 120ms,
    color 120ms,
    border-color 120ms;
  ${({ $variant }) => variants[$variant]}
  ${({ $danger, $variant }) => $danger && $variant !== "link" && dangerStyle}
`;
