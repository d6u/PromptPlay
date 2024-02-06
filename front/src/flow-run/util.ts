import { D } from '@mobily/ts-belt';

import {
  NodeAccountLevelTextFieldDefinition,
  NodeAllLevelConfigUnion,
  NodeConfig,
  NodeType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import { NodeLevelValidationError, ValidationErrorType } from './types';

export function getNodeAllLevelConfigOrValidationErrors(
  nodeConfigs: Readonly<Record<string, NodeConfig>>,
  getAccountLevelFieldValue: (nodeType: NodeType, fieldKey: string) => string,
): {
  nodeLevelErrorMessages?: NodeLevelValidationError[];
  nodeAllLevelConfigs?: Readonly<Record<string, NodeAllLevelConfigUnion>>;
} {
  const errorMessages: NodeLevelValidationError[] = [];

  const nodeAllLevelConfigs: Readonly<Record<string, NodeAllLevelConfigUnion>> =
    D.mapWithKey(nodeConfigs, (key, instanceConfig) => {
      const nodeDefinition = getNodeDefinitionForNodeTypeName(
        instanceConfig.type,
      );

      const afds = nodeDefinition.accountLevelConfigFieldDefinitions as
        | Record<string, NodeAccountLevelTextFieldDefinition>
        | undefined;

      // TODO: Add validation to ensure typesafety, this cannot be done
      // in TypeScript due to the dynamic types used.
      if (!afds) {
        return instanceConfig as NodeAllLevelConfigUnion;
      }

      const partialConfig = D.mapWithKey(afds, (key, fd) => {
        const value = getAccountLevelFieldValue(instanceConfig.type, key);

        if (!fd.schema) {
          return value;
        }

        const { error } = fd.schema.validate(value);

        if (!error) {
          return value;
        }

        error.details.forEach((detail) => {
          errorMessages.push({
            type: ValidationErrorType.NodeLevel,
            nodeId: instanceConfig.nodeId,
            errorMessage: detail.message,
          });
        });

        return null;
      });

      return {
        ...instanceConfig,
        ...partialConfig,
      } as NodeAllLevelConfigUnion;
    });

  if (errorMessages.length) {
    return { nodeLevelErrorMessages: errorMessages };
  }

  return { nodeAllLevelConfigs };
}
