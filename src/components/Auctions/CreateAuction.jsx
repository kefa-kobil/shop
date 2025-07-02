import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
  Upload,
  Alert
} from 'antd'
import { 
  ArrowLeftOutlined,
  UploadOutlined,
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

  const isManager = user?.role === 'manager' || user?.role === 'admin'

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

  const categories = [
    'Fruits',
    'Vegetables', 
    'Dairy',
    'Meat',
    'Bakery',
    'Beverages',
    'Snacks',
    'Frozen',
    'Pantry',
    'Personal Care',
    'Household'
  ]

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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const auctionData = {
        ...values,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        created_by: user.id,
        status: 'active',
        current_price: values.starting_price
      }
      
      console.log('Auction data:', auctionData)
      message.success('Auction created successfully!')
      
      // Navigate to auction list
      navigate('/auctions')
    } catch (error) {
      message.error('Failed to create auction')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('You can only upload image files!')
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!')
      }
      return false // Prevent auto upload
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
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="Auction Title"
                rules={[
                  { required: true, message: 'Please enter auction title' },
                  { min: 10, message: 'Title must be at least 10 characters' }
                ]}
              >
                <Input placeholder="Enter auction title" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[
                  { required: true, message: 'Please select a category' }
                ]}
              >
                <Select placeholder="Select category" size="large">
                  {categories.map(category => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter description' },
              { min: 20, message: 'Description must be at least 20 characters' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Describe the product in detail..."
            />
          </Form.Item>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
              <Form.Item
                name="reserve_price"
                label="Reserve Price ($)"
                tooltip="Minimum price you're willing to accept (optional)"
              >
                <InputNumber
                  min={0.01}
                  step={0.01}
                  precision={2}
                  placeholder="Optional"
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item
            name="image_url"
            label="Product Image URL"
          >
            <Input 
              placeholder="https://example.com/image.jpg" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="image_upload"
            label="Or Upload Image"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} size="large">
                Click to Upload
              </Button>
            </Upload>
          </Form.Item>

          <Alert
            message="Auction Guidelines"
            description={
              <ul className="mt-2 space-y-1">
                <li>• Auctions must run for at least 1 hour and maximum 7 days</li>
                <li>• Starting price should be reasonable to attract bidders</li>
                <li>• Provide clear, detailed descriptions and good quality images</li>
                <li>• Reserve price is the minimum you're willing to accept (optional)</li>
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