import styled from '@emotion/styled';
import { Input } from '@mui/joy';
import { ReactNode, useCallback, useRef } from 'react';
import { Control, Controller, FieldArrayWithId } from 'react-hook-form';

import { useOnElementResize } from 'generic-util/ResizeObserver';

import ReadonlyInput from '../../components/generic/ReadonlyInput';
import NodeFieldHelperTextWithStatus from '../../components/node-fields/NodeFieldHelperTextWithStatus';
import NodeBoxCommonRemoveButton from '../node-box/NodeBoxCommonRemoveButton';
import { FormValue } from './types';

type Props = {
  isReadOnly: boolean;
  control: Control<FormValue>;
  field: FieldArrayWithId<FormValue, 'variables', 'id'>;
  index: number;
  helperText?: ReactNode;
  onConfirmNameChange: () => void;
  onRemove: () => void;
  onHeightChange?: (height: number) => void;
};

function NodeBoxVariableEditableItem(props: Props) {
  const { onHeightChange } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(0);

  // TODO: Don't attach observer when onHeightChange is not provided
  useOnElementResize(
    containerRef,
    useCallback(
      (contentRect) => {
        const newHeight = contentRect.height;

        if (prevHeightRef.current !== newHeight) {
          prevHeightRef.current = newHeight;

          onHeightChange?.(prevHeightRef.current + (props.helperText ? 10 : 5));
        }
      },
      [props.helperText, onHeightChange],
    ),
  );

  return (
    <Container ref={containerRef}>
      <InputContainer>
        {props.isReadOnly ? (
          <ReadonlyInput value={props.field.name} />
        ) : (
          <Controller
            control={props.control}
            name={`variables.${props.index}.name`}
            render={({ field }) => (
              <NameInput
                {...field}
                color="primary"
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    props.onConfirmNameChange();
                  }
                }}
                onBlur={() => {
                  field.onBlur();
                  props.onConfirmNameChange();
                }}
              />
            )}
          />
        )}
        {!props.isReadOnly && (
          <NodeBoxCommonRemoveButton onClick={props.onRemove} />
        )}
      </InputContainer>
      {props.helperText && (
        <HelperTextContainer>
          <NodeFieldHelperTextWithStatus>
            {props.helperText}
          </NodeFieldHelperTextWithStatus>
        </HelperTextContainer>
      )}
    </Container>
  );
}

// ANCHOR: UI

export const ROW_MARGIN_TOP = 5;

const Container = styled.div`
  margin-top: ${ROW_MARGIN_TOP}px;
  margin-bottom: ${ROW_MARGIN_TOP}px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 5px;
`;

const NameInput = styled(Input)`
  flex-grow: 1;
`;

const HelperTextContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 10px;
`;

export default NodeBoxVariableEditableItem;
