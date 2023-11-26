import mustache from "mustache";
import { defer, Observable, of } from "rxjs";
import invariant from "ts-invariant";
import {
  NodeOutputVariable,
  V3TextTemplateNodeConfig,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariablesDict,
  VariableType,
} from "../models/v3-flow-content-types";

export function handleTextTemplateNode(
  data: V3TextTemplateNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
): Observable<V3VariableValueLookUpDict> {
  return defer(() => {
    // Prepare inputs
    // ----------
    let variableContent: NodeOutputVariable | null = null;

    const argsMap: Record<string, unknown> = {};

    for (const variable of Object.values(variableMap)) {
      if (variable.nodeId !== data.nodeId) {
        continue;
      }

      if (variable.type === VariableType.NodeInput) {
        const outputId = inputIdToOutputIdMap[variable.id];

        if (outputId) {
          const outputValue = variableValueMap[outputId];
          argsMap[variable.name] = outputValue ?? null;
        } else {
          argsMap[variable.name] = null;
        }
      } else if (variable.type === VariableType.NodeOutput) {
        if (variable.index === 0) {
          variableContent = variable;
        }
      }
    }

    invariant(variableContent != null);

    // Execute logic
    // ----------
    const content = mustache.render(data.content, argsMap);

    // Update outputs
    // ----------
    variableValueMap[variableContent.id] = content;

    return of({
      [variableContent.id]: content,
    });
  });
}
