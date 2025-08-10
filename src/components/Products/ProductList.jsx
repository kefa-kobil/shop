import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { ProductCard } from './ProductCard'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../store/slices/cartSlice'
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
  message,
  Card
} from 'antd'
import { 
  SearchOutlined, 
  FilterOutlined,
  HomeOutlined,
  TableOutlined,
  BedOutlined,
  LaptopOutlined,
  TrophyOutlined,
  ToolOutlined,
  GiftOutlined,
  HeartOutlined,
  FireOutlined,
  StarOutlined,
  ShoppingOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

export const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])
  
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  // Mock furniture and general merchandise products
  const mockProducts = [
    {
      id: '1',
      name: 'Modern Sectional Sofa',
      description: 'Comfortable L-shaped sectional sofa with premium fabric upholstery',
      price: 899.99,
      original_price: 1299.99,
      discount_percentage: 31,
      stock: 8,
      category: 'Sofas',
      image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      rating: 4.7,
      reviews_count: 156,
      active: true
    },
    {
      id: '2',
      name: 'Dining Table Set',
      description: '6-piece dining table set with solid wood construction',
      price: 649.99,
      original_price: 799.99,
      discount_percentage: 19,
      stock: 12,
      category: 'Tables',
      image_url: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg',
      rating: 4.5,
      reviews_count: 89,
      active: true
    },
    {
      id: '3',
      name: 'Ergonomic Office Chair',
      description: 'High-back ergonomic office chair with lumbar support',
      price: 299.99,
      original_price: 399.99,
      discount_percentage: 25,
      stock: 25,
      category: 'Chairs',
      image_url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
      rating: 4.6,
      reviews_count: 234,
      active: true
    },
    {
      id: '4',
      name: 'Queen Memory Foam Mattress',
      description: 'Premium memory foam mattress with cooling gel technology',
      price: 599.99,
      original_price: 899.99,
      discount_percentage: 33,
      stock: 15,
      category: 'Beds',
      image_url: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      rating: 4.8,
      reviews_count: 312,
      active: true
    },
    {
      id: '5',
      name: '55" 4K Smart TV',
      description: 'Ultra HD 4K Smart TV with HDR and streaming apps',
      price: 449.99,
      original_price: 599.99,
      discount_percentage: 25,
      stock: 18,
      category: 'Electronics',
      image_url: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg',
      rating: 4.4,
      reviews_count: 178,
      active: true
    },
    {
      id: '6',
      name: 'Gaming Laptop',
      description: 'High-performance gaming laptop with RTX graphics',
      price: 1299.99,
      original_price: 1599.99,
      discount_percentage: 19,
      stock: 6,
      category: 'Electronics',
      image_url: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
      rating: 4.9,
      reviews_count: 145,
      active: true
    },
    {
      id: '7',
      name: 'Storage Ottoman',
      description: 'Multi-functional storage ottoman with soft cushioning',
      price: 89.99,
      original_price: 129.99,
      discount_percentage: 31,
      stock: 35,
      category: 'Storage',
      image_url: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      rating: 4.3,
      reviews_count: 67,
      active: true
    },
    {
      id: '8',
      name: 'Treadmill Pro',
      description: 'Professional-grade treadmill with digital display',
      price: 799.99,
      original_price: 1099.99,
      discount_percentage: 27,
      stock: 4,
      category: 'Sports',
      image_url: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg',
      rating: 4.5,
      reviews_count: 98,
      active: true
    },
    {
      id: '9',
      name: 'Bookshelf Unit',
      description: '5-tier wooden bookshelf with adjustable shelves',
      price: 159.99,
      original_price: 219.99,
      discount_percentage: 27,
      stock: 22,
      category: 'Storage',
      image_url: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg',
      rating: 4.4,
      reviews_count: 134,
      active: true
    },
    {
      id: '10',
      name: 'Wireless Headphones',
      description: 'Premium noise-canceling wireless headphones',
      price: 199.99,
      original_price: 299.99,
      discount_percentage: 33,
      stock: 45,
      category: 'Electronics',
      image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
      rating: 4.7,
      reviews_count: 289,
      active: true
    },
    {
      id: '11',
      name: 'Yoga Mat Set',
      description: 'Premium yoga mat with carrying strap and blocks',
      price: 49.99,
      original_price: 79.99,
      discount_percentage: 38,
      stock: 60,
      category: 'Sports',
      image_url: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg',
      rating: 4.6,
      reviews_count: 156,
      active: true
    },
    {
      id: '12',
      name: 'Coffee Table',
      description: 'Modern glass-top coffee table with metal legs',
      price: 249.99,
      original_price: 349.99,
      discount_percentage: 29,
      stock: 14,
      category: 'Tables',
      image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      rating: 4.5,
      reviews_count: 78,
      active: true
    }
  ]

  const categoryData = [
    { key: 'chairs', icon: <HomeOutlined />, label: 'Chairs', color: '#1890ff' },
    { key: 'tables', icon: <TableOutlined />, label: 'Tables', color: '#52c41a' },
    { key: 'sofas', icon: <HeartOutlined />, label: 'Sofas', color: '#fa8c16' },
    { key: 'beds', icon: <BedOutlined />, label: 'Beds', color: '#722ed1' },
    { key: 'storage', icon: <ToolOutlined />, label: 'Storage', color: '#13c2c2' },
    { key: 'electronics', icon: <LaptopOutlined />, label: 'Electronics', color: '#eb2f96' },
    { key: 'sports', icon: <TrophyOutlined />, label: 'Sports', color: '#f759ab' },
    { key: 'miscellaneous', icon: <GiftOutlined />, label: 'Miscellaneous', color: '#faad14' },
  ]

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      // Use mock data for now
      setProducts(mockProducts)
      setError('')
    } catch (error) {
      setError('Failed to fetch products. Please check your connection.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const uniqueCategories = [...new Set(mockProducts.map(item => item.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      setCategories(['Chairs', 'Tables', 'Sofas', 'Beds', 'Storage', 'Electronics', 'Sports'])
    }
  }

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      message.warning('Please sign in to add items to cart')
      return
    }

    dispatch(addToCart(product))
    message.success('Item added to cart!')
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
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="text-white">
                <Title level={1} className="!text-white !text-5xl !font-bold !mb-6">
                  Welcome to<br />Daily Outlet
                </Title>
                <Text className="text-xl text-white opacity-90 block mb-8">
                  Discover amazing deals on furniture, electronics, sports goods, and more. 
                  Quality products at unbeatable prices.
                </Text>
                <Button 
                  type="primary" 
                  size="large" 
                  className="bg-white text-red-600 border-none hover:bg-gray-100 font-semibold px-8 py-6 h-auto text-lg"
                >
                  Shop Now
                </Button>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg" 
                  alt="Modern Living Room" 
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full p-4 shadow-lg">
                  <div className="text-center">
                    <Text className="text-xs text-gray-500 block">Welcome to our site, if you need help</Text>
                    <Text className="text-xs text-gray-500 block">simply reply to this message, we are</Text>
                    <Text className="text-xs text-gray-500 block">online and ready to help.</Text>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="!text-blue-600 !text-4xl !font-bold !mb-4">
              Our categories
            </Title>
            <Text className="text-lg text-gray-600">
              Lots of new products and product collections
            </Text>
          </div>
          
          <Row gutter={[32, 32]}>
            {categoryData.map((category, index) => (
              <Col key={category.key} xs={12} sm={8} md={6} lg={6}>
                <Card
                  hoverable
                  className="text-center border-none shadow-lg rounded-full aspect-square overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => setCategoryFilter(category.label)}
                  cover={
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div 
                        className="text-6xl"
                        style={{ color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div 
                          className="px-4 py-2 rounded-full text-white font-semibold text-sm"
                          style={{ backgroundColor: '#dc2626' }}
                        >
                          {category.label.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  }
                />
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Weekly Bestsellers Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Title level={2} className="!text-blue-600 !text-4xl !font-bold !mb-4">
              Weekly bestsellers
            </Title>
            <Text className="text-lg text-gray-600">
              Most popular products this week
            </Text>
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
                  className="rounded-full"
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
            <Row gutter={[24, 32]}>
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
      </div>

      {/* Shopping by Brands Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="!text-blue-600 !text-4xl !font-bold !mb-4">
              Shopping by brands
            </Title>
            <Text className="text-lg text-gray-600">
              Discover lots products from popular brands
            </Text>
          </div>
          
          <Row gutter={[24, 24]}>
            {[
              { name: 'IKEA', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg' },
              { name: 'West Elm', image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg' },
              { name: 'CB2', image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg' },
              { name: 'Pottery Barn', image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg' },
              { name: 'Crate & Barrel', image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg' }
            ].map((brand, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={4.8}>
                <Card
                  hoverable
                  className="overflow-hidden rounded-2xl shadow-lg border-none transform transition-all duration-300 hover:scale-105"
                  cover={
                    <div className="relative h-48">
                      <img 
                        src={brand.image} 
                        alt={brand.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="bg-white rounded-full p-4 shadow-lg">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <HomeOutlined className="text-2xl text-gray-600" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="text-white">
                          <Text className="text-xl font-bold text-white block">Brand</Text>
                          <Text className="text-sm text-white opacity-90">Company</Text>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Product Collections Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="!text-blue-600 !text-4xl !font-bold !mb-4">
              Product collections
            </Title>
            <Text className="text-lg text-gray-600">
              Explore product collections from our vendors
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}