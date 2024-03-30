import styled from '@emotion/styled';

import {
  NodeExecutionMessage,
  NodeExecutionMessageType,
} from 'state-flow/common-types';

type Props = {
  message: NodeExecutionMessage;
};

function NodeExecutionMessageDisplay(props: Props) {
  return (
    <Container $type={props.message.type}>{props.message.content}</Container>
  );
}

const Container = styled.div<{ $type: NodeExecutionMessageType }>`
  margin-top: 5px;
  margin-bottom: 5px;
  border: 1px solid white;
  ${(props) => {
    switch (props.$type) {
      case NodeExecutionMessageType.Error:
        return 'border-color: red;';
      case NodeExecutionMessageType.Info:
        return 'border-color: green;';
    }
  }}
  padding: 5px 6px;
  min-height: 32px;
  border-radius: 5px;
  font-size: 14px;
  word-break: break-word;
`;

export default NodeExecutionMessageDisplay;
