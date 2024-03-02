import styled from '@emotion/styled';
import { Input } from '@mui/joy';
import { Control, Controller, FieldArrayWithId } from 'react-hook-form';

import ReadonlyInput from 'generic-components/ReadonlyInput';
import RemoveButton from 'generic-components/RemoveButton';

import { ConditionFormValue } from './types';

type Props = {
  isReadOnly: boolean;
  control: Control<ConditionFormValue>;
  formField: FieldArrayWithId<ConditionFormValue, 'list', 'id'>;
  index: number;
  onRemove: () => void;
  onUpdateTrigger: () => void;
};

function NodeConditionEditor(props: Props) {
  if (props.isReadOnly) {
    return <ReadonlyInput value={props.formField.expressionString} />;
  }

  return (
    <>
      <Controller
        control={props.control}
        name={`list.${props.index}.expressionString`}
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
      <RemoveButton
        onClick={() => {
          props.onRemove();
          props.onUpdateTrigger();
        }}
      />
    </>
  );
}

// NOTE: Requires parent to have `display: flex`
const StyledInput = styled(Input)`
  flex-grow: 1;
`;

export default NodeConditionEditor;
