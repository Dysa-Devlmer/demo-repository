import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function RecentOrders() {
  const orders = [
    {
      id: 1,
      customer: 'María García',
      total: '$45.99',
      status: 'Completado',
      time: '5 min ago'
    },
    {
      id: 2,
      customer: 'Juan Pérez',
      total: '$32.50',
      status: 'Preparando',
      time: '12 min ago'
    },
    {
      id: 3,
      customer: 'Ana López',
      total: '$78.25',
      status: 'Entregado',
      time: '18 min ago'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes Recientes</CardTitle>
        <CardDescription>
          Las últimas órdenes procesadas por el chatbot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{order.customer}</p>
                <p className="text-xs text-muted-foreground">{order.time}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{order.total}</p>
                <p className="text-xs text-green-600">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}