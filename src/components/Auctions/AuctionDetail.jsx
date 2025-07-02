import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Button, 
  InputNumber,
  Table,
  Tag,
  Image,
  Statistic,
  Form,
  message,
  Avatar,
  Divider,
  Alert
} from 'antd'
import { 
  ArrowLeftOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  GavelOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Countdown } = Statistic

export const AuctionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [bidLoading, setBidLoading] = useState(false)
  const [bidAmount, setBidAmount] = useState(0)
  const [form] = Form.useForm()

  // Mock auction data
  const mockAuction = {
    id: '1',
    title: 'Premium Organic Apples - 5kg Box',
    description: 'Fresh organic apples from local farms, perfect for families. These apples are hand-picked and certified organic. Great for eating fresh, baking, or making juice.',
    starting_price: 15.00,
    current_price: 23.50,
    min_bid_increment: 1.00,
    start_time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    end_time: new Date(Date.now() + 22 * 60 * 60 * 1000),
    status: 'active',
    bid_count: 8,
    image_url: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg',
    category: 'Fruits',
    created_by: 'manager@test.com'
  }

  const mockBids = [
    {
      id: '1',
      user_name: 'John D.',
      amount: 23.50,
      created_at: new Date(Date.now() - 5 * 60 * 1000),
      is_current_user: false
    },
    {
      id: '2',
      user_name: 'Sarah M.',
      amount: 22.00,
      created_at: new Date(Date.now() - 15 * 60 * 1000),
      is_current_user: false
    },
    {
      id: '3',
      user_name: 'Mike R.',
      amount: 21.50,
      created_at: new Date(Date.now() - 25 * 60 * 1000),
      is_current_user: true
    },
    {
      id: '4',
      user_name: 'Lisa K.',
      amount: 20.00,
      created_at: new Date(Date.now() - 35 * 60 * 1000),
      is_current_user: false
    },
    {
      id: '5',
      user_name: 'Tom B.',
      amount: 18.50,
      created_at: new Date(Date.now() - 45 * 60 * 1000),
      is_current_user: false
    }
  ]

  useEffect(() => {
    fetchAuctionDetails()
  }, [id])

  useEffect(() => {
    if (auction) {
      setBidAmount(auction.current_price + auction.min_bid_increment)
    }
  }, [auction])

  const fetchAuctionDetails = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setAuction(mockAuction)
      setBids(mockBids)
    } catch (error) {
      message.error('Failed to fetch auction details')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceBid = async (values) => {
    if (!isAuthenticated) {
      message.warning('Please sign in to place a bid')
      return
    }

    if (values.amount <= auction.current_price) {
      message.error(`Bid must be higher than current price of $${auction.current_price}`)
      return
    }

    if (values.amount < auction.current_price + auction.min_bid_increment) {
      message.error(`Minimum bid increment is $${auction.min_bid_increment}`)
      return
    }

    setBidLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update auction current price
      setAuction(prev => ({
        ...prev,
        current_price: values.amount,
        bid_count: prev.bid_count + 1
      }))

      // Add new bid to the list
      const newBid = {
        id: Date.now().toString(),
        user_name: user?.fullName?.split(' ').map(n => n[0]).join('') + '.' || 'You',
        amount: values.amount,
        created_at: new Date(),
        is_current_user: true
      }
      setBids(prev => [newBid, ...prev])

      // Update minimum bid amount
      setBidAmount(values.amount + auction.min_bid_increment)
      form.setFieldsValue({ amount: values.amount + auction.min_bid_increment })

      message.success('Bid placed successfully!')
    } catch (error) {
      message.error('Failed to place bid')
    } finally {
      setBidLoading(false)
    }
  }

  const isAuctionActive = () => {
    if (!auction) return false
    const now = new Date()
    return auction.status === 'active' && 
           new Date(auction.start_time) <= now && 
           new Date(auction.end_time) > now
  }

  const getTimeStatus = () => {
    if (!auction) return null
    const now = new Date()
    const startTime = new Date(auction.start_time)
    const endTime = new Date(auction.end_time)

    if (now < startTime) {
      return { type: 'warning', text: 'Auction has not started yet' }
    } else if (now > endTime) {
      return { type: 'error', text: 'Auction has ended' }
    } else {
      return { type: 'success', text: 'Auction is live' }
    }
  }

  const bidColumns = [
    {
      title: 'Bidder',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span className={record.is_current_user ? 'font-bold text-blue-600' : ''}>
            {record.is_current_user ? 'You' : name}
          </span>
          {record === bids[0] && (
            <Tag color="gold" icon={<TrophyOutlined />}>
              Leading
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Bid Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong className="text-green-600">
          ${amount.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => {
        const now = new Date()
        const diff = Math.floor((now - new Date(time)) / 1000 / 60)
        return <Text type="secondary">{diff}m ago</Text>
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          message="Auction Not Found"
          description="The auction you're looking for doesn't exist or has been removed."
          type="error"
          showIcon
        />
      </div>
    )
  }

  const timeStatus = getTimeStatus()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/auctions')}
            type="text"
          >
            Back to Auctions
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Auction Details */}
        <Col xs={24} lg={14}>
          <Card className="mb-6">
            <Space direction="vertical" size="large" className="w-full">
              {/* Image */}
              <Image
                src={auction.image_url}
                alt={auction.title}
                className="w-full h-64 object-cover rounded-lg"
              />

              {/* Title and Description */}
              <div>
                <Space className="mb-4">
                  <Tag color="blue">{auction.category}</Tag>
                  <Tag color={timeStatus.type}>{timeStatus.text}</Tag>
                </Space>
                <Title level={3} className="!mb-4">{auction.title}</Title>
                <Text className="text-gray-600">{auction.description}</Text>
              </div>

              {/* Auction Stats */}
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Starting Price"
                    value={auction.starting_price}
                    prefix={<DollarOutlined />}
                    precision={2}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Current Bid"
                    value={auction.current_price}
                    prefix={<DollarOutlined />}
                    precision={2}
                    valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Total Bids"
                    value={auction.bid_count}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Min Increment"
                    value={auction.min_bid_increment}
                    prefix={<DollarOutlined />}
                    precision={2}
                  />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        {/* Bidding Panel */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" size="large" className="w-full">
            {/* Time Remaining */}
            <Card>
              <div className="text-center">
                <Text type="secondary" className="block mb-2">
                  <ClockCircleOutlined /> Time Remaining
                </Text>
                {isAuctionActive() ? (
                  <Countdown
                    value={new Date(auction.end_time).getTime()}
                    format="D[d] H[h] m[m] s[s]"
                    valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}
                  />
                ) : (
                  <Text className="text-xl font-bold text-gray-500">
                    {timeStatus.text}
                  </Text>
                )}
              </div>
            </Card>

            {/* Bidding Form */}
            {isAuctionActive() && (
              <Card title={<Space><GavelOutlined />Place Your Bid</Space>}>
                {isAuthenticated ? (
                  <Form
                    form={form}
                    onFinish={handlePlaceBid}
                    layout="vertical"
                    initialValues={{ amount: bidAmount }}
                  >
                    <Form.Item
                      name="amount"
                      label="Bid Amount ($)"
                      rules={[
                        { required: true, message: 'Please enter bid amount' },
                        {
                          validator: (_, value) => {
                            if (value <= auction.current_price) {
                              return Promise.reject('Bid must be higher than current price')
                            }
                            if (value < auction.current_price + auction.min_bid_increment) {
                              return Promise.reject(`Minimum increment is $${auction.min_bid_increment}`)
                            }
                            return Promise.resolve()
                          }
                        }
                      ]}
                    >
                      <InputNumber
                        min={auction.current_price + auction.min_bid_increment}
                        step={auction.min_bid_increment}
                        precision={2}
                        className="w-full"
                        size="large"
                        value={bidAmount}
                        onChange={setBidAmount}
                      />
                    </Form.Item>
                    
                    <Text type="secondary" className="block mb-4">
                      Minimum bid: ${(auction.current_price + auction.min_bid_increment).toFixed(2)}
                    </Text>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={bidLoading}
                      size="large"
                      block
                      icon={<GavelOutlined />}
                    >
                      Place Bid
                    </Button>
                  </Form>
                ) : (
                  <div className="text-center">
                    <Text type="secondary" className="block mb-4">
                      Sign in to place a bid
                    </Text>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => navigate('/auth')}
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Bid History */}
            <Card title="Bid History">
              {bids.length > 0 ? (
                <Table
                  columns={bidColumns}
                  dataSource={bids}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                />
              ) : (
                <div className="text-center py-8">
                  <Text type="secondary">No bids yet. Be the first to bid!</Text>
                </div>
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  )
}