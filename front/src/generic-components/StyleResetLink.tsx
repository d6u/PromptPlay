import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

const StyleResetLink = styled(Link)`
  text-decoration: none;
  color: initial;
  &:visited {
    color: initial;
  }
`;

export default StyleResetLink;
