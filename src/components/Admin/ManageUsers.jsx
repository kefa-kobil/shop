import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Card, 
  Table, 
  Button, 
  Typography, 
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Avatar
} from 'antd'
import { 
  ArrowLeftOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  UserOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

export const ManageUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  // Mock users data
  const mockUsers = [
    {
      id: '1',
      email: 'customer@test.com',
      fullName: 'Test Customer',
      role: 'customer',
      createdAt: '2024-01-15',
      lastLogin: '2024-01-20',
      status: 'active'
    },
    {
      id: '2',
      email: 'manager@test.com',
      fullName: 'Test Manager',
      role: 'manager',
      createdAt: '2024-01-10',
      lastLogin: '2024-01-19',
      status: 'active'
    },
    {
      id: '3',
      email: 'admin@test.com',
      fullName: 'Test Admin',
      role: 'admin',
      createdAt: '2024-01-01',
      lastLogin: '2024-01-20',
      status: 'active'
    },
    {
      id: '4',
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      role: 'customer',
      createdAt: '2024-01-18',
      lastLogin: '2024-01-19',
      status: 'active'
    },
    {
      id: '5',
      email: 'jane.smith@example.com',
      fullName: 'Jane Smith',
      role: 'customer',
      createdAt: '2024-01-16',
      lastLogin: '2024-01-17',
      status: 'inactive'
    }
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setUsers(mockUsers)
    } catch (error) {
      message.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setEditModalVisible(true)
  }

  const handleDelete = async (userId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setUsers(users.filter(user => user.id !== userId))
      message.success('User deleted successfully')
    } catch (error) {
      message.error('Failed to delete user')
    }
  }

  const handleEditSubmit = async (values) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...values }
          : user
      ))
      
      message.success('User updated successfully')
      setEditModalVisible(false)
      setEditingUser(null)
      form.resetFields()
    } catch (error) {
      message.error('Failed to update user')
    }
  }

  const handleAddSubmit = async (values) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newUser = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Never',
        status: 'active'
      }
      
      setUsers([...users, newUser])
      message.success('User added successfully')
      setAddModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('Failed to add user')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red'
      case 'manager': return 'blue'
      case 'customer': return 'green'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red'
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const columns = [
    {
      title: 'User',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} className="capitalize">
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="flex justify-between items-center mt-4">
          <div>
            <Title level={2} className="!mb-2">Manage Users</Title>
            <Text type="secondary">Manage user accounts and permissions</Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Space size="large">
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by role"
            value={roleFilter || undefined}
            onChange={setRoleFilter}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="customer">Customer</Option>
            <Option value="manager">Manager</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Space>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setEditingUser(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value="customer">Customer</Option>
              <Option value="manager">Manager</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                Update User
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        title="Add New User"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSubmit}
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
            initialValue="customer"
          >
            <Select>
              <Option value="customer">Customer</Option>
              <Option value="manager">Manager</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                Add User
              </Button>
              <Button onClick={() => setAddModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}