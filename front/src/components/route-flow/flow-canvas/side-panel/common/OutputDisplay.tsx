import { ReactNode } from 'react';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

export default function OutputDisplay(props: Props) {
  let content: ReactNode;

  if (typeof props.value === 'string') {
    content = props.value;
  } else {
    content = JSON.stringify(props.value, null, 2);
  }

  return content;
}
