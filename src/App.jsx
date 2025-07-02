import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Header } from './components/Layout/Header'
import { ProductList } from './components/Products/ProductList'
import { AuthForm } from './components/Auth/AuthForm'
import { AdminDashboard } from './components/Admin/AdminDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout, Typography } from 'antd'

const { Content } = Layout
const { Title, Text } = Typography

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout className="min-h-screen">
          <Header />
          <Content>
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/auth" element={<AuthForm />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireManager={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <Title level={2}>My Orders</Title>
                      <Text type="secondary">Order history will be displayed here</Text>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <Title level={2}>Shopping Cart</Title>
                      <Text type="secondary">Cart items will be displayed here</Text>
                    </div>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App