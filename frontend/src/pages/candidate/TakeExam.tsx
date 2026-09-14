import { IonAlert, IonButton, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLoading, IonModal, IonPage, IonProgressBar, IonRadio, IonRadioGroup, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react'
import { person, logOutOutline, logInOutline, send, closeSharp } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Logo from "../../assets/ralogo.png"
import { Link, useHistory, useParams } from 'react-router-dom'
import {candidateExamApi} from '../../services/candidateExamApi'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import './takeexam.css'


interface RouteParams {
  id?: string;
}

interface ExamDetails {
    _id: string;
    title: string;
    description: string;
    duration: number;
    totalMark: number;
    instructions: string;
    scheduleStart: string;
    scheduleEnd: string;
    isActive: boolean;
    status: string;
    organizationId: string;
    examNumber: number;
    examCode: string;
    numberOfQuestions: number;
    passingMark: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface QuestionOption {
    _id: string;
    text: string;
    isCorrect: boolean;
}

type QuestionStatus =
    | "pending"
    | "answered"
    | "skipped"
    | "review";

interface Question {
    _id: string;
    text: string;
    options: QuestionOption[];
    exam: string;
    createdBy: string;
    status: QuestionStatus;
    createdAt: string;
    updatedAt: string;
    questionNumber: number;
    questionCode: string;
    isActive: boolean;
    organizationId: string;
    __v: number;
}

interface CandidateQuestion {
    _id: string;
    question: Question;
    selectedOptionIndex: number | null;
    selectedOptionText: string;
}

interface CandidateExamResponse {
    examDetails: ExamDetails;
    questionArray: CandidateQuestion[];
    isSubmitted: boolean;
}

interface ExamResult {
    totalScore: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalBlank: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    timeTaken?: string;
}

interface CandidateAnswer {
    questionId: string;
    selectedOptionIndex: number;
    selectedOptionText: string;
}

const TakeExam: React.FC = () => {
    const {user} =  useAuth();
    const { id } = useParams<RouteParams>();
    const candidateExamId = id || '';
    const history = useHistory();

    
    const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
    const [questions, setQuestions] = useState<CandidateQuestion[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    // const [examDuration, setExamDuration] = useState<number>(20);
    const [remainingSeconds, setRemainingSeconds] = useState(
    (examDetails?.duration ?? 0) * 60);

    // Timer Color
    const [timerColor, setTimerColor] = useState<string>('dark');
    const [isSaving, setIsSaving] = useState(false);
    const [isGettingExam, setIsGettingExam] = useState(false);
    const [error, setError] = useState('');
    const [showSubmitAlert, setShowSubmitAlert] = useState(false);

    // Result modal state
    const [showResultModal, setShowResultModal] = useState(false);
    const [examResult, setExamResult] = useState<ExamResult | null>(null);

    // Track time taken
    const [examStartTime] = useState<number>(Date.now());

    // Derived State
    const currentQuestion = questions[currentIndex] ?? null;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    // Calculate ANswered and total questions for progress
    const answeredCount = questions.filter(q => q.selectedOptionIndex !== null).length;
    const progress = answeredCount/questions.length;
    
    // Get the candidate Exam
    useEffect(() => {
        const getCandidateExam = async () => {
            try {
                setIsGettingExam(true);
                const res = await candidateExamApi.getCandidateExamDetails(candidateExamId);

                const payload: CandidateExamResponse = res.data;

                setExamDetails(payload?.examDetails);
                setRemainingSeconds(payload?.examDetails?.duration * 60);
                setQuestions(payload?.questionArray);
                setIsSubmitted(payload?.isSubmitted);
                // console.log(payload);
            } catch (error) {
                console.error("Failed to get exam:", error);
            } finally{
                setIsGettingExam(false);
            }
        };

        if (candidateExamId) {
            getCandidateExam();
        }
    }, [candidateExamId]);

    // Set Timer
    useEffect(() => {
    const interval = setInterval(() => {
      if (!examDetails?.duration || isSubmitted) return; // don't start yet
        setRemainingSeconds(prev => {
            // Submit when timer is 0
            if (prev <= 1 && !isSubmitted) {
                clearInterval(interval);
                handleSubmit();
                return 0;
            }

            // Change timer to red if 5 minutes remaining
            if (prev <= 301 && !isSubmitted) {
                clearInterval(interval);
                // handleSubmit();
                setTimerColor('danger')
            }

            return prev - 1;

        });
    }, 1000);

    return () => clearInterval(interval);
    }, [remainingSeconds]);
   
    // TODO: Run Location Checks
    // TODO: Run Network Checks
    // If checks not successful, disallow

    // Save Question
    const handleSave = async (event: any) => {
      const index = event.detail.value;
      const option = currentQuestion.question.options[index];

      // Save answer in database
      try {
        setIsSaving(true);
        setError('')
        const res = await candidateExamApi.saveAnswer(
          candidateExamId,
          currentQuestion.question._id,
          index,
          option.text,
        );

        // Update questions array if save successful
        if (res.success === true) {
          setQuestions((prev) => {
            const updated = [...prev];

            updated[currentIndex] = {
              ...updated[currentIndex],
              selectedOptionIndex: index,
              selectedOptionText: option.text,
            };

            return updated;
          });
        }
      } catch (error: any) {
        setError(error.message);
        console.error('Could not save answer: ', error.message);
      } finally{
        setIsSaving(false)
      }
    };

    // Format seconds as HH:MM:SS
    const formatTimeTaken = (startMs: number): string => {
        const totalSecs = Math.floor((Date.now() - startMs) / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
    };

    // Submit Exam
    const handleSubmit = async () => {
        try {
          setIsSubmitting(true);
          const timeTaken = formatTimeTaken(examStartTime);
          const res = await candidateExamApi.submitExam(candidateExamId);
          const payload = res?.data ?? res;
          if (payload) {
            setExamResult({ ...payload, timeTaken });
            setIsSubmitted(true);
            setShowResultModal(true);
          }
        } catch (error: any) {
          setError(error.message);
          console.error('Could not submit exam: ', error.message);
        } finally{
          setIsSubmitting(false);
        }
    }
    
    // Goto Next Question
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    // Goto Previous Question
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

  return (
    <IonPage>
        <IonHeader>
        {/* Time Banner */}
            <IonToolbar color={'light'}>
                <div
            className="flex justify-between items-center px-2 sm:px-4 md:px-8 lg:px-18"
          >
            <div className=" flex items-center justify-between gap-2">
              <Link
                to={'/home'}
                >
                    <div className="flex items-center gap-4">
                        <IonImg src={Logo} className="w-10 h-10" />
                    </div>
              </Link>
            </div>
                <div className={`text-(--ion-color-${timerColor}) font-semibold text-lg flex justify-center items-center`} >
                    {/* Simulate a countdown timer of 30 minutes */}
                    <Clock size={18} className='mx-2 h-5 w-5' />
                    <IonText>
                        {minutes} : {seconds}
                    </IonText>
                </div>
            <div className="flex justify-end items-center">
              <div className="flex">
                {user ? (
                  <IonButton onClick={handleSubmit} shape="round" fill="clear">
                    <IonIcon slot="icon-only" icon={send} />
                  </IonButton>
                ) : (
                  <IonButton routerLink="/login" shape="round" fill="clear">
                    <IonIcon slot="icon-only" icon={logInOutline} />
                  </IonButton>
                )}
              </div>
            </div>
          </div>
            </IonToolbar>
        </IonHeader>
      <IonContent fullscreen>
        <div className="min-h-screen bg-white p-2 sm:p-4 lg:p-18">
          <div className="text-slate-900 p-2">
            {/* Question Count & Progress Bar*/}
            <div className="">
                <IonText className='text-xs'>Question {currentIndex+1} of {questions.length}</IonText>
                <IonProgressBar value={progress}></IonProgressBar>
            </div>

            {/* Show loader while questions are being fetched */}
            {isGettingExam && (
                <div className="flex justify-center items-center flex-col h-18 text-(--ion-color-tertiary)">
                    <IonSpinner name='bubbles' color={'tertiary'} />
                    <IonText>Loading Questions...</IonText>
                </div>
            )}
            <hr />

            {/* Question and Option */}
            <div className="mt-3">
                <IonText className='text-sm font-bold mt-3'> {currentQuestion?.question?.text}</IonText>

                <IonRadioGroup
                    key={currentQuestion?.question?._id}
                    value={currentQuestion?.selectedOptionIndex ?? undefined}
                    onIonChange={handleSave}
                >
                    {currentQuestion?.question?.options.map((option, index) => (
                        <IonItem lines="none" className="my-2" key={option._id}>
                            <IonRadio
                                disabled={isSubmitted}
                                color="light"
                                value={index}
                                className="ion-no-border"
                            >
                                <div className="ion-text-wrap text-(--ion-color-dark) text-sm">
                                    {option.text}
                                </div>
                            </IonRadio>
                        </IonItem>
                    ))}
                </IonRadioGroup>
            </div>

            {/* Loader for saving */}
            {isSaving ? (
                <div className="flex justify-center items-center text-xs text-(--ion-color-tertiary)">
                    Saving<IonSpinner name='dots' color={'tertiary'} />
            </div>
            ): <div className="flex justify-center items-center text-xs text-(--ion-color-success)">
                    <CheckCircle size={18} className='mx-2 h-5 w-5' /> Saved
            </div>}

            {/* Display any error */}
            {error && (
                <div className="flex justify-center items-center text-xs text-(--ion-color-danger)">
                    <AlertTriangle size={18} className='mx-2 h-5 w-5' />Oops... {error}
            </div>
            ) }

          {/* Next - Previous Navigations & Submit Button */}
          <div className="w-full flex justify-between items-center mt-6">
            <IonButton shape='round' fill='outline'  onClick={handlePrevious} disabled={isSaving || currentIndex === 0}>Previous</IonButton>

            {currentIndex === questions.length - 1 ? <IonButton shape='round'  onClick={() => setShowSubmitAlert(true)} disabled={isSubmitted || isSubmitting} >{isSubmitted ? 'Submitted' : 'Submit'}</IonButton> 
            : <IonButton shape='round' onClick={handleNext} disabled={isSaving}>Next</IonButton>}
          </div>

          {/* Arrange the question arrays in small buttons for easy navigation */}
          <div className="mt-6">
            <IonText className='text-sm font-semibold'>Question Palette</IonText>
            <div className="">
            {questions?.map((question, index) => (
                <IonButton color={currentIndex === index ? 'primary' : question.selectedOptionIndex !== null ? 'success' : 'primary'} size='small' key={question._id} onClick={() => setCurrentIndex(index)} className='w-8 mr-1 text-xs' shape="round" fill={currentIndex === index || question.selectedOptionIndex !== null ? "solid" : "outline"}>
                    {index + 1}
                </IonButton>
            ))}
            </div>
          </div>
          </div>

        </div>

        {/* Modal to view submitted result */}
        <IonModal
          isOpen={showResultModal}
          onDidDismiss={() => setShowResultModal(false)}
          backdropDismiss={false}
          animated={true}
          className="rounded-t-2xl"
        >
          <IonContent className="ion-padding-bottom" color="light">
            <div className="result-modal-container">

              {/* Confetti / trophy section */}
              <div className="result-trophy-section">
                <div className="result-trophy">🏆</div>
              </div>

              {/* Congratulations text */}
              <div className="result-congrats-section flex flex-col gap-2 justify-center items-center mt-3">
                <IonText className="result-congrats-title text-2xl font-semibold">Congratulations! 🎉</IonText>
                <IonText className="result-congrats-subtitle text-md font-medium">You have completed the exam</IonText>
              </div>

              {/* Circular Score */}
              <div className="result-score-section">
                <div className="result-score-ring-wrapper">
                  <svg className="result-score-svg" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e8e8e8" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke={examResult?.passed ? '#22c55e' : '#ef4444'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - (examResult?.percentage ?? 0) / 100)}`}
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                    />
                  </svg>
                  <div className="result-score-inner">
                    <span className="result-score-pct">{examResult?.percentage ?? 0}%</span>
                    <span className="result-score-label">Your Score</span>
                  </div>
                </div>
              </div>

              {/* Stats Table */}
              <div className="result-stats-table">
                <div className="result-stat-row">
                  <span className="result-stat-key">Total Questions</span>
                  <span className="result-stat-val">{examResult?.totalQuestions ?? 0}</span>
                </div>
                <div className="result-stat-row">
                  <span className="result-stat-key">Correct Answers</span>
                  <span className="result-stat-val result-stat-correct">{examResult?.totalCorrect ?? 0}</span>
                </div>
                <div className="result-stat-row">
                  <span className="result-stat-key">Incorrect Answers</span>
                  <span className="result-stat-val result-stat-incorrect">{examResult?.totalIncorrect ?? 0}</span>
                </div>
                <div className="result-stat-row">
                  <span className="result-stat-key">Unanswered</span>
                  <span className="result-stat-val">{examResult?.totalBlank ?? 0}</span>
                </div>
                {/* <div className="result-stat-row">
                  <span className="result-stat-key">Time Taken</span>
                  <span className="result-stat-val result-stat-time">{examResult?.timeTaken ?? '--:--:--'}</span>
                </div> */}
              </div>

              {/* Pass / Fail Badge */}
              <div className={`result-badge ${examResult?.passed ? 'result-badge-pass' : 'result-badge-fail'}`}>
                <span className="result-badge-icon">{examResult?.passed ? '🥇' : '📋'}</span>
                <div className="result-badge-text">
                  <span className="result-badge-title">{examResult?.passed ? 'Great Job!' : 'Better Luck!'}</span>
                  <span className="result-badge-subtitle">
                    {examResult?.passed ? 'You have passed the exam.' : 'You did not pass the exam.'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="result-actions">
                <IonButton expand="block" shape="round" onClick={() => setShowResultModal(false)} className="result-btn-primary">
                  Review My Answers
                </IonButton>
                <IonButton expand="block" shape="round" fill="outline" className="result-btn-secondary" onClick={() => {
                  setShowResultModal(false);
                  history.push("/candidate/dashboard");
                  // window.location.reload();
                }}>
                  Back to Dashboard
                </IonButton>
              </div>

            </div>
          </IonContent>
        </IonModal>

        {/* Submit confirmation */}
        <IonAlert
            isOpen={showSubmitAlert}
            onDidDismiss={() => setShowSubmitAlert(false)}
            color='light'
            className='custom-alert text-gray-100'
            animated={true}
            header="Submit Exam"
            message="Are you sure you want to submit your exam? You will not be able to make further changes."
            buttons={[
                {
                    text: 'No',
                    role: 'cancel',
                },
                {
                    text: 'Yes',
                    handler: () => {
                        handleSubmit();
                    },
                },
            ]}
        />

        {/* SHow submitting loader */}
        {isSubmitting && (
          <IonLoading
            isOpen={isSubmitting}
            message="Submitting exam..."
            spinner='lines'
            backdropDismiss={false}
            color='light'
          />
        )}
      </IonContent>
    </IonPage>
  );
}

export default TakeExam;