import { IonButton, IonContent, IonIcon, IonInput, IonPage, IonSpinner, IonText, useIonToast } from '@ionic/react'
import { AlertTriangle, ArrowRight, ArrowRightIcon, BarChart2Icon, BookmarkIcon, CheckCircle2Icon, Clock3, ListIcon, Search, ShieldCheck, ShieldCheckIcon, TrendingUpIcon, UserIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import TopNav from '../../components/TopNav'
import { arrowForward, chevronForward, play, search, searchOutline } from 'ionicons/icons'
import { resultApi } from '../../services/resultApi'

// interface ResultData {
//   candidateExams: [
//     {
//       exam: {
//         title: string;
//         createdAt: string;
//         examCode: string;
//         description: string;
//         numberOfQuestions: number;
//         passingMark: number;
//         totalMark: number;
//       },
//       passed: boolean;
//       percentage: number;
//     }
//   ],
//   totalResultCount: number;
// }

const CandidateResult: React.FC = () => {
  const {user} = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<[]>([]);

  // Format Date
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

    // Get Candidate's Results
    const getCandidateResults = async () => {
      setLoading(true)
      try {
            const response = await resultApi.getCandidateExamResults({
              search: searchTerm || undefined,
            });
            // console.log("Results: ", response)
            setResults(response?.data?.candidateResults || []);
          } catch (error: any) {
        // console.log("Error: ", error)
            console.error('Error fetching exams:', error);
            present({
              message: error.message || 'Failed to fetch Exam results',
              duration: 2000,
              position: 'bottom',
              color: 'danger',
            });
          } finally {
            setLoading(false);
          }
    }

    useEffect(() => {
      getCandidateResults();
    }, [user?.id])

      const handleSearch = async () => {
        console.log("Search term was sent:", searchTerm)
      }
  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />
        <div className="min-h-screen bg-slate-100 p-2 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">

              <div className="space-y-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <IonText className="text-lg uppercase tracking-wide text-(--ion-color-primary) font-bold">
                        Your Exam Results
                      </IonText>
                    </div>
                    <IonText className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                      Total: {results?.length}
                    </IonText>
                  </div>

                  <div className="mt-3 space-y-2 grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {loading ? (
                      <div className="w-full text-center flex flex-co items-center justify-center">
                                          <IonSpinner color="primary" name='crescent' />
                                          <IonText className="block text-sm text-slate-900">
                                          Loading your Results...
                                        </IonText>
                      </div>
                    ) : results.length === 0 ? (
                      <div className="w-full text-center flex flex-col items-center justify-center">
                                        <div className="mb-3 w-12 h-12 bg-(--ion-color-primary) rounded-full flex items-center justify-center">
                                          <AlertTriangle className="w-6 h-6 text-white" />
                                        </div>
                                        <IonText className="block text-sm font-semibold text-slate-900">
                                          No Results Found
                                        </IonText>
                                        <IonText className="block text-xs text-slate-500">
                                          Your exam results will appear here once you complete an exam.
                                        </IonText>
                      </div>
                    ) : results.map((result: any) => (
                      <div
                        key={result?.exam?.title}
                        className="rounded-2xl border border-(--ion-color-primary)/20 shadow-sm shadow-cyan-100 p-2"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-sm text-slate-900">
                              {result?.exam?.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(result?.updatedAt)}
                            </p>
                          </div>
                          <div
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${result?.passed ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}
                          >
                            {result?.passed ? 'Passed' : 'Failed'}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-4 text-sm text-slate-500">
                          <span>
                            Score: 
                            <span className="font-semibold text-slate-900">
                              {result?.percentage}%
                            </span>
                          </span>
                          <IonButton shape='round' fill='clear' routerLink={`/view-result/${result?._id}`}>
                            <IonIcon icon={chevronForward} color='primary' slot='icon-only' />
                          </IonButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default CandidateResult