import { AttributeValue } from "@aws-sdk/client-dynamodb";

export function buildUpdateExpressionFieldsFromItem(
  item: Record<string, AttributeValue>,
): {
  updateExpression: string;
  expressionAttributeNames: Record<string, string>;
  expressionAttributeValues: Record<string, AttributeValue>;
} {
  const updateExpressionParts = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, AttributeValue> = {};

  for (const key of Object.keys(item)) {
    updateExpressionParts.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = item[key] as AttributeValue;
  }

  const updateExpression = "SET " + updateExpressionParts.join(", ");

  return {
    updateExpression,
    expressionAttributeNames,
    expressionAttributeValues,
  };
}
