import { IonContent, IonPage, IonButton, IonSpinner, IonText, useIonToast } from '@ionic/react'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { examApi } from '../../services/examApi';
import { useAuth } from '../../contexts/AuthContext';
import TopNav from '../../components/TopNav';
import { AlertTriangle, Clock, File, FileEdit, ListCheck, Power, User, Zap } from 'lucide-react';
import { candidateExamApi } from '../../services/candidateExamApi';
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from '@capacitor/core';
import { number } from 'framer-motion';

interface RouteParams {
  id?: string;
}

const PreExam: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const examId = id || '1';
  const { user } = useAuth();
  const [exam, setExam] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initExamLoading, setInitExamLoading] = useState(false);
  const [initExamError, setInitExamError] = useState<string | null>(null);
  const [candidateExamId, setCandidateExamId] = useState<any>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState<boolean>(false);
  const [cordinates, setCordinates] = useState<{latitude: number | string, longitude: number | string} | null>(null);
  const [present] = useIonToast();
  const platform = Capacitor.getPlatform();
  // console.log(platform)
  const [distance, setDistance] = useState<any | null>(null);
  
// Get current location
const getLocation = async () => {
  const permission = await Geolocation.requestPermissions();

  if (permission.location !== "granted") {
    setInitExamError("Location permission denied")
    present({
      message: 'Location permission denied', 
      duration: 2000, 
      position: 'bottom', 
      color: 'danger'
    });
    throw new Error("Location permission denied");
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
  });

  return position.coords;
};

