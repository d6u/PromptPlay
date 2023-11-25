import { A, D } from "@mobily/ts-belt";
import mustache from "mustache";
import {
  BehaviorSubject,
  catchError,
  concat,
  concatMap,
  defer,
  EMPTY,
  endWith,
  from,
  map,
  Observable,
  of,
  retry,
  startWith,
  tap,
  throwError,
  TimeoutError,
  zipWith,
} from "rxjs";
import invariant from "ts-invariant";
import { NodeAugment } from "../components/route-flow/state/store-flow-state-types";
import * as ElevenLabs from "../integrations/eleven-labs";
import * as HuggingFace from "../integrations/hugging-face";
import * as OpenAI from "../integrations/openai";
import {
  NodeID,
  NodeType,
  VariableValueMap,
} from "../models/v2-flow-content-types";
import {
  NodeOutputVariable,
  V3ChatGPTChatCompletionNodeConfig,
  V3ChatGPTMessageNodeConfig,
  V3ElevenLabsNodeConfig,
  V3HuggingFaceInferenceNodeConfig,
  V3JavaScriptFunctionNodeConfig,
  V3LocalEdge,
  V3NodeConfig,
  V3NodeConfigsDict,
  V3OutputNodeConfig,
  V3TextTemplateNodeConfig,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariablesDict,
  VariableType,
} from "../models/v3-flow-content-types";
import { useLocalStorageStore, useSpaceStore } from "../state/appState";

const AsyncFunction = async function () {}.constructor;

export enum RunEventType {
  VariableValueChanges = "VariableValueChanges",
  NodeAugmentChange = "NodeAugmentChange",
  RunStatusChange = "RunStatusChange",
}

export type FlowInputVariableMap = Record<V3VariableID, unknown>;
export type FlowOutputVariableMap = Record<V3VariableID, unknown>;

export type RunEvent =
  | VariableValueChangeEvent
  | NodeAugmentChangeEvent
  | RunStatusChangeEvent;

type VariableValueChangeEvent = {
  type: RunEventType.VariableValueChanges;
  changes: VariableValueMap;
};

type NodeAugmentChangeEvent = {
  type: RunEventType.NodeAugmentChange;
  nodeId: NodeID;
  augmentChange: Partial<NodeAugment>;
};

type RunStatusChangeEvent = {
  type: RunEventType.RunStatusChange;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
};

export function run(
  nodeConfigs: V3NodeConfigsDict,
  edges: V3LocalEdge[],
  variableMap: VariablesDict,
  inputVariableMap: FlowInputVariableMap,
  useStreaming: boolean = false,
): Observable<RunEvent> {
  const nodeGraph: Record<NodeID, NodeID[]> = {};
  const nodeIndegree: Record<NodeID, number> = {};

  for (const nodeId of D.keys(nodeConfigs)) {
    nodeGraph[nodeId] = [];
    nodeIndegree[nodeId] = 0;
  }

  const inputIdToOutputIdMap: Record<V3VariableID, V3VariableID> = {};
  const outputIdToValueMap: FlowInputVariableMap = { ...inputVariableMap };

  for (const edge of edges) {
    // nodeGraph[edge.source] contains duplicate edge.target,
    // because there can be multiple edges between two nodes.
    //
    // This is expected since we are reducing indegree the equial number of
    // times in the while loop below.
    nodeGraph[edge.source]!.push(edge.target);
    nodeIndegree[edge.target] += 1;

    inputIdToOutputIdMap[edge.targetHandle] = edge.sourceHandle!;
  }

  // `obs` is a topological sort of the node graph.
  const obs = new Observable<{ nodeId: NodeID; nodeConfig: V3NodeConfig }>(
    (subscriber) => {
      const queue: NodeID[] = [];

      for (const [id, count] of Object.entries(nodeIndegree) as [
        NodeID,
        number,
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
    },
  );

  // `sub` is to control the pace of the execution and the termination.
  //
  // Because `obs` will emit all the nodes at once, we give `sub` a value one
  // at a time and only give `sub` a new value after one node in `obs` is
  // finished executing. So that we can execute the node graph in topological
  // order.
  const sub = new BehaviorSubject(0);

  return obs.pipe(
    zipWith(sub),
    concatMap(([{ nodeId, nodeConfig }]) => {
      let obs: Observable<RunEvent>;

      switch (nodeConfig.type) {
        case NodeType.InputNode: {
          obs = EMPTY;
          break;
        }
        case NodeType.OutputNode: {
          obs = handleOutputNode(
            nodeConfig,
            variableMap,
            inputIdToOutputIdMap,
            outputIdToValueMap,
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            })),
          );
          break;
        }
        case NodeType.JavaScriptFunctionNode: {
          const nodeData = nodeConfig;
          obs = handleJavaScriptFunctionNode(
            nodeData,
            variableMap,
            inputIdToOutputIdMap,
            outputIdToValueMap,
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            })),
          );
          break;
        }
        case NodeType.ChatGPTMessageNode: {
          obs = handleChatGPTMessageNode(
            nodeConfig,
            variableMap,
            inputIdToOutputIdMap,
            outputIdToValueMap,
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            })),
          );
          break;
        }
        case NodeType.ChatGPTChatCompletionNode: {
          obs = from(
            handleChatGPTChatNode(
              nodeConfig,
              variableMap,
              inputIdToOutputIdMap,
              outputIdToValueMap,
              useStreaming,
            ),
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            })),
          );
          break;
        }
        case NodeType.TextTemplate: {
          obs = handleTextTemplateNode(
            nodeConfig,
            variableMap,
            inputIdToOutputIdMap,
            outputIdToValueMap,
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            })),
          );
          break;
        }
        case NodeType.HuggingFaceInference: {
          obs = handleHuggingFaceInferenceNode(
            nodeConfig,
            variableMap,
            inputIdToOutputIdMap,
            outputIdToValueMap,
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            })),
          );
          break;
        }
        case NodeType.ElevenLabs: {
          obs = handleElevenLabsNode(
            nodeConfig,
            variableMap,
            inputIdToOutputIdMap,
            outputIdToValueMap,
          ).pipe(
            map((changes) => ({
              type: RunEventType.VariableValueChanges,
              changes,
            })),
          );
          break;
        }
      }

      return obs.pipe(
        // startWith and endWith will run for each node, before and after
        // running its logic.
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
        // `catchError` here act like `endWith`, but also make sure the error
        // is rethrown.
        //
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catchError<any, Observable<RunEvent>>((e) =>
          concat<[RunEvent, RunEvent]>(
            of({
              type: RunEventType.NodeAugmentChange,
              nodeId,
              augmentChange: { isRunning: false, hasError: true },
            }),
            throwError(() => e),
          ),
        ),
        tap({
          complete() {
            sub.next(0);
          },
        }),
      );
    }),
    tap({
      error(e) {
        // console.error("Run failed with error,", e);
        // By erroring `sub`, we stop the observable chain completely.
        sub.error(e);
      },
      complete() {
        sub.complete();
      },
    }),
    catchError((error) =>
      of<RunStatusChangeEvent>({ type: RunEventType.RunStatusChange, error }),
    ),
  );
}

