import styled from "styled-components";
import { mobile } from "../../theme/theme";

export const Wrapper = styled.div`
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 3px 3px 0 ${({ theme }) => theme.colors.ink};

  ${mobile} {
    right: 8px;
    bottom: 8px;
  }
`;

export const ZoomButton = styled.button`
  width: 38px;
  height: 38px;
  border: 0;
  background: transparent;
  font-size: 18px;
  font-weight: 600;

  & + & {
    border-top: 1.5px solid ${({ theme }) => theme.colors.ink};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.mustard};
  }

  ${mobile} {
    width: 32px;
    height: 32px;
    font-size: 15px;
  }
`;
