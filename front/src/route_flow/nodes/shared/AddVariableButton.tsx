import Button from "@mui/joy/Button";
import styled from "styled-components";

const StyledButton = styled(Button)``;

export default function AddVariableButton(props: { onClick: () => void }) {
  return (
    <StyledButton
      color="success"
      size="sm"
      variant="outlined"
      onClick={props.onClick}
    >
      Add variable
    </StyledButton>
  );
}
