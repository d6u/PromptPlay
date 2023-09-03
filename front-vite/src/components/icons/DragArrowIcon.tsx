export default function DragArrowIcon({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <svg
      className={className}
      onClick={onClick}
      version="1.1"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m52.289 3.668 22.531 33.492c1.2578 1.8477-0.0625 4.2812-2.2734 4.2812h-12.199v52.484c0 1.9727-1.5977 3.5742-3.5742 3.5742h-13.539c-1.9727 0-3.5742-1.5977-3.5742-3.5742v-52.441h-12.199c-2.2109 0-3.5312-2.4375-2.293-4.2812l22.551-33.496c1.0781-1.6016 3.4531-1.6016 4.5703-0.039062z" />
    </svg>
  );
}
