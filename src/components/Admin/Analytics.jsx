import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
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
  DatePicker,
  Spin,
  message
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
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7days')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  // Analytics data based on actual products
  const [analytics, setAnalytics] = useState({
    revenue: {
      current: 0,
      previous: 0,
      growth: 0
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

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: 45.67, status: 'completed', time: '2 hours ago' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 78.90, status: 'processing', time: '3 hours ago' },
    { id: 'ORD-003', customer: 'Bob Johnson', amount: 123.45, status: 'shipped', time: '5 hours ago' },
    { id: 'ORD-004', customer: 'Alice Brown', amount: 67.89, status: 'completed', time: '6 hours ago' },
    { id: 'ORD-005', customer: 'Charlie Wilson', amount: 89.12, status: 'pending', time: '8 hours ago' }
  ]

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Fetch actual products from database
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      setProducts(productsData || [])

      // Calculate category performance based on actual products
      const categoryStats = {}
      let totalRevenue = 0

      productsData?.forEach(product => {
        const category = product.category || 'Uncategorized'
        const productRevenue = (product.price * (product.reviews_count || 10)) // Mock sales data
        
        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            revenue: 0,
            productCount: 0
          }
        }
        
        categoryStats[category].revenue += productRevenue
        categoryStats[category].productCount += 1
        totalRevenue += productRevenue
      })

      // Convert to array and calculate percentages
      const categoryArray = Object.values(categoryStats).map(cat => ({
        ...cat,
        percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0,
        color: getCategoryColor(cat.category)
      })).sort((a, b) => b.revenue - a.revenue)

      setCategories(categoryArray)

      // Update analytics with calculated revenue
      setAnalytics(prev => ({
        ...prev,
        revenue: {
          current: totalRevenue,
          previous: totalRevenue * 0.8, // Mock previous period
          growth: 25.0 // Mock growth
        }
      }))

    } catch (error) {
      console.error('Error fetching analytics:', error)
      message.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Fruits': '#52c41a',
      'Vegetables': '#73d13d',
      'Dairy': '#1890ff',
      'Meat': '#fa8c16',
      'Bakery': '#722ed1',
      'Beverages': '#13c2c2',
      'Snacks': '#eb2f96',
      'Frozen': '#2f54eb',
      'Pantry': '#fa541c',
      'Personal Care': '#f759ab',
      'Household': '#597ef7'
    }
    return colors[category] || '#8c8c8c'
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

  // Get top products based on actual data
  const topProducts = products
    .map(product => ({
      id: product.id,
      name: product.name,
      sales: product.reviews_count || Math.floor(Math.random() * 100) + 10, // Mock sales
      revenue: product.price * (product.reviews_count || Math.floor(Math.random() * 100) + 10),
      growth: (Math.random() - 0.5) * 30 // Mock growth between -15% and +15%
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const topProductsColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Text className="font-medium">{name}</Text>
      )
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spin size="large" />
      </div>
    )
  }

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
            <Text type="secondary">Track your supermarket performance</Text>
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
              title="Active Products"
              value={products.length}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Categories"
              value={categories.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card title="Top Selling Products" className="h-full">
            {topProducts.length > 0 ? (
              <Table
                columns={topProductsColumns}
                dataSource={topProducts}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <div className="text-center py-8">
                <Text type="secondary">No products found</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Category Performance */}
        <Col xs={24} lg={12}>
          <Card title="Category Performance" className="h-full">
            {categories.length > 0 ? (
              <Space direction="vertical" className="w-full">
                {categories.map((category, index) => (
                  <div key={index} className="w-full">
                    <div className="flex justify-between mb-1">
                      <Text>{category.category}</Text>
                      <Space>
                        <Text type="secondary">({category.productCount} products)</Text>
                        <Text strong>${category.revenue.toFixed(2)}</Text>
                      </Space>
                    </div>
                    <Progress
                      percent={category.percentage}
                      strokeColor={category.color}
                      showInfo={true}
                      format={(percent) => `${percent.toFixed(1)}%`}
                    />
                  </div>
                ))}
              </Space>
            ) : (
              <div className="text-center py-8">
                <Text type="secondary">No categories found</Text>
              </div>
            )}
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