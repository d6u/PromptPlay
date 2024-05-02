import { css } from '@emotion/react';
import { NodeKind, getNodeDefinitionForNodeTypeName } from 'flow-models';
import RemoveButton from 'generic-components/RemoveButton';
import IconThreeDots from 'icons/IconThreeDots';
import { useContext, useMemo } from 'react';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import NodeBoxIconRename from 'view-flow-canvas/node-box/NodeBoxIconRename';
import { DRAG_HANDLE_CLASS_NAME } from '../constants';

type Props = {
  nodeId: string;
};

function NodeHeader(props: Props) {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const readonly = !isCurrentUserOwner;

  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );
  const removeNode = useFlowStore((s) => s.removeNode);
  const setCanvasRenameNodeId = useFlowStore((s) => s.setCanvasRenameNodeId);

  const nodeDef = useMemo(
    () => getNodeDefinitionForNodeTypeName(nodeConfig.type),
    [nodeConfig],
  );

  return (
    <div
      css={css`
        margin-bottom: 5px;
      `}
    >
      <div
        css={css`
          position: relative;
          margin-bottom: 5px;
        `}
      >
        <div
          className={DRAG_HANDLE_CLASS_NAME}
          css={css`
            cursor: grab;
            padding-top: 10px;
            padding-left: 10px;
            padding-right: 10px;
          `}
        >
          <h3
            css={css`
              margin: 0;
              font-size: 16px;
              line-height: 32px;
            `}
          >
            {nodeDef.label}
          </h3>
          <IconThreeDots
            css={css`
              fill: #cacaca;
              width: 20px;
              position: absolute;
              top: -3px;
              left: calc(50% - 30px / 2);
            `}
          />
        </div>
        <div
          className={DRAG_HANDLE_CLASS_NAME}
          css={css`
            cursor: grab;
            padding-top: 5px;
            padding-left: 10px;
            padding-right: 10px;
            margin-bottom: 10px;
          `}
        >
          <h3
            css={css`
              margin: 0;
              font-size: 12px;
              line-height: 12px;
              color: #636b74;
            `}
          >
            {nodeDef.label}
          </h3>
        </div>
        {!readonly && (
          <div
            css={css`
              position: absolute;
              top: 10px;
              right: 10px;
            `}
          >
            <RemoveButton onClick={() => removeNode(props.nodeId)} />
          </div>
        )}
      </div>
      <div
        css={css`
          display: flex;
          gap: 5px;
          padding-left: 10px;
          padding-right: 10px;
          margin-top: 5px;
        `}
      >
        {(nodeConfig.kind === NodeKind.Start ||
          nodeConfig.kind === NodeKind.SubroutineStart) && (
          <NodeBoxIconRename
            onClick={() => {
              setCanvasRenameNodeId(props.nodeId);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default NodeHeader;
