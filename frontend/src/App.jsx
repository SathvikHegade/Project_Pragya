import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import ProtectedRoute from './components/ProtectedRoute'
import AppFooter from './components/AppFooter'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const LabLibrary = lazy(() => import('./pages/LabLibrary'))
const ExperimentView = lazy(() => import('./pages/ExperimentView'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'))
const StudentProfile = lazy(() => import('./pages/StudentProfile'))
const NotesVivaPage = lazy(() => import('./pages/NotesVivaPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-root">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute><Navbar /><Dashboard /><AppFooter /></ProtectedRoute>
                } />
                <Route path="/labs" element={
                  <ProtectedRoute><Navbar /><LabLibrary /><AppFooter /></ProtectedRoute>
                } />
                <Route path="/experiment/:id" element={
                  <ProtectedRoute><Navbar /><ExperimentView /></ProtectedRoute>
                } />
                <Route path="/teacher" element={
                  <ProtectedRoute role="teacher"><Navbar /><TeacherDashboard /><AppFooter /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Navbar /><StudentProfile /><AppFooter /></ProtectedRoute>
                } />
                <Route path="/notes-viva" element={
                  <ProtectedRoute><Navbar /><NotesVivaPage /><AppFooter /></ProtectedRoute>
                } />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
