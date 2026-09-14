import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonPage,
  IonSpinner,
  IonText,
  useIonToast,
} from "@ionic/react";
import {
  AlertCircle,
  ArrowRight,
  ArrowRightIcon,
  BarChart2Icon,
  BookmarkIcon,
  CheckCircle2Icon,
  CheckIcon,
  Clock3,
  CopyIcon,
  ListIcon,
  Search,
  Share,
  ShieldCheck,
  ShieldCheckIcon,
  TrendingUpIcon,
  UserIcon,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TopNav from "../components/TopNav";
import {
  arrowForward,
  chevronForward,
  play,
  search,
  searchOutline,
} from "ionicons/icons";
import { useParams } from "react-router";
import { resultApi } from "../services/resultApi";

interface RouteParams {
  id: string;
}

const CandidateViewResult: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<RouteParams>();
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>();

  const getCandidateResults = async () => {
    setLoading(true);
    try {
      const response = await resultApi.getResultById(id);
      console.log("Result: ", response);
      setResult(response?.data?.result || []);
    } catch (error: any) {
      // console.log("Error: ", error)
      console.error("Error fetching exams:", error);
      present({
        message: error.message || "Failed to fetch Result",
        duration: 2000,
        position: "bottom",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCandidateResults();
  }, [id]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />
        <div className="min-h-screen bg-slate-100 p-2 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <section className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
                {(user?.role === "admin" || user?.role === "examiner") && (
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <IonText>
                      <IonText className="text-md sm:text-lg font-bold text-slate-800">
                        {result?.exam?.title}
                      </IonText>

                      <p className="mt-1 text-xs sm:text-base text-slate-500">
                        Result Sheet
                      </p>

                      <div className="mt-2 flex justify-between items-center">
                        <IonText className="text-xs sm:text-base flex flex-col sm:flex-row sm:items-center sm:gap-2">
                          <span className="font-semibold text-slate-700">
                            Candidate Name:
                          </span>
                          <span className="text-slate-900">
                            {result?.candidate?.name}
                          </span>
                        </IonText>

                        <IonText className="text-xs sm:text-base flex flex-col sm:flex-row sm:items-center sm:gap-2">
                          <span className="font-semibold text-slate-700">
                            RAN No:
                          </span>
                          <span className="text-slate-900">
                            {result?.candidate?.ranNo}
                          </span>
                        </IonText>
                      </div>
                    </IonText>
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-slate-500">Loading result...</p>
                    <IonSpinner name="bubbles" color={"primary"} />
                  </div>
                ) : (
                  <div className="mt-3 flex justify-center items center gap-4">
                    {/* Circular Score */}
                    <div className="result-score-section">
                      <div className="result-score-ring-wrapper">
                        <svg className="result-score-svg" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="#e8e8e8"
                            strokeWidth="8"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke={result?.passed ? "#22c55e" : "#ef4444"}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - (result?.percentage ?? 0) / 100)}`}
                            transform="rotate(-90 60 60)"
                            style={{
                              transition: "stroke-dashoffset 1.2s ease",
                            }}
                          />
                        </svg>
                        <div className="result-score-inner">
                          <span className="result-score-pct">
                            {result?.percentage ?? 0}%
                          </span>
                          <span className="result-score-label">
                            Your % Score
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Table */}
                <div className="result-stats-table">
                  <div className="result-stat-row">
                    <span className="result-stat-key">Total Questions</span>
                    <span className="result-stat-val">
                      {result?.totalCorrect +
                        result?.totalIncorrect +
                        result?.totalBlank}
                    </span>
                  </div>
                  <div className="result-stat-row">
                    <span className="result-stat-key">Correct Answers</span>
                    <span className="result-stat-val result-stat-correct">
                      {result?.totalCorrect ?? 0}
                    </span>
                  </div>
                  <div className="result-stat-row">
                    <span className="result-stat-key">Incorrect Answers</span>
                    <span className="result-stat-val result-stat-incorrect">
                      {result?.totalIncorrect}
                    </span>
                  </div>
                  <div className="result-stat-row">
                    <span className="result-stat-key">Unanswered</span>
                    <span className="result-stat-val">
                      {result?.totalBlank ?? 0}
                    </span>
                  </div>
                  {/* <div className="result-stat-row">
                                  <span className="result-stat-key">Time Taken</span>
                                  <span className="result-stat-val result-stat-time">{result?.timeTaken ?? '--:--:--'}</span>
                                </div> */}
                </div>

                {/* Pass / Fail Badge */}
                <div
                  className={`result-badge ${result?.passed ? "result-badge-pass" : "result-badge-fail"}`}
                >
                  <span className="result-badge-icon">
                    {result?.passed ? "🥇" : "📋"}
                  </span>
                  <div className="result-badge-text">
                    <span className="result-badge-title">
                      {result?.passed ? "Great Job!" : "Better Luck!"}
                    </span>
                    <span className="result-badge-subtitle">
                      {result?.passed
                        ? "You have passed the exam."
                        : "You did not pass the exam."}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {user?.role === "candidate" && (
                  <div className="result-actions">
                    <IonButton
                      expand="block"
                      shape="round"
                      routerLink={`/candidate/take-exam/${result?.candidateExam}`}
                      className="result-btn-primary"
                    >
                      Review My Answers
                    </IonButton>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CandidateViewResult;
