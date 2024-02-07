import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { NodeType } from 'flow-models';

import background from 'assets/warning-background.svg';

import { BACKDROP_PADDING, NODE_BOX_WIDTH } from '../ui-constants';

type Props = {
  nodeType: NodeType;
  isRunning?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
};

function NodeBox(props: Props) {
  const nodeState = props.isRunning
    ? NodeState.Running
    : props.hasError
      ? NodeState.Error
      : NodeState.Idle;

  return (
    <Backdrop $type={props.nodeType} $state={nodeState}>
      <Content>{props.children}</Content>
    </Backdrop>
  );
}

enum NodeState {
  Idle,
  Running,
  Error,
}

const Backdrop = styled.div<{ $type: NodeType; $state: NodeState }>`
  width: ${NODE_BOX_WIDTH}px;
  padding: ${BACKDROP_PADDING}px;
  border-radius: 8px;
  cursor: initial;
  ${(props) => {
    if (props.$state === NodeState.Running) {
      return css`
        background-size: 100px 100px;
        background-image: linear-gradient(
          -45deg,
          green 0%,
          green 25%,
          yellow 25%,
          yellow 50%,
          green 50%,
          green 75%,
          yellow 75%
        );
        animation: AnimateBG 2s linear infinite;

        @keyframes AnimateBG {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 100% 0%;
          }
        }
      `;
    } else if (props.$state === NodeState.Error) {
      return css`
        background: red;
      `;
    }

    switch (props.$type) {
      case NodeType.InputNode:
        return css`
          background: linear-gradient(22deg, #9cede8 0%, #00e1d4 100%);
        `;
      case NodeType.OutputNode:
        return css`
          background: linear-gradient(39deg, #daf1bd 14.47%, #8eec63 87.64%);
        `;
      case NodeType.JavaScriptFunctionNode:
        // background will be included as data URL if its size is smaller
        // than a threshold. That's why we need to add "" around the url.
        return css`
          background: url(\"${background}\");
        `;
      case NodeType.ChatGPTMessageNode:
        return css`
          background: linear-gradient(22deg, #98ecff 0%, #5cc5e0 100%);
        `;
      case NodeType.ChatGPTChatCompletionNode:
        return css`
          background: linear-gradient(22deg, #fa97b6 0%, #e081fe 100%);
        `;
      case NodeType.TextTemplate: {
        return css`
          background: linear-gradient(22deg, #98ecff 0%, #5cc5e0 100%);
        `;
      }
      case NodeType.HuggingFaceInference: {
        return css`
          background: linear-gradient(22deg, #fa97b6 0%, #e081fe 100%);
        `;
      }
      case NodeType.ElevenLabs: {
        return css`
          background: linear-gradient(22deg, #ffd196 0%, #ff8900 100%);
        `;
      }
      case NodeType.ConditionNode: {
        return '';
      }
    }
  }}
`;

const Content = styled.div`
  background: #fff;
  border-radius: 5px;
  overflow: hidden;
`;

export default NodeBox;
