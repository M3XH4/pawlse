import { Clock } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string
  iconClassName?: string
  showTime?: boolean
  showProgress?: boolean
  progress?: number
  label?: string
  size?: "xs" | "sm" | "md" | "lg"
  variant?: "inline" | "badge" | "icon"
}

/**
 * Dynamic Circular Progress Spinning Animation.
 * Spins continuously while rendering an SVG arc that dynamically expands
 * according to the progress percentage (0-100%).
 */
function CircularProgressSpinner({
  progress = 20,
  size = "sm",
  className,
}: {
  progress?: number
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}) {
  const radius = 9
  const circumference = 2 * Math.PI * radius // 56.55
  const normalizedProgress = Math.min(100, Math.max(8, progress))
  const strokeDashoffset = circumference - (circumference * normalizedProgress) / 100

  const sizeClasses = {
    xs: "size-3.5 stroke-[2.75]",
    sm: "size-4.5 stroke-[2.5]",
    md: "size-5.5 stroke-[2.25]",
    lg: "size-7 stroke-[2]",
  }

  return (
    <svg
      role="progressbar"
      aria-valuenow={Math.round(normalizedProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      viewBox="0 0 24 24"
      className={cn("animate-spin shrink-0 select-none", sizeClasses[size], className)}
    >
      {/* Background circular track */}
      <circle
        cx="12"
        cy="12"
        r={radius}
        fill="none"
        stroke="currentColor"
        className="opacity-25"
      />
      {/* Active progress arc that expands as it spins */}
      <circle
        cx="12"
        cy="12"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="opacity-95 transition-[stroke-dashoffset] duration-150 ease-out"
      />
    </svg>
  )
}

/**
 * Pure SVG Loader for places that strictly need an SVG icon element.
 */
function SpinnerIcon({ className, progress = 25, size = "sm" }: { className?: string; progress?: number; size?: "xs" | "sm" | "md" | "lg" }) {
  return (
    <CircularProgressSpinner
      progress={progress}
      size={size}
      className={className}
    />
  )
}

/**
 * Enhanced Spinner with spinning progress animation, live elapsed timer, and percentage indicator.
 * Displays elapsed time in tenths of a second so users know the app is actively working.
 */
function Spinner({
  className,
  iconClassName,
  showTime = true,
  showProgress = true,
  progress: customProgress,
  label,
  size = "sm",
  variant = "inline",
  ...props
}: SpinnerProps) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    startTimeRef.current = Date.now()
    const timer = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedMs(Date.now() - startTimeRef.current)
      }
    }, 80)

    return () => clearInterval(timer)
  }, [])

  const elapsedSeconds = `${(elapsedMs / 1000).toFixed(1)}s`

  // Calculate simulated progress if showProgress is enabled and no explicit progress passed
  const simulatedProgress = customProgress !== undefined 
    ? Math.min(100, Math.max(0, customProgress))
    : Math.min(94, Math.round(15 + 79 * (1 - Math.exp(-elapsedMs / 2500))))

  // Pure icon mode
  if (variant === "icon" || (!showTime && !showProgress && !label)) {
    return (
      <CircularProgressSpinner
        progress={simulatedProgress}
        size={size}
        className={cn(className, iconClassName)}
      />
    )
  }

  // Badge variant
  if (variant === "badge") {
    return (
      <span
        role="status"
        aria-label="Loading"
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium select-none shadow-2xs",
          className
        )}
        {...props}
      >
        <CircularProgressSpinner
          progress={simulatedProgress}
          size={size}
          className={cn("text-paw-orange", iconClassName)}
        />
        {label && <span>{label}</span>}
        {showProgress && (
          <span className="font-mono text-[11px] font-bold text-paw-orange">
            {Math.round(simulatedProgress)}%
          </span>
        )}
        {showTime && (
          <span className="inline-flex items-center gap-0.5 font-mono text-[11px] font-bold tabular-nums text-gray-600 dark:text-gray-300">
            <Clock className="size-2.5 opacity-60" />
            {elapsedSeconds}
          </span>
        )}
      </span>
    )
  }

  // Inline variant (default, optimized for buttons and inline contexts)
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center gap-1.5 shrink-0 select-none align-middle", className)}
      {...props}
    >
      <CircularProgressSpinner
        progress={simulatedProgress}
        size={size}
        className={iconClassName}
      />
      {label && <span className="text-xs font-semibold">{label}</span>}
      {showProgress && (
        <span className="font-mono text-[11px] font-bold tabular-nums opacity-90 px-1 py-0.5 rounded bg-black/10 dark:bg-white/15">
          {Math.round(simulatedProgress)}%
        </span>
      )}
      {showTime && (
        <span className="inline-flex items-center gap-0.5 font-mono text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15 opacity-90 shadow-2xs">
          <Clock className="size-2.5 opacity-70" />
          {elapsedSeconds}
        </span>
      )}
    </span>
  )
}

export { Spinner, SpinnerIcon, CircularProgressSpinner }
