import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Button, 
  Upload, 
  Typography, 
  Space,
  message,
  Row,
  Col,
  Switch
} from 'antd'
import { 
  ArrowLeftOutlined,
  UploadOutlined,
  SaveOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

export const AddProduct = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Product data:', values)
      message.success('Product added successfully!')
      
      // Reset form or navigate back
      form.resetFields()
      // navigate('/admin')
    } catch (error) {
      message.error('Failed to add product')
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
    },
    onChange: (info) => {
      // Handle file selection
      console.log('File selected:', info.file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <Title level={2} className="!mb-2 !mt-4">Add New Product</Title>
        <Text type="secondary">Add a new product to your inventory</Text>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            active: true,
            stock: 0,
            rating: 4.0,
            reviews_count: 0
          }}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[
                  { required: true, message: 'Please enter product name' }
                ]}
              >
                <Input placeholder="Enter product name" size="large" />
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
          >
            <TextArea 
              rows={4} 
              placeholder="Enter product description"
            />
          </Form.Item>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="price"
                label="Price ($)"
                rules={[
                  { required: true, message: 'Please enter price' }
                ]}
              >
                <InputNumber
                  min={0}
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
                name="original_price"
                label="Original Price ($)"
              >
                <InputNumber
                  min={0}
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
                name="discount_percentage"
                label="Discount (%)"
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="0"
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="stock"
                label="Stock Quantity"
                rules={[
                  { required: true, message: 'Please enter stock quantity' }
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="rating"
                label="Rating"
              >
                <InputNumber
                  min={0}
                  max={5}
                  step={0.1}
                  precision={1}
                  placeholder="4.0"
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="reviews_count"
                label="Reviews Count"
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item
            name="active"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item className="mb-0 pt-4">
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                Add Product
              </Button>
              <Button 
                onClick={() => form.resetFields()}
                size="large"
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}