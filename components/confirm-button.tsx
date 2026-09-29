"use client";

import { type ComponentProps } from "react";

export function ConfirmButton(props: ComponentProps<"button">) {
  const { children, ...rest } = props;
  return (
    <button
      {...rest}
      onClick={(event) => {
        if (!window.confirm("This action changes financial history. Continue?")) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
