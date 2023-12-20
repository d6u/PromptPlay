import styled from '@emotion/styled';
import Button from '@mui/joy/Button';

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
