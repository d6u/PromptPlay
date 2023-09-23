import { A } from "@mobily/ts-belt";
import mustache from "mustache";
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  concatMap,
  from,
  map,
  tap,
  zipWith,
  of,
  startWith,
  endWith,
  catchError,
  throwError,
  concat,
  defer,
} from "rxjs";
import * as HF from "../../integrations/hugging-face";
import * as OpenAI from "../../integrations/openai";
import { useLocalStorageStore, useSpaceStore } from "../../state/appState";
import {
  ChatGPTChatCompletionNodeConfig,
  ChatGPTMessageNodeConfig,
  HuggingFaceInferenceNodeConfig,
  InputID,
  JavaScriptFunctionNodeConfig,
  LocalEdge,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeType,
  OutputID,
  OutputNodeConfig,
  TextTemplateNodeConfig,
  VariableValueMap,
} from "./types-flow-content";
import { NodeAugment } from "./types-local-state";

const AsyncFunction = async function () {}.constructor;

export enum RunEventType {
  VariableValueChanges = "VariableValueChanges",
  NodeAugmentChange = "NodeAugmentChange",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FlowInputVariableMap = Record<OutputID, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FlowOutputVariableMap = Record<InputID, any>;

export type RunEvent = VariableValueChangeEvent | NodeAugmentChangeEvent;

type VariableValueChangeEvent = {
  type: RunEventType.VariableValueChanges;
  changes: VariableValueMap;
};

type NodeAugmentChangeEvent = {
  type: RunEventType.NodeAugmentChange;
  nodeId: NodeID;
  augmentChange: Partial<NodeAugment>;
};

export function run(
  edges: LocalEdge[],
  nodeConfigs: NodeConfigs,
  inputVariableMap: FlowInputVariableMap
): Observable<RunEvent> {
  const nodeGraph: Record<NodeID, NodeID[]> = {};
  const nodeIndegree: Record<NodeID, number> = {};

  for (const nodeId of Object.keys(nodeConfigs) as NodeID[]) {
    nodeGraph[nodeId] = [];
    nodeIndegree[nodeId] = 0;
  }

  const inputIdToOutputIdMap: Record<InputID, OutputID | undefined> = {};
  const outputIdToValueMap: FlowInputVariableMap = { ...inputVariableMap };

  for (const edge of edges) {
    // nodeGraph[edge.source] contains duplicate edge.target,
    // because there can be multiple edges between two nodes.
    //
    // This is expected since we are reducing indegree the equial number of
    // times in the while loop below.
    nodeGraph[edge.source].push(edge.target);
    nodeIndegree[edge.target] += 1;

    inputIdToOutputIdMap[edge.targetHandle] = edge.sourceHandle!;
  }

  const sub = new BehaviorSubject(0);

  const obs = new Observable<{ nodeId: NodeID; nodeConfig: NodeConfig }>(
    (subscriber) => {
      const queue: NodeID[] = [];

      for (const [id, count] of Object.entries(nodeIndegree) as [
        NodeID,
        number
      ][]) {
        if (count === 0) {
          queue.push(id);
        }
      }

      while (queue.length > 0) {
        const nodeId = queue.shift()!;
        // It's OK to force unwrap here since the risk missing node config is tiny.
        const nodeConfig = nodeConfigs[nodeId]!;

        subscriber.next({ nodeId, nodeConfig });

        for (const nextId of nodeGraph[nodeId]) {
          nodeIndegree[nextId] -= 1;
          if (nodeIndegree[nextId] === 0) {
            queue.push(nextId);
          }
        }
      }

      subscriber.complete();
    }
  );

  return obs.pipe(
    zipWith(sub),
    concatMap(([{ nodeId, nodeConfig }]) => {
      let obs: Observable<RunEvent>;

      switch (nodeConfig.nodeType) {
        case NodeType.InputNode: {
          obs = EMPTY;
          break;
        }
        case NodeType.OutputNode: {
          obs = handleOutputNode(
            nodeConfig,
            inputIdToOutputIdMap,
            outputIdToValueMap
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            }))
          );
          break;
        }
        case NodeType.JavaScriptFunctionNode: {
          const nodeData = nodeConfig;
          obs = handleJavaScriptFunctionNode(
            nodeData,
            inputIdToOutputIdMap,
            outputIdToValueMap
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            }))
          );
          break;
        }
        case NodeType.ChatGPTMessageNode: {
          obs = handleChatGPTMessageNode(
            nodeConfig,
            inputIdToOutputIdMap,
            outputIdToValueMap
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            }))
          );
          break;
        }
        case NodeType.ChatGPTChatCompletionNode: {
          obs = from(
            handleChatGPTChatNode(
              nodeConfig,
              inputIdToOutputIdMap,
              outputIdToValueMap
            )
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            }))
          );
          break;
        }
        case NodeType.TextTemplate: {
          obs = handleTextTemplateNode(
            nodeConfig,
            inputIdToOutputIdMap,
            outputIdToValueMap
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            }))
          );
          break;
        }
        case NodeType.HuggingFaceInference: {
          obs = handleHuggingFaceInferenceNode(
            nodeConfig,
            inputIdToOutputIdMap,
            outputIdToValueMap
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            }))
          );
          break;
        }
      }

      return obs.pipe(
        startWith<RunEvent>({
          type: RunEventType.NodeAugmentChange,
          nodeId,
          augmentChange: { isRunning: true },
        }),
        endWith<RunEvent>({
          type: RunEventType.NodeAugmentChange,
          nodeId,
          augmentChange: { isRunning: false },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catchError<any, Observable<RunEvent>>((e) =>
          concat<[RunEvent, RunEvent]>(
            of({
              type: RunEventType.NodeAugmentChange,
              nodeId,
              augmentChange: { isRunning: false, hasError: true },
            }),
            throwError(() => e)
          )
        ),
        tap({
          complete() {
            sub.next(0);
          },
        })
      );
    }),
    tap({
      error(e) {
        sub.error(e);
      },
      complete() {
        sub.complete();
      },
    })
  );
}