function handleOutputNode(
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

function handleJavaScriptFunctionNode(
  data: V3JavaScriptFunctionNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
): Observable<V3VariableValueLookUpDict> {
  return defer(async () => {
    let outputVariable: NodeOutputVariable | null = null;
    const pairs: Array<[string, unknown]> = [];

    for (const variable of Object.values(variableMap)) {
      if (variable.nodeId !== data.nodeId) {
        continue;
      }

      if (variable.type === VariableType.NodeInput) {
        const outputId = inputIdToOutputIdMap[variable.id];

        if (outputId) {
          const outputValue = variableValueMap[outputId];
          pairs.push([variable.name, outputValue ?? null]);
        } else {
          pairs.push([variable.name, null]);
        }
      } else if (variable.type === VariableType.NodeOutput) {
        outputVariable = variable;
      }
    }

    invariant(outputVariable != null);

    const fn = AsyncFunction(
      ...pairs.map((pair) => pair[0]),
      data.javaScriptCode,
    );

    const result = await fn(...pairs.map((pair) => pair[1]));

    variableValueMap[outputVariable.id] = result;

    return { [outputVariable.id]: result };
  });
}

function handleChatGPTMessageNode(
  data: V3ChatGPTMessageNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
): Observable<V3VariableValueLookUpDict> {
  // Prepare inputs
  // ----------
  let variableMessage: NodeOutputVariable | null = null;
  let variableMessages: NodeOutputVariable | null = null;

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
        variableMessage = variable;
      } else if (variable.index === 1) {
        variableMessages = variable;
      }
    }
  }

  invariant(variableMessage != null);
  invariant(variableMessages != null);

  // Execute logic
  // ----------

  let messages = (argsMap["messages"] ?? []) as OpenAI.ChatGPTMessage[];

  const message = {
    role: data.role,
    content: mustache.render(data.content, argsMap),
  };

  messages = A.append(messages, message);

  // Update outputs
  // ----------

  variableValueMap[variableMessage.id] = message;
  variableValueMap[variableMessages.id] = messages;

  return of({
    [variableMessage.id]: message,
    [variableMessages.id]: messages,
  });
}

