import { Info } from '@phosphor-icons/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipContent as TooltipData } from '@/lib/educational-tooltips'

interface InfoTooltipProps {
  content: TooltipData
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  iconSize?: number
}

export function InfoTooltip({ content, side = 'top', className, iconSize = 16 }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className={`inline-flex items-center justify-center text-muted-foreground hover:text-accent transition-colors ${className || ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Info size={iconSize} weight="fill" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs p-4 bg-card/95 backdrop-blur-xl border-border shadow-xl"
          sideOffset={8}
        >
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-card-foreground">{content.title}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{content.description}</p>
            {content.details && (
              <p className="text-xs leading-relaxed text-muted-foreground/80 pt-2 border-t border-border/50">
                {content.details}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
