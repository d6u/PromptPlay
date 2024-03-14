import styled from '@emotion/styled';
import { Input } from '@mui/joy';
import { Control, Controller, FieldArrayWithId } from 'react-hook-form';

import ReadonlyInput from 'generic-components/ReadonlyInput';

import { VariableFormValue } from './types';

type Props = {
  isReadOnly: boolean;
  control: Control<VariableFormValue>;
  formField: FieldArrayWithId<VariableFormValue, 'list', 'id'>;
  index: number;
  onRemove: () => void;
  onUpdateTrigger: () => void;
};

function NodeVariableEditor(props: Props) {
  if (props.isReadOnly) {
    return <ReadonlyInput value={props.formField.name} />;
  }

  return (
    <Controller
      control={props.control}
      name={`list.${props.index}.name`}
      render={({ field }) => (
        <StyledInput
          color="primary"
          ref={field.ref}
          name={field.name}
          value={field.value}
          disabled={field.disabled}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              props.onUpdateTrigger();
            }
          }}
          onBlur={() => {
            field.onBlur();
            props.onUpdateTrigger();
          }}
          onChange={field.onChange}
        />
      )}
    />
  );
}

// NOTE: Requires parent to have `display: flex`
const StyledInput = styled(Input)`
  flex-grow: 1;
`;

export default NodeVariableEditor;
