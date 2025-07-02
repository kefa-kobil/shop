import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from '../../lib/supabase'
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
  Alert,
  Spin
} from 'antd'
import { 
  ArrowLeftOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  ThunderboltOutlined
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

  useEffect(() => {
    fetchAuctionDetails()
  }, [id])

  useEffect(() => {
    if (auction) {
      const nextBidAmount = parseFloat(auction.current_price) + parseFloat(auction.min_bid_increment)
      setBidAmount(nextBidAmount)
      form.setFieldsValue({ amount: nextBidAmount })
    }
  }, [auction, form])

  const fetchAuctionDetails = async () => {
    setLoading(true)
    try {
      // Fetch auction with product details
      const { data: auctionData, error: auctionError } = await supabase
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
        .eq('id', id)
        .single()

      if (auctionError) throw auctionError

      if (!auctionData) {
        setAuction(null)
        setLoading(false)
        return
      }

      // Transform auction data
      const transformedAuction = {
        ...auctionData,
        title: auctionData.title || auctionData.products?.name || 'Untitled Auction',
        description: auctionData.description || auctionData.products?.description || 'No description available',
        image_url: auctionData.products?.image_url || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg',
        category: auctionData.products?.category || 'General'
      }

      setAuction(transformedAuction)

      // Fetch bids for this auction
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('auction_id', id)
        .order('created_at', { ascending: false })

      if (bidsError) {
        console.error('Error fetching bids:', bidsError)
        // Don't throw error, just set empty bids
        setBids([])
      } else {
        // Transform bids data
        const transformedBids = bidsData?.map(bid => ({
          ...bid,
          user_name: bid.profiles?.full_name || 'Anonymous',
          is_current_user: bid.user_id === user?.id
        })) || []

        setBids(transformedBids)
      }

    } catch (error) {
      console.error('Error fetching auction details:', error)
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

    const currentPrice = parseFloat(auction.current_price)
    const minIncrement = parseFloat(auction.min_bid_increment)
    const bidValue = parseFloat(values.amount)

    if (bidValue <= currentPrice) {
      message.error(`Bid must be higher than current price of $${currentPrice.toFixed(2)}`)
      return
    }

    if (bidValue < currentPrice + minIncrement) {
      message.error(`Minimum bid increment is $${minIncrement.toFixed(2)}`)
      return
    }

    setBidLoading(true)
    try {
      // Insert new bid
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .insert({
          auction_id: auction.id,
          user_id: user.id,
          amount: bidValue
        })
        .select()
        .single()

      if (bidError) throw bidError

      // Update auction current price
      const { error: updateError } = await supabase
        .from('auctions')
        .update({ 
          current_price: bidValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', auction.id)

      if (updateError) throw updateError

      // Update local state
      setAuction(prev => ({
        ...prev,
        current_price: bidValue
      }))

      // Add new bid to the list
      const newBid = {
        ...bidData,
        user_name: user?.fullName || 'You',
        is_current_user: true
      }
      setBids(prev => [newBid, ...prev])

      // Update minimum bid amount
      const nextBidAmount = bidValue + minIncrement
      setBidAmount(nextBidAmount)
      form.setFieldsValue({ amount: nextBidAmount })

      message.success('Bid placed successfully!')
    } catch (error) {
      console.error('Error placing bid:', error)
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
          ${parseFloat(amount).toFixed(2)}
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
        <Spin size="large" />
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
                    value={parseFloat(auction.starting_price)}
                    prefix={<DollarOutlined />}
                    precision={2}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Current Bid"
                    value={parseFloat(auction.current_price)}
                    prefix={<DollarOutlined />}
                    precision={2}
                    valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Total Bids"
                    value={bids.length}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Min Increment"
                    value={parseFloat(auction.min_bid_increment)}
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
              <Card title={<Space><ThunderboltOutlined />Place Your Bid</Space>}>
                {isAuthenticated ? (
                  <Form
                    form={form}
                    onFinish={handlePlaceBid}
                    layout="vertical"
                  >
                    <Form.Item
                      name="amount"
                      label="Bid Amount ($)"
                      rules={[
                        { required: true, message: 'Please enter bid amount' },
                        {
                          validator: (_, value) => {
                            const currentPrice = parseFloat(auction.current_price)
                            const minIncrement = parseFloat(auction.min_bid_increment)
                            
                            if (value <= currentPrice) {
                              return Promise.reject('Bid must be higher than current price')
                            }
                            if (value < currentPrice + minIncrement) {
                              return Promise.reject(`Minimum increment is $${minIncrement.toFixed(2)}`)
                            }
                            return Promise.resolve()
                          }
                        }
                      ]}
                    >
                      <InputNumber
                        min={parseFloat(auction.current_price) + parseFloat(auction.min_bid_increment)}
                        step={parseFloat(auction.min_bid_increment)}
                        precision={2}
                        className="w-full"
                        size="large"
                      />
                    </Form.Item>
                    
                    <Text type="secondary" className="block mb-4">
                      Minimum bid: ${(parseFloat(auction.current_price) + parseFloat(auction.min_bid_increment)).toFixed(2)}
                    </Text>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={bidLoading}
                      size="large"
                      block
                      icon={<ThunderboltOutlined />}
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