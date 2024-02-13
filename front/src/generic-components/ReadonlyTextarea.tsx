import Textarea from '@mui/joy/Textarea';
import { ComponentProps } from 'react';

type Props = ComponentProps<typeof Textarea> & {
  isCode?: boolean;
};

function ReadonlyTextarea(props: Props) {
  const { isCode, ...restProps } = props;

  return (
    <Textarea
      {...restProps}
      sx={{
        '--Textarea-focusedHighlight': 'rgb(205, 215, 225)',
        '--Textarea-focusedThickness': '1px',
        fontFamily: isCode ? 'var(--font-family-mono)' : undefined,
        color: '#747474',
      }}
      slotProps={{
        textarea: {
          sx: { cursor: 'not-allowed' },
        },
      }}
    />
  );
}

export default ReadonlyTextarea;
