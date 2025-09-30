import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './pages/App.jsx'
import Order from './pages/Order.jsx'
import Kitchen from './pages/Kitchen.jsx'
import { initOneSignal } from './lib/push.js'

initOneSignal()

const router = createBrowserRouter([
  { path: '/', element: <App/> },
  { path: '/order', element: <Order/> },     // QR이 여길 가리킴 ?table=5
  { path: '/kitchen', element: <Kitchen/> }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
)