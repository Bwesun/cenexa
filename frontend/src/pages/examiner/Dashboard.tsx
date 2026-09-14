import { IonButton, IonContent, IonIcon, IonPage, IonText } from "@ionic/react";
import {
  ArrowRightIcon,
  BarChart2Icon,
  BookmarkIcon,
  CheckCircle2Icon,
  ListIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import TopNav from "../../components/TopNav";
import { play, playCircle } from "ionicons/icons";
import { Link } from "react-router-dom";

const ExaminerDashboard: React.FC = () => {
    const {user} = useAuth();
      const recentExams = [
        {
          title: "React Fundamentals",
          date: "20 Apr 2024",
          score: "80%",
          status: "Passed",
          color: "bg-emerald-500/10 text-emerald-700",
        },
        {
          title: "Data Structures",
          date: "15 Apr 2024",
          score: "75%",
          status: "Passed",
          color: "bg-sky-500/10 text-sky-700",
        },
        {
          title: "HTML & CSS",
          date: "10 Apr 2024",
          score: "90%",
          status: "Passed",
          color: "bg-violet-500/10 text-violet-700",
        },
      ];
  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />
        <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
                  <p className="text-md font-semibold text-(--ion-color-primary)">Hi, {user?.name || 'User'}</p>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-6">
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                    <Link to={'/exams'}>
                  <div className="rounded-4xl bg-white p-3 shadow-sm">
                    <div className="flex items-center flex-col justify-center gap-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                        <ListIcon size={18} />
                      </div>
                        <p className="text-sm font-semibold text-slate-900">Exam List</p>
                        <p className="text-xs text-slate-500">View all exams</p>
                    </div>
                  </div>
                    </Link>
                    
                  {/* <div className="rounded-4xl bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-center flex-col gap-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <UsersIcon size={18} />
                      </div>
                        <p className="text-sm font-semibold text-slate-900">Users</p>
                        <p className="text-xs text-slate-500">Manage Users</p>
                    </div>
                  </div> */}

                  <Link to={'/examiner/results'}>
                  <div className="rounded-4xl bg-white p-3 shadow-sm">
                    <div className="flex items-center  justify-center flex-col gap-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <BarChart2Icon size={18} />
                      </div>
                        <p className="text-sm font-semibold text-slate-900">Results</p>
                        <p className="text-xs text-slate-500">Check performance</p>
                    </div>
                  </div>
                  </Link>

                  <Link to={'/profile'}>
                  <div className="rounded-4xl bg-white p-3 shadow-sm">
                    <div className="flex items-center  justify-center flex-col gap-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                        <UserIcon size={18} />
                      </div>
                        <p className="text-sm font-semibold text-slate-900">Profile</p>
                        <p className="text-xs text-slate-500">View profile</p>
                    </div>
                  </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
};

export default ExaminerDashboard;

