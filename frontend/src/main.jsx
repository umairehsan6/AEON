import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom'
import Layout from './layouts/layout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
// import Home from './components/homepages.jsx'
import Login from './components/login.jsx'
import Signup from './components/signup2.jsx'
import HomePage from './pages/home.jsx'
import AdminPage from './pages/AdminPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ProductManagement from './pages/ProoductManangment.jsx'
import Cart from './pages/cart.jsx'
import ProductListPage from './pages/products.jsx'
import ProductPage from './pages/Productpage.jsx'
import Collection from './pages/Collection.jsx'
import CheckoutPage from './pages/Checkout.jsx'
import OrdersPage from './pages/Orders.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import { CartProvider } from './context/CartContext.jsx'
const router = createBrowserRouter(createRoutesFromElements(
  <>
    <Route path='/' element={<Layout />}>
      <Route path='' element={<HomePage />} />
      <Route path='login' element={<Login />} />
      <Route path='signup' element={<Signup />} />
      <Route path='profile' element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path='orders' element={
        <ProtectedRoute>
          <OrdersPage />
        </ProtectedRoute>
      } />
      <Route path='products' element={<ProductListPage />} />
      <Route path='product/:id' element={<ProductPage />} />
      <Route path='cart' element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      }/>
    </Route>
    <Route path='/admin' element={
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    }>
      <Route path='' element={<DashboardPage />} />
      <Route path='dashboard' element={<DashboardPage />} />
      <Route path='orders' element={<OrdersPage />} />
      <Route path='product-management' element={<ProductManagement />} />
      <Route path='collection' element={<Collection />} />
    </Route>
    <Route path='/checkout' element={<CheckoutPage />} />
  </>
))



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </StrictMode>,
)
