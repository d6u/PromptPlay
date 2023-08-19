import { forwardRef } from "react";

const DragHandleIcon = forwardRef<
  SVGSVGElement,
  {
    className?: string;
    onClick?: () => void;
  }
>(function ({ className, onClick, ...rest }, ref) {
  return (
    <svg
      className={className}
      ref={ref}
      onClick={onClick}
      version="1.1"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <g>
        <path d="m41.367 15.188c0 5.6133-4.5508 10.164-10.164 10.164-5.6172 0-10.168-4.5508-10.168-10.164 0-5.6172 4.5508-10.168 10.168-10.168 5.6133 0 10.164 4.5508 10.164 10.164" />
        <path d="m40.391 15.188c-0.03125 3.7969-2.4219 7.3438-6.0352 8.6328-3.6641 1.3086-7.7539 0.17578-10.254-2.8047-2.4805-2.9609-2.7422-7.3438-0.74219-10.617 1.9648-3.2344 5.8789-4.9922 9.6016-4.2383 4.2852 0.87109 7.3984 4.6602 7.4297 9.0273 0.007813 1.2578 1.9648 1.2578 1.9531 0-0.03125-4.668-2.9688-8.8477-7.3438-10.477-4.3281-1.6016-9.4336-0.21484-12.352 3.3594-2.9688 3.6328-3.4297 8.8477-0.96875 12.891 2.4414 4.0156 7.2188 6.0547 11.805 5.1367 5.125-1.0352 8.8281-5.7227 8.8672-10.906 0-1.2656-1.9531-1.2656-1.9609-0.003906z" />
        <path d="m41.367 50c0 5.6133-4.5508 10.164-10.164 10.164-5.6172 0-10.168-4.5508-10.168-10.164s4.5508-10.164 10.168-10.164c5.6133 0 10.164 4.5508 10.164 10.164" />
        <path d="m40.391 50c-0.03125 3.7969-2.4219 7.3438-6.0352 8.6328-3.6641 1.3086-7.7539 0.17578-10.254-2.8047-2.4805-2.9609-2.7422-7.3438-0.74219-10.617 1.9648-3.2344 5.8789-4.9922 9.6016-4.2383 4.2852 0.87109 7.3984 4.6602 7.4297 9.0273 0.007813 1.2578 1.9648 1.2578 1.9531 0-0.03125-4.668-2.9688-8.8477-7.3438-10.477-4.3281-1.6016-9.4336-0.21484-12.352 3.3594-2.9688 3.6328-3.4297 8.8477-0.96875 12.891 2.4414 4.0156 7.2188 6.0547 11.805 5.1367 5.125-1.0352 8.8281-5.7227 8.8672-10.906 0-1.2617-1.9531-1.2617-1.9609-0.003906z" />
        <path d="m41.367 84.812c0 5.6172-4.5508 10.168-10.164 10.168-5.6172 0-10.168-4.5508-10.168-10.168 0-5.6133 4.5508-10.164 10.168-10.164 5.6133 0 10.164 4.5508 10.164 10.164" />
        <path d="m40.391 84.812c-0.03125 3.7969-2.4219 7.3438-6.0352 8.6328-3.6641 1.3086-7.7539 0.17578-10.254-2.8047-2.4805-2.9609-2.7422-7.3438-0.74219-10.617 1.9648-3.2344 5.8789-4.9922 9.6016-4.2383 4.2852 0.875 7.3984 4.6641 7.4297 9.0273 0.007813 1.2578 1.9648 1.2578 1.9531 0-0.03125-4.668-2.9688-8.8477-7.3438-10.477-4.3281-1.6016-9.4336-0.21484-12.352 3.3594-2.9688 3.6328-3.4297 8.8477-0.96875 12.891 2.4414 4.0156 7.2188 6.0547 11.805 5.1367 5.125-1.0352 8.8281-5.7227 8.8672-10.906 0-1.2617-1.9531-1.2617-1.9609-0.003906z" />
        <path d="m78.965 15.188c0 5.6133-4.5508 10.164-10.168 10.164-5.6133 0-10.164-4.5508-10.164-10.164 0-5.6172 4.5508-10.168 10.164-10.168 5.6172 0 10.168 4.5508 10.168 10.164" />
        <path d="m77.988 15.188c-0.03125 3.7969-2.4219 7.3438-6.0352 8.6328-3.6641 1.3086-7.7539 0.17578-10.254-2.8047-2.4805-2.9609-2.7422-7.3438-0.74219-10.617 1.9648-3.2344 5.8789-4.9922 9.6016-4.2383 4.2852 0.87109 7.4023 4.6602 7.4297 9.0273 0.007813 1.2578 1.9648 1.2578 1.9531 0-0.03125-4.668-2.9688-8.8477-7.3438-10.477-4.3281-1.6016-9.4336-0.21484-12.352 3.3594-2.9688 3.6328-3.4297 8.8477-0.96875 12.891 2.4414 4.0156 7.2188 6.0547 11.805 5.1367 5.125-1.0352 8.8281-5.7227 8.8672-10.906 0.003906-1.2656-1.9492-1.2656-1.9609-0.003906z" />
        <path d="m78.965 50c0 5.6133-4.5508 10.164-10.168 10.164-5.6133 0-10.164-4.5508-10.164-10.164s4.5508-10.164 10.164-10.164c5.6172 0 10.168 4.5508 10.168 10.164" />
        <path d="m77.988 50c-0.03125 3.7969-2.4219 7.3438-6.0352 8.6328-3.6641 1.3086-7.7539 0.17578-10.254-2.8047-2.4805-2.9609-2.7422-7.3438-0.74219-10.617 1.9648-3.2344 5.8789-4.9922 9.6016-4.2383 4.2852 0.87109 7.4023 4.6602 7.4297 9.0273 0.007813 1.2578 1.9648 1.2578 1.9531 0-0.03125-4.668-2.9688-8.8477-7.3438-10.477-4.3281-1.6016-9.4336-0.21484-12.352 3.3594-2.9688 3.6328-3.4297 8.8477-0.96875 12.891 2.4414 4.0156 7.2188 6.0547 11.805 5.1367 5.125-1.0352 8.8281-5.7227 8.8672-10.906 0.003906-1.2617-1.9492-1.2617-1.9609-0.003906z" />
        <path d="m78.965 84.812c0 5.6172-4.5508 10.168-10.168 10.168-5.6133 0-10.164-4.5508-10.164-10.168 0-5.6133 4.5508-10.164 10.164-10.164 5.6172 0 10.168 4.5508 10.168 10.164" />
        <path d="m77.988 84.812c-0.03125 3.7969-2.4219 7.3438-6.0352 8.6328-3.6641 1.3086-7.7539 0.17578-10.254-2.8047-2.4805-2.9609-2.7422-7.3438-0.74219-10.617 1.9648-3.2344 5.8789-4.9922 9.6016-4.2383 4.2852 0.875 7.4023 4.6641 7.4297 9.0273 0.007813 1.2578 1.9648 1.2578 1.9531 0-0.03125-4.668-2.9688-8.8477-7.3438-10.477-4.3281-1.6016-9.4336-0.21484-12.352 3.3594-2.9688 3.6328-3.4297 8.8477-0.96875 12.891 2.4414 4.0156 7.2188 6.0547 11.805 5.1367 5.125-1.0352 8.8281-5.7227 8.8672-10.906 0.003906-1.2617-1.9492-1.2617-1.9609-0.003906z" />
      </g>
    </svg>
  );
});

export default DragHandleIcon;
