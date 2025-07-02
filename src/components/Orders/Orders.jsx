import { useState } from 'react'
import { 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Button,
  Row,
  Col,
  Empty,
  Timeline
} from 'antd'
import { 
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

// Mock orders data - in real app this would come from your API
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 45.67,
    items: [
      { name: 'Fresh Bananas', quantity: 2, price: 2.99 },
      { name: 'Whole Milk', quantity: 1, price: 3.99 },
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'shipped',
    total: 23.45,
    items: [
      { name: 'Sourdough Bread', quantity: 1, price: 4.99 },
      { name: 'Cheddar Cheese', quantity: 1, price: 5.49 },
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: '2024-01-22',
    status: 'processing',
    total: 67.89,
    items: [
      { name: 'Ground Beef', quantity: 2, price: 8.99 },
      { name: 'Roma Tomatoes', quantity: 3, price: 1.99 },
    ]
  }
]

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'orange'
    case 'processing': return 'blue'
    case 'shipped': return 'purple'
    case 'delivered': return 'green'
    case 'cancelled': return 'red'
    default: return 'default'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return <ClockCircleOutlined />
    case 'processing': return <ClockCircleOutlined />
    case 'shipped': return <TruckOutlined />
    case 'delivered': return <CheckCircleOutlined />
    default: return <ClockCircleOutlined />
  }
}

export const Orders = () => {
  const [orders] = useState(mockOrders)

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Empty
          image={<ShoppingOutlined className="text-6xl text-gray-400" />}
          description={
            <Space direction="vertical">
              <Title level={3} type="secondary">No orders yet</Title>
              <Text type="secondary">Your order history will appear here</Text>
            </Space>
          }
          className="py-16"
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Title level={2} className="!mb-2">My Orders</Title>
        <Text type="secondary">Track and manage your orders</Text>
      </div>

      <Space direction="vertical" size="large" className="w-full">
        {orders.map(order => (
          <Card key={order.id} className="w-full">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Space direction="vertical" size="middle" className="w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <Title level={4} className="!mb-1">{order.orderNumber}</Title>
                      <Text type="secondary">Placed on {order.date}</Text>
                    </div>
                    <Tag 
                      color={getStatusColor(order.status)} 
                      icon={getStatusIcon(order.status)}
                      className="capitalize"
                    >
                      {order.status}
                    </Tag>
                  </div>

                  <div>
                    <Text strong>Items:</Text>
                    <div className="mt-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <Text>{item.name} x {item.quantity}</Text>
                          <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <Text strong>Total: ${order.total.toFixed(2)}</Text>
                    <Space>
                      <Button type="default" size="small">
                        View Details
                      </Button>
                      <Button type="primary" size="small">
                        Reorder
                      </Button>
                    </Space>
                  </div>
                </Space>
              </Col>

              <Col xs={24} lg={8}>
                <Card size="small" title="Order Timeline" className="h-full">
                  <Timeline
                    size="small"
                    items={[
                      {
                        color: 'green',
                        children: (
                          <div>
                            <Text strong>Order Placed</Text>
                            <br />
                            <Text type="secondary" className="text-xs">{order.date}</Text>
                          </div>
                        ),
                      },
                      {
                        color: order.status === 'pending' ? 'gray' : 'green',
                        children: (
                          <div>
                            <Text strong>Processing</Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              {order.status === 'pending' ? 'Pending' : 'Completed'}
                            </Text>
                          </div>
                        ),
                      },
                      {
                        color: ['shipped', 'delivered'].includes(order.status) ? 'green' : 'gray',
                        children: (
                          <div>
                            <Text strong>Shipped</Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              {['shipped', 'delivered'].includes(order.status) ? 'In transit' : 'Pending'}
                            </Text>
                          </div>
                        ),
                      },
                      {
                        color: order.status === 'delivered' ? 'green' : 'gray',
                        children: (
                          <div>
                            <Text strong>Delivered</Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              {order.status === 'delivered' ? 'Completed' : 'Pending'}
                            </Text>
                          </div>
                        ),
                      },
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        ))}
      </Space>
    </div>
  )
}