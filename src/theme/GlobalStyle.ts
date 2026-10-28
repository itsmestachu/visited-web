import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    margin: 0;
    height: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.ink};
    background: ${({ theme }) => theme.colors.frame};
    -webkit-font-smoothing: antialiased;
  }

  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  button:disabled {
    cursor: default;
    opacity: 0.55;
  }

  input,
  textarea {
    font: inherit;
    color: inherit;
  }
`;
