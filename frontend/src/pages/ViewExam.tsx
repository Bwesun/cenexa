import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonPage, IonText, IonSpinner, useIonToast, useIonViewDidEnter, useIonAlert } from '@ionic/react'
import React, { useMemo, useState, useEffect } from 'react'
import { PlayCircle, Filter, ArrowRightIcon, CheckCircle2Icon, ShieldCheckIcon, TrendingUpIcon, Edit, Eye, Trash, Trash2 } from 'lucide-react'
import TopNav from '../components/TopNav';
import { add, chevronForward, play, search, pencil, cloudUploadOutline, refreshOutline } from 'ionicons/icons';
import Logo from '../assets/ralogo.png';
import { useAuth } from '../contexts/AuthContext';
import { questionApi } from '../services/questionApi';
import { useHistory, useParams } from 'react-router-dom';

interface QuestionsData {
  _id: string;
  exam: string;
  organizationId: number;
  text: string;
  questionCode: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  createdAt: string;
  createdBy: string;
  qrCode: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface RouteParams {
  id: string;
}

const ViewExam: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<RouteParams>();
  const examId = id || '';
  const [examTitle, setExamTitle] = useState('');
  const [qrCode, setQrCode] = useState<string>('');
  const [present] = useIonToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState<QuestionsData[]>([]);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    limit: 0,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // Fetch exams on component mount
  const fetchQuestions = async () => {
    user?.role === 'admin' ? await fetchAdminQuestions() : user?.role === 'examiner' ? await fetchExaminerQuestions() : null;
  };

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  // useIonViewDidEnter(() => {
  //   const fetchQuestions = async () => {
  //     user?.role === 'admin' ? await fetchAdminQuestions() : user?.role === 'examiner' ? await fetchExaminerQuestions() : null;
  //   };
  //   fetchQuestions();
  // },[id]);

  // Get Questions for Examiner only
  const fetchExaminerQuestions = async () => {
    setLoading(true);
    try {
      const response = await questionApi.getExaminerQuestions(examId, {
        search: searchTerm || undefined,
        page: currentPage,
        limit: 20,
      });
      setExamTitle(response.exam);
      setQrCode(response.qrCode);
      setPagination(response.pagination);
      setQuestions(response.data || []);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      present({
        message: error.message || 'Failed to fetch questions',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

//   Get Questions for Admin only
const fetchAdminQuestions = async () => {
    setLoading(true);
    try {
      const response = await questionApi.getAllQuestions(examId, {
        search: searchTerm || undefined,
        page: currentPage,
        limit: 20,
      });
    // console.log("Admin Req: ", response)

      setExamTitle(response.exam);
      setQrCode(response.qrCode);
      setPagination(response.pagination);
      setQuestions(response.data || []);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      present({
        message: error.message || 'Failed to fetch questions',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    await setCurrentPage(1);
    user?.role === 'admin' ? await fetchAdminQuestions() : user?.role === 'examiner' ? await fetchExaminerQuestions() : null;
    setLoading(false);
  };

  const handleDeleteQuestion = async (examId: string) => {
    try {
      await questionApi.deleteQuestion(examId);
      present({
        message: 'Exam deleted successfully',
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
      user?.role === 'admin' ? await fetchAdminQuestions() : user?.role === 'examiner' ? await fetchExaminerQuestions() : null;
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

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1)
    user?.role === 'admin' ? fetchAdminQuestions() : user?.role === 'examiner' ? fetchExaminerQuestions() : null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1)
    user?.role === 'admin' ? fetchAdminQuestions() : user?.role === 'examiner' ? fetchExaminerQuestions() : null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-700';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700';
      case 'rejected':
        return 'bg-slate-500/10 text-slate-700';
      default:
        return 'bg-blue-500/10 text-blue-700';
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto ">
            <div className="space-y-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <IonText className="text-lg tracking-normal text-(--ion-color-primary) font-semibold">
                      {examTitle}
                    </IonText>
                  </div>
                  <IonText className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    Questions: {pagination?.totalDocs}
                  </IonText>
                </div>

                {/* Display QR Code */}
                <div className="flex items-center justify-center">
                  {qrCode && (
                    <IonImg src={qrCode} alt='Exam QR Code' className='w-1/2' />
                  )}
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
                    <IonButton
                                          onClick={() => fetchQuestions()}
                                          color="primary"
                                          shape="round"
                                          title="Refresh Exams"
                                          fill="clear"
                                        >
                                          <IonIcon
                                            icon={refreshOutline}
                                            slot="icon-only"
                                            color="primary"
                                          ></IonIcon>
                                        </IonButton>
                  </div>
                </div>

                {/* Add Questions Button */}
                {user?.role === 'examiner' ? (
                    <div className="mt-6">
                        <IonButton
                        color="primary"
                        fill="outline"
                        expand='block'
                        onClick={() => history.push(`/examiner/add-question/${examId}`)}
                        >
                        <IonIcon icon={add} color="primary"></IonIcon>
                        Add Question
                        </IonButton>
                    </div>
                ) : ''}

                {/* Admin Bulk Upload Button */}
                {user?.role === 'admin' ? (
                    <div className="mt-6">
                        <IonButton
                        color="primary"
                        fill="outline"
                        expand='block'
                        onClick={() => history.push(`/admin/bulk-upload/${examId}`)}
                        >
                        <IonIcon icon={cloudUploadOutline} color="primary" slot="start"></IonIcon>
                        <span className='ml-3'>Upload Questions in Bulk</span>
                        </IonButton>
                    </div>
                ) : ''}

                {/* Loading Spinner */}
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <IonSpinner name="crescent" color="primary" />
                  </div>
                )}

                {/* Questions Grid */}
                {!loading && (
                  <div className="mt-3 space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {questions.length > 0 ? (
                      questions.map((question) => (
                        <div
                          key={question._id}
                          className="rounded-2xl border border-(--ion-color-primary)/20 shadow-sm shadow-cyan-100 p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm text-slate-900 ">
                                {question.text}
                              </p>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(question.status)}`}>
                              {question.status}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div>
                              <p className="text-slate-500">Options</p>
                              <p className="font-semibold">{question.options.length}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Question Code</p>
                              <p className="font-semibold">{question.questionCode}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3 gap-1">
                            {(user?.role === "admin" || user?.role === "examiner") ? (
                              <div className="w-full grid grid-cols-2 items-center gap-2">
                                <IonButton
                                  expand="block"
                                  shape="round"
                                  fill="solid"
                                  size="small"
                                  color="primary"
                                  routerLink={`/view-question/${question._id}`}
                                >
                                  View
                                </IonButton>
                                <IonButton
                                  expand="block"
                                  shape="round"
                                  fill="outline"
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    history.push(`/view-question/${question._id}`, { openEdit: true });
                                  }}
                                >
                                  <IonIcon icon={pencil} slot="start" />
                                  Edit
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
                        <p>No Questions found</p>
                      </div>
                    )}

                  </div>
                )}
                {/* Pagination */}
                {pagination?.totalDocs > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center">
                      <IonButton
                        color="primary"
                        fill="outline"
                        size="small"
                        disabled={!pagination.hasPrevPage}
                        onClick={handlePreviousPage}
                      >
                        Previous
                      </IonButton>
                      <IonText className="text-sm text-slate-500">
                        Page {pagination.page} of {pagination.totalPages}
                      </IonText>
                      <IonButton
                        color="primary"
                        fill="outline"
                        size="small"
                        disabled={!pagination.hasNextPage}
                        onClick={handleNextPage}
                      >
                        Next
                      </IonButton>
                    </div>
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

export default ViewExam;