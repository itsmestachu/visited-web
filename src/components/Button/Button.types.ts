import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "outline" | "link" | "icon" | "back";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant;
  danger?: boolean;
};
