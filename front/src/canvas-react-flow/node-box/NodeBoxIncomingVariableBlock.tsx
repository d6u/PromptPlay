import styled from '@emotion/styled';
import Input from '@mui/joy/Input';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { useOnElementResize } from '../../utils/ResizeObserver';
import NodeBoxCommonRemoveButton from './NodeBoxCommonRemoveButton';
import NodeBoxHelperTextContainer from './NodeBoxHelperTextContainer';
import NodeBoxIncomingVariableReadonly from './NodeBoxIncomingVariableReadonly';

type Props = {
  isReadOnly: boolean;
  name: string;
  helperMessage?: ReactNode;
  onConfirmNameChange?: (name: string) => void;
  onRemove?: () => void;
  onHeightChange?: (height: number) => void;
};

export default function NodeBoxIncomingVariableBlock(props: Props) {
  const { onHeightChange, helperMessage } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(0);

  useOnElementResize(
    containerRef,
    useCallback(
      (contentRect) => {
        const newHeight = contentRect.height;

        if (prevHeightRef.current !== newHeight) {
          prevHeightRef.current = newHeight;

          onHeightChange?.(prevHeightRef.current + (helperMessage ? 10 : 5));
        }
      },
      [helperMessage, onHeightChange],
    ),
  );

  const [name, setName] = useState(props.name);

  return (
    <Container ref={containerRef}>
      <InputContainer>
        {props.isReadOnly ? (
          <NodeBoxIncomingVariableReadonly
            color="neutral"
            size="sm"
            variant="outlined"
            value={name}
          />
        ) : (
          <NameInput
            color="primary"
            size="sm"
            variant="outlined"
            value={name}
            onChange={(e) => {
              if (!props.isReadOnly) {
                setName(e.target.value);
              }
            }}
            onKeyUp={(e) => {
              if (props.isReadOnly) {
                return;
              }
              if (e.key === 'Enter') {
                props.onConfirmNameChange?.(name);
              }
            }}
            onBlur={() => {
              if (props.isReadOnly) {
                return;
              }
              props.onConfirmNameChange?.(name);
            }}
          />
        )}
        {!props.isReadOnly && (
          <NodeBoxCommonRemoveButton onClick={() => props.onRemove?.()} />
        )}
      </InputContainer>
      {props.helperMessage && (
        <HelperMessageContainer>
          <NodeBoxHelperTextContainer>
            {props.helperMessage}
          </NodeBoxHelperTextContainer>
        </HelperMessageContainer>
      )}
    </Container>
  );
}

// ANCHOR: UI

export const ROW_MARGIN_TOP = 5;

const Container = styled.div`
  margin-top: ${ROW_MARGIN_TOP}px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const InputContainer = styled.div`
  display: flex;
`;

const NameInput = styled(Input)`
  margin-right: 5px;
  flex-grow: 1;
`;

const HelperMessageContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;
