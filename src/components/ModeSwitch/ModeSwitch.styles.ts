import styled from "styled-components";
import { StatusSwitch } from "../StatusSwitch/StatusSwitch";

export const FloatingSwitch = styled(StatusSwitch)`
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  border: 1.5px solid ${({ theme }) => theme.colors.ink};
  background: ${({ theme }) => theme.colors.paper};
  box-shadow: 3px 3px 0 ${({ theme }) => theme.colors.ink};
`;
