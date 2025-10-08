import { splitProps, type JSX } from "solid-js";

import { cn } from "~/lib/utils";

type SkeletonProps = {
  class?: string | undefined;
  style?: JSX.CSSProperties | undefined;
};

const Skeleton = (props: SkeletonProps) => {
  const [local, others] = splitProps(props, ["class", "style"]);
  return (
    <div
      class={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        local.class
      )}
      style={{
        "background-color": "var(--color-bg-secondary, rgba(0, 0, 0, 0.1))",
        ...local.style,
      }}
      {...others}
    />
  );
};

export { Skeleton };
