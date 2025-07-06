import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Layout/Header'
import { ProductList } from './components/Products/ProductList'
import { AuthForm } from './components/Auth/AuthForm'
import { AdminDashboard } from './components/Admin/AdminDashboard'
import { AddProduct } from './components/Admin/AddProduct.jsx'
import { ManageUsers } from './components/Admin/ManageUsers'
import { Analytics } from './components/Admin/Analytics'
import { AuctionList } from './components/Auctions/AuctionList'
import { AuctionDetail } from './components/Auctions/AuctionDetail'
import { CreateAuction } from './components/Auctions/CreateAuction'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Cart } from './components/Cart/Cart'
import { Orders } from './components/Orders/Orders'
import { POSSystem } from './components/POS/POSSystem'
import { POSTransactions } from './components/POS/POSTransactions'
import { POSSessions } from './components/POS/POSSessions'
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
            <Route path="/auctions" element={<AuctionList />} />
            <Route 
              path="/auctions/:id" 
              element={
                <ProtectedRoute>
                  <AuctionDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auctions/create" 
              element={
                <ProtectedRoute requireManager={true}>
                  <CreateAuction />
                </ProtectedRoute>
              } 
            />
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
              path="/admin/pos" 
              element={
                <ProtectedRoute requireManager={true}>
                  <POSSystem />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/pos-transactions" 
              element={
                <ProtectedRoute requireManager={true}>
                  <POSTransactions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/pos-sessions" 
              element={
                <ProtectedRoute requireManager={true}>
                  <POSSessions />
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