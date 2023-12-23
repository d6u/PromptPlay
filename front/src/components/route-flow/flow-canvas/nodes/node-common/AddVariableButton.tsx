import styled from '@emotion/styled';
import Button from '@mui/joy/Button';

const StyledButton = styled(Button)``;

type Props = {
  label?: string;
  onClick: () => void;
};

export default function AddVariableButton(props: Props) {
  return (
    <StyledButton
      color="success"
      size="sm"
      variant="outlined"
      onClick={props.onClick}
    >
      Add {props.label ?? 'Variable'}
    </StyledButton>
  );
}
