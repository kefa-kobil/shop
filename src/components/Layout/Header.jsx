import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import { 
  Layout, 
  Menu, 
  Button, 
  Dropdown, 
  Badge, 
  Avatar, 
  Space,
  Drawer,
  Input
} from 'antd'
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  MenuOutlined,
  ShopOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  ThunderboltOutlined,
  CalculatorOutlined,
  SearchOutlined,
  FacebookOutlined,
  InstagramOutlined,
  AppleOutlined,
  CoffeeOutlined,
  GiftOutlined,
  HeartOutlined,
  HomeOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'

const { Header: AntHeader } = Layout
const { Search } = Input

export const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { itemCount } = useSelector((state) => state.cart)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const handleSignOut = () => {
    dispatch(logoutUser())
    navigate('/')
    setDrawerVisible(false)
  }

  const isManager = user?.role === 'manager' || user?.role === 'admin'
  const isCustomer = user?.role === 'customer'

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.fullName || user?.email,
      disabled: true,
    },
    ...(isCustomer ? [
      {
        key: 'orders',
        icon: <OrderedListOutlined />,
        label: 'My Orders',
        onClick: () => navigate('/orders'),
      },
    ] : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: handleSignOut,
      danger: true,
    },
  ]

  const categories = [
    { key: 'fruits', icon: <AppleOutlined />, label: 'Fruits', color: '#52c41a' },
    { key: 'vegetables', icon: <GiftOutlined />, label: 'Vegetables', color: '#73d13d' },
    { key: 'dairy', icon: <CoffeeOutlined />, label: 'Dairy', color: '#1890ff' },
    { key: 'meat', icon: <HeartOutlined />, label: 'Meat', color: '#fa8c16' },
    { key: 'bakery', icon: <HomeOutlined />, label: 'Bakery', color: '#722ed1' },
    { key: 'beverages', icon: <CoffeeOutlined />, label: 'Beverages', color: '#13c2c2' },
    { key: 'snacks', icon: <GiftOutlined />, label: 'Snacks', color: '#eb2f96' },
    { key: 'health', icon: <MedicineBoxOutlined />, label: 'Health', color: '#f759ab' },
  ]

  return (
    <div className="bg-white shadow-sm">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-blue-600 rounded-full flex items-center justify-center">
                  <ShopOutlined className="text-2xl text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">Hot Deals</div>
                <div className="text-xs text-gray-500 -mt-1">Grocery • Liquidation • More</div>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <Search
                placeholder="Search for products..."
                size="large"
                className="w-full"
                style={{
                  borderRadius: '50px',
                }}
                onSearch={(value) => {
                  if (value.trim()) {
                    navigate(`/?search=${encodeURIComponent(value)}`)
                  }
                }}
              />
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Social Icons */}
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  type="text"
                  shape="circle"
                  icon={<FacebookOutlined />}
                  className="text-blue-600 hover:bg-blue-50"
                />
                <Button
                  type="text"
                  shape="circle"
                  icon={<InstagramOutlined />}
                  className="text-pink-600 hover:bg-pink-50"
                />
              </div>

              {isAuthenticated ? (
                <Space size="middle">
                  {/* Cart for customers */}
                  {isCustomer && (
                    <Link to="/cart">
                      <Badge count={itemCount} size="small">
                        <Button 
                          type="text" 
                          icon={<ShoppingCartOutlined />} 
                          size="large"
                          className="flex items-center justify-center hover:bg-gray-50"
                        />
                      </Badge>
                    </Link>
                  )}
                  
                  <div className="hidden md:flex items-center space-x-2">
                    {user?.role && (
                      <span className="px-3 py-1 text-xs bg-gradient-to-r from-red-500 to-blue-600 text-white rounded-full font-medium">
                        {user.role}
                      </span>
                    )}
                    <Dropdown
                      menu={{ items: userMenuItems }}
                      placement="bottomRight"
                      trigger={['click']}
                    >
                      <Button type="text" className="flex items-center space-x-2 hover:bg-gray-50">
                        <Avatar size="small" icon={<UserOutlined />} />
                        <span className="hidden lg:inline text-sm">
                          {user?.fullName || user?.email}
                        </span>
                      </Button>
                    </Dropdown>
                  </div>
                </Space>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link to="/auth">
                    <Button type="text" className="hover:bg-gray-50">Sign In</Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button 
                      type="primary" 
                      className="bg-gradient-to-r from-red-500 to-blue-600 border-none hover:from-red-600 hover:to-blue-700"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                className="md:hidden hover:bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="hidden lg:flex items-center space-x-8 overflow-x-auto">
              {categories.map((category) => (
                <Link
                  key={category.key}
                  to={`/?category=${category.key}`}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 whitespace-nowrap group"
                >
                  <div 
                    className="p-2 rounded-full group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span style={{ color: category.color }}>
                      {category.icon}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{category.label}</span>
                </Link>
              ))}
            </div>

            {/* Additional Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link to="/auctions" className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
                <ThunderboltOutlined />
                <span className="text-sm font-medium">Auctions</span>
              </Link>
              {isManager && (
                <>
                  <Link to="/admin" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                    <DashboardOutlined />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                  <Link to="/admin/pos" className="flex items-center space-x-1 text-gray-700 hover:text-green-600">
                    <CalculatorOutlined />
                    <span className="text-sm font-medium">POS</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={320}
      >
        <div className="space-y-6">
          {/* Mobile Search */}
          <Search
            placeholder="Search products..."
            size="large"
            onSearch={(value) => {
              if (value.trim()) {
                navigate(`/?search=${encodeURIComponent(value)}`)
                setDrawerVisible(false)
              }
            }}
          />

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <Link
                  key={category.key}
                  to={`/?category=${category.key}`}
                  onClick={() => setDrawerVisible(false)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50"
                >
                  <div 
                    className="p-3 rounded-full mb-2"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span style={{ color: category.color }}>
                      {category.icon}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-center">{category.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <Link
              to="/auctions"
              onClick={() => setDrawerVisible(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <ThunderboltOutlined className="text-red-500" />
              <span>Auctions</span>
            </Link>
            
            {isAuthenticated && isCustomer && (
              <Link
                to="/orders"
                onClick={() => setDrawerVisible(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <OrderedListOutlined className="text-blue-500" />
                <span>My Orders</span>
              </Link>
            )}

            {isManager && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setDrawerVisible(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <DashboardOutlined className="text-blue-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/pos"
                  onClick={() => setDrawerVisible(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <CalculatorOutlined className="text-green-500" />
                  <span>POS System</span>
                </Link>
              </>
            )}
          </div>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
                <Avatar icon={<UserOutlined />} />
                <div>
                  <div className="font-medium">{user?.fullName || user?.email}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>
              <Button
                danger
                block
                icon={<LogoutOutlined />}
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="border-t pt-4 space-y-3">
              <Link to="/auth" onClick={() => setDrawerVisible(false)}>
                <Button block>Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setDrawerVisible(false)}>
                <Button type="primary" block>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}