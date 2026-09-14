import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonInputOtp,
  IonInputPasswordToggle,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonText,
  IonTitle,
  IonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { AlertCircleIcon } from "lucide-react";
import LogoImage from "../../assets/ralogo.png";
import { closeOutline, mailOutline } from "ionicons/icons";
import { requestReset, verifyOtp, resetPassword } from "../../services/resetPasswordAuth";

const LoginPage: React.FC = () => {
  const [ranNo, setRanNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const history = useHistory();

  const savedRanNo = localStorage.getItem("ranNo");
  const savedPassword = localStorage.getItem("password");

  useEffect(() => {
    // Redirect logged in users to their various dashboard
    if(isAuthenticated && user?.role === 'super'){
      history.push('/super/dashboard')
    }

    if(isAuthenticated && user?.role === 'admin'){
      history.push('/admin/dashboard')
    }

    if(isAuthenticated && user?.role === 'examiner'){
      history.push('/examiner/dashboard')
    }

    if(isAuthenticated && user?.role === 'candidate'){
      history.push('/candidate/dashboard')
    }
  }, [isAuthenticated]);

  // useEffect(() => {
  //   if(savedRanNo === ''){
  //     setRanNo(savedRanNo)
  //   }

  //   if(savedPassword === ''){
  //     setRanNo(savedPassword)
  //   }
  // })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true)

    try {
      const response = await login(ranNo, password);
      // Redirect based on role
      if (response.role === "super") {
        // console.log("super logged in, redirecting to dashboard...", response);
        history.push("/super/dashboard");
      } 

      // Redirect for admin
      if(response.role === "admin"){
        history.push("/admin/dashboard");
      }

      // Redirect for examiner
      if(response.role === "examiner"){
        history.push("/examiner/dashboard");
      }

      // Redirect for candidate
      if(response.role === "candidate"){
        history.push("/candidate/dashboard");
      }

      // save ranNo and password to local storage for auto-login (optional, consider security implications)
      localStorage.setItem("ranNo", ranNo);
      localStorage.setItem("password", password);

      setLoading(false)
    } catch (err: any) {
      setToastMessage(err.message.message || "Failed to login. Please check your credentials.");
      setShowToast(true);
      setLoading(false)
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="max-w-2xl mx-auto sm:my-10 p-6  bg-white h-full sm:h-auto">
          <IonImg src={LogoImage} alt="Anakazo logo" className="mx-auto h-24" />
          <IonText className="text-center flex justify-center text-gray-700 mt-2 mb-6">Examination Platform</IonText>
          <IonText color={"primary"} className="text-2xl font-bold text-center mb-6 flex justify-center">
            Login 
          </IonText>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertCircleIcon size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <IonItem lines="none">
                <IonInput
                  type="number"
                  label="RAN Number"
                  labelPlacement="floating"
                  value={ranNo || ""}
                  color={"primary"}
                  onIonInput={(e) => setRanNo(e.detail.value!)}
                  required
                  className=""
                />
              </IonItem>
              
              <div>
                <IonItem lines="none">
                  <IonInput
                    type="password"
                    label="Password"
                    labelPlacement="floating"
                    value={password || ""}
                    color={"primary"}
                    onIonInput={(e) => setPassword(e.detail.value!)}
                    required
                    className=""
                  >
                    <IonInputPasswordToggle slot="end" color="primary" />
                  </IonInput>
                </IonItem>
                {/* Forgot password link */}
                <div className="flex justify-end mt-2">
                  <Link to="#" onClick={() => history.push('/forgot-password')} className="text-sm text-[#f8982a] hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>
            <IonButton
              type="submit"
              expand="block"
              color={"primary"}
              className=""
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </IonButton>
          </form>
          <p className="mt-6 text-center text-gray-600">
            Don't have an Organization account?{' '}
            <Link to="/register" className="text-[#f8982a] hover:underline">
              Register
            </Link>
          </p>
        </div>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
