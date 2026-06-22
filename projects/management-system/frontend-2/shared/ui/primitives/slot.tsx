import {
  HTMLAttributes,
  ReactElement,
  Ref,
  cloneElement,
  forwardRef,
  isValidElement,
} from "react";

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    }
  };
}

export const Slot = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
>(function Slot({ children, ...props }, forwardedRef) {
  if (!isValidElement(children)) {
    return null;
  }

  const child = children as ReactElement<{
    className?: string;
    ref?: Ref<HTMLElement>;
    style?: HTMLAttributes<HTMLElement>["style"];
  }>;

  return cloneElement(child, {
    ...props,
    ...child.props,
    ref: mergeRefs(forwardedRef, child.props.ref),
    style: { ...props.style, ...child.props.style },
    className: [props.className, child.props.className]
      .filter(Boolean)
      .join(" "),
  });
});

Slot.displayName = "Slot";
