import {
  IonButton,
  IonContent,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { AlertCircleIcon } from "lucide-react";
import LogoImage from "../../assets/ralogo.png";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ranNo, setRanNo] = useState("");
  const [role, setRole] = useState("candidate");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const history = useHistory();
  const [toast, setToast] = useState<{ show: boolean; msg?: string; color?: string }>({ show: false });

  // Capitalize first letter of a word
  function capitalizeWord(word: string): string {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  // Capitalize first letter of each word in a sentence
  function capitalizeWords(sentence: string): string {
    return sentence
      .split(" ")
      .map(word => capitalizeWord(word))
      .join(" ");
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Capitalize name before sending to backend
    const newName = capitalizeWords(capitalizeWord(name));
    try {
      await register({ 
        name: newName, 
        phone, 
        role, 
        address, 
        email, 
        password,
        ranNo: ranNo,
      });
      setToast({ show: true, msg: "Registration successful!", color: "success" });
      history.push("/home");
    } catch (err: any) {
      setToast({ show: true, msg: err?.message.message ?? "Registration failed", color: "danger" });
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="max-w-2xl mx-auto sm:my-10 p-6  bg-white h-full sm:h-auto shadow">
          <IonImg src={LogoImage} alt="ABC Logo" className="mx-auto h-44" />
      <h1 className="text-2xl font-bold text-center text-(--ion-color-primary) mb-6">
        Create Account
      </h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircleIcon size={20} className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleRegister}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <IonItem lines="none">
              <IonInput 
                type="text"
                label="Name"
                labelPlacement="floating"
                value={name}
                color={"primary"}
                onIonInput={(e) => setName(e.detail.value!)}
                required
                className=""
              />
            </IonItem>
            <IonItem lines="none">
              <IonInput
                type="email"
                label="Email Address"
                labelPlacement="floating"
                value={email}
                color={"primary"}
                onIonInput={(e) => setEmail(e.detail.value!)}
                required
                className=""
              />
            </IonItem>
          <IonItem lines="none">
              <IonInput
                type="text"
                label="RAN Number"
                labelPlacement="floating"
                placeholder="e.g. 08451234"
                value={ranNo}
                color={"primary"}
                onIonInput={(e) => setRanNo(e.detail.value!)}
                required
                className=""
              />
            </IonItem>
          <IonItem lines="none">
              <IonInput
                label="Phone Number"
                type="tel"
                labelPlacement="floating"
                placeholder="e.g 08012345678"
                value={phone}
                color={"primary"}
                onIonInput={(e) => setPhone(e.detail.value!)}
                required
                className=""
              />
            </IonItem>
          <IonItem lines="none">
            <IonSelect
              label="Role"
              labelPlacement="floating"
              value={role}
              onIonChange={(e) => setRole(e.detail.value!)}
              interface="alert"
              required
              className="selectbtn"
            >
              {/* <IonSelectOption className="selectbtn" value="candidate">Candidate</IonSelectOption>
              <IonSelectOption className="selectbtn" value="examiner">Examiner</IonSelectOption> */}
              <IonSelectOption className="selectbtn" value="admin">Admin</IonSelectOption>
            </IonSelect>
          </IonItem>
          
          <IonItem lines="none">
              <IonInput
                type="password"
                label="Password"
                labelPlacement="floating"
                value={password}
                color={"primary"}
                onIonInput={(e) => setPassword(e.detail.value!)}
                required
                className=""
              />
            </IonItem>
          <IonItem lines="none">
            <IonTextarea
              label="Address"
              labelPlacement="floating"
              placeholder="Full Address"
              value={address}
              color="primary"
              onIonInput={(e) => setAddress(e.detail.value!)
              }
              required
            />
          </IonItem>
        </div>
        <IonButton
          expand="block"
          type="submit"
          fill="clear"
          className="bg-linear-to-r from-[#f8982a] to-[#f8982a] text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </IonButton>
      </form>
      <p className="mt-6 text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-[#f8982a] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
    <IonToast isOpen={toast.show} onDidDismiss={() => setToast({ show: false })} message={toast.msg} color={toast.color === "danger" ? "danger" : "success"} duration={2500} />
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
