import { HANDLE_HEIGHT } from '../../../../common-react-flow/handles/common';
import { BACKDROP_PADDING } from '../../../../common-react-flow/ui-constants';
import {
  TITLE_HEIGHT,
  TITLE_MARGIN_BOTTOM,
  TITLE_PADDING_TOP,
} from './HeaderSection';
import { ROW_MARGIN_TOP } from './NodeInputModifyRow';
import { VARIABLE_LABEL_HEIGHT } from './NodeOutputRow';
import { SECTION_PADDING_BOTTOM } from './node-common';

const TITLE_LENGTH = TITLE_PADDING_TOP + TITLE_HEIGHT + TITLE_MARGIN_BOTTOM;
const BUTTON_HEIGHT = 32;
const BUTTON_MARGIN_BOTTOM = 5;

export function calculateInputHandleTop(i: number): number {
  const fixHeight =
    BACKDROP_PADDING + TITLE_LENGTH + BUTTON_HEIGHT + BUTTON_MARGIN_BOTTOM;
  const center = VARIABLE_LABEL_HEIGHT / 2 - HANDLE_HEIGHT / 2;

  return fixHeight + (ROW_MARGIN_TOP + VARIABLE_LABEL_HEIGHT) * i + center;
}

export function calculateOutputHandleBottom(i: number): number {
  const fixHeight = BACKDROP_PADDING + SECTION_PADDING_BOTTOM;
  const center = VARIABLE_LABEL_HEIGHT / 2 - HANDLE_HEIGHT / 2;
  return fixHeight + (ROW_MARGIN_TOP + VARIABLE_LABEL_HEIGHT) * i + center;
}
