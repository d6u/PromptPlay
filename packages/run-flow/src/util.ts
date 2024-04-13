import { D } from '@mobily/ts-belt';

import {
  NodeAccountLevelTextFieldDefinition,
  NodeAllLevelConfigUnion,
  NodeConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import {
  ValidationErrorType,
  type AccountLevelValidationError,
} from './event-types';
import { GetAccountLevelFieldValueFunction } from './run-param-types';

type Error = {
  nodeAllLevelConfigs?: never;
  errors: AccountLevelValidationError[];
};

type Success = {
  nodeAllLevelConfigs: Readonly<Record<string, NodeAllLevelConfigUnion>>;
  errors?: never;
};

export function getNodeAllLevelConfigOrValidationErrors(
  nodeConfigs: Readonly<Record<string, NodeConfig>>,
  getAccountLevelFieldValue: GetAccountLevelFieldValueFunction,
): Error | Success {
  const validationErrors: AccountLevelValidationError[] = [];

  const nodeAllLevelConfigs = D.map(nodeConfigs, (nodeConfig) => {
    const nodeDefinition = getNodeDefinitionForNodeTypeName(nodeConfig.type);

    const accountLevelConfigFieldDefinitions =
      nodeDefinition.accountLevelConfigFieldDefinitions as
        | Record<string, NodeAccountLevelTextFieldDefinition>
        | undefined;

    // TODO: Add validation to ensure typesafety, this cannot be done
    // in TypeScript due to the dynamic types used.
    if (!accountLevelConfigFieldDefinitions) {
      return nodeConfig as NodeAllLevelConfigUnion;
    }

    const accountLevelConfig = D.mapWithKey(
      accountLevelConfigFieldDefinitions,
      (fieldKey, accountLevelConfigFieldDefinition) => {
        const fieldValue = getAccountLevelFieldValue(nodeConfig.type, fieldKey);

        if (!accountLevelConfigFieldDefinition.schema) {
          return fieldValue;
        }

        const result =
          accountLevelConfigFieldDefinition.schema.safeParse(fieldValue);

        if (result.success) {
          return fieldValue;
        }

        result.error.errors.forEach((issue) => {
          validationErrors.push({
            type: ValidationErrorType.AccountLevel,
            nodeType: nodeConfig.type,
            fieldKey: fieldKey,
            message: issue.message,
          });
        });

        return null;
      },
    );

    return {
      ...nodeConfig,
      ...accountLevelConfig,
    } as NodeAllLevelConfigUnion;
  });

  if (validationErrors.length) {
    return { errors: validationErrors };
  } else {
    return { nodeAllLevelConfigs };
  }
}
