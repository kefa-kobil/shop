import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { ProductCard } from './ProductCard'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Row, 
  Col, 
  Input, 
  Select, 
  Spin, 
  Alert, 
  Button, 
  Typography, 
  Space,
  Empty,
  message
} from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Option } = Select

export const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      setError('Failed to fetch products')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null)

      if (error) throw error
      
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleAddToCart = async (product) => {
    if (!user) {
      message.warning('Please sign in to add items to cart')
      return
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingItem) {
        // Update quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)

        if (updateError) throw updateError
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          })

        if (insertError) throw insertError
      }

      message.success('Item added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      message.error('Failed to add item to cart')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchProducts}>
              Try Again
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-2">Our Products</Title>
        <Typography.Text type="secondary">
          Discover amazing deals on quality products
        </Typography.Text>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={16} md={18}>
            <Input
              size="large"
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              size="large"
              placeholder="All Categories"
              value={categoryFilter || undefined}
              onChange={setCategoryFilter}
              allowClear
              className="w-full"
              suffixIcon={<FilterOutlined />}
            >
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Empty
          description={
            <Space direction="vertical">
              <Typography.Text>No products found</Typography.Text>
              <Typography.Text type="secondary">
                Try adjusting your search or filters
              </Typography.Text>
            </Space>
          }
          className="py-16"
        />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredProducts.map(product => (
            <Col 
              key={product.id} 
              xs={24} 
              sm={12} 
              md={8} 
              lg={6}
            >
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}