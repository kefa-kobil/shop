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
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  message
} from 'antd'
import { 
  ArrowLeftOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

export const POSTransactions = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState([dayjs().startOf('day'), dayjs().endOf('day')])
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [transactionItems, setTransactionItems] = useState([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [stats, setStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    cashSales: 0,
    cardSales: 0
  })

  const isManager = user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => {
    fetchTransactions()
  }, [dateRange, paymentMethodFilter])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('pos_transactions')
        .select(`
          *,
          profiles!pos_transactions_cashier_id_fkey (
            full_name
          ),
          customer:profiles!pos_transactions_customer_id_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      // Apply date filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        query = query
          .gte('created_at', dateRange[0].toISOString())
          .lte('created_at', dateRange[1].toISOString())
      }

      // Apply payment method filter
      if (paymentMethodFilter) {
        query = query.eq('payment_method', paymentMethodFilter)
      }

      // If not manager, only show own transactions
      if (!isManager) {
        query = query.eq('cashier_id', user.id)
      }

      const { data, error } = await query

      if (error) throw error

      setTransactions(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      message.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (transactionData) => {
    const totalSales = transactionData.reduce((sum, t) => sum + parseFloat(t.total_amount), 0)
    const totalTransactions = transactionData.length
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0
    const cashSales = transactionData
      .filter(t => t.payment_method === 'cash')
      .reduce((sum, t) => sum + parseFloat(t.total_amount), 0)
    const cardSales = transactionData
      .filter(t => t.payment_method === 'card')
      .reduce((sum, t) => sum + parseFloat(t.total_amount), 0)

    setStats({
      totalSales,
      totalTransactions,
      averageTransaction,
      cashSales,
      cardSales
    })
  }

  const fetchTransactionItems = async (transactionId) => {
    try {
      const { data, error } = await supabase
        .from('pos_transaction_items')
        .select(`
          *,
          products (
            name,
            category
          )
        `)
        .eq('transaction_id', transactionId)

      if (error) throw error
      setTransactionItems(data || [])
    } catch (error) {
      console.error('Error fetching transaction items:', error)
      message.error('Failed to fetch transaction items')
    }
  }

  const showTransactionDetail = async (transaction) => {
    setSelectedTransaction(transaction)
    await fetchTransactionItems(transaction.id)
    setDetailModalVisible(true)
  }

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash': return 'green'
      case 'card': return 'blue'
      case 'digital_wallet': return 'purple'
      default: return 'default'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <DollarOutlined />
      case 'card': return <ShoppingCartOutlined />
      case 'digital_wallet': return <ShoppingCartOutlined />
      default: return <ShoppingCartOutlined />
    }
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    {
      title: 'Transaction #',
      dataIndex: 'transaction_number',
      key: 'transaction_number',
      render: (number) => <Text strong>{number}</Text>
    },
    {
      title: 'Date & Time',
      dataIndex: 'created_at',
      key: 'created_at',
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
      title: 'Cashier',
      dataIndex: ['profiles', 'full_name'],
      key: 'cashier',
      render: (name) => name || 'Unknown'
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'full_name'],
      key: 'customer',
      render: (name) => name || 'Walk-in'
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => (
        <Tag 
          color={getPaymentMethodColor(method)} 
          icon={getPaymentMethodIcon(method)}
          className="capitalize"
        >
          {method.replace('_', ' ')}
        </Tag>
      )
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => (
        <Text strong className="text-green-600">
          ${parseFloat(amount).toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'} className="capitalize">
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showTransactionDetail(record)}
          >
            View
          </Button>
          <Button
            type="text"
            icon={<PrinterOutlined />}
            onClick={() => message.info('Print receipt functionality would be implemented here')}
          >
            Print
          </Button>
        </Space>
      )
    }
  ]

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: ['products', 'name'],
      key: 'product_name',
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.products?.category}
          </Text>
        </div>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price) => `$${parseFloat(price).toFixed(2)}`
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total) => (
        <Text strong>${parseFloat(total).toFixed(2)}</Text>
      )
    }
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
        <Title level={2} className="!mb-2 !mt-4">POS Transactions</Title>
        <Text type="secondary">View and manage point of sale transactions</Text>
      </div>

      {/* Stats */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Sales"
              value={stats.totalSales}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={stats.totalTransactions}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Transaction"
              value={stats.averageTransaction}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cash vs Card"
              value={`${((stats.cashSales / (stats.totalSales || 1)) * 100).toFixed(0)}% / ${((stats.cardSales / (stats.totalSales || 1)) * 100).toFixed(0)}%`}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search transactions..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
              format="YYYY-MM-DD"
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Payment Method"
              value={paymentMethodFilter || undefined}
              onChange={setPaymentMethodFilter}
              allowClear
              className="w-full"
            >
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="digital_wallet">Digital Wallet</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
        />
      </Card>

      {/* Transaction Detail Modal */}
      <Modal
        title={`Transaction Details - ${selectedTransaction?.transaction_number}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => message.info('Print receipt functionality would be implemented here')}
          >
            Print Receipt
          </Button>
        ]}
        width={800}
      >
        {selectedTransaction && (
          <div>
            <Descriptions bordered column={2} className="mb-6">
              <Descriptions.Item label="Transaction Number">
                {selectedTransaction.transaction_number}
              </Descriptions.Item>
              <Descriptions.Item label="Date & Time">
                {dayjs(selectedTransaction.created_at).format('MMM DD, YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Cashier">
                {selectedTransaction.profiles?.full_name || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedTransaction.customer?.full_name || 'Walk-in'}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Tag 
                  color={getPaymentMethodColor(selectedTransaction.payment_method)}
                  className="capitalize"
                >
                  {selectedTransaction.payment_method.replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag 
                  color={selectedTransaction.payment_status === 'completed' ? 'green' : 'orange'}
                  className="capitalize"
                >
                  {selectedTransaction.payment_status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Notes" span={2}>
                {selectedTransaction.notes || 'No notes'}
              </Descriptions.Item>
            </Descriptions>

            <Title level={4}>Items</Title>
            <Table
              columns={itemColumns}
              dataSource={transactionItems}
              rowKey="id"
              pagination={false}
              size="small"
              className="mb-4"
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <Text>Subtotal:</Text>
                <Text>${parseFloat(selectedTransaction.subtotal).toFixed(2)}</Text>
              </div>
              <div className="flex justify-between mb-2">
                <Text>Tax:</Text>
                <Text>${parseFloat(selectedTransaction.tax_amount).toFixed(2)}</Text>
              </div>
              {selectedTransaction.discount_amount > 0 && (
                <div className="flex justify-between mb-2">
                  <Text>Discount:</Text>
                  <Text className="text-red-600">
                    -${parseFloat(selectedTransaction.discount_amount).toFixed(2)}
                  </Text>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <Text strong className="text-lg">Total:</Text>
                <Text strong className="text-lg text-green-600">
                  ${parseFloat(selectedTransaction.total_amount).toFixed(2)}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}