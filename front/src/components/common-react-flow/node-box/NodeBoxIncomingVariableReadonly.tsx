import Input from '@mui/joy/Input';

export default function NodeBoxIncomingVariableReadonly(
  props: React.ComponentProps<typeof Input>,
) {
  return (
    <Input
      sx={{
        '--Input-focusedHighlight': 'rgb(205, 215, 225)',
        '--Input-focusedThickness': '1px',
        flexGrow: 1,
        color: '#747474',
      }}
      slotProps={{
        input: {
          sx: {
            cursor: 'not-allowed',
          },
        },
      }}
      {...props}
    />
  );
}
