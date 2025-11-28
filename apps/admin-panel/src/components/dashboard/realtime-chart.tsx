import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function RealtimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad en Tiempo Real</CardTitle>
        <CardDescription>
          Conversaciones por hora en las últimas 24 horas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          <p>Gráfico de actividad en tiempo real</p>
          <p className="text-xs">Chart.js integration pendiente</p>
        </div>
      </CardContent>
    </Card>
  )
}