function handleChatGPTChatNode(
  data: V3ChatGPTChatCompletionNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
  useStreaming: boolean,
): Observable<V3VariableValueLookUpDict> {
  return defer(() => {
    // Prepare inputs
    // ----------

    let variableContent: NodeOutputVariable | null = null;
    let variableMessage: NodeOutputVariable | null = null;
    let variableMessages: NodeOutputVariable | null = null;

    const argsMap: { [key: string]: unknown } = {};

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
        } else if (variable.index === 1) {
          variableMessage = variable;
        } else if (variable.index === 2) {
          variableMessages = variable;
        }
      }
    }

    invariant(variableContent != null);
    invariant(variableMessage != null);
    invariant(variableMessages != null);

    // Execute logic
    // ----------

    const openAiApiKey = useLocalStorageStore.getState().openAiApiKey;
    if (!openAiApiKey) {
      // console.error("OpenAI API key is missing");
      useSpaceStore.getState().setMissingOpenAiApiKey(true);
      return throwError(() => new Error("OpenAI API key is missing"));
    }

    let messages = (argsMap["messages"] ?? []) as OpenAI.ChatGPTMessage[];
    let role = "assistant";
    let content = "";

    const options = {
      apiKey: openAiApiKey,
      model: data.model,
      messages,
      temperature: data.temperature,
      stop: data.stop,
      seed: data.seed,
      responseFormat:
        data.responseFormatType != null
          ? { type: data.responseFormatType }
          : null,
    };

    if (useStreaming) {
      return concat(
        OpenAI.getStreamingCompletion(options).pipe(
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

            invariant(variableContent != null);
            invariant(variableMessage != null);
            invariant(variableMessages != null);

            return {
              [variableContent.id]: content,
              [variableMessage.id]: message,
              [variableMessages.id]: A.append(messages, message),
            };
          }),
        ),
        defer(() => {
          const message = { role, content };
          messages = A.append(messages, message);

          invariant(variableContent != null);
          invariant(variableMessage != null);
          invariant(variableMessages != null);

          variableValueMap[variableContent.id] = content;
          variableValueMap[variableMessage.id] = message;
          variableValueMap[variableMessages.id] = messages;

          return of({
            [variableContent.id]: content,
            [variableMessage.id]: message,
            [variableMessages.id]: messages,
          });
        }),
      );
    } else {
      return OpenAI.getNonStreamingCompletion(options).pipe(
        map((result) => {
          if (result.isError) {
            console.error(result.data);
            throw result.data;
          }

          const content = result.data.choices[0].message.content;
          const message = result.data.choices[0].message;
          messages = A.append(messages, message);

          invariant(variableContent != null);
          invariant(variableMessage != null);
          invariant(variableMessages != null);

          variableValueMap[variableContent.id] = content;
          variableValueMap[variableMessage.id] = message;
          variableValueMap[variableMessages.id] = messages;

          return {
            [variableContent.id]: content,
            [variableMessage.id]: message,
            [variableMessages.id]: messages,
          };
        }),
        tap({
          error: (error) => {
            if (error instanceof TimeoutError) {
              console.debug("ERROR: OpenAI API call timed out.");
            } else {
              console.debug("ERROR: OpenAI API call errored.", error);
            }
          },
        }),
        retry(2), // 3 attempts max
      );
    }
  });
}

function handleTextTemplateNode(
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

function handleHuggingFaceInferenceNode(
  data: V3HuggingFaceInferenceNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
): Observable<V3VariableValueLookUpDict> {
  return defer(() => {
    // Prepare inputs
    // ----------
    let variableOutput: NodeOutputVariable | null = null;

    const argsMap: { [key: string]: unknown } = {};

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
          variableOutput = variable;
        }
      }
    }

    invariant(variableOutput != null);

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
      HuggingFace.callInferenceApi(
        { apiToken: huggingFaceApiToken, model: data.model },
        argsMap["parameters"],
      ),
    ).pipe(
      map((result) => {
        if (result.isError) {
          if (result.data) {
            throw result.data;
          } else {
            throw new Error("Unknown error");
          }
        }

        invariant(variableOutput != null);

        variableValueMap[variableOutput.id] = result.data;

        return {
          [variableOutput.id]: result.data,
        };
      }),
    );
  });
}

function handleElevenLabsNode(
  data: V3ElevenLabsNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
): Observable<V3VariableValueLookUpDict> {
  return defer(() => {
    // Prepare inputs
    // ----------

    let variableAudio: NodeOutputVariable | null = null;

    const argsMap: { [key: string]: unknown } = {};

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
          variableAudio = variable;
        }
      }
    }

    invariant(variableAudio != null);

    // Execute logic
    // ----------

    const elevenLabsApiKey = useLocalStorageStore.getState().elevenLabsApiKey;
    if (!elevenLabsApiKey) {
      // console.error("Eleven Labs API key is missing");
      useSpaceStore.getState().setMissingElevenLabsApiKey(true);
      return throwError(() => new Error("Eleven Labs API key is missing"));
    }

    const text = argsMap["text"];

    invariant(typeof text === "string");

    return from(
      ElevenLabs.textToSpeech({
        text,
        voiceId: data.voiceId,
        apiKey: elevenLabsApiKey,
      }),
    ).pipe(
      map((result) => {
        if (result.isError) {
          throw result.data;
        }

        const url = URL.createObjectURL(result.data);

        invariant(variableAudio != null);

        variableValueMap[variableAudio.id] = url;

        return {
          [variableAudio.id]: url,
        };
      }),
    );
  });
}
