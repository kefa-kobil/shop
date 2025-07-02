import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Typography, 
  Space,
  Table,
  Progress,
  Tag,
  Select,
  DatePicker
} from 'antd'
import { 
  ArrowLeftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export const Analytics = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('7days')

  // Mock analytics data
  const [analytics, setAnalytics] = useState({
    revenue: {
      current: 15420.50,
      previous: 12350.75,
      growth: 24.8
    },
    orders: {
      current: 156,
      previous: 134,
      growth: 16.4
    },
    customers: {
      current: 89,
      previous: 76,
      growth: 17.1
    },
    avgOrderValue: {
      current: 98.85,
      previous: 92.15,
      growth: 7.3
    }
  })

  const topProducts = [
    { id: 1, name: 'Fresh Bananas', sales: 245, revenue: 731.55, growth: 12.5 },
    { id: 2, name: 'Whole Milk', sales: 189, revenue: 754.11, growth: 8.3 },
    { id: 3, name: 'Sourdough Bread', sales: 156, revenue: 778.44, growth: -2.1 },
    { id: 4, name: 'Ground Beef', sales: 134, revenue: 1204.66, growth: 15.7 },
    { id: 5, name: 'Cheddar Cheese', sales: 98, revenue: 538.02, growth: 5.2 }
  ]

  const categoryPerformance = [
    { category: 'Fruits', revenue: 3245.67, percentage: 21.0, color: '#52c41a' },
    { category: 'Dairy', revenue: 2876.43, percentage: 18.6, color: '#1890ff' },
    { category: 'Meat', revenue: 2654.32, percentage: 17.2, color: '#fa8c16' },
    { category: 'Bakery', revenue: 2123.45, percentage: 13.8, color: '#722ed1' },
    { category: 'Vegetables', revenue: 1987.65, percentage: 12.9, color: '#eb2f96' },
    { category: 'Others', revenue: 2532.98, percentage: 16.5, color: '#13c2c2' }
  ]

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: 45.67, status: 'completed', time: '2 hours ago' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 78.90, status: 'processing', time: '3 hours ago' },
    { id: 'ORD-003', customer: 'Bob Johnson', amount: 123.45, status: 'shipped', time: '5 hours ago' },
    { id: 'ORD-004', customer: 'Alice Brown', amount: 67.89, status: 'completed', time: '6 hours ago' },
    { id: 'ORD-005', customer: 'Charlie Wilson', amount: 89.12, status: 'pending', time: '8 hours ago' }
  ]

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      // Analytics data would be fetched based on timeRange
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? (
      <ArrowUpOutlined className="text-green-500" />
    ) : (
      <ArrowDownOutlined className="text-red-500" />
    )
  }

  const getGrowthColor = (growth) => {
    return growth >= 0 ? '#52c41a' : '#ff4d4f'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green'
      case 'processing': return 'blue'
      case 'shipped': return 'purple'
      case 'pending': return 'orange'
      default: return 'default'
    }
  }

  const topProductsColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => sales.toLocaleString(),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => `$${revenue.toFixed(2)}`,
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth) => (
        <Space>
          {getGrowthIcon(growth)}
          <span style={{ color: getGrowthColor(growth) }}>
            {Math.abs(growth).toFixed(1)}%
          </span>
        </Space>
      ),
    },
  ]

  const recentOrdersColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin')}
            type="text"
          >
            Back to Dashboard
          </Button>
        </Space>
        <div className="flex justify-between items-center mt-4">
          <div>
            <Title level={2} className="!mb-2">Analytics Dashboard</Title>
            <Text type="secondary">Track your business performance</Text>
          </div>
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Select.Option value="7days">7 Days</Select.Option>
              <Select.Option value="30days">30 Days</Select.Option>
              <Select.Option value="90days">90 Days</Select.Option>
              <Select.Option value="1year">1 Year</Select.Option>
            </Select>
            <RangePicker />
          </Space>
        </div>
      </div>

      {/* Key Metrics */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={analytics.revenue.current}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <Space>
                  {getGrowthIcon(analytics.revenue.growth)}
                  <span style={{ color: getGrowthColor(analytics.revenue.growth), fontSize: '14px' }}>
                    {analytics.revenue.growth.toFixed(1)}%
                  </span>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Orders"
              value={analytics.orders.current}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <Space>
                  {getGrowthIcon(analytics.orders.growth)}
                  <span style={{ color: getGrowthColor(analytics.orders.growth), fontSize: '14px' }}>
                    {analytics.orders.growth.toFixed(1)}%
                  </span>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Customers"
              value={analytics.customers.current}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <Space>
                  {getGrowthIcon(analytics.customers.growth)}
                  <span style={{ color: getGrowthColor(analytics.customers.growth), fontSize: '14px' }}>
                    {analytics.customers.growth.toFixed(1)}%
                  </span>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Order Value"
              value={analytics.avgOrderValue.current}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#fa8c16' }}
              suffix={
                <Space>
                  {getGrowthIcon(analytics.avgOrderValue.growth)}
                  <span style={{ color: getGrowthColor(analytics.avgOrderValue.growth), fontSize: '14px' }}>
                    {analytics.avgOrderValue.growth.toFixed(1)}%
                  </span>
                </Space>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card title="Top Selling Products" className="h-full">
            <Table
              columns={topProductsColumns}
              dataSource={topProducts}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Category Performance */}
        <Col xs={24} lg={12}>
          <Card title="Category Performance" className="h-full">
            <Space direction="vertical" className="w-full">
              {categoryPerformance.map((category, index) => (
                <div key={index} className="w-full">
                  <div className="flex justify-between mb-1">
                    <Text>{category.category}</Text>
                    <Text strong>${category.revenue.toFixed(2)}</Text>
                  </div>
                  <Progress
                    percent={category.percentage}
                    strokeColor={category.color}
                    showInfo={false}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24}>
          <Card 
            title="Recent Orders" 
            extra={
              <Button type="text" icon={<EyeOutlined />}>
                View All
              </Button>
            }
          >
            <Table
              columns={recentOrdersColumns}
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}