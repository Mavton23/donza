import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import AboutPage from './pages/AboutPage';
import Login from "./pages/auth/Login";
import AuthRedirectModal from './components/common/AuthRedirectModal';
import Register from "./pages/auth/Register";
import { AdminRegisterForm } from './pages/auth/AdminRegisterForm';
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import SearchResults from './components/search/SearchResults';
import SettingsPage from "./pages/settings/SettingsPage"
import AccountSettings from "./pages/settings/AccountSettings";
import SecuritySettings from './pages/settings/SecuritySettings';
import NotificationSettings from './pages/settings/NotificationSettings';
import AppearanceSettings from './pages/settings/AppearanceSettings';
import BillingSettings from './pages/settings/BillingSettings';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ContactSection from './pages/help/ContactSection';
import HelpCenter from './pages/help/HelpCenter';
import HelpArticle from './pages/help/HelpArticle';

// Páginas do instrutor
import InstructorLessons from "./pages/lessons/InstructorLesson";
import LessonCreate from "./pages/lessons/LessonCreate";
import LessonEdit from './pages/lessons/LessonEdit';
import InstructorAssignments from './pages/assignments/InstructorAssignments';
import AssignmentCreate from "./pages/assignments/AssignmentCreate";
import InstructorEarnings from './pages/earnings/InstructorEarnings';
import InstructorAnalytics from './pages/analytics/InstructorAnalytics';
import InstitutionSettings from "./pages/InstitutionSettings";

// Páginas da institution
import InstitutionLayout from "./components/institution/InstitutionLayout";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import InstitutionCoursesTable from "./components/institution/InstitutionCoursesTable";
import InstitutionInstructors from "./components/institution/InstitutionInstructors";
import InstitutionAnalytics from "./pages/InstitutionAnalytics";
import InstitutionMembers from "./components/institution/InstitutionMembers";
import InstitutionCertificates from "./pages/InstitutionCertificates";
import InstitutionBilling from "./pages/InstitutionBilling";

// Páginas do sistema
import UserProfile from "./pages/user/Profile";
import CompleteProfile from "./pages/auth/CompleteProfile";
import CourseCatalog from './components/courses/CourseCatalog';
import MyCourses from './components/courses/MyCourses';
import CoursePage from "./pages/courses/CoursesPage";

import CourseDetail from "./pages/courses/CourseDetail";
import CourseCreate from "./pages/courses/CourseCreate";
import CourseEdit from './pages/courses/CourseEdit';
import CourseReviews from './components/reviews/CourseReviews';

import ModuleContent from "./pages/courses/ModuleContent";
import EventCreate from "./pages/events/EventCreate";
import EventList from "./pages/events/EventList";
import EventDetail from "./pages/events/EventDetail";
import EventEdit from './pages/events/EventEdit';
import Dashboard from "./pages/Dashboard";
import Reviews from "./pages/Review";
import Messages from "./pages/messaging/Messages";
import NewConversation from './pages/messaging/NewConversation';
import ConversationView from './components/messaging/ConversationView';
import CertificatesPage from "./pages/user/CertificatesPage";
import ProgressPage from "./pages/user/ProgressPage";
import CommunityList from "./pages/communities/CommunityList";
import CommunityCreate from "./pages/communities/CommunityCreate";
import CommunityDetail from "./pages/communities/CommunityDetail";
import CreatePost from "./pages/communities/CreatePost";
import CreateStudyGroup from "./pages/communities/CreateStudyGroup";
import GroupJoinPage from './components/community/groups/GroupJoinPage';
import StudyGroupDetail from './pages/communities/StudyGroupDetail';
import StudyGroupEditPage from './pages/groups/StudyGroupEditPage';
import GroupMeetingsPage from './pages/groups/GroupMeetingsPage';
import GroupMembersPage from './pages/groups/GroupMembersPage';
import PostDetail from "./components/community/PostDetail";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminVerificationDetail from './pages/admin/AdminVerificationDetail';
import LegalPage from "./components/legal/LegalPage";
import TermsAndPrivacyPage from "./pages/TermsAndPrivacyPage";
import CourseLearningContainer from './pages/courses/CourseLearningContainer';
import InstitutionReviewDashboard from './components/reviews/InstitutionReviewDashboard';
import AdminVerifications from './pages/admin/AdminVerifications';

