import { D } from '@mobily/ts-belt';

import {
  NodeAccountLevelTextFieldDefinition,
  NodeAllLevelConfigUnion,
  NodeConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import { ValidationError, ValidationErrorType } from './event-types';
import { GetAccountLevelFieldValueFunction } from './run-param-types';

export function getNodeAllLevelConfigOrValidationErrors(
  nodeConfigs: Readonly<Record<string, NodeConfig>>,
  getAccountLevelFieldValue: GetAccountLevelFieldValueFunction,
):
  | {
      nodeAllLevelConfigs?: never;
      errors: ValidationError[];
    }
  | {
      nodeAllLevelConfigs: Readonly<Record<string, NodeAllLevelConfigUnion>>;
      errors?: never;
    } {
  const validationErrors: ValidationError[] = [];

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

        const result = fd.schema.safeParse(value);

        if (result.success) {
          return value;
        }

        result.error.errors.forEach((issue) => {
          validationErrors.push({
            type: ValidationErrorType.FieldLevel,
            nodeId: instanceConfig.nodeId,
            fieldKey: key,
            message: issue.message,
          });
        });

        return null;
      });

      return {
        ...instanceConfig,
        ...partialConfig,
      } as NodeAllLevelConfigUnion;
    });

  if (validationErrors.length) {
    return { errors: validationErrors };
  } else {
    return { nodeAllLevelConfigs };
  }
}
