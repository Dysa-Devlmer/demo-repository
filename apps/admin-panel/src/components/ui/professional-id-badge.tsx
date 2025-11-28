"use client";

import { useState } from "react";
import { Badge } from "./badge";
import { Hash, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfessionalIdBadgeProps {
  id: string;
  variant?: "default" | "compact";
  className?: string;
  showCopyIcon?: boolean;
  showTooltip?: boolean;
}

/**
 * Badge profesional para mostrar IDs formateados
 *
 * @example
 * // ID de usuario
 * <ProfessionalIdBadge id="CBDYSA-USR-000001" />
 *
 * // ID de orden compacto
 * <ProfessionalIdBadge id="CBDYSA-ORD-000042" variant="compact" />
 */
export function ProfessionalIdBadge({
  id,
  variant = "default",
  className,
  showCopyIcon = true,
  showTooltip = true,
}: ProfessionalIdBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);

    toast.success("ID copiado al portapapeles", {
      description: id,
      icon: <CheckCircle2 className="h-4 w-4" />,
      duration: 2000,
    });

    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === "compact") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "font-mono text-xs cursor-pointer hover:shadow-sm transition-all",
          className
        )}
        onClick={handleCopy}
      >
        <span className="text-blue-600 dark:text-blue-400 font-medium">{id}</span>
      </Badge>
    );
  }

  return (
    <div className="group relative">
      <Badge
        variant="outline"
        className={cn(
          "font-mono text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200",
          "dark:from-blue-950 dark:to-purple-950 dark:border-blue-800",
          "hover:shadow-md transition-all cursor-pointer px-3 py-1",
          className
        )}
        onClick={handleCopy}
      >
        <div className="flex items-center gap-1.5">
          <Hash className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-semibold">
            {id}
          </span>
          {showCopyIcon && (
            copied ? (
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )
          )}
        </div>
      </Badge>
      {showTooltip && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          Click para copiar
        </div>
      )}
    </div>
  );
}

/**
 * Badge minimalista para IDs
 */
export function MinimalIdBadge({ id, className }: { id: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-xs text-muted-foreground", className)}
    >
      {id}
    </Badge>
  );
}

/**
 * Badge con estilo de etiqueta colorida
 */
export function ColoredIdBadge({
  id,
  color = "blue",
  className,
}: {
  id: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  className?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700",
    green: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700",
    purple: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700",
    orange: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700",
    red: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-xs font-semibold", colorClasses[color], className)}
    >
      <Hash className="h-3 w-3 mr-1 inline" />
      {id}
    </Badge>
  );
}
