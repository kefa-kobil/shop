import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from '../../lib/supabase'
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Button, 
  DatePicker, 
  Typography, 
  Space,
  message,
  Row,
  Col,
  Alert
} from 'antd'
import { 
  ArrowLeftOutlined,
  SaveOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

export const CreateAuction = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const isManager = user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => {
    if (isManager) {
      fetchProducts()
    }
  }, [isManager])

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      message.error('Failed to fetch products')
    } finally {
      setLoadingProducts(false)
    }
  }

  if (!isManager) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          message="Access Denied"
          description="Only managers and admins can create auctions."
          type="error"
          showIcon
        />
      </div>
    )
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // Validate auction duration
      const [startTime, endTime] = values.auction_period
      const duration = endTime.diff(startTime, 'hours')
      
      if (duration < 1) {
        message.error('Auction must run for at least 1 hour')
        return
      }
      
      if (duration > 168) { // 7 days
        message.error('Auction cannot run for more than 7 days')
        return
      }

      // Get selected product details
      const selectedProduct = products.find(p => p.id === values.product_id)

      const auctionData = {
        product_id: values.product_id,
        title: values.title || selectedProduct?.name,
        description: values.description || selectedProduct?.description,
        starting_price: values.starting_price,
        current_price: values.starting_price, // Initialize current price to starting price
        min_bid_increment: values.min_bid_increment,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'active',
        created_by: user.id
      }

      const { data, error } = await supabase
        .from('auctions')
        .insert(auctionData)
        .select()
        .single()

      if (error) throw error
      
      message.success('Auction created successfully!')
      navigate('/auctions')
    } catch (error) {
      console.error('Error creating auction:', error)
      message.error('Failed to create auction')
    } finally {
      setLoading(false)
    }
  }

  const disabledDate = (current) => {
    // Disable dates before today
    return current && current < dayjs().startOf('day')
  }

  const disabledTime = (current, type) => {
    if (!current) return {}
    
    const now = dayjs()
    if (current.isSame(now, 'day')) {
      // If it's today, disable past hours
      return {
        disabledHours: () => {
          const hours = []
          for (let i = 0; i < now.hour(); i++) {
            hours.push(i)
          }
          return hours
        },
        disabledMinutes: (selectedHour) => {
          if (selectedHour === now.hour()) {
            const minutes = []
            for (let i = 0; i <= now.minute(); i++) {
              minutes.push(i)
            }
            return minutes
          }
          return []
        }
      }
    }
    return {}
  }

  const handleProductChange = (productId) => {
    const selectedProduct = products.find(p => p.id === productId)
    if (selectedProduct) {
      // Auto-fill form with product details
      form.setFieldsValue({
        title: selectedProduct.name,
        description: selectedProduct.description,
        starting_price: selectedProduct.price
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <Title level={2} className="!mb-2 !mt-4">Create New Auction</Title>
        <Text type="secondary">Set up a new auction for your products</Text>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            min_bid_increment: 1.00,
            auction_period: [
              dayjs().add(1, 'hour'),
              dayjs().add(2, 'day')
            ]
          }}
        >
          <Form.Item
            name="product_id"
            label="Select Product"
            rules={[
              { required: true, message: 'Please select a product' }
            ]}
          >
            <Select 
              placeholder="Choose a product for auction" 
              size="large"
              loading={loadingProducts}
              onChange={handleProductChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name} - ${product.price} ({product.category})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="Auction Title (Optional)"
                tooltip="Leave empty to use product name"
              >
                <Input placeholder="Custom auction title" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="starting_price"
                label="Starting Price ($)"
                rules={[
                  { required: true, message: 'Please enter starting price' }
                ]}
              >
                <InputNumber
                  min={0.01}
                  step={0.01}
                  precision={2}
                  placeholder="0.00"
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Auction Description (Optional)"
            tooltip="Leave empty to use product description"
          >
            <TextArea 
              rows={4} 
              placeholder="Custom auction description..."
            />
          </Form.Item>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="min_bid_increment"
                label="Minimum Bid Increment ($)"
                rules={[
                  { required: true, message: 'Please enter minimum bid increment' }
                ]}
              >
                <InputNumber
                  min={0.01}
                  step={0.01}
                  precision={2}
                  placeholder="1.00"
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="auction_period"
                label={
                  <Space>
                    <ClockCircleOutlined />
                    Auction Period
                  </Space>
                }
                rules={[
                  { required: true, message: 'Please select auction period' }
                ]}
              >
                <RangePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  placeholder={['Start Time', 'End Time']}
                  size="large"
                  className="w-full"
                  disabledDate={disabledDate}
                  disabledTime={disabledTime}
                />
              </Form.Item>
            </Col>
          </Row>

          <Alert
            message="Auction Guidelines"
            description={
              <ul className="mt-2 space-y-1">
                <li>• Select a product from your inventory to auction</li>
                <li>• Auctions must run for at least 1 hour and maximum 7 days</li>
                <li>• Starting price should be reasonable to attract bidders</li>
                <li>• Title and description will auto-fill from product details if left empty</li>
                <li>• Once started, auctions cannot be cancelled if there are active bids</li>
              </ul>
            }
            type="info"
            showIcon
            className="mb-6"
          />

          <Form.Item className="mb-0">
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                Create Auction
              </Button>
              <Button 
                onClick={() => form.resetFields()}
                size="large"
              >
                Reset
              </Button>
              <Button 
                onClick={() => navigate('/auctions')}
                size="large"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}