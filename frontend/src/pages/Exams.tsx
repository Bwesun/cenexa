import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonPage, IonText, IonSpinner, useIonToast } from '@ionic/react'
import React, { useMemo, useState, useEffect } from 'react'
import { PlayCircle, Filter, ArrowRightIcon, CheckCircle2Icon, ShieldCheckIcon, TrendingUpIcon, Edit, Eye, Trash, Trash2 } from 'lucide-react'
import TopNav from '../components/TopNav';
import { add, chevronForward, play, refreshCircle, refreshCircleOutline, refreshOutline, search } from 'ionicons/icons';
import Logo from '../assets/ralogo.png';
import { useAuth } from '../contexts/AuthContext';
import { examApi } from '../services/examApi';

interface ExamData {
  _id: string;
  title: string;
  numberOfQuestions: number;
  duration: number;
  description?: string;
  totalMark: number;
  passingMark: number;
  scheduleStart: string;
  scheduleEnd: string;
  status: 'published' | 'unpublished' | 'archived';
  createdAt: string;
}

const Exams: React.FC = () => {
  const { user } = useAuth();
  const [present] = useIonToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Fetch exams on component mount
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async (page = 1) => {
    setLoading(true);
    try {
      const response = await examApi.getAllExams({
        search: searchTerm || undefined,
        page,
      });
      setExams(response.data || []);
      setPagination({
        page,
        limit: response.limit || pagination.limit,
        totalItems: response.totalItems || exams.length,
        totalPages: response.totalPages || pagination.totalPages
      });
    } catch (error: any) {
      console.error('Error fetching exams:', error);
      present({
        message: error.message || 'Failed to fetch exams',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await fetchExams();
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      await examApi.deleteExam(examId);
      present({
        message: 'Exam deleted successfully',
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
      await fetchExams();
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      present({
        message: error.message || 'Failed to delete exam',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/10 text-emerald-700';
      case 'unpublished':
        return 'bg-yellow-500/10 text-yellow-700';
      case 'archived':
        return 'bg-slate-500/10 text-slate-700';
      default:
        return 'bg-blue-500/10 text-blue-700';
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />

        {/* Display if user is Admin */}
        {user?.role === 'admin' ? (
          <IonFab horizontal="end" vertical="bottom" slot="fixed">
            <IonFabButton color="primary" routerLink="/admin/create-exam">
              <IonIcon icon={add} color="light"></IonIcon>
            </IonFabButton>
          </IonFab>
        ) : ''}

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <IonText className="text-lg uppercase tracking-wide text-(--ion-color-primary) font-bold">
                      Exam List
                    </IonText>
                  </div>
                  <div className="flex justify-end items-center">
                    <IonText className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                      Total: {exams.length}
                    </IonText>
                    <IonButton onClick={() => fetchExams()} color='primary' shape='round' title='Refresh Exams' fill='clear'>
                      <IonIcon icon={refreshOutline} slot='icon-only' color="primary"></IonIcon>
                    </IonButton>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-6">
                  <div className="flex gap-2 items-center">
                    <IonInput
                      type="text"
                      placeholder="Search exams by exam code..."
                      value={searchTerm}
                      onIonChange={(e) => setSearchTerm(e.detail.value || "")}
                      className="bg-gray-100"
                    />
                    <IonButton
                      color="primary"
                      fill="clear"
                      onClick={handleSearch}
                    >
                      <IonIcon icon={search} slot="icon-only" color="primary" />
                    </IonButton>
                  </div>
                </div>

                {/* Loading Spinner */}
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <IonSpinner name="crescent" color="primary" />
                  </div>
                )}

                {/* Exams Grid */}
                {!loading && (
                  <div className="mt-3 space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {exams.length > 0 ? (
                      exams.map((exam) => (
                        <div
                          key={exam._id}
                          className="rounded-2xl border border-(--ion-color-primary)/20 shadow-sm shadow-cyan-100 p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-md text-slate-900 line-clamp-2">
                                {exam.title}
                              </p>
                              {/* {exam.description && (
                                <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                                  {exam.description}
                                </p>
                              )} */}
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(exam.status)}`}>
                              {exam.status}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div>
                              <p className="text-slate-500">Questions</p>
                              <p className="font-semibold">{exam.numberOfQuestions}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Duration</p>
                              <p className="font-semibold">{exam.duration} min</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Total Marks</p>
                              <p className="font-semibold">{exam.totalMark}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Passing Mark</p>
                              <p className="font-semibold">{exam.passingMark}</p>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 space-y-1 text-xs text-slate-500">
                            <p>
                              <span className="font-semibold">Start:</span> {formatDate(exam.scheduleStart)}
                            </p>
                            <p>
                              <span className="font-semibold">End:</span> {formatDate(exam.scheduleEnd)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-3 gap-1">
                            {user?.role === "candidate" ? (
                              <div className="w-full grid items-center gap-2">
                                <IonButton
                                  expand="block"
                                  shape="round"
                                  fill="solid"
                                  size="small"
                                  routerLink={`/candidate/pre-exam/${exam._id}`}
                                >
                                  Start
                                </IonButton>
                              </div>
                            ) : user?.role === "examiner" ? (
                              <div className="grid grid-cols-2 justify-center items-center w-full gap-2">
                                <IonButton
                                  expand="block"
                                  shape="round"
                                  fill="solid"
                                  size="small"
                                  routerLink={`/view-exam/${exam._id}`}
                                >
                                  View Questions
                                </IonButton>
                                <IonButton
                                  expand="block"
                                  shape="round"
                                  fill="solid"
                                  size="small"
                                  routerLink={`/examiner/add-question/${exam._id}`}
                                >
                                  Add Questions
                                </IonButton>
                              </div>
                            ) : user?.role === "admin" ? (
                              <div className="flex justify-center items-center w-full gap-2">
                                <IonButton
                                  color={"dark"}
                                  shape="round"
                                  fill="clear"
                                  size="small"
                                  routerLink={`/view-exam/${exam._id}`}
                                >
                                  <Eye size={18} />
                                </IonButton>
                                <IonButton
                                  color={"primary"}
                                  shape="round"
                                  fill="clear"
                                  size="small"
                                  routerLink={`/admin/edit-exam/${exam._id}`}
                                >
                                  <Edit size={18} />
                                </IonButton>
                                <IonButton
                                  color={"danger"}
                                  shape="round"
                                  fill="clear"
                                  size="small"
                                  onClick={() => handleDeleteExam(exam._id)}
                                >
                                  <Trash2 size={18} />
                                </IonButton>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-slate-500">
                        <p>No exams found</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination */}
                                {pagination.totalPages > 0 && (
                                  <div className="mt-6 flex justify-between items-center">
                                    <IonButton
                                      color="primary"
                                      shape="round"
                                      fill="clear"
                                      size="small"
                                      onClick={() => fetchExams(pagination.page - 1)}
                                      disabled={pagination.page === 1}
                                    >
                                      Previous
                                    </IonButton>
                                    <IonText className="text-sm text-slate-500">
                                      Page {pagination.page} of {pagination.totalPages}
                                    </IonText>
                                    <IonButton
                                      color="primary"
                                      shape="round"
                                      fill="clear"
                                      size="small"
                                      onClick={() => fetchExams(pagination.page + 1)}
                                      disabled={pagination.page === pagination.totalPages}
                                    >
                                      Next
                                    </IonButton>
                                  </div>
                                )}
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Exams