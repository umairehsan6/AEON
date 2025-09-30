import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom'
import Layout from './layouts/layout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import Home from './components/homepages.jsx'
import Login from './components/login.jsx'
import Signup from './components/signup2.jsx'
import HomePage from './pages/home.jsx'
import AdminPage from './pages/AdminPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

const router = createBrowserRouter(createRoutesFromElements(
  <>
    <Route path='/' element={<Layout />}>
      <Route path='' element={<HomePage />} />
      <Route path='login' element={<Login />} />
      <Route path='signup' element={<Signup />} />
      <Route path='profile' element={<ProfilePage />} />
    </Route>
    <Route path='/admin' element={<AdminLayout />}>
      <Route path='' element={<AdminPage />} />
    </Route>
  </>
))



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
