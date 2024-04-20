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
            #24bb25 0%,
            #24bb25 25%,
            yellow 25%,
            yellow 50%,
            #24bb25 50%,
            #24bb25 75%,
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
          background: linear-gradient(344deg, #30d752 0%, #00c702 100%);
        `;
    }
  }}
`;

const Content = styled.div`
  background: #fff;
  border-radius: 4px;
  // Prevent margin collapse
  display: flow-root;
`;

export default NodeBox;
