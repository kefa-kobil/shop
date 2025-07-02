import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSelector } from 'react-redux'
import { 
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Typography,
  Space,
  Timeline,
  Spin,
  Alert
} from 'antd'
import { 
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  LineChartOutlined,
  PlusOutlined,
  TeamOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

export const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  const isManager = user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => {
    if (isManager) {
      fetchStats()
    }
  }, [isManager])

  const fetchStats = async () => {
    try {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // For now, we'll use mock data for users and orders since we're not using Supabase auth
      setStats({
        totalProducts: productsCount || 0,
        totalUsers: 150, // Mock data
        totalOrders: 45, // Mock data
        totalRevenue: 2340.50 // Mock data
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isManager) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          message="Access Denied"
          description="You don't have permission to access this page."
          type="error"
          showIcon
          className="text-center"
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spin size="large" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <ShoppingOutlined className="text-blue-600" />,
      color: '#1890ff'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <UserOutlined className="text-green-600" />,
      color: '#52c41a'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCartOutlined className="text-orange-600" />,
      color: '#fa8c16'
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      prefix: '$',
      precision: 2,
      icon: <DollarOutlined className="text-purple-600" />,
      color: '#722ed1'
    }
  ]

  const timelineItems = [
    {
      color: 'blue',
      children: (
        <div>
          <Text strong>New product added</Text>
          <br />
          <Text type="secondary">2 hours ago</Text>
        </div>
      ),
    },
    {
      color: 'green',
      children: (
        <div>
          <Text strong>New order received</Text>
          <br />
          <Text type="secondary">4 hours ago</Text>
        </div>
      ),
    },
    {
      color: 'purple',
      children: (
        <div>
          <Text strong>New user registered</Text>
          <br />
          <Text type="secondary">6 hours ago</Text>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-2">Admin Dashboard</Title>
        <Text type="secondary">Manage your supermarket operations</Text>
      </div>

      {/* Stats Grid */}
      <Row gutter={[24, 24]} className="mb-8">
        {statCards.map((stat, index) => (
          <Col key={index} xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                precision={stat.precision}
                valueStyle={{ color: stat.color }}
                suffix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Quick Actions */}
        <Col xs={24} lg={16}>
          <Card title="Quick Actions" className="h-full">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="large"
                  block
                  className="h-16 flex items-center justify-center"
                >
                  <Space direction="vertical" size={0}>
                    <span>Add Product</span>
                  </Space>
                </Button>
              </Col>
              <Col xs={24} md={8}>
                <Button 
                  icon={<LineChartOutlined />} 
                  size="large"
                  block
                  className="h-16 flex items-center justify-center"
                >
                  <Space direction="vertical" size={0}>
                    <span>View Analytics</span>
                  </Space>
                </Button>
              </Col>
              <Col xs={24} md={8}>
                <Button 
                  icon={<TeamOutlined />} 
                  size="large"
                  block
                  className="h-16 flex items-center justify-center"
                >
                  <Space direction="vertical" size={0}>
                    <span>Manage Users</span>
                  </Space>
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card title="Recent Activity" className="h-full">
            <Timeline items={timelineItems} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}