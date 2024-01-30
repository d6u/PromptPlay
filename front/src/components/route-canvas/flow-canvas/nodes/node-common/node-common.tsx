import styled from '@emotion/styled';
import IconGear from '../../../../icons/IconGear';

export const SECTION_PADDING_BOTTOM = 10;

export const Section = styled.div`
  padding: 0 10px ${SECTION_PADDING_BOTTOM}px;
`;

export const SmallSection = styled(Section)`
  padding: 0 10px 5px;
  display: flex;
  gap: 5px;
`;

export const StyledIconGear = styled(IconGear)`
  width: 20px;
  fill: #636b74;
`;
