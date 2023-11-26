import { Observable, of } from "rxjs";
import {
  V3OutputNodeConfig,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariablesDict,
  VariableType,
} from "../models/v3-flow-content-types";

export function handleOutputNode(
  data: V3OutputNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
): Observable<V3VariableValueLookUpDict> {
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