// Calculate Distance
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  if ([lat1, lon1, lat2, lon2].some(v => !Number.isFinite(v))) {
    alert(`Invalid coordinates: ${JSON.stringify({ lat1, lon1, lat2, lon2 })}`)
    throw new Error(
      `Invalid coordinates: ${JSON.stringify({ lat1, lon1, lat2, lon2 })}`
    );
  }

  const R = 6371000;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

  // fetch exam details
    const fetchExam = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examApi.getExamById(examId);
        // backend returns { success: true, data: exam }
        const payload = res?.data ?? res;
        setExam(payload?.data ?? payload);
        // console.log("Exam: ", payload?.location?.latitude)
      } catch (err: any) {
        console.error('Failed to load exam', err);
        setError(err?.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    // initiate exam setup for candidate
    const initiateExam = async () => {
      setInitExamLoading(true);
      setInitExamError(null);
      try {
        if (!examId) {
          setInitExamError('Exam ID is required. Return to previous page and select an exam to take');
          return;
        }

        const res = await candidateExamApi.initiateExamSetup(examId);
        // backend returns { success: true, data: exam }
        const payload = await res?.data ?? res;
        setCandidateExamId(payload?.data?.candidateExamId ?? payload?.candidateExamId);
        setIsSubmitted(payload?.data?.isSubmitted ?? payload?.isSubmitted);
        // console.log("CandidateExamID: ", payload?.data ?? payload)
      } catch (err: any) {
        console.log('Failed to initiate exam', err);
        setInitExamError(err?.message || 'Failed to initiate exam');
      } finally {
        setInitExamLoading(false);
      }
    }

    // Check if student is inside venue or not
    const checkDistance = async () => {
      try{
        setIsCheckingLocation(true)
        const coords = await getLocation();

        const distance = await calculateDistance(
          Number(coords.latitude),
          Number(coords.longitude),
          Number(exam?.location?.latitude),
          Number(exam?.location?.longitude)
        );
        setDistance(distance);

        if (distance <= exam?.location?.radius) {
          console.log("Allow Exam");
          present({
          message: `Location confirmed!`,
          duration: 2000,
          position: 'bottom',
          color: 'success'
        })
        } else {
          present({
          message: `Location not confirmed! You are outside the exam venue`,
          duration: 4000,
          position: 'bottom',
          color: 'danger'
        })
          setInitExamError('Candidate is outside the exam venue')
        }
      } catch (err: any) {
        present({
          message: `Error: Cannot Confirm your location. make sure your GPS is turned on`,
          duration: 4000,
          position: 'bottom',
          color: 'danger'
        })
        setInitExamError(err?.message || 'Failed to check distance');
      } finally {
        setIsCheckingLocation(false)
        setInitExamLoading(false);
      }
    }
    
  useEffect(()  => {
    fetchExam();
    initiateExam();
  }, [examId]);

  useEffect(() => {
  if (
      platform !== "web" &&
      exam?.location?.latitude != null &&
      exam?.location?.longitude != null
    ) {
      checkDistance();
    }
  }, [exam]);

  // console.log(exam.location.longitude)
  const candidateName = user?.name || 'John Doe';

  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8 lg:p-12">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Exam summary card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <IonSpinner name="crescent" color="primary" />
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-6 flex justify-center items-center flex-col">
                  <AlertTriangle size={24} />
                  {initExamError}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold text-(--ion-color-dark)">{exam?.title ?? 'Exam Title'}</div>
                    <p className="mt-2 text-sm text-slate-600">{exam?.description ?? 'Exam description.'}</p>
                  </div>
                  <div className="text-sm text-slate-700 bg-slate-50 rounded-md px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div><span className="font-semibold">Exam Code</span> &nbsp;: {exam?.examCode ?? 'N/A'}</div>
                      <div><span className="font-semibold">Duration</span> &nbsp;: {exam?.duration ?? 'N/A'} Minutes</div>
                      <div><span className="font-semibold">Questions</span> &nbsp;: {exam?.numberOfQuestions ?? exam?.numberOfQuestions ?? 'N/A'}</div>
                      <div><span className="font-semibold">Pass Mark</span> &nbsp;: {exam?.passingMark ?? 'N/A'}%</div>
                      {/* <div><span className="font-semibold">Attempts Left</span> &nbsp;: 1</div> */}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Candidate + Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center gap-3 text-(--ion-color-dark)">
                  <div>
                    <div className="text-sm text-(--ion-color-primary) font-semibold flex items-center gap-3 pb-2"><User /> Candidate Information</div>
                    <div className="mt-2 text-sm">
                      <div><span className="font-semibold">Name:</span> {candidateName}</div>
                      <div><span className="font-semibold">ID:</span> {user?.ranNo ?? user?.id ?? 'EXM2026001'}</div>
                      <div><span className="font-semibold">Conference:</span> {user?.conference ?? 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-(--ion-color-primary) font-semibold flex items-center gap-3 pb-2"><Zap /> Readiness Checklist</div>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>☑ Stable Internet Connection</li>
                  <li>☑ Device Charged</li>
                  <li>☑ Quiet Environment</li>
                  <li>☑ Instructions Read</li>
                </ul>
              </div>
            </div>

            {/* Instructions card */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="text-sm text-(--ion-color-primary) font-semibold flex items-center gap-3 pb-2"><AlertTriangle /> IMPORTANT INSTRUCTIONS</div>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>• Read each question carefully.</li>
                <li>• Do not refresh or close the App.</li>
                <li>• Your answers are automatically saved.</li>
                {/* <li>• You may flag questions for review.</li> */}
                <li>• The timer starts immediately after clicking Start Exam.</li>
                <li>• The exam will auto-submit when time expires.</li>
              </ul>
            </div>

            {/* Rules and Structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="text-sm text-(--ion-color-primary) font-semibold flex items-center gap-3 pb-2"><ListCheck /> Exam Rules</div>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>✅ Back Navigation</li>
                  <li>✅ Auto Save Enabled</li>
                  <li>❌ Multiple Tabs</li>
                  <li>❌ App Restart</li>
                </ul>
              </div>
            </div>

            {/* Time information */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="text-sm text-(--ion-color-primary) font-semibold flex items-center gap-3 pb-2" ><Clock /> TIME INFORMATION</div>
              <p className="text-sm text-slate-700">You have {exam?.duration} minutes to complete this examination.</p>
              <div className="mt-3 text-sm text-slate-700">
                <p>• The timer cannot be paused.</p>
                <p>• The timer continues even if you leave the page.</p>
                <p>• The exam is automatically submitted at 00:00.</p>
              </div>
            </div>

            {/* Declaration and Start */}
            <div className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-sm text-(--ion-color-primary) font-semibold flex items-center gap-3 pb-2"><FileEdit /> Candidate Declaration</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>☑ I have read and understood the examination instructions.</li>
                  <li>☑ I agree to abide by all examination rules.</li>
                  <li>☑ I understand that malpractice may lead to disqualification.</li>
                </ul>
              </div>

              <div className="w-full md:w-auto text-center">
                <div className="mb-2 text-xs text-slate-500">Once started, the timer cannot be paused.</div>
                {/* {initExamLoading && (
                    <div className="flex text-center flex-col justify-center items-center gap-2">
                      <IonSpinner name="crescent" color="light" />
                      <IonText color="dark">SETTING UP EXAM ENVIRONMENT...</IonText>
                    </div>
                )} */}

                {/* Display error */}
                {initExamError && (
                    <div className="flex text-center flex-col justify-center items-center gap-2 text-red-600">
                      <AlertTriangle size={18} />
                      <IonText className='text-sm'>{initExamError.toString()} - { 'Kindly contact Admin for further assistance.' }</IonText>
                    </div>
                )}
                  {isSubmitted && (
                    <div className="flex text-center flex-col justify-center items-center gap-2 text-yellow-500">
                      <AlertTriangle size={18} />
                      <IonText>{ 'Exam already taken' }</IonText>
                    </div>
                  )}                  
                  <IonButton routerLink={`/candidate/take-exam/${candidateExamId}`} size="large" color="primary" className="px-10 py-4 font-semibold rounded-full" disabled={initExamLoading || isCheckingLocation || !candidateExamId} >
                    {initExamLoading ? (
                      <span>
                        <IonSpinner name="crescent" color="light" />
                        LOADING...
                      </span>
                    ) : initExamError ? (
                      <span>
                        FAILED
                      </span>
                    ) : isSubmitted ? (
                      <span>
                        REVIEW ANSWERS
                      </span>
                    ) : (
                      <span>
                        START EXAM
                      </span>
                    )}
                  </IonButton>

                  
                
              </div>
              {initExamError && (
                    <IonButton color={'primary'} fill='clear' onClick={() => window.location.reload()}>
                      {/* Refresh Page */}
                      Refresh
                      {/* Location: Lat - {exam?.location?.latitude}, Long - {exam?.location?.longitude}. Radius - {exam?.location?.radius} meters
                      <br />

                      Distance: {distance} */}
                    </IonButton>
                  )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default PreExam