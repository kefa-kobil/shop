import { useDispatch, useSelector } from 'react-redux'
import { removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice'
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Image, 
  InputNumber,
  Row,
  Col,
  Divider,
  Empty,
  Popconfirm,
  message
} from 'antd'
import { 
  DeleteOutlined, 
  ShoppingCartOutlined,
  ClearOutlined,
  DollarOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

export const Cart = () => {
  const dispatch = useDispatch()
  const { items, total, itemCount } = useSelector((state) => state.cart)

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId))
    message.success('Item removed from cart')
  }

  const handleUpdateQuantity = (productId, quantity) => {
    dispatch(updateQuantity({ productId, quantity }))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
    message.success('Cart cleared')
  }

  const handleCheckout = () => {
    // In a real app, this would navigate to checkout or process payment
    message.success('Checkout functionality would be implemented here')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Empty
          image={<ShoppingCartOutlined className="text-6xl text-gray-400" />}
          description={
            <Space direction="vertical">
              <Title level={3} type="secondary">Your cart is empty</Title>
              <Text type="secondary">Add some products to get started</Text>
            </Space>
          }
          className="py-16"
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">Shopping Cart</Title>
          <Text type="secondary">{itemCount} items in your cart</Text>
        </div>
        <Popconfirm
          title="Clear Cart"
          description="Are you sure you want to remove all items from your cart?"
          onConfirm={handleClearCart}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            icon={<ClearOutlined />} 
            danger
            type="text"
          >
            Clear Cart
          </Button>
        </Popconfirm>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="middle" className="w-full">
            {items.map(item => (
              <Card key={item.id} className="w-full">
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={6}>
                    <Image
                      src={item.image_url || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg'}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded"
                      preview={false}
                    />
                  </Col>
                  <Col xs={24} sm={10}>
                    <Space direction="vertical" size="small">
                      <Title level={5} className="!mb-0">{item.name}</Title>
                      <Text type="secondary" className="text-sm">
                        {item.description}
                      </Text>
                      <Text strong className="text-green-600">
                        <DollarOutlined />{item.price}
                      </Text>
                    </Space>
                  </Col>
                  <Col xs={12} sm={4}>
                    <Space direction="vertical" size="small" align="center">
                      <Text type="secondary" className="text-xs">Quantity</Text>
                      <InputNumber
                        min={1}
                        max={item.stock}
                        value={item.quantity}
                        onChange={(value) => handleUpdateQuantity(item.id, value)}
                        size="small"
                      />
                    </Space>
                  </Col>
                  <Col xs={12} sm={4}>
                    <Space direction="vertical" size="small" align="end" className="w-full">
                      <Text strong className="text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.id)}
                        size="small"
                      >
                        Remove
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Order Summary" className="sticky top-24">
            <Space direction="vertical" size="middle" className="w-full">
              <div className="flex justify-between">
                <Text>Subtotal ({itemCount} items)</Text>
                <Text>${total.toFixed(2)}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Shipping</Text>
                <Text>Free</Text>
              </div>
              <div className="flex justify-between">
                <Text>Tax</Text>
                <Text>${(total * 0.08).toFixed(2)}</Text>
              </div>
              <Divider className="my-4" />
              <div className="flex justify-between">
                <Title level={4}>Total</Title>
                <Title level={4} className="text-green-600">
                  ${(total * 1.08).toFixed(2)}
                </Title>
              </div>
              <Button
                type="primary"
                size="large"
                block
                onClick={handleCheckout}
                className="h-12"
              >
                Proceed to Checkout
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}