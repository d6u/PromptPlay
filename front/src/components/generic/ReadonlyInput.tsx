import { Input } from '@mui/joy';
import { ComponentProps } from 'react';

function ReadonlyInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
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
    />
  );
}

export default ReadonlyInput;
