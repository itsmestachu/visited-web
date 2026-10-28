import { StyledButton } from "./Button.styles";
import type { ButtonProps } from "./Button.types";

export function Button({ variant, danger = false, type = "button", ...rest }: ButtonProps) {
  return <StyledButton type={type} $variant={variant} $danger={danger} {...rest} />;
}
