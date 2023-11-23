export default function BlockPointerIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      version="1.1"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="a">
          <path d="m23 18.512h54v62.977h-54z" />
        </clipPath>
      </defs>
      <g clipPath="url(#a)">
        <path
          d="m23.504 24.609c-0.83984-3.3633 3.7852-7.6758 7.3594-5.4688l44.367 27.441c1.7891 0.94531 1.8906 5.7812 0 6.832l-44.367 27.441c-3.5742 2.207-8.1992-2.1016-7.3594-5.4688v-50.781z"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}
