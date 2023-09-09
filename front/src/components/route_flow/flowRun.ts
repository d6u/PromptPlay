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
} from "rxjs";
import * as OpenAI from "../../llm/open-ai";
import { usePersistStore, useStore } from "../../state/zustand";
import {
  ChatGPTChatCompletionNodeConfig,
  ChatGPTMessageNodeConfig,
  InputNodeConfig,
  JavaScriptFunctionNodeConfig,
  LocalEdge,
  NodeAugment,
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
  FlowConfigChange = "FlowConfigChange",
}

type RunEvent =
  | NodeConfigChangeEvent
  | NodeAugmentChangeEvent
  | FlowConfigChangeEvent;

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

type FlowConfigChangeEvent = {
  type: RunEventType.FlowConfigChange;
  outputValueMap: OutputValueMap;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OutputValueMap = Record<string, any>;

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

  let finalResult: OutputValueMap = {};

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
          const result = handleOutputNode(
            nodeConfig,
            inputIdToOutputIdMap,
            outputIdToValueMap
          );
          finalResult = { ...finalResult, ...result };
          obs = of({
            type: RunEventType.FlowConfigChange,
            outputValueMap: finalResult,
          });
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
            ),
            startWith<RunEvent>({
              type: RunEventType.NodeAugmentChange,
              nodeId,
              augmentChange: { isRunning: true },
            }),
            endWith<RunEvent>({
              type: RunEventType.NodeAugmentChange,
              nodeId,
              augmentChange: { isRunning: false },
            })
          );
          break;
        }
      }

      return obs.pipe(
        tap({
          complete() {
            sub.next(0);
          },
        })
      );
    }),
    tap({
      error(e) {
        sub.complete();
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};

  for (const input of data.inputs) {
    const outputId = inputIdToOutputIdMap[input.id];

    if (outputId) {
      const outputValue = outputIdToValueMap[outputId];
      result[input.id] = outputValue ?? null;
    } else {
      result[input.id] = null;
    }
  }

  return result;
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
    console.error("OpenAI API key is missing");
    useStore.getState().setMissingOpenAiApiKey(true);
    return EMPTY;
  }

  let messages = argsMap["messages"] ?? [];

  return from(
    OpenAI.getNonStreamingCompletion({
      apiKey: openAiApiKey,
      model: data.model,
      temperature: data.temperature,
      stop: data.stop,
      messages,
    })
  ).pipe(
    map((result) => {
      if (result.isError) {
        console.error(result.data.error.message);

        // Update outputs
        // ----------

        outputIdToValueMap[data.outputs[0].id] = null;
        outputIdToValueMap[data.outputs[1].id] = null;
        outputIdToValueMap[data.outputs[2].id] = null;

        return {
          outputs: pipe(
            adjust<NodeOutputItem>(0, assoc("value", null)),
            adjust<NodeOutputItem>(1, assoc("value", null)),
            adjust<NodeOutputItem>(2, assoc("value", null))
          )(data.outputs),
        };
      } else {
        const message = result.data.choices[0].message;
        const content = message.content;
        messages = append(message, messages);

        // Update outputs
        // ----------

        outputIdToValueMap[data.outputs[0].id] = content;
        outputIdToValueMap[data.outputs[1].id] = message;
        outputIdToValueMap[data.outputs[2].id] = messages;

        return {
          outputs: pipe(
            adjust<NodeOutputItem>(0, assoc("value", content)),
            adjust<NodeOutputItem>(1, assoc("value", message)),
            adjust<NodeOutputItem>(2, assoc("value", messages))
          )(data.outputs),
        };
      }
    })
  );
}
