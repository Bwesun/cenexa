import { IonButton, IonContent, IonIcon, IonPage, IonText } from "@ionic/react";
import {
  ArrowRightIcon,
  BarChart2Icon,
  BookOpenIcon,
  BookmarkIcon,
  CheckCircle2Icon,
  HelpCircleIcon,
  ListIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import TopNav from "../../components/TopNav";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminApi";

const AdminDashboard: React.FC = () => {
    const {user} = useAuth();
    const [dashboardStats, setDashboardStats] = useState<any>(null);

    const getAdminDashboardStats = async () => {
      try{
        const response = await adminApi.getAdminDashboardStats();
        if(response.success){
          setDashboardStats(response.data);
        }
      }catch(error: any){
        console.error("Failed to get dashboard stats:", error);
      }
    }

    useEffect(() => {
      getAdminDashboardStats();
    }, [])
    
  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />
        <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
                  <p className="text-md font-semibold text-(--ion-color-primary)">Hi, {user?.name || 'User'}</p>

            {/* Admin Analytics Section */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {/* Total Users Card */}
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Users</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{dashboardStats?.totalUsers || 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <UsersIcon size={24} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="block font-bold text-slate-800">{dashboardStats?.byRole?.admin || 0}</span>
                    <span className="text-slate-500">Admins</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">{dashboardStats?.byRole?.examiner || 0}</span>
                    <span className="text-slate-500">Examiners</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">{dashboardStats?.byRole?.candidate || 0}</span>
                    <span className="text-slate-500">Candidates</span>
                  </div>
                </div>
              </div>

              {/* Total Exams Card */}
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Exams</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{dashboardStats?.totalExams || 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <BookOpenIcon size={24} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <TrendingUpIcon size={16} className="text-emerald-500" />
                  <span className="text-xs text-slate-500 font-medium">{dashboardStats?.activeExams || 0} active exams this week</span>
                </div>
              </div>

              {/* Total Questions Card */}
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Questions</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{dashboardStats?.totalQuestions || 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <HelpCircleIcon size={24} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <BookmarkIcon size={16} className="text-violet-500" />
                  <span className="text-xs text-slate-500 font-medium">Avg. 17.5 questions per exam</span>
                </div>
              </div>
            </div>

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

                  <Link to={'/admin/users'}>
                  <div className="rounded-4xl bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-center flex-col gap-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <UsersIcon size={18} />
                      </div>
                        <p className="text-sm font-semibold text-slate-900">Users</p>
                        <p className="text-xs text-slate-500">Manage Users</p>
                    </div>
                  </div>
                  </Link>

                  <Link to={'/admin/result'}>
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
                        <p className="text-xs text-slate-500">View account</p>
                    </div>
                  </div>
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
};

export default AdminDashboard;

