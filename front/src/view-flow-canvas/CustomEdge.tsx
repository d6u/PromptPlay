import { ConnectorType, type ConnectorTypeEnum } from 'flow-models';
import { BaseEdge, getBezierPath, type BezierEdgeProps } from 'reactflow';
import { EdgeRunState } from 'run-flow';
import { useFlowStore } from 'state-flow/flow-store';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  pathOptions,
  sourceHandleId,
  selected,
}: BezierEdgeProps) {
  // Reference: https://github.com/xyflow/xyflow/blob/3f4cd6d1fbbc2fa08c410c280f24b7a41c1ef73f/packages/react/src/components/Edges/BezierEdge.tsx#L30-L38
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: pathOptions?.curvature,
  });

  const sourceConnectorType = useFlowStore((s): ConnectorTypeEnum | null => {
    // `connectors[sourceHandleId!]` could be undefined when deleting an edge
    return s.getFlowContent().connectors[sourceHandleId!]?.type ?? null;
  });

  const edgeState = useFlowStore(
    (s) =>
      s.getFlowContent().runFlowStates.edgeStates[id] ?? EdgeRunState.PENDING,
  );

  let stroke: string;
  if (selected) {
    stroke = '#555';
    switch (true) {
      case edgeState === EdgeRunState.SKIPPED: // SKIPPED will use default
        break;
      case edgeState === EdgeRunState.MET:
        stroke = '#12ac13';
        break;
      case edgeState === EdgeRunState.UNMET:
        stroke = '#ff2626';
        break;
      case edgeState === EdgeRunState.PENDING:
        if (sourceConnectorType === ConnectorType.NodeOutput) {
          stroke = '#009cde';
        } else if (sourceConnectorType === ConnectorType.OutCondition) {
          stroke = '#7a00df';
        }
        break;
    }
  } else {
    stroke = '#b1b1b7';
    switch (true) {
      case edgeState === EdgeRunState.SKIPPED: // SKIPPED will use default
        break;
      case edgeState === EdgeRunState.MET:
        stroke = '#75ff75';
        break;
      case edgeState === EdgeRunState.UNMET:
        stroke = '#ffadad';
        break;
      case edgeState === EdgeRunState.PENDING:
        if (sourceConnectorType === ConnectorType.NodeOutput) {
          stroke = '#64d1ff';
        } else if (sourceConnectorType === ConnectorType.OutCondition) {
          stroke = '#c074ff';
        }
        break;
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ strokeWidth: 2, stroke: stroke }}
      />
    </>
  );
}
