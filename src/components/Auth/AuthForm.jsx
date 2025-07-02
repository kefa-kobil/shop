import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, signupUser, clearError } from '../../store/slices/authSlice'
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Card, 
  Typography, 
  Space, 
  Alert,
  Divider
} from 'antd'
import { 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  ShopOutlined
} from '@ant-design/icons'

const { Title, Text, Link } = Typography
const { Option } = Select

export const AuthForm = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth)
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  const [form] = Form.useForm()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    // Clear error when component mounts or mode changes
    dispatch(clearError())
  }, [dispatch, isSignUp])

  const handleSubmit = async (values) => {
    if (isSignUp) {
      dispatch(signupUser({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: values.role
      }))
    } else {
      dispatch(loginUser(values.email, values.password))
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    dispatch(clearError())
    form.resetFields()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <div className="text-center mb-8">
            <Space direction="vertical" size="small">
              <ShopOutlined className="text-4xl text-blue-600" />
              <Title level={2} className="!mb-0">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Title>
              <Text type="secondary">
                {isSignUp ? 'Join our supermarket community' : 'Sign in to your account'}
              </Text>
            </Space>
          </div>

          {error && (
            <Alert
              message="Authentication Error"
              description={error}
              type="error"
              showIcon
              className="mb-6"
              closable
              onClose={() => dispatch(clearError())}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            {isSignUp && (
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please enter your full name' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your full name"
                />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            {isSignUp && (
              <Form.Item
                name="role"
                label="Role"
                initialValue="customer"
                rules={[
                  { required: true, message: 'Please select a role' }
                ]}
              >
                <Select placeholder="Select your role">
                  <Option value="customer">Customer</Option>
                  <Option value="manager">Manager</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </Form.Item>
            )}

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="h-12"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="text-center">
            <Text type="secondary">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Link onClick={toggleMode} className="font-medium">
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Link>
            </Text>
          </div>

          {/* Test Accounts Info */}
          {!isSignUp && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <Text strong className="text-blue-800">Test Accounts:</Text>
              <div className="mt-2 text-sm text-blue-700">
                <div>Customer: customer@test.com</div>
                <div>Manager: manager@test.com</div>
                <div>Admin: admin@test.com</div>
                <div className="mt-1 text-xs">Password: password123</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}