export default function App() {
  return (
    <Router basename="/src">
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/admin" element={<AdminRegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<TermsAndPrivacyPage />} />
        <Route path="/privacy" element={<LegalPage page="privacy" />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactSection />} />
        <Route path="/help/:category" element={<HelpCenter />} />
        <Route path="/help/article/:slug" element={<HelpArticle />} />

        {/* Rotas protegidas - Comuns a todos usuários autenticados */}
        <Route path="/search" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <SearchResults />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <UserProfile />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <UserProfile />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/complete-profile" element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        } />


        {/* Rotas específicas para estudantes */}
        <Route path="/courses" element={
          <ProtectedRoute requiredRoles={['student', 'instructor', 'institution']}>
            <AuthenticatedLayout>
              <CourseCatalog />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/learning/courses" element={
          <ProtectedRoute requiredRoles={['student']}>
            <AuthenticatedLayout>
              <MyCourses />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Rota para a área de aprendizado */}
        <Route 
          path="/learn/:slug" 
          element={
            <ProtectedRoute requiredRoles={['student']}>
              <CourseLearningContainer />
            </ProtectedRoute>
          }
        />

        <Route path="/learning/certificates" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CertificatesPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/learning/progress" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ProgressPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/events" element={
          <ProtectedRoute requiredRoles={['student', 'instructor', 'institution']}>
            <AuthenticatedLayout>
              <EventList />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
        />

        <Route path="/events/create" element={
          <ProtectedRoute requiredRoles={['instructor', 'institution']}>
            <AuthenticatedLayout>
              <EventCreate />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
        />

        <Route path="/events/:eventId" element={
          <ProtectedRoute requiredRoles={['student', 'instructor', 'institution']}>
            <AuthenticatedLayout>
              <EventDetail />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
        />

        <Route path="/events/:eventId/edit" element={
          <ProtectedRoute requiredRoles={['student', 'instructor', 'institution']}>
            <AuthenticatedLayout>
              <EventEdit />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
        />

        {/* Rotas para instrutores */}
        <Route path="/instructor/courses" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <CoursePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/instructor/courses/create" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <CourseCreate />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/instructor/courses/:courseId/edit" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <CourseEdit />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/courses/:slug" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CourseDetail />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/courses/:courseId/reviews" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CourseReviews />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/institution/:courseId/reviews" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <InstitutionReviewDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

      {/*

        <Route path="/instructor/courses/:courseId/modules/:moduleId/lessons/:lessonId" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <LessonEdit />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/instructor/courses/:courseId/analytics" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <CourseAnalytics />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } /> */}

        <Route path="/courses/:courseId/assignments/new" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <AssignmentCreate />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/instructor/lessons" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <InstructorLessons />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/instructor/lessons/new" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <LessonCreate />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/instructor/lessons/:lessonId/edit" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <LessonEdit />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/instructor/assignments" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <InstructorAssignments />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/instructor/assignments/new" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <AssignmentCreate />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/instructor/earnings" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <InstructorEarnings />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute requiredRoles={['instructor', 'admin']}>
            <AuthenticatedLayout>
              <InstructorAnalytics />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Institution routes */}
        <Route path="/institution" element={
          <ProtectedRoute requiredRoles={['institution']}>
            <InstitutionLayout />
          </ProtectedRoute>
        }>
          <Route index element={<InstitutionDashboard />} /> {/* Rota para /institution */}
          <Route path="dashboard" element={<InstitutionDashboard />} />
          <Route path="courses" element={<InstitutionCoursesTable />} />
          <Route path="instructors" element={<InstitutionInstructors />} />
          <Route path="analytics" element={<InstitutionAnalytics />} />
          {/* <Route path="members" element={<InstitutionMembers />} /> */}
          <Route path="certificates" element={<InstitutionCertificates />} />
          <Route path="billing" element={<InstitutionBilling />} />
          <Route path="settings" element={<InstitutionSettings />} />
        </Route>

        {/* Rotas para administradores */}

        {/* Rotas para administradores */}
        <Route path="/admin" element={
          <ProtectedRoute>
              <AdminPanel />
          </ProtectedRoute>
        } />

        <Route path="/admin/verifications" element={
          <ProtectedRoute>
              <AdminVerifications />
          </ProtectedRoute>
        } />

        <Route path="/admin/verifications/:id" element={
          <ProtectedRoute>
              <AdminVerificationDetail />
          </ProtectedRoute>
        } />

        {/* Rotas compartilhadas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/courses/:slug/modules/:moduleId" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ModuleContent />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Novas funcionalidades */}
        <Route path="/messages" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Messages />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <NotificationsPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/messages/new" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <NewConversation />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/messages/:conversationId" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ConversationView />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/communities" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CommunityList />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/communities/new" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <CommunityCreate />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <CommunityDetail />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId/groups/:groupId/join" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <GroupJoinPage />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId/groups/:groupId" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <StudyGroupDetail />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId/groups/:groupId/edit" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <StudyGroupEditPage />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId/groups/:groupId/meetings" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <GroupMeetingsPage />
            </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId/groups/:groupId/manage-members" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <GroupMembersPage />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId/create-post" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <CreatePost />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId/posts/:postId" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <PostDetail />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId/create-group" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <CreateStudyGroup />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/communities/:communityId/study-group" element={
          <ProtectedRoute>
          <AuthenticatedLayout>
            <StudyGroupDetail />
          </AuthenticatedLayout>
        </ProtectedRoute>
        } />

        <Route path="/reviews" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Reviews />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/reviews/:id" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Reviews />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <SettingsPage />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="account" replace />} />
        <Route path="account" element={<AccountSettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="notifications" element={<NotificationSettings />} />
        <Route path="appearance" element={<AppearanceSettings />} />
        <Route path="billing" element={<BillingSettings />} />
      </Route>
      
      </Routes>
    </Router>
  );
}

// Componente para rotas protegidas com RBAC
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated) {
    return <AuthRedirectModal redirectPath="/login" state={{ from: location }} />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return (
      <AuthRedirectModal
        redirectPath="/dashboard"
        message="Você não tem permissão para acessar esta área."
      />
    );
  }

  return children;
};

// Layout para páginas autenticadas
const AuthenticatedLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-6 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};