import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { 
  Card, 
  Table, 
  Typography, 
  Space, 
  Button,
  Tag,
  Modal,
  Form,
  InputNumber,
  message,
  Statistic,
  Row,
  Col,
  Descriptions
} from 'antd'
import { 
  ArrowLeftOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export const POSSessions = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [closeSessionModalVisible, setCloseSessionModalVisible] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [form] = Form.useForm()

  const isManager = user?.role === 'manager' || user?.role === 'admin'
  const isStaff = isManager || user?.role === 'cashier'

  useEffect(() => {
    if (isStaff) {
      fetchSessions()
    }
  }, [isStaff])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('pos_sessions')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('opened_at', { ascending: false })

      // If not manager, only show own sessions
      if (!isManager) {
        query = query.eq('cashier_id', user.id)
      }

      const { data, error } = await query

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
      message.error('Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    try {
      // Check if user already has an open session
      const { data: existingSession } = await supabase
        .from('pos_sessions')
        .select('id')
        .eq('cashier_id', user.id)
        .eq('status', 'open')
        .single()

      if (existingSession) {
        message.warning('You already have an active session')
        return
      }

      const { data, error } = await supabase
        .from('pos_sessions')
        .insert({
          cashier_id: user.id,
          register_number: `REG-${user.id.slice(-3)}`,
          opening_cash: 200.00,
          status: 'open'
        })
        .select()
        .single()

      if (error) throw error
      
      message.success('POS session started successfully')
      fetchSessions()
    } catch (error) {
      console.error('Error starting session:', error)
      message.error('Failed to start POS session')
    }
  }

  const showCloseSessionModal = (session) => {
    setSelectedSession(session)
    form.setFieldsValue({
      closing_cash: session.opening_cash + session.total_sales
    })
    setCloseSessionModalVisible(true)
  }

  const closeSession = async (values) => {
    try {
      const { error } = await supabase
        .from('pos_sessions')
        .update({
          closing_cash: values.closing_cash,
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', selectedSession.id)

      if (error) throw error
      
      message.success('Session closed successfully')
      setCloseSessionModalVisible(false)
      setSelectedSession(null)
      form.resetFields()
      fetchSessions()
    } catch (error) {
      console.error('Error closing session:', error)
      message.error('Failed to close session')
    }
  }

  const getStatusColor = (status) => {
    return status === 'open' ? 'green' : 'red'
  }

  const calculateSessionDuration = (openedAt, closedAt) => {
    const start = dayjs(openedAt)
    const end = closedAt ? dayjs(closedAt) : dayjs()
    const duration = end.diff(start, 'minute')
    
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    return `${hours}h ${minutes}m`
  }

  const columns = [
    {
      title: 'Register',
      dataIndex: 'register_number',
      key: 'register_number',
      render: (number) => <Text strong>{number}</Text>
    },
    {
      title: 'Cashier',
      dataIndex: ['profiles', 'full_name'],
      key: 'cashier',
      render: (name) => name || 'Unknown'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="capitalize">
          {status}
        </Tag>
      )
    },
    {
      title: 'Opened At',
      dataIndex: 'opened_at',
      key: 'opened_at',
      render: (date) => (
        <div>
          <div>{dayjs(date).format('MMM DD, YYYY')}</div>
          <Text type="secondary" className="text-xs">
            {dayjs(date).format('HH:mm:ss')}
          </Text>
        </div>
      )
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => calculateSessionDuration(record.opened_at, record.closed_at)
    },
    {
      title: 'Opening Cash',
      dataIndex: 'opening_cash',
      key: 'opening_cash',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`
    },
    {
      title: 'Total Sales',
      dataIndex: 'total_sales',
      key: 'total_sales',
      render: (amount) => (
        <Text className="text-green-600 font-semibold">
          ${parseFloat(amount).toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Transactions',
      dataIndex: 'total_transactions',
      key: 'total_transactions'
    },
    {
      title: 'Closing Cash',
      dataIndex: 'closing_cash',
      key: 'closing_cash',
      render: (amount) => amount ? `$${parseFloat(amount).toFixed(2)}` : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'open' && (record.cashier_id === user.id || isManager) && (
            <Button
              type="primary"
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => showCloseSessionModal(record)}
            >
              Close Session
            </Button>
          )}
        </Space>
      )
    }
  ]

  if (!isStaff) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-8">
            <Title level={3}>Access Denied</Title>
            <Text type="secondary">Only staff members can access POS sessions</Text>
          </div>
        </Card>
      </div>
    )
  }

  const activeSession = sessions.find(s => s.status === 'open' && s.cashier_id === user.id)

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
            <Title level={2} className="!mb-2">POS Sessions</Title>
            <Text type="secondary">Manage point of sale sessions</Text>
          </div>
          {!activeSession && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={startSession}
              size="large"
            >
              Start New Session
            </Button>
          )}
        </div>
      </div>

      {/* Active Session Stats */}
      {activeSession && (
        <Card className="mb-6" title="Current Active Session">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Register"
                value={activeSession.register_number}
                prefix={<ShoppingCartOutlined />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Session Duration"
                value={calculateSessionDuration(activeSession.opened_at)}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Total Sales"
                value={activeSession.total_sales}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Transactions"
                value={activeSession.total_transactions}
                prefix={<ShoppingCartOutlined />}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Sessions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} sessions`,
          }}
        />
      </Card>

      {/* Close Session Modal */}
      <Modal
        title="Close POS Session"
        open={closeSessionModalVisible}
        onCancel={() => {
          setCloseSessionModalVisible(false)
          setSelectedSession(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        {selectedSession && (
          <div>
            <Descriptions bordered column={1} className="mb-6">
              <Descriptions.Item label="Register">
                {selectedSession.register_number}
              </Descriptions.Item>
              <Descriptions.Item label="Opened At">
                {dayjs(selectedSession.opened_at).format('MMM DD, YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {calculateSessionDuration(selectedSession.opened_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Opening Cash">
                ${parseFloat(selectedSession.opening_cash).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Sales">
                ${parseFloat(selectedSession.total_sales).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Transactions">
                {selectedSession.total_transactions}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Closing Cash">
                ${(parseFloat(selectedSession.opening_cash) + parseFloat(selectedSession.total_sales)).toFixed(2)}
              </Descriptions.Item>
            </Descriptions>

            <Form
              form={form}
              layout="vertical"
              onFinish={closeSession}
            >
              <Form.Item
                name="closing_cash"
                label="Actual Closing Cash"
                rules={[
                  { required: true, message: 'Please enter closing cash amount' }
                ]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  className="w-full"
                  size="large"
                  prefix="$"
                />
              </Form.Item>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setCloseSessionModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" danger>
                  Close Session
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}