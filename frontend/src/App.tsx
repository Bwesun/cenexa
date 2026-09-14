import { Redirect, Route, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonImg,
  IonLabel,
  IonRouterOutlet,
  IonSpinner,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonText,
  setupIonicReact,
  useIonToast
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { BarChart3, FileQuestion, FileText, HomeIcon, Hotel, LayoutDashboard, ListOrdered, LogIn, Network, ShoppingCart, User, UsersIcon } from "lucide-react";
import { App as CapacitorApp } from '@capacitor/app';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { useEffect, useRef } from 'react';
import { StatusBar, Style } from "@capacitor/status-bar"
// import { addListeners, registerNotifications } from './utils/notifications';
// import Home from './pages/Home';
// import Profile from './pages/Profile';
// import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LogoImage from "./assets/ralogo.png";
// import ViewProfile from './pages/ViewProfile';
// import ManageUsers from './pages/admin/Users';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/Dashbaord';
import Exams from './pages/Exams';
import CreateExam from './pages/admin/CreateExam';
import Users from './pages/admin/Users';
import CandidateDashboard from './pages/candidate/Dashboard';
import SuperDashboard from './pages/super/Dashbaord';
import ExaminerDashboard from './pages/examiner/Dashboard';
import Organizations from './pages/super/Organizations';
import Profile from './pages/Profile';
import CandidateResult from './pages/candidate/Result';
import CandidateViewResult from './pages/ViewResult';
import PreExam from './pages/candidate/PreExam';
import TakeExam from './pages/candidate/TakeExam';
import ViewExam from './pages/ViewExam';
import AddQuestion from './pages/examiner/AddQuestion';
import ViewQuestion from './pages/ViewQuestion';
import SuperAdminUsers from './pages/super/Users';
import EditExam from './pages/admin/EditExam';
import ResultsAdmin from './pages/admin/ResultsAdmin';
import ViewExamResults from './pages/admin/ViewExamResults';
import UploadBulkQuestions from './pages/admin/UploadBulkQuestions';
// import VerifyOtpPage from './pages/auth/passwordreset/VerifyOPT';
// import VendorDashboard from './pages/vendor/VendorDashboard';
// import AdminDashboard from './pages/admin/Dashboard';


setupIonicReact();

const App: React.FC = () => {
  const { isLoading } = useAuth();
  const [present] = useIonToast();
  const location = useLocation();
  const lastBackPress = useRef<number>(0);

  // HANDLE ANDROID BACK BUTTON
  useEffect(() => {
    const handler = CapacitorApp.addListener('backButton', () => {
      const currentTime = new Date().getTime();
      const isAtRoot = ['/home', '/'].includes(location.pathname);

      if (isAtRoot) {
        if (currentTime - lastBackPress.current < 2000) {
          CapacitorApp.exitApp(); // Exit the app
        } else {
          lastBackPress.current = currentTime;

          // Trigger vibration
          Haptics.impact({ style: ImpactStyle.Medium });

          // Show toast
          present({
            message: 'Press back again to exit',
            duration: 2000,
            position: 'bottom',
          });
        }
      } else {
        window.history.back(); // Navigate back
      }
    });

    return () => {
      CapacitorApp.removeAllListeners(); // Clean up listener
    };
  }, [location.pathname, present]);

  // SET STATUS BAR
  useEffect(() => {
    const setStatusBar = async () => {
      try {
        await StatusBar.setBackgroundColor({ color: "#281f9e" });
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Default });
      } catch (error) {
        console.error("Error setting status bar:", error);
      }
    };

    setStatusBar();
  }, []);

  if (isLoading) {
    return (
      <div className='flex items-center gap-3 flex-col justify-center h-screen bg-white'>
        <IonImg src={LogoImage} alt='RAN Logo' className="mx-auto h-32" />
        <IonText color="dark" className="text-sm">Examination Platform</IonText>
        <IonSpinner name='crescent' color={'primary'} />
      </div>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <AppContent />
      </IonReactRouter>
    </IonApp>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const showTabBar = !['/login', '/register', '/forgot-password', '/verify-payment'].includes(location.pathname);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
        <Route exact path="/home" component={Home} />
        {/* <Route exact path="/verify-otp" component={VerifyOtpPage} />
        <Route exact path="/reset-password" component={ResetPasswordPage} /> */}

        <PrivateRoute
          exact
          path="/profile"
          component={Profile}
          isAuthenticated={isAuthenticated}
          allowedRoles={['candidate', 'admin', 'examiner', 'super']}
          userRole={user?.role}
        />

        {/* <PrivateRoute
          exact
          path="/viewprofile/:id"
          component={ViewProfile}
          isAuthenticated={isAuthenticated}
        /> */}

        {/* GENERAL USERS PAGE ROUTES */}
        <PrivateRoute
          exact
          path='/exams'
          component={Exams}
          isAuthenticated={isAuthenticated}
          allowedRoles={["candidate", "admin", "examiner"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path='/view-exam/:id'
          component={ViewExam}
          isAuthenticated={isAuthenticated}
          allowedRoles={["admin", "examiner"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path='/view-question/:id'
          component={ViewQuestion}
          isAuthenticated={isAuthenticated}
          allowedRoles={["admin", "examiner"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path='/view-result/:id'
          component={CandidateViewResult}
          isAuthenticated={isAuthenticated}
          allowedRoles={["candidate", "admin", "examiner"]}
          userRole={user?.role}
        />



        {/* SUPER ADMIN PAGE ROUTES */}
        <PrivateRoute
          exact
          path='/super/dashboard'
          component={SuperDashboard}
          isAuthenticated={isAuthenticated}
          allowedRoles={["super"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path='/super/organizations'
          component={Organizations}
          isAuthenticated={isAuthenticated}
          allowedRoles={["super"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path='/super/users'
          component={SuperAdminUsers}
          isAuthenticated={isAuthenticated}
          allowedRoles={["super"]}
          userRole={user?.role}
        />


        {/* ADMINS PAGE ROUTES */}
        <PrivateRoute
          exact
          path="/admin/dashboard"
          component={AdminDashboard}
          isAuthenticated={isAuthenticated}
          allowedRoles={['admin']}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path="/admin/users"
          component={Users}
          isAuthenticated={isAuthenticated}
          userRole={user?.role}
          allowedRoles={["admin"]}
        />

        <PrivateRoute
          exact
          path="/admin/create-exam"
          component={CreateExam}
          isAuthenticated={isAuthenticated}
          allowedRoles={["admin"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path="/admin/edit-exam/:id"
          component={EditExam}
          isAuthenticated={isAuthenticated}
          allowedRoles={["admin"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path="/admin/results"
          component={ResultsAdmin}
          isAuthenticated={isAuthenticated}
          allowedRoles={["admin"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path="/admin/view-exam-results/:examId"
          component={ViewExamResults}
          isAuthenticated={isAuthenticated}
          allowedRoles={["admin"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path="/admin/bulk-upload/:examId"
          component={UploadBulkQuestions}
          isAuthenticated={isAuthenticated}
          allowedRoles={["admin"]}
          userRole={user?.role}
        />


        {/* EXAMINERS PAGE ROUTES */}
        <PrivateRoute
          exact
          path="/examiner/dashboard"
          component={ExaminerDashboard}
          isAuthenticated={isAuthenticated}
          allowedRoles={['examiner']}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path="/examiner/add-question/:id"
          component={AddQuestion}
          isAuthenticated={isAuthenticated}
          allowedRoles={['examiner']}
          userRole={user?.role}
        />


        {/* CANDIDATES PAGE ROUTES */}
        <PrivateRoute
          exact
          path="/candidate/dashboard"
          component={CandidateDashboard}
          isAuthenticated={isAuthenticated}
          allowedRoles={["candidate"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path="/candidate/result"
          component={CandidateResult}
          isAuthenticated={isAuthenticated}
          allowedRoles={["candidate"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path='/candidate/pre-exam/:id'
          component={PreExam}
          isAuthenticated={isAuthenticated}
          allowedRoles={["candidate"]}
          userRole={user?.role}
        />

        <PrivateRoute
          exact
          path='/candidate/take-exam/:id'
          component={TakeExam}
          isAuthenticated={isAuthenticated}
          allowedRoles={["candidate"]}
          userRole={user?.role}
        />
        

        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
      {showTabBar &&
        (user?.role === "super" ? (
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/super/dashboard">
              <LayoutDashboard size={20} />
              <IonLabel>Dashboard</IonLabel>
            </IonTabButton>
            <IonTabButton tab="exams" href="/super/organizations">
              <FileText size={20} />
              <IonLabel>Organizations</IonLabel>
            </IonTabButton>
            <IonTabButton tab="users" href="/super/users">
              <UsersIcon size={20} />
              <IonLabel>Users</IonLabel>
            </IonTabButton>
            {/* <IonTabButton tab="result" href="/super/result">
              <BarChart3 size={20} />
              <IonLabel>Results</IonLabel>
            </IonTabButton> */}
            <IonTabButton tab="profile" href="/profile">
              <User size={20} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        ) : user?.role === "admin" ? (
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/admin/dashboard">
              <LayoutDashboard size={20} />
              <IonLabel>Dashboard</IonLabel>
            </IonTabButton>
            <IonTabButton tab="exams" href="/exams">
              <FileText size={20} />
              <IonLabel>Exams</IonLabel>
            </IonTabButton>
            <IonTabButton tab="users" href="/admin/users">
              <UsersIcon size={20} />
              <IonLabel>Users</IonLabel>
            </IonTabButton>
            <IonTabButton tab="result" href="/admin/results">
              <BarChart3 size={20} />
              <IonLabel>Results</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <User size={20} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        ) : user?.role === "examiner" ? (
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/examiner/dashboard">
              <LayoutDashboard size={20} />
              <IonLabel>Dashboard</IonLabel>
            </IonTabButton>
            <IonTabButton tab="exams" href="/exams">
              <FileText size={20} />
              <IonLabel>Exams</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <User size={20} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        ) : user?.role === "candidate" ? (
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/candidate/dashboard">
              <LayoutDashboard size={20} />
              <IonLabel>Dashboard</IonLabel>
            </IonTabButton>
            <IonTabButton tab="exams" href="/exams">
              <FileText size={20} />
              <IonLabel>Exams</IonLabel>
            </IonTabButton>
            <IonTabButton tab="result" href="/candidate/result">
              <BarChart3 size={20} />
              <IonLabel>Results</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <User size={20} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        ) : (
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <HomeIcon size={20} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="login" href="/login">
              <LogIn size={20} />
              <IonLabel>Login</IonLabel>
            </IonTabButton>
          </IonTabBar>
        ))}
    </IonTabs>
  );
};

interface PrivateRouteProps {
  component: React.FC<any>;
  isAuthenticated: boolean;
  userRole?: string;
  allowedRoles?: string[];
  path: string;
  exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  isAuthenticated,
  userRole,
  allowedRoles,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      if (!isAuthenticated) return <Redirect to="/login" />;

      if (allowedRoles && allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
        console.log("Allowed roles: ", allowedRoles, ". USer role: ", userRole)
        const fallbackPath =
          userRole === 'super'
            ? '/super/dashboard'
            : userRole === 'admin'
            ? '/admin/dashboard'
            : userRole === 'examiner'
            ? '/examiner/dashboard'
            : userRole === 'candidate'
            ? '/candidate/dashboard'
            : '/login';

        return <Redirect to={fallbackPath} />;
      }

      return <Component {...props} />;
    }}
  />
);

export default App;
