import styled from '@emotion/styled';
import Input from '@mui/joy/Input';
import { ReactNode, useEffect, useRef, useState } from 'react';
import InputReadonly from '../../../../route-flow/common/InputReadonly';
import HelperTextContainer from './HelperTextContainer';
import RemoveButton from './RemoveButton';

type Props = {
  isReadOnly: boolean;
  name: string;
  helperMessage?: ReactNode;
  onConfirmNameChange?: (name: string) => void;
  onRemove?: () => void;
  onHeightChange?: (height: number) => void;
};

export default function NodeInputModifyRow(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver>();

  const propsRef = useRef<Props>(props);
  propsRef.current = props;

  if (resizeObserverRef.current == null) {
    resizeObserverRef.current = new ResizeObserver((entries) => {
      const newHeight = entries[0].contentBoxSize[0].blockSize;

      if (prevHeightRef.current !== newHeight) {
        prevHeightRef.current = newHeight;

        props.onHeightChange?.(
          prevHeightRef.current + (propsRef.current.helperMessage ? 10 : 5),
        );
      }
    });
  }

  useEffect(() => {
    const containerElement = containerRef.current!;
    resizeObserverRef.current!.observe(containerElement);
    return () => {
      resizeObserverRef.current!.unobserve(containerElement);
    };
  }, []);

  const [name, setName] = useState(props.name);

  return (
    <Container ref={containerRef}>
      <InputContainer>
        {props.isReadOnly ? (
          <InputReadonly
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
          <RemoveButton onClick={() => props.onRemove?.()} />
        )}
      </InputContainer>
      {props.helperMessage && (
        <HelperMessageContainer>
          <HelperTextContainer>{props.helperMessage}</HelperTextContainer>
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
