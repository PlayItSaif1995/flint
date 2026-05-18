import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import './index.css'

import Splash from './pages/Splash'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'

import RolePicker from './pages/onboarding/RolePicker'
import CandProfession from './pages/onboarding/CandProfession'
import CandCV from './pages/onboarding/CandCV'
import CandLocation from './pages/onboarding/CandLocation'
import EmpCompany from './pages/onboarding/EmpCompany'
import EmpVerify from './pages/onboarding/EmpVerify'

import Discover from './pages/candidate/Discover'
import Applications from './pages/candidate/Applications'
import Sparks from './pages/candidate/Sparks'
import CandProfile from './pages/candidate/CandProfile'
import CandSettings from './pages/candidate/CandSettings'
import EditProfile from './pages/candidate/EditProfile'
import ChatScreen from './pages/ChatScreen'

import EmpDashboard from './pages/employer/EmpDashboard'
import Shortlist from './pages/employer/Shortlist'
import EmpSparks from './pages/employer/EmpSparks'
import EmpSettings from './pages/employer/EmpSettings'
import PostJob from './pages/employer/PostJob'
import EditJob from './pages/employer/EditJob'
import Headhunt from './pages/employer/Headhunt'

import Premium from './pages/Premium'
import EmpPremium from './pages/EmpPremium'
import Notifications from './pages/Notifications'

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="app-shell">
      <div className="loading-screen">
        <i className="ti ti-bolt spin" style={{ color: 'var(--spark)' }}></i>
        <p>Loading flint.</p>
      </div>
    </div>
  )

  // Not logged in — show auth screens
  if (!user) return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )

  // Logged in but not finished onboarding
  if (!profile?.onboarded) return (
    <div className="app-shell">
      <Routes>
        <Route path="/onboarding" element={<RolePicker />} />
        <Route path="/onboarding/profession" element={<CandProfession />} />
        <Route path="/onboarding/cv" element={<CandCV />} />
        <Route path="/onboarding/location" element={<CandLocation />} />
        <Route path="/onboarding/company" element={<EmpCompany />} />
        <Route path="/onboarding/verify" element={<EmpVerify />} />
        <Route path="*" element={<Navigate to="/onboarding" />} />
      </Routes>
    </div>
  )

  // Fully onboarded
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to={profile?.active_role === 'employer' ? '/employer' : '/discover'} />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/sparks" element={<Sparks />} />
        <Route path="/profile" element={<CandProfile />} />
        <Route path="/settings" element={<CandSettings />} />
        <Route path="/settings/edit-profile" element={<EditProfile />} />
        <Route path="/premium" element={<Premium />} />

        <Route path="/employer" element={<EmpDashboard />} />
        <Route path="/employer/shortlist/:jobId" element={<Shortlist />} />
        <Route path="/employer/sparks" element={<EmpSparks />} />
        <Route path="/employer/settings" element={<EmpSettings />} />
        <Route path="/employer/post-job" element={<PostJob />} />
        <Route path="/employer/edit-job/:jobId" element={<EditJob />} />
        <Route path="/employer/headhunt" element={<Headhunt />} />
        <Route path="/employer/premium" element={<EmpPremium />} />

        <Route path="/chat/:matchId" element={<ChatScreen />} />
        <Route path="/notifications" element={<Notifications />} />

        <Route path="/onboarding/company" element={<EmpCompany />} />
        <Route path="/onboarding/verify" element={<EmpVerify />} />
        <Route path="/onboarding/profession" element={<CandProfession />} />
        <Route path="/onboarding/cv" element={<CandCV />} />
        <Route path="/onboarding/location" element={<CandLocation />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
