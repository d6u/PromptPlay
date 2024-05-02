import Button from '@mui/joy/Button';

type Props = {
  label: string;
  onClick: () => void;
};

function NodeAddConnectorButton(props: Props) {
  return (
    <Button color="success" variant="outlined" onClick={props.onClick}>
      {props.label}
    </Button>
  );
}

export default NodeAddConnectorButton;
