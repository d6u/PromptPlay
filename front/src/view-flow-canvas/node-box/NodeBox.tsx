import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import { NodeRunState, type NodeRunStateEnum } from 'run-flow';

import { BACKDROP_PADDING, NODE_BOX_WIDTH } from '../constants';

type Props = {
  selected: boolean;
  nodeState: NodeRunStateEnum;
  children: ReactNode;
};

function NodeBox(props: Props) {
  return (
    <Backdrop $selected={props.selected} $nodeState={props.nodeState}>
      <Content>{props.children}</Content>
    </Backdrop>
  );
}

const Backdrop = styled.div<{
  $selected: boolean;
  $nodeState: NodeRunStateEnum;
}>`
  width: ${NODE_BOX_WIDTH}px;
  padding: ${BACKDROP_PADDING}px;
  border-radius: 6px;
  cursor: initial;
  ${(props) => {
    if (props.$selected) {
      return css`
        background: linear-gradient(344deg, #64b6fb 0%, #276eff 100%);
      `;
    }

    switch (props.$nodeState) {
      case NodeRunState.PENDING:
      case NodeRunState.SKIPPED:
        return css`
          background: linear-gradient(344deg, #dbdbdb 0%, #c9c9c9 100%);
        `;
      case NodeRunState.RUNNING:
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
      case NodeRunState.INTERRUPTED:
      case NodeRunState.FAILED:
        return css`
          background: red;
        `;
      case NodeRunState.SUCCEEDED:
        return css`
          background: green;
        `;
    }

    // switch (props.$type) {
    //   case NodeType.OutputNode:
    //     return css`
    //       background: linear-gradient(39deg, #daf1bd 14.47%, #8eec63 87.64%);
    //     `;
    //   case NodeType.JavaScriptFunctionNode:
    //     // background will be included as data URL if its size is smaller
    //     // than a threshold. That's why we need to add "" around the url.
    //     return css`
    //       background: url(\"${background}\");
    //     `;
    //   case NodeType.ChatGPTMessageNode:
    //     return css`
    //       background: linear-gradient(22deg, #98ecff 0%, #5cc5e0 100%);
    //     `;
    //   case NodeType.ChatGPTChatCompletionNode:
    //     return css`
    //       background: linear-gradient(22deg, #fa97b6 0%, #e081fe 100%);
    //     `;
    //   case NodeType.TextTemplate: {
    //     return css`
    //       background: linear-gradient(22deg, #98ecff 0%, #5cc5e0 100%);
    //     `;
    //   }
    //   case NodeType.HuggingFaceInference: {
    //     return css`
    //       background: linear-gradient(22deg, #fa97b6 0%, #e081fe 100%);
    //     `;
    //   }
    //   case NodeType.ElevenLabs: {
    //     return css`
    //       background: linear-gradient(22deg, #ffd196 0%, #ff8900 100%);
    //     `;
    //   }
    //   case NodeType.ConditionNode: {
    //     return '';
    //   }
    //   case NodeType.InputNode:
    //   default:
    //     return css`
    //       background: linear-gradient(22deg, #9cede8 0%, #00e1d4 100%);
    //     `;
    // }
  }}
`;

const Content = styled.div`
  background: #fff;
  border-radius: 4px;
  // Prevent margin collapse
  display: flow-root;
`;

export default NodeBox;
