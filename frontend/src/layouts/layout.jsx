import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import RoleRedirect from '../components/RoleRedirect'
import {Outlet} from 'react-router-dom'

const Layout = () => {
  return (
    <>
    {/* <RoleRedirect /> */}
    <Header/>
    <Outlet />
    <Footer />
    </>
  )
}

export default Layout