function handleOutputNode(
  data: OutputNodeConfig,
  inputIdToOutputIdMap: Record<InputID, OutputID | undefined>,
  variableValueMap: VariableValueMap
): Observable<VariableValueMap> {
  const changes: VariableValueMap = {};

  for (const input of data.inputs) {
    const outputId = inputIdToOutputIdMap[input.id];

    if (outputId) {
      const outputValue = variableValueMap[outputId];
      changes[input.id] = outputValue ?? null;
    }
  }

  return of(changes);
}

function handleJavaScriptFunctionNode(
  data: JavaScriptFunctionNodeConfig,
  inputIdToOutputIdMap: Record<InputID, OutputID | undefined>,
  variableValueMap: VariableValueMap
): Observable<VariableValueMap> {
  return defer(async () => {
    const pairs: Array<[string, unknown]> = [];

    for (const input of data.inputs) {
      const outputId = inputIdToOutputIdMap[input.id];

      if (outputId) {
        const outputValue = variableValueMap[outputId];
        pairs.push([input.name, outputValue ?? null]);
      } else {
        pairs.push([input.name, null]);
      }
    }

    const fn = AsyncFunction(
      ...pairs.map((pair) => pair[0]),
      data.javaScriptCode
    );

    const result = await fn(...pairs.map((pair) => pair[1]));

    variableValueMap[data.outputs[0].id] = result;

    return { [data.outputs[0].id]: result };
  });
}

function handleChatGPTMessageNode(
  data: ChatGPTMessageNodeConfig,
  inputIdToOutputIdMap: Record<InputID, OutputID | undefined>,
  variableValueMap: VariableValueMap
): Observable<VariableValueMap> {
  // Prepare inputs
  // ----------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const argsMap: Record<string, any> = {};

  for (const input of data.inputs) {
    const outputId = inputIdToOutputIdMap[input.id];

    if (outputId) {
      const outputValue = variableValueMap[outputId];
      argsMap[input.name] = outputValue ?? null;
    } else {
      argsMap[input.name] = null;
    }
  }

  // Execute logic
  // ----------

  let messages: OpenAI.ChatGPTMessage[] = argsMap["messages"] ?? [];

  const message = {
    role: data.role,
    content: mustache.render(data.content, argsMap),
  };

  messages = A.append(messages, message);

  // Update outputs
  // ----------

  variableValueMap[data.outputs[0].id] = message;
  variableValueMap[data.outputs[1].id] = messages;

  return of({
    [data.outputs[0].id]: message,
    [data.outputs[1].id]: messages,
  });
}

