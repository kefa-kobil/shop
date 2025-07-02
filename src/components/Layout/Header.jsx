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
  Drawer
} from 'antd'
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  MenuOutlined,
  ShopOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined
} from '@ant-design/icons'

const { Header: AntHeader } = Layout

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

  const navigationItems = [
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: <Link to="/">Products</Link>,
    },
    ...(isAuthenticated ? [
      ...(isCustomer ? [
        {
          key: 'orders',
          icon: <OrderedListOutlined />,
          label: <Link to="/orders">My Orders</Link>,
        },
      ] : []),
      ...(isManager ? [
        {
          key: 'admin',
          icon: <DashboardOutlined />,
          label: <Link to="/admin">Dashboard</Link>,
        },
      ] : []),
    ] : []),
  ]

  const mobileMenuItems = [
    ...navigationItems,
    ...(isAuthenticated ? [
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
    ] : [
      {
        type: 'divider',
      },
      {
        key: 'signin',
        icon: <UserOutlined />,
        label: <Link to="/auth">Sign In</Link>,
      },
      {
        key: 'signup',
        label: <Link to="/auth?mode=signup">Sign Up</Link>,
      },
    ]),
  ]

  return (
    <AntHeader className="bg-white shadow-md sticky top-0 z-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <ShopOutlined className="text-2xl text-blue-600" />
          <span className="text-xl font-bold text-gray-900 hidden sm:block">
            SuperMarket
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center flex-1 justify-center">
          <Menu
            mode="horizontal"
            items={navigationItems}
            className="border-none bg-transparent flex-1 justify-center"
            style={{ lineHeight: '64px' }}
          />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Space size="middle">
              {/* Only show cart for customers */}
              {isCustomer && (
                <Link to="/cart">
                  <Badge count={itemCount} size="small">
                    <Button 
                      type="text" 
                      icon={<ShoppingCartOutlined />} 
                      size="large"
                      className="flex items-center justify-center"
                    />
                  </Badge>
                </Link>
              )}
              
              <div className="hidden md:flex items-center space-x-2">
                {user?.role && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                    {user.role}
                  </span>
                )}
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <Button type="text" className="flex items-center space-x-2">
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
                <Button type="text">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button type="primary">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            className="lg:hidden"
          />
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
        >
          <Menu
            mode="vertical"
            items={mobileMenuItems}
            className="border-none"
            onClick={() => setDrawerVisible(false)}
          />
          
          {isAuthenticated && user?.role && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Avatar size="small" icon={<UserOutlined />} />
                <div>
                  <div className="text-sm font-medium">
                    {user?.fullName || user?.email}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </AntHeader>
  )
}