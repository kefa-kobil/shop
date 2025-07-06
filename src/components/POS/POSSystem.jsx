import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../../lib/supabase'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Input, 
  Table,
  Space,
  message,
  Modal,
  Form,
  InputNumber,
  Select,
  Divider,
  Statistic,
  Badge,
  Tag
} from 'antd'
import { 
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  DollarOutlined,
  CreditCardOutlined,
  MobileOutlined,
  PrinterOutlined,
  SearchOutlined,
  CalculatorOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

export const POSSystem = () => {
  const { user } = useSelector((state) => state.auth)
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [form] = Form.useForm()

  const isStaff = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'cashier'

  useEffect(() => {
    if (isStaff) {
      fetchProducts()
    }
  }, [isStaff])

  const fetchProducts = async () => {
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
    }
  }

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id)
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ))
    } else {
      setCartItems([...cartItems, {
        ...product,
        quantity: 1,
        total: product.price
      }])
    }
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems(cartItems.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ))
  }

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
    const taxRate = 0.08 // 8% tax
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount
    
    return { subtotal, taxAmount, total }
  }

  const processPayment = async (values) => {
    setLoading(true)
    try {
      const { subtotal, taxAmount, total } = calculateTotals()
      
      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('pos_transactions')
        .insert({
          transaction_number: `TXN-${Date.now()}`,
          cashier_id: user.id,
          customer_id: values.customer_id || null,
          subtotal: subtotal,
          tax_amount: taxAmount,
          discount_amount: values.discount || 0,
          total_amount: total - (values.discount || 0),
          payment_method: values.payment_method,
          payment_status: 'completed',
          notes: values.notes
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Create transaction items
      const transactionItems = cartItems.map(item => ({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.total
      }))

      const { error: itemsError } = await supabase
        .from('pos_transaction_items')
        .insert(transactionItems)

      if (itemsError) throw itemsError

      // Update product stock
      for (const item of cartItems) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.stock - item.quantity })
          .eq('id', item.id)

        if (stockError) throw stockError
      }

      message.success('Transaction completed successfully!')
      clearCart()
      setPaymentModalVisible(false)
      form.resetFields()
      
      // Refresh products to update stock
      fetchProducts()
      
    } catch (error) {
      console.error('Error processing payment:', error)
      message.error('Failed to process payment')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const { subtotal, taxAmount, total } = calculateTotals()

  const cartColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.category}</Text>
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => updateQuantity(record.id, quantity - 1)}
          />
          <span className="mx-2">{quantity}</span>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => updateQuantity(record.id, quantity + 1)}
            disabled={quantity >= record.stock}
          />
        </Space>
      )
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Text strong>${total.toFixed(2)}</Text>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.id)}
        />
      )
    }
  ]

  if (!isStaff) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-8">
            <Title level={3}>Access Denied</Title>
            <Text type="secondary">Only staff members can access the POS system</Text>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-8">
            <Title level={3}>No Active Session</Title>
            <Text type="secondary" className="block mb-4">
              You need to start a POS session before making sales
            </Text>
            <Button type="primary" size="large" onClick={startSession}>
              Start POS Session
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-2">Point of Sale</Title>
            <Text type="secondary">Cashier: {user.fullName}</Text>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Products Section */}
        <Col xs={24} lg={14}>
          <Card title="Products" className="h-full">
            <Search
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
              size="large"
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map(product => (
                <Card
                  key={product.id}
                  size="small"
                  hoverable
                  className="cursor-pointer"
                  onClick={() => addToCart(product)}
                  bodyStyle={{ padding: '12px' }}
                >
                  <div className="text-center">
                    <Text strong className="block text-sm mb-1">
                      {product.name}
                    </Text>
                    <Text type="secondary" className="block text-xs mb-2">
                      {product.category}
                    </Text>
                    <Text className="block text-green-600 font-bold">
                      ${product.price.toFixed(2)}
                    </Text>
                    <Tag 
                      color={product.stock > 10 ? 'green' : product.stock > 0 ? 'orange' : 'red'}
                      className="mt-1 text-xs"
                    >
                      Stock: {product.stock}
                    </Tag>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </Col>

        {/* Cart Section */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined />
                Cart ({cartItems.length} items)
              </Space>
            }
            extra={
              cartItems.length > 0 && (
                <Button type="text" danger onClick={clearCart}>
                  Clear All
                </Button>
              )
            }
            className="h-full"
          >
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCartOutlined className="text-4xl text-gray-400 mb-4" />
                <Text type="secondary">Cart is empty</Text>
              </div>
            ) : (
              <div>
                <Table
                  columns={cartColumns}
                  dataSource={cartItems}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                  className="mb-4"
                />
                
                <Divider />
                
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>Subtotal:</Text>
                    <Text>${subtotal.toFixed(2)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Tax (8%):</Text>
                    <Text>${taxAmount.toFixed(2)}</Text>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between">
                    <Text strong className="text-lg">Total:</Text>
                    <Text strong className="text-lg text-green-600">
                      ${total.toFixed(2)}
                    </Text>
                  </div>
                </div>
                
                <Button
                  type="primary"
                  size="large"
                  block
                  className="mt-4"
                  icon={<CalculatorOutlined />}
                  onClick={() => setPaymentModalVisible(true)}
                >
                  Process Payment
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal
        title="Process Payment"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={processPayment}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Text>Subtotal:</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <Text>Tax:</Text>
                  <Text>${taxAmount.toFixed(2)}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text strong className="text-lg">Total:</Text>
                  <Text strong className="text-lg">${total.toFixed(2)}</Text>
                </div>
              </div>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="payment_method"
                label="Payment Method"
                rules={[{ required: true, message: 'Please select payment method' }]}
              >
                <Select size="large">
                  <Option value="cash">
                    <Space><DollarOutlined />Cash</Space>
                  </Option>
                  <Option value="card">
                    <Space><CreditCardOutlined />Card</Space>
                  </Option>
                  <Option value="digital_wallet">
                    <Space><MobileOutlined />Digital Wallet</Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="discount"
                label="Discount Amount"
              >
                <InputNumber
                  min={0}
                  max={subtotal}
                  precision={2}
                  className="w-full"
                  size="large"
                  prefix="$"
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="notes"
                label="Notes (Optional)"
              >
                <Input.TextArea rows={2} placeholder="Transaction notes..." />
              </Form.Item>
            </Col>
          </Row>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setPaymentModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              <Space>
                <PrinterOutlined />
                Complete Sale
              </Space>
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}