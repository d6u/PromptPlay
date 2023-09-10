import styled from "@emotion/styled";

const Svg = styled.svg`
  width: 20px;
  height: 20px;
  fill: #00b3ff;
`;

export default function VariableMapArrow() {
  return (
    <Svg version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path
        d="m64.461 28.57 0.12109 14.641h-53.129v13.34h53.129v14.879l23.965-21.254z"
        fillRule="evenodd"
      />
    </Svg>
  );
}
