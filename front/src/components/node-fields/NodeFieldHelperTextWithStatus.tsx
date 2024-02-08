import { ClassNames } from '@emotion/react';
import { FormHelperText } from '@mui/joy';
import { ReactNode } from 'react';

type Props = {
  color?: 'danger' | 'success';
  children: ReactNode;
};

function NodeFieldHelperTextWithStatus(props: Props) {
  let color: string;
  switch (props.color) {
    case 'danger':
      color = 'var(--joy-palette-danger-500, #C41C1C)';
      break;
    case 'success':
      color = 'var(--joy-palette-success-500, #1F7A1F)';
      break;
    case undefined:
      color = 'var(--FormHelperText-color, var(--joy-palette-text-tertiary))';
      break;
  }

  return (
    <ClassNames>
      {({ css }) => (
        <FormHelperText
          className={css`
            --FormHelperText-fontSize: var(--joy-fontSize-xs);
            color: ${color};
          `}
        >
          <div>{props.children}</div>
        </FormHelperText>
      )}
    </ClassNames>
  );
}

export default NodeFieldHelperTextWithStatus;
