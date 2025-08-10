import { useState } from 'react'
import { Card, Button, Rate, Tag, Typography, Space, Image } from 'antd'
import { ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons'

const { Text, Title } = Typography
const { Meta } = Card

export const ProductCard = ({ product, onAddToCart }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await onAddToCart(product)
    } finally {
      setIsLoading(false)
    }
  }

  const actions = [
    <Button
      key="add-to-cart"
      type="primary"
      icon={<ShoppingCartOutlined />}
      onClick={handleAddToCart}
      loading={isLoading}
      disabled={product.stock === 0}
      block
      size="large"
      className="mx-4 mb-4"
    >
      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  ]

  return (
    <Card
      hoverable
      className="h-full flex flex-col"
      cover={
        <div className="relative overflow-hidden h-48">
          <Image
            alt={product.name}
            src={product.image_url || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg'}
            className="w-full h-full object-cover"
            preview={false}
          />
          {product.discount_percentage && (
            <Tag 
              color="red" 
              className="absolute top-2 right-2 font-semibold"
            >
              {product.discount_percentage}% OFF
            </Tag>
          )}
        </div>
      }
      actions={actions}
      bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex-1">
        <Meta
          title={
            <Title level={5} className="!mb-2 line-clamp-2">
              {product.name}
            </Title>
          }
          description={
            <Text type="secondary" className="line-clamp-2 text-sm">
              {product.description}
            </Text>
          }
        />

        <div className="mt-3 space-y-3">
          {/* Rating */}
          <div className="flex items-center justify-between">
            <Rate 
              disabled 
              defaultValue={product.rating || 4} 
              className="text-sm"
            />
            <Text type="secondary" className="text-xs">
              ({product.reviews_count || 0} reviews)
            </Text>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <Space align="baseline">
              <Text strong className="text-lg text-green-600">
                <DollarOutlined />{product.price}
              </Text>
              {product.original_price && product.original_price > product.price && (
                <Text delete type="secondary" className="text-sm">
                  ${product.original_price}
                </Text>
              )}
            </Space>
            
            <Tag color={product.stock > 10 ? 'green' : product.stock > 0 ? 'orange' : 'red'}>
              Stock: {product.stock}
            </Tag>
          </div>

          {/* Category */}
          {product.category && (
            <Tag color="blue" className="text-xs">
              {product.category}
            </Tag>
          )}
        </div>
      </div>
    </Card>
  )
}