function handleChatGPTChatNode(
  data: ChatGPTChatCompletionNodeConfig,
  inputIdToOutputIdMap: Record<InputID, OutputID | undefined>,
  variableValueMap: VariableValueMap
): Observable<VariableValueMap> {
  return defer(() => {
    // Prepare inputs
    // ----------

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const argsMap: { [key: string]: any } = {};

    for (const input of data.inputs) {
      const outputId = inputIdToOutputIdMap[input.id];

      if (outputId) {
        const outputValue = variableValueMap[outputId];
        argsMap[input.name] = outputValue ?? null;
      } else {
        argsMap[input.name] = null;
      }
    }

    // Execute logic
    // ----------

    const openAiApiKey = useLocalStorageStore.getState().openAiApiKey;
    if (!openAiApiKey) {
      // console.error("OpenAI API key is missing");
      useSpaceStore.getState().setMissingOpenAiApiKey(true);
      return throwError(() => new Error("OpenAI API key is missing"));
    }

    let messages: OpenAI.ChatGPTMessage[] = argsMap["messages"] ?? [];
    let role = "assistant";
    let content = "";

    const obs1 = OpenAI.getStreamingCompletion({
      apiKey: openAiApiKey,
      model: data.model,
      messages,
      temperature: data.temperature,
      stop: data.stop,
    }).pipe(
      map((piece) => {
        if ("error" in piece) {
          // console.error(piece.error.message);
          throw piece.error.message;
        }

        if (piece.choices[0].delta.role) {
          role = piece.choices[0].delta.role;
        }
        if (piece.choices[0].delta.content) {
          content += piece.choices[0].delta.content;
        }
        const message = { role, content };

        return {
          [data.outputs[0].id]: content,
          [data.outputs[1].id]: message,
          [data.outputs[2].id]: A.append(messages, message),
        };
      })
    );

    return concat(
      obs1,
      defer(() => {
        const message = { role, content };
        messages = A.append(messages, message);

        variableValueMap[data.outputs[0].id] = content;
        variableValueMap[data.outputs[1].id] = message;
        variableValueMap[data.outputs[2].id] = messages;

        return of({
          [data.outputs[0].id]: content,
          [data.outputs[1].id]: message,
          [data.outputs[2].id]: messages,
        });
      })
    );
  });
}

function handleTextTemplateNode(
  data: TextTemplateNodeConfig,
  inputIdToOutputIdMap: Record<InputID, OutputID | undefined>,
  variableValueMap: VariableValueMap
): Observable<VariableValueMap> {
  return defer(() => {
    // Prepare inputs
    // ----------

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const argsMap: Record<string, any> = {};

    for (const input of data.inputs) {
      const outputId = inputIdToOutputIdMap[input.id];

      if (outputId) {
        const outputValue = variableValueMap[outputId];
        argsMap[input.name] = outputValue ?? null;
      } else {
        argsMap[input.name] = null;
      }
    }

    // Execute logic
    // ----------

    const content = mustache.render(data.content, argsMap);

    // Update outputs
    // ----------

    variableValueMap[data.outputs[0].id] = content;

    return of({
      [data.outputs[0].id]: content,
    });
  });
}

function handleHuggingFaceInferenceNode(
  data: HuggingFaceInferenceNodeConfig,
  inputIdToOutputIdMap: Record<InputID, OutputID | undefined>,
  variableValueMap: VariableValueMap
): Observable<VariableValueMap> {
  return defer(() => {
    // Prepare inputs
    // ----------

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const argsMap: { [key: string]: any } = {};

    for (const input of data.inputs) {
      const outputId = inputIdToOutputIdMap[input.id];

      if (outputId) {
        const outputValue = variableValueMap[outputId];
        argsMap[input.name] = outputValue ?? null;
      } else {
        argsMap[input.name] = null;
      }
    }

    // Execute logic
    // ----------

    const huggingFaceApiToken =
      useLocalStorageStore.getState().huggingFaceApiToken;
    if (!huggingFaceApiToken) {
      // console.error("Hugging Face API token is missing");
      useSpaceStore.getState().setMissingHuggingFaceApiToken(true);
      return throwError(() => new Error("Hugging Face API token is missing"));
    }

    return from(
      HF.callInferenceApi(
        { apiToken: huggingFaceApiToken, model: data.model },
        argsMap["parameters"]
      )
    ).pipe(
      map((result) => {
        if (result.isError) {
          if (result.data) {
            throw result.data;
          } else {
            throw new Error("Unknown error");
          }
        }

        variableValueMap[data.outputs[0].id] = result.data;

        return {
          [data.outputs[0].id]: result.data,
        };
      })
    );
  });
}
