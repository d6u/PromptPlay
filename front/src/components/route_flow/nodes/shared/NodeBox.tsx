import styled, { css } from "styled-components";
import background from "../../../../assets/warning-background.svg";
import { NodeType } from "../../flowTypes";

const Backdrop = styled.div<{ $type: NodeType }>`
  width: 300px;
  padding: 3px;
  border-radius: 8px;
  cursor: initial;
  ${(props) => {
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
    }
  }}
`;

const Content = styled.div`
  background: #fff;
  border-radius: 5px;
`;

type Props = {
  nodeType: NodeType;
  children: React.ReactNode;
};

export default function NodeBox(props: Props) {
  return (
    <Backdrop $type={props.nodeType}>
      <Content>{props.children}</Content>
    </Backdrop>
  );
}
