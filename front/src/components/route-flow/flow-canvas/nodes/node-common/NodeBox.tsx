import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { NodeType } from "flow-models/v2-flow-content-types";
import background from "../../../../../assets/warning-background.svg";

export const BACKDROP_PADDING = 3;
export const NODE_BOX_WIDTH = 300;

// eslint-disable-next-line react-refresh/only-export-components
export enum NodeState {
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
      case NodeType.ChatGPTMessageNode:
        return css`
          background: linear-gradient(22deg, #98ecff 0%, #5cc5e0 100%);
        `;
      case NodeType.ChatGPTChatCompletionNode:
        return css`
          background: linear-gradient(22deg, #fa97b6 0%, #e081fe 100%);
        `;
      case NodeType.JavaScriptFunctionNode:
        return css`
          background: url(${background});
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
    }
  }}
`;

const Content = styled.div`
  background: #fff;
  border-radius: 5px;
`;

type Props = {
  nodeType: NodeType;
  state?: NodeState;
  children: React.ReactNode;
};

export default function NodeBox(props: Props) {
  return (
    <Backdrop $type={props.nodeType} $state={props.state ?? NodeState.Idle}>
      <Content>{props.children}</Content>
    </Backdrop>
  );
}
