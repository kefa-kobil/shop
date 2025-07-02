import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Layout/Header'
import { ProductList } from './components/Products/ProductList'
import { AuthForm } from './components/Auth/AuthForm'
import { AdminDashboard } from './components/Admin/AdminDashboard'
import { AddProduct } from './components/Admin/AddProduct'
import { ManageUsers } from './components/Admin/ManageUsers'
import { Analytics } from './components/Admin/Analytics'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Cart } from './components/Cart/Cart'
import { Orders } from './components/Orders/Orders'
import { Layout } from 'antd'

const { Content } = Layout

function App() {
  return (
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
              path="/admin/add-product" 
              element={
                <ProtectedRoute requireManager={true}>
                  <AddProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manage-users" 
              element={
                <ProtectedRoute requireManager={true}>
                  <ManageUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute requireManager={true}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute requireCustomer={true}>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute requireCustomer={true}>
                  <Cart />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Content>
      </Layout>
    </Router>
  )
}

export default App