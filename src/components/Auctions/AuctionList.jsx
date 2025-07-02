import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Button, 
  Input,
  Select,
  Empty,
  Spin,
  message,
  Statistic,
  Image
} from 'antd'
import { 
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Countdown } = Statistic
const { Option } = Select

export const AuctionList = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')

  const isManager = user?.role === 'manager' || user?.role === 'admin'

  // Mock auction data
  const mockAuctions = [
    {
      id: '1',
      title: 'Premium Organic Apples - 5kg Box',
      description: 'Fresh organic apples from local farms, perfect for families',
      starting_price: 15.00,
      current_price: 23.50,
      min_bid_increment: 1.00,
      start_time: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
      end_time: new Date(Date.now() + 22 * 60 * 60 * 1000), // Ends in 22 hours
      status: 'active',
      bid_count: 8,
      image_url: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg',
      category: 'Fruits'
    },
    {
      id: '2',
      title: 'Artisan Sourdough Bread Bundle',
      description: 'Freshly baked sourdough bread, 3 loaves',
      starting_price: 8.00,
      current_price: 12.75,
      min_bid_increment: 0.50,
      start_time: new Date(Date.now() - 1 * 60 * 60 * 1000), // Started 1 hour ago
      end_time: new Date(Date.now() + 47 * 60 * 60 * 1000), // Ends in 47 hours
      status: 'active',
      bid_count: 5,
      image_url: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg',
      category: 'Bakery'
    },
    {
      id: '3',
      title: 'Premium Wagyu Beef Steaks',
      description: 'Grade A5 Wagyu beef steaks, 2 pieces',
      starting_price: 45.00,
      current_price: 67.50,
      min_bid_increment: 2.50,
      start_time: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
      end_time: new Date(Date.now() + 71 * 60 * 60 * 1000), // Ends in 71 hours
      status: 'active',
      bid_count: 12,
      image_url: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg',
      category: 'Meat'
    }
  ]

  useEffect(() => {
    fetchAuctions()
  }, [statusFilter])

  const fetchAuctions = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setAuctions(mockAuctions)
    } catch (error) {
      message.error('Failed to fetch auctions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green'
      case 'ended': return 'red'
      case 'cancelled': return 'orange'
      default: return 'default'
    }
  }

  const isAuctionActive = (auction) => {
    const now = new Date()
    return auction.status === 'active' && 
           new Date(auction.start_time) <= now && 
           new Date(auction.end_time) > now
  }

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || auction.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-2">Live Auctions</Title>
            <Text type="secondary">Bid on exclusive products and get great deals</Text>
          </div>
          {isManager && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/auctions/create')}
            >
              Create Auction
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={16} md={18}>
            <Input
              size="large"
              placeholder="Search auctions..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              size="large"
              placeholder="Filter by status"
              value={statusFilter || undefined}
              onChange={setStatusFilter}
              allowClear
              className="w-full"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="active">Active</Option>
              <Option value="ended">Ended</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Auctions Grid */}
      {filteredAuctions.length === 0 ? (
        <Empty
          description={
            <Space direction="vertical">
              <Typography.Text>No auctions found</Typography.Text>
              <Typography.Text type="secondary">
                {isManager ? 'Create your first auction to get started' : 'Check back later for new auctions'}
              </Typography.Text>
            </Space>
          }
          className="py-16"
        />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredAuctions.map(auction => (
            <Col key={auction.id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                className="h-full"
                cover={
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      alt={auction.title}
                      src={auction.image_url}
                      className="w-full h-full object-cover"
                      preview={false}
                    />
                    <div className="absolute top-2 left-2">
                      <Tag color={getStatusColor(auction.status)} className="capitalize">
                        {auction.status}
                      </Tag>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Tag color="blue">{auction.category}</Tag>
                    </div>
                  </div>
                }
                actions={[
                  <Button
                    key="view"
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                    disabled={!isAuthenticated}
                    block
                    size="large"
                    className="mx-4 mb-4"
                  >
                    {isAuthenticated ? 'View & Bid' : 'Sign in to Bid'}
                  </Button>
                ]}
              >
                <Space direction="vertical" size="middle" className="w-full">
                  <div>
                    <Title level={5} className="!mb-2 line-clamp-2">
                      {auction.title}
                    </Title>
                    <Text type="secondary" className="line-clamp-2 text-sm">
                      {auction.description}
                    </Text>
                  </div>

                  <div className="space-y-3">
                    {/* Current Price */}
                    <div className="flex justify-between items-center">
                      <Text type="secondary">Current Bid:</Text>
                      <Text strong className="text-lg text-green-600">
                        <DollarOutlined />{auction.current_price.toFixed(2)}
                      </Text>
                    </div>

                    {/* Starting Price */}
                    <div className="flex justify-between items-center">
                      <Text type="secondary">Starting Price:</Text>
                      <Text className="text-gray-500">
                        ${auction.starting_price.toFixed(2)}
                      </Text>
                    </div>

                    {/* Bid Count */}
                    <div className="flex justify-between items-center">
                      <Text type="secondary">Total Bids:</Text>
                      <Text>{auction.bid_count}</Text>
                    </div>

                    {/* Time Remaining */}
                    {isAuctionActive(auction) ? (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Text type="secondary" className="block mb-1">
                          <ClockCircleOutlined /> Time Remaining:
                        </Text>
                        <Countdown
                          value={new Date(auction.end_time).getTime()}
                          format="D[d] H[h] m[m] s[s]"
                          valueStyle={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}
                        />
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Text type="secondary">
                          {auction.status === 'ended' ? 'Auction Ended' : 'Auction Not Started'}
                        </Text>
                      </div>
                    )}
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}