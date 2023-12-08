import { AttributeValue } from "@aws-sdk/client-dynamodb";

export function undefinedThrow<T>(
  val: T | undefined,
  msg: string | null = null,
): T {
  if (val !== undefined) {
    return val;
  }

  if (msg != null) {
    throw new Error(msg);
  } else {
    throw new Error("Unexpected undefined value");
  }
}

export function dateToNumber(date: Date): number {
  return date.getTime();
}

export function numberToDate(num: number): Date {
  return new Date(num);
}

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
