'use client'

import { STYLE_PROMPTS } from '@/lib/style-prompts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function PromptsTab() {
  const styles = Object.entries(STYLE_PROMPTS).filter(([key]) => key !== 'intelligent')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {styles.map(([key, config]) => (
        <Card key={key} className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">{config.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 mb-3">
              {config.tabs.map(tab => (
                <Badge key={tab} variant="outline" className="text-xs">{tab}</Badge>
              ))}
            </div>
            {config.colors.length > 0 && (
              <div className="flex gap-1 mb-3">
                {config.colors.slice(0, 5).map((color, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Show Prompt</summary>
              <p className="mt-2 text-muted-foreground whitespace-pre-wrap bg-secondary rounded p-2 max-h-32 overflow-y-auto">{config.prompt || 'Uses tab default'}</p>
            </details>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
