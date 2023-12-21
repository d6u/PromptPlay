import {
  V3OutputNodeConfig,
  V3VariableValueLookUpDict,
  VariableType,
} from 'flow-models';
import { Observable, of } from 'rxjs';
import type { RunContext } from './run-single';

export function handleOutputNode(
  data: V3OutputNodeConfig,
  context: RunContext,
): Observable<V3VariableValueLookUpDict> {
  const {
    variablesDict: variableMap,
    edgeTargetHandleToSourceHandleLookUpDict: inputIdToOutputIdMap,
    outputIdToValueMap: variableValueMap,
  } = context;

  const changes: V3VariableValueLookUpDict = {};

  for (const input of Object.values(variableMap)) {
    if (
      input.type === VariableType.FlowOutput &&
      input.nodeId === data.nodeId
    ) {
      const outputId = inputIdToOutputIdMap[input.id];

      if (outputId) {
        const outputValue = variableValueMap[outputId];
        changes[input.id] = outputValue ?? null;
      }
    }
  }

  return of(changes);
}
