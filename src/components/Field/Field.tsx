import { Head, Label, Wrapper } from "./Field.styles";
import type { FieldProps } from "./Field.types";

export function Field({ label, action, children }: FieldProps) {
  return (
    <Wrapper>
      <Head>
        <Label>{label}</Label>
        {action}
      </Head>
      {children}
    </Wrapper>
  );
}
