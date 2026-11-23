"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-[#05070f]/75 backdrop-blur-[10px]", className)}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "passport-phones-hero fixed left-1/2 top-1/2 z-50 h-fit max-h-[min(90vh,920px)] w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[24px] border border-white/10 text-white outline-none",
          "bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,#1a2438_0%,#0a0e1c_58%,#05070f_100%)]",
          "shadow-[0_40px_100px_rgba(0,0,0,0.55)]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 z-20 rounded-full bg-black/35 p-1.5 text-white/70 backdrop-blur-sm transition hover:bg-black/50 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-0 pt-6 pr-12", className)} {...props} />;
}

export function DialogEyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs uppercase tracking-[0.14em] text-white/45", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "mt-1.5 font-semibold text-white",
        "text-[clamp(22px,2.8vw,28px)] leading-none tracking-[-0.045em]",
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn(
        "mt-1.5 text-[13px] font-normal leading-snug tracking-tight text-white/50",
        className,
      )}
      {...props}
    />
  );
}

/** Prefer fitting content — avoid scroll unless a panel opts in. */
export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-hidden px-6 pb-5 pt-3", className)} {...props} />;
}
