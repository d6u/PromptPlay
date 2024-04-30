import type { SVGProps } from 'react';

function IconThreeDots(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      version="1.1"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <path d="m62.5 50c0 6.9023-5.5977 12.5-12.5 12.5s-12.5-5.5977-12.5-12.5 5.5977-12.5 12.5-12.5 12.5 5.5977 12.5 12.5" />
        <path d="m31.25 50c0 6.9023-5.5977 12.5-12.5 12.5s-12.5-5.5977-12.5-12.5 5.5977-12.5 12.5-12.5 12.5 5.5977 12.5 12.5" />
        <path d="m93.75 50c0 6.9023-5.5977 12.5-12.5 12.5s-12.5-5.5977-12.5-12.5 5.5977-12.5 12.5-12.5 12.5 5.5977 12.5 12.5" />
      </g>
    </svg>
  );
}

export default IconThreeDots;
