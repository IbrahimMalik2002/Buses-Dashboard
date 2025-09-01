import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import BusDetails from './components/BusDetails'
import './styles.css'


const router = createBrowserRouter([
{ path: '/', element: <App /> },
{ path: '/bus/:id', element: <BusDetails /> },
])


createRoot(document.getElementById('root')).render(
<React.StrictMode>
<RouterProvider router={router} />
</React.StrictMode>
)