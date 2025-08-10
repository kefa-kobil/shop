import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from '../../lib/supabase'
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

  // Mock auction data for when database is not connected
  const mockAuctions = [
    {
      id: '1',
      title: 'Premium Organic Bananas',
      description: 'Fresh organic bananas from local farms. Perfect for smoothies and snacks.',
      starting_price: 5.99,
      current_price: 8.50,
      min_bid_increment: 0.50,
      start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Started 2 hours ago
      end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Ends in 4 hours
      status: 'active',
      image_url: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg',
      category: 'Fruits',
      bid_count: 12
    },
    {
      id: '2',
      title: 'Artisan Sourdough Bread',
      description: 'Handcrafted sourdough bread baked fresh daily. Limited quantity available.',
      starting_price: 8.00,
      current_price: 12.75,
      min_bid_increment: 0.25,
      start_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Started 1 hour ago
      end_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Ends in 6 hours
      status: 'active',
      image_url: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
      category: 'Bakery',
      bid_count: 8
    },
    {
      id: '3',
      title: 'Premium Ribeye Steak',
      description: 'Grade A ribeye steak, perfectly marbled. Great for special occasions.',
      starting_price: 25.00,
      current_price: 32.50,
      min_bid_increment: 1.00,
      start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 minutes ago
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Ends in 2 hours
      status: 'active',
      image_url: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg',
      category: 'Meat',
      bid_count: 15
    },
    {
      id: '4',
      title: 'Aged Cheddar Cheese',
      description: 'Premium aged cheddar cheese, 2 years old. Rich and flavorful.',
      starting_price: 15.00,
      current_price: 18.25,
      min_bid_increment: 0.75,
      start_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // Started 3 hours ago
      end_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // Ends in 1 hour
      status: 'active',
      image_url: 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg',
      category: 'Dairy',
      bid_count: 6
    },
    {
      id: '5',
      title: 'Craft Beer Selection',
      description: 'Limited edition craft beer variety pack from local brewery.',
      starting_price: 20.00,
      current_price: 20.00,
      min_bid_increment: 1.00,
      start_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Started 10 minutes ago
      end_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // Ends in 8 hours
      status: 'active',
      image_url: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
      category: 'Beverages',
      bid_count: 3
    }
  ]

  useEffect(() => {
    fetchAuctions()
  }, [statusFilter])

  const fetchAuctions = async () => {
    setLoading(true)
    let filteredMockAuctions = mockAuctions
    try {
      // Always use mock data for now since database isn't connected
      filteredMockAuctions = mockAuctions
      if (statusFilter && statusFilter !== 'active') {
        filteredMockAuctions = mockAuctions.filter(auction => auction.status === statusFilter)
      }
      setAuctions(filteredMockAuctions)
      setLoading(false)
      return

      // Database code (commented out until Supabase is connected)
      /*
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || 
          !import.meta.env.VITE_SUPABASE_ANON_KEY ||
          import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url' || 
          import.meta.env.VITE_SUPABASE_ANON_KEY === 'your_supabase_anon_key') {
        // Use mock data when Supabase is not properly configured
        let filteredMockAuctions = mockAuctions
        if (statusFilter) {
          filteredMockAuctions = mockAuctions.filter(auction => auction.status === statusFilter)
        }
        setAuctions(filteredMockAuctions)
        setLoading(false)
        return
      }

      // Try to fetch from Supabase if configured
      try {
        let query = supabase
          .from('auctions')
          .select(`
            *,
            products (
              name,
              description,
              image_url,
              category,
              price
            )
          `)
          .order('created_at', { ascending: false })

        if (statusFilter) {
          query = query.eq('status', statusFilter)
        }

        const { data, error } = await query

        if (error) throw error

        // Transform the data to include product information
        const transformedAuctions = data?.map(auction => ({
          ...auction,
          // Use product name as title if not set
          title: auction.title || auction.products?.name || 'Untitled Auction',
          // Use product description if auction description is empty
          description: auction.description || auction.products?.description || 'No description available',
          // Use product image
          image_url: auction.products?.image_url || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg',
          // Use product category
          category: auction.products?.category || 'General',
          // Calculate bid count (mock for now since we don't have actual bids)
          bid_count: Math.floor(Math.random() * 20) + 1
        })) || []

        setAuctions(transformedAuctions)
      } catch (supabaseError) {
        // Fall back to mock data if Supabase query fails
        console.log('Supabase query failed, using mock data:', supabaseError)
        let filteredMockAuctions = mockAuctions
        if (statusFilter) {
          filteredMockAuctions = mockAuctions.filter(auction => auction.status === statusFilter)
        }
        setAuctions(filteredMockAuctions)
      }
    } catch (error) {
      */
      // Final fallback to mock data
      console.error('Error fetching auctions:', error)
      filteredMockAuctions = mockAuctions
      if (statusFilter) {
        filteredMockAuctions = mockAuctions.filter(auction => auction.status === statusFilter)
      }
      setAuctions(filteredMockAuctions)
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
                        <DollarOutlined />{parseFloat(auction.current_price).toFixed(2)}
                      </Text>
                    </div>

                    {/* Starting Price */}
                    <div className="flex justify-between items-center">
                      <Text type="secondary">Starting Price:</Text>
                      <Text className="text-gray-500">
                        ${parseFloat(auction.starting_price).toFixed(2)}
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