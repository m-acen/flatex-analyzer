"use client";
import { useSearchParams } from "next/navigation";
import NextLink, { LinkProps } from "next/link";
import React from "react";

type Props = LinkProps & {
  children: React.ReactNode;
};

export function PreserveSearchParamsLink({ href, children, ...props }: Props) {
  const searchParams = useSearchParams();
  let mergedHref = href;

  if (typeof href === "string" && searchParams.size > 0) {
    mergedHref = href.includes("?")
      ? `${href}&${searchParams.toString()}`
      : `${href}?${searchParams.toString()}`;
  }

  return (
    <NextLink href={mergedHref} {...props}>
      {children}
    </NextLink>
  );
}
