import { Link } from "react-router-dom";
import styled from "styled-components";

const StyleResetLink = styled(Link)`
  text-decoration: none;
  color: initial;
  &:visited {
    color: initial;
  }
`;

export default StyleResetLink;
