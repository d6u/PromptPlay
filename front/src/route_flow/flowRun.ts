import mustache from "mustache";
import { adjust, append, assoc, pipe } from "ramda";
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
import * as OpenAI from "../integrations/openai";
import { usePersistStore, useStore } from "../state/zustand";
import { NodeAugment } from "./flowState";
import {
  ChatGPTChatCompletionNodeConfig,
  ChatGPTMessageNodeConfig,
  InputNodeConfig,
  JavaScriptFunctionNodeConfig,
  LocalEdge,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeOutputItem,
  NodeType,
  OutputNodeConfig,
} from "./flowTypes";

export enum RunEventType {
  NodeConfigChange = "NodeConfigChange",
  NodeAugmentChange = "NodeAugmentChange",
}

type RunEvent = NodeConfigChangeEvent | NodeAugmentChangeEvent;

type NodeConfigChangeEvent = {
  type: RunEventType.NodeConfigChange;
  nodeId: NodeID;
  nodeChange: Partial<NodeConfig>;
};

type NodeAugmentChangeEvent = {
  type: RunEventType.NodeAugmentChange;
  nodeId: NodeID;
  augmentChange: Partial<NodeAugment>;
};

export function run(
  edges: LocalEdge[],
  nodeConfigs: NodeConfigs
): Observable<RunEvent> {
  const nodeGraph: Record<NodeID, NodeID[]> = {};
  const nodeIndegree: Record<NodeID, number> = {};

  for (const nodeId of Object.keys(nodeConfigs)) {
    nodeGraph[nodeId] = [];
    nodeIndegree[nodeId] = 0;
  }

  const inputIdToOutputIdMap: Record<string, string | undefined> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputIdToValueMap: Record<string, any> = {};

  for (const edge of edges) {
    // nodeGraph[edge.source] contains duplicate edge.target,
    // because there can be multiple edges between two nodes.
    //
    // This is expected since we are reducing indegree the equial number of
    // times in the while loop below.
    nodeGraph[edge.source].push(edge.target);
    nodeIndegree[edge.target] += 1;

    inputIdToOutputIdMap[edge.targetHandle!] = edge.sourceHandle!;
  }

  const sub = new BehaviorSubject(0);

  const obs = new Observable<{ nodeId: NodeID; nodeConfig: NodeConfig }>(
    (subscriber) => {
      const queue: string[] = [];

      for (const [id, count] of Object.entries(nodeIndegree)) {
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
          handleInputNode(nodeConfig, outputIdToValueMap);
          obs = EMPTY;
          break;
        }
        case NodeType.OutputNode: {
          obs = handleOutputNode(
            nodeConfig,
            inputIdToOutputIdMap,
            outputIdToValueMap
          ).pipe(
            map((change) => ({
              type: RunEventType.NodeConfigChange,
              nodeId,
              nodeChange: change,
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
            map((change) => ({
              type: RunEventType.NodeConfigChange,
              nodeId,
              nodeChange: change,
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
            map((change) => ({
              type: RunEventType.NodeConfigChange,
              nodeId,
              nodeChange: change,
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
            map<Partial<ChatGPTChatCompletionNodeConfig>, RunEvent>(
              (change) => ({
                type: RunEventType.NodeConfigChange,
                nodeId,
                nodeChange: change,
              })
            )
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

function handleInputNode(
  data: InputNodeConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputIdToValueMap: { [key: string]: any }
) {
  for (const output of data.outputs) {
    outputIdToValueMap[output.id] = output.value;
  }
}

function handleOutputNode(
  data: OutputNodeConfig,
  inputIdToOutputIdMap: { [key: string]: string | undefined },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputIdToValueMap: { [key: string]: any }
): Observable<Partial<OutputNodeConfig>> {
  let inputs = data.inputs;

  for (const [i, input] of data.inputs.entries()) {
    const outputId = inputIdToOutputIdMap[input.id];

    if (outputId) {
      const outputValue = outputIdToValueMap[outputId];
      inputs = adjust<NodeOutputItem>(
        i,
        assoc("value", outputValue ?? null)
      )(inputs);
    } else {
      inputs = adjust<NodeOutputItem>(i, assoc("value", null))(inputs);
    }
  }

  return of({ inputs });
}

function handleJavaScriptFunctionNode(
  data: JavaScriptFunctionNodeConfig,
  inputIdToOutputIdMap: { [key: string]: string | undefined },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputIdToValueMap: { [key: string]: any }
): Observable<Partial<JavaScriptFunctionNodeConfig>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pairs: Array<[string, any]> = [];

  for (const input of data.inputs) {
    const outputId = inputIdToOutputIdMap[input.id];

    if (outputId) {
      const outputValue = outputIdToValueMap[outputId];
      pairs.push([input.name, outputValue ?? null]);
    } else {
      pairs.push([input.name, null]);
    }
  }

  const fn = Function(...pairs.map((pair) => pair[0]), data.javaScriptCode);

  const result = fn(...pairs.map((pair) => pair[1]));

  outputIdToValueMap[data.outputs[0].id] = result;

  return of({
    outputs: adjust<NodeOutputItem>(0, assoc("value", result))(data.outputs),
  });
}

function handleChatGPTMessageNode(
  data: ChatGPTMessageNodeConfig,
  inputIdToOutputIdMap: { [key: string]: string | undefined },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputIdToValueMap: { [key: string]: any }
): Observable<Partial<ChatGPTMessageNodeConfig>> {
  // Prepare inputs
  // ----------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const argsMap: Record<string, any> = {};

  for (const input of data.inputs) {
    const outputId = inputIdToOutputIdMap[input.id];

    if (outputId) {
      const outputValue = outputIdToValueMap[outputId];
      argsMap[input.name] = outputValue ?? null;
    } else {
      argsMap[input.name] = null;
    }
  }

  // Execute logic
  // ----------

  let messages = argsMap["message_list"] ?? [];

  const message = {
    role: data.role,
    content: mustache.render(data.content, argsMap),
  };

  messages = append(message, messages);

  // Update outputs
  // ----------

  outputIdToValueMap[data.outputs[0].id] = message;
  outputIdToValueMap[data.outputs[1].id] = messages;

  return of({
    outputs: pipe(
      adjust<NodeOutputItem>(0, assoc("value", message)),
      adjust<NodeOutputItem>(1, assoc("value", messages))
    )(data.outputs),
  });
}

function handleChatGPTChatNode(
  data: ChatGPTChatCompletionNodeConfig,
  inputIdToOutputIdMap: { [key: string]: string | undefined },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputIdToValueMap: { [key: string]: any }
): Observable<Partial<ChatGPTChatCompletionNodeConfig>> {
  // Prepare inputs
  // ----------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const argsMap: { [key: string]: any } = {};

  for (const input of data.inputs) {
    const outputId = inputIdToOutputIdMap[input.id];

    if (outputId) {
      const outputValue = outputIdToValueMap[outputId];
      argsMap[input.name] = outputValue ?? null;
    } else {
      argsMap[input.name] = null;
    }
  }

  // Execute logic
  // ----------

  const openAiApiKey = usePersistStore.getState().openAiApiKey;
  if (!openAiApiKey) {
    // console.error("OpenAI API key is missing");
    useStore.getState().setMissingOpenAiApiKey(true);
    return throwError(() => new Error("OpenAI API key is missing"));
  }

  let messages = argsMap["messages"] ?? [];
  let role = "assistant";
  let content = "";

  const obs1 = from(
    OpenAI.getStreamingCompletion({
      apiKey: openAiApiKey,
      model: data.model,
      messages,
      temperature: data.temperature,
      stop: data.stop,
    })
  ).pipe(
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
        outputs: pipe(
          adjust<NodeOutputItem>(0, assoc("value", content)),
          adjust<NodeOutputItem>(1, assoc("value", message)),
          adjust<NodeOutputItem>(2, assoc("value", append(message, messages)))
        )(data.outputs),
      };
    })
  );

  return concat(
    obs1,
    defer(() => {
      const message = { role, content };
      messages = append(message, messages);

      outputIdToValueMap[data.outputs[0].id] = content;
      outputIdToValueMap[data.outputs[1].id] = message;
      outputIdToValueMap[data.outputs[2].id] = messages;

      return of({
        outputs: pipe(
          adjust<NodeOutputItem>(0, assoc("value", content)),
          adjust<NodeOutputItem>(1, assoc("value", message)),
          adjust<NodeOutputItem>(2, assoc("value", messages))
        )(data.outputs),
      });
    })
  );
}
