import { A } from "@mobily/ts-belt";
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
import { NodeAugment } from "../components/route-flow/store/types-local-state";
import * as ElevenLabs from "../integrations/eleven-labs";
import * as HuggingFace from "../integrations/hugging-face";
import * as OpenAI from "../integrations/openai";
import {
  ChatGPTChatCompletionNodeConfig,
  ChatGPTMessageNodeConfig,
  ElevenLabsNodeConfig,
  HuggingFaceInferenceNodeConfig,
  JavaScriptFunctionNodeConfig,
  LocalEdge,
  NodeID,
  NodeInputID,
  NodeOutputID,
  NodeType,
  OutputNodeConfig,
  TextTemplateNodeConfig,
  VariableValueMap,
} from "../models/v2-flow-content-types";
import { V3NodeConfig, V3NodeConfigs } from "../models/v3-flow-content-types";
import { useLocalStorageStore, useSpaceStore } from "../state/appState";

const AsyncFunction = async function () {}.constructor;

export enum RunEventType {
  VariableValueChanges = "VariableValueChanges",
  NodeAugmentChange = "NodeAugmentChange",
  RunStatusChange = "RunStatusChange",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FlowInputVariableMap = Record<NodeOutputID, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FlowOutputVariableMap = Record<NodeInputID, any>;

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
  edges: LocalEdge[],
  nodeConfigs: V3NodeConfigs,
  inputVariableMap: FlowInputVariableMap,
  useStreaming: boolean = false,
): Observable<RunEvent> {
  const nodeGraph: Record<NodeID, NodeID[]> = {};
  const nodeIndegree: Record<NodeID, number> = {};

  for (const nodeId of Object.keys(nodeConfigs) as NodeID[]) {
    nodeGraph[nodeId] = [];
    nodeIndegree[nodeId] = 0;
  }

  const inputIdToOutputIdMap: Record<NodeInputID, NodeOutputID | undefined> =
    {};
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

      switch (nodeConfig.nodeType) {
        case NodeType.InputNode: {
          obs = EMPTY;
          break;
        }
        case NodeType.OutputNode: {
          obs = handleOutputNode(
            nodeConfig,
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
  data: OutputNodeConfig,
  inputIdToOutputIdMap: Record<NodeInputID, NodeOutputID | undefined>,
  variableValueMap: VariableValueMap,
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
  inputIdToOutputIdMap: Record<NodeInputID, NodeOutputID | undefined>,
  variableValueMap: VariableValueMap,
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
      data.javaScriptCode,
    );

    const result = await fn(...pairs.map((pair) => pair[1]));

    variableValueMap[data.outputs[0].id] = result;

    return { [data.outputs[0].id]: result };
  });
}

function handleChatGPTMessageNode(
  data: ChatGPTMessageNodeConfig,
  inputIdToOutputIdMap: Record<NodeInputID, NodeOutputID | undefined>,
  variableValueMap: VariableValueMap,
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
  inputIdToOutputIdMap: Record<NodeInputID, NodeOutputID | undefined>,
  variableValueMap: VariableValueMap,
  useStreaming: boolean,
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

    const options = {
      apiKey: openAiApiKey,
      model: data.model,
      messages,
      temperature: data.temperature,
      stop: data.stop,
      seed: data.seed,
      responseFormat: data.responseFormat,
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

            return {
              [data.outputs[0].id]: content,
              [data.outputs[1].id]: message,
              [data.outputs[2].id]: A.append(messages, message),
            };
          }),
        ),
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

          variableValueMap[data.outputs[0].id] = content;
          variableValueMap[data.outputs[1].id] = message;
          variableValueMap[data.outputs[2].id] = messages;

          return {
            [data.outputs[0].id]: content,
            [data.outputs[1].id]: message,
            [data.outputs[2].id]: messages,
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
  data: TextTemplateNodeConfig,
  inputIdToOutputIdMap: Record<NodeInputID, NodeOutputID | undefined>,
  variableValueMap: VariableValueMap,
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
  inputIdToOutputIdMap: Record<NodeInputID, NodeOutputID | undefined>,
  variableValueMap: VariableValueMap,
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

        variableValueMap[data.outputs[0].id] = result.data;

        return {
          [data.outputs[0].id]: result.data,
        };
      }),
    );
  });
}

function handleElevenLabsNode(
  data: ElevenLabsNodeConfig,
  inputIdToOutputIdMap: Record<NodeInputID, NodeOutputID | undefined>,
  variableValueMap: VariableValueMap,
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

    const elevenLabsApiKey = useLocalStorageStore.getState().elevenLabsApiKey;
    if (!elevenLabsApiKey) {
      // console.error("Eleven Labs API key is missing");
      useSpaceStore.getState().setMissingElevenLabsApiKey(true);
      return throwError(() => new Error("Eleven Labs API key is missing"));
    }

    return from(
      ElevenLabs.textToSpeech({
        text: argsMap["text"],
        voiceId: data.voiceId,
        apiKey: elevenLabsApiKey,
      }),
    );
  }).pipe(
    map((result) => {
      if (result.isError) {
        throw result.data;
      }

      const url = URL.createObjectURL(result.data);

      variableValueMap[data.outputs[0].id] = url;

      return {
        [data.outputs[0].id]: url,
      };
    }),
  );
}
