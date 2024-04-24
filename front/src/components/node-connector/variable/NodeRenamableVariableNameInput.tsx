import styled from '@emotion/styled';
import { Input } from '@mui/joy';
import { Control, Controller, FieldArrayWithId } from 'react-hook-form';

import ReadonlyInput from 'generic-components/ReadonlyInput';

import { VariableFormValue } from '../types';

type Props = {
  isReadOnly: boolean;
  control: Control<VariableFormValue>;
  formField: FieldArrayWithId<VariableFormValue, 'list', 'id'>;
  index: number;
  onRemove: () => void;
  onUpdateTrigger: () => void;
};

function NodeRenamableVariableNameInput(props: Props) {
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
  // "width: 0" is required for input to work properly with
  // "flow-shrink: 1" (default for flex items), because browser gives input
  // a default width (https://arc.net/l/quote/zbdbssje)
  //
  // But it's a question whether this is a good place to put this, because
  // MUI's Input component wraps the actual input in a div, so this width
  // doesn't apply to the actual input element. Right now it seems to work.
  width: 0;
`;

export default NodeRenamableVariableNameInput;
