import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "danger" | "link" | "icon" | "back";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant: Variant };

export function Button({ variant, className, type = "button", ...rest }: Props) {
  return <button type={type} className={[`btn-${variant}`, className].filter(Boolean).join(" ")} {...rest} />;
}
