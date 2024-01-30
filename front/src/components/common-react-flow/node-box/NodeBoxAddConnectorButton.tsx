import Button from '@mui/joy/Button';

type Props = {
  label: 'Variable' | 'Condition';
  onClick: () => void;
};

export default function NodeBoxAddConnectorButton(props: Props) {
  return (
    <Button
      color="success"
      size="sm"
      variant="outlined"
      onClick={props.onClick}
    >
      Add {props.label}
    </Button>
  );
}
