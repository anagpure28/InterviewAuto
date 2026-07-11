import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from '../Pages/HomePage'
import LangSelectionPage from '../Pages/LangSelectionPage'
import PageNotFound from '../Pages/PageNotFound'
import ScreenPage from '../Pages/ScreenPage'
import Dashboard from '../Pages/Dashboard'
import Studymaterial from '../Pages/Studymaterial'
import { PrivateRoute } from './PrivateRoute'
import { CourseRoute } from './CourseRoute'
import { Login } from '../Pages/Login'

const AllRoutes = () => {
  return (
    <div>
        <Routes>
            {/* Public */}
            <Route path='/' element={<HomePage />}/>
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Login />} />
            <Route path='/study-material' element={<Studymaterial />}/>

            {/* Protected — require a logged-in user (valid JWT) */}
            <Route path='/language' element={
              <PrivateRoute>
                <LangSelectionPage />
              </PrivateRoute>
            }/>
            <Route path='/screen' element={
              <PrivateRoute>
                <CourseRoute>
                  <ScreenPage />
                </CourseRoute>
              </PrivateRoute>
            }/>
            <Route path='/dashboard' element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }/>

            <Route path='*' element={<PageNotFound />}/>
        </Routes>
    </div>
  )
}

export default AllRoutes
