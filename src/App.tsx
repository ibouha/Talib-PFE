import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Housing from './pages/Housing';
import HousingDetails from './pages/HousingDetails';
import Items from './pages/Items';
import ItemDetails from './pages/ItemDetails';
import Roommates from './pages/Roommates';
import RoommateDetails from './pages/RoommateDetails';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import DebugAPI from './pages/DebugAPI';
import AuthDebug from './pages/AuthDebug';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import StudentDashboard from './pages/dashboard/student/StudentDashboard';
import OwnerDashboard from './pages/dashboard/owner/OwnerDashboard';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';

// Management Pages
import MyItemsPage from './pages/dashboard/student/MyItemsPage';
import MyRoommateProfilesPage from './pages/dashboard/student/MyRoommateProfilesPage';
import MyPropertiesPage from './pages/dashboard/owner/MyPropertiesPage';

// Admin Management Pages
import AdminUsersPage from './pages/dashboard/admin/AdminUsersPage';
import AdminContentPage from './pages/dashboard/admin/AdminContentPage';


// Form Pages
import AddPropertyPage from './pages/forms/AddPropertyPage';
import EditPropertyPage from './pages/forms/EditPropertyPage';
import AddItemPage from './pages/forms/AddItemPage';
import EditItemPage from './pages/forms/EditItemPage';
import CreateRoommateProfilePage from './pages/forms/CreateRoommateProfilePage';
import EditRoommateProfilePage from './pages/forms/EditRoommateProfilePage';
import StyleGuide from './pages/StyleGuide';



// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {
  const { i18n } = useTranslation();
  const [isRtl, setIsRtl] = useState(i18n.language === 'ar');

  // Handle RTL direction based on language
  useEffect(() => {
    setIsRtl(i18n.language === 'ar');
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <ToastProvider>
      <AuthProvider>
        <FavoritesProvider>
          <div className={isRtl ? 'rtl' : ''}>
            <Routes>
              {/* Main Layout Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/items" element={<Items />} />
                <Route path="/items/:id" element={<ItemDetails />} />
                <Route path="/housing" element={<Housing />} />
                <Route path="/housing/:id" element={<HousingDetails />} />
                <Route path="/roommates" element={<Roommates />} />
                <Route path="/roommates/:id" element={<RoommateDetails />} />
                <Route path="/style-guide" element={<StyleGuide />} />
                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                <Route path="/auth-debug" element={<AuthDebug />} />
                <Route path="/debug-api" element={<DebugAPI />} />
              </Route>

              {/* Auth Layout Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />


              </Route>

              {/* Dashboard Layout Routes - Protected */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="student" element={<StudentDashboard />} />
                <Route path="owner" element={<OwnerDashboard />} />
                <Route path="admin" element={<AdminDashboard />} />

                {/* Student Management Pages */}
                <Route path="my-items" element={
                  <ProtectedRoute requiredRole="student">
                    <MyItemsPage />
                  </ProtectedRoute>
                } />
                <Route path="my-roommate-profiles" element={
                  <ProtectedRoute requiredRole="student">
                    <MyRoommateProfilesPage />
                  </ProtectedRoute>
                } />

                {/* Owner Management Pages */}
                <Route path="my-properties" element={
                  <ProtectedRoute requiredRole="owner">
                    <MyPropertiesPage />
                  </ProtectedRoute>
                } />

                {/* Admin Management Pages */}
                <Route path="admin-users" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsersPage />
                  </ProtectedRoute>
                } />
                <Route path="admin-content" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminContentPage />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Profile Route inside Dashboard Layout - Protected */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Profile />} />
              </Route>

              {/* Form Routes inside Dashboard Layout - Protected */}
              <Route path="/add-property" element={
                <ProtectedRoute requiredRole="owner">
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AddPropertyPage />} />
              </Route>

              <Route path="/edit-property/:id" element={
                <ProtectedRoute requiredRole="owner">
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<EditPropertyPage />} />
              </Route>

              <Route path="/add-item" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AddItemPage />} />
              </Route>

              <Route path="/edit-item/:id" element={
                <ProtectedRoute requiredRole="student">
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<EditItemPage />} />
              </Route>

              <Route path="/create-roommate-profile" element={
                <ProtectedRoute requiredRole="student">
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<CreateRoommateProfilePage />} />
              </Route>

              <Route path="/edit-roommate-profile/:id" element={
                <ProtectedRoute requiredRole="student">
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<EditRoommateProfilePage />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

          </div>
        </FavoritesProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;