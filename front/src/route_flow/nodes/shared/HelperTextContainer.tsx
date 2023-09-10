import styled from "@emotion/styled";
import FormHelperText from "@mui/joy/FormHelperText";
import { ReactNode } from "react";

const FieldHelperText = styled(FormHelperText)<{
  $color?: "danger" | "success";
}>`
  --FormHelperText-fontSize: var(--joy-fontSize-xs);
  color: ${(props) => {
    switch (props.$color) {
      case "danger":
        return "var(--joy-palette-danger-500, #C41C1C)";
      case "success":
        return "var(--joy-palette-success-500, #1F7A1F)";
      default:
        return "var(--FormHelperText-color, var(--joy-palette-text-tertiary))";
    }
  }};
`;

type Props = {
  color?: "danger" | "success";
  children: ReactNode;
};

export default function HelperTextContainer(props: Props) {
  return (
    <FieldHelperText $color={props.color}>
      <div>{props.children}</div>
    </FieldHelperText>
  );
}
