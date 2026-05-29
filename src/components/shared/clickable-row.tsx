"use client";
// clickable-row.tsx — <tr> clickeable para server components que no pueden usar useRouter

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ClickableRow({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(href)}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </tr>
  );
}
