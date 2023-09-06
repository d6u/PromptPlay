import { VARIABLE_ROW_MARGIN_BOTTOM } from "./NodeInputVariableInput";
import {
  CONTAINER_BORDER,
  CONTAINER_PADDING,
  HANDLE_RADIUS,
  SECTION_MARGIN_BOTTOM,
  VARIABLE_LABEL_HEIGHT,
} from "./commonStyledComponents";

export function calculateInputHandleTop(i: number): number {
  return (
    CONTAINER_BORDER +
    CONTAINER_PADDING +
    VARIABLE_LABEL_HEIGHT +
    SECTION_MARGIN_BOTTOM +
    (VARIABLE_ROW_MARGIN_BOTTOM + VARIABLE_LABEL_HEIGHT) * i +
    VARIABLE_LABEL_HEIGHT / 2 -
    HANDLE_RADIUS / 2
  );
}

export function calculateOutputHandleBottom(i: number): number {
  return (
    CONTAINER_BORDER +
    CONTAINER_PADDING +
    (VARIABLE_ROW_MARGIN_BOTTOM + VARIABLE_LABEL_HEIGHT) * i +
    VARIABLE_LABEL_HEIGHT / 2 -
    HANDLE_RADIUS / 2
  );
}
