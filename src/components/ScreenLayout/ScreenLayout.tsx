import type { ReactNode } from "react";
import { SectionBox, SectionHead } from "./ScreenLayout.styles";

export { Stack as ScreenLayout, Muted, ErrorText, ButtonRow } from "./ScreenLayout.styles";

type SectionProps = {
  title: string;
  count?: number;
  children: ReactNode;
};

export function Section({ title, count, children }: SectionProps) {
  return (
    <SectionBox>
      <SectionHead>
        {title}
        {count !== undefined && <small>{count}</small>}
      </SectionHead>
      {children}
    </SectionBox>
  );
}
