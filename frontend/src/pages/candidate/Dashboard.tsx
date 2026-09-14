import { IonButton, IonContent, IonIcon, IonPage, IonText, useIonToast } from '@ionic/react'
import { ArrowRight, ArrowRightIcon, BarChart2Icon, BookmarkIcon, CheckCircle2Icon, Clock3, ListIcon, ScanQrCodeIcon, Search, ShieldCheck, ShieldCheckIcon, TrendingUpIcon, UserIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import TopNav from '../../components/TopNav'
import { barcode, play, qrCode } from 'ionicons/icons'
import { Link, useHistory } from 'react-router-dom'
import { CapacitorBarcodeScanner } from "@capacitor/barcode-scanner";
import { Camera } from "@capacitor/camera";

const CandidateDashboard: React.FC = () => {
    const {user} = useAuth();
    const [qr, setQr] = useState<any>();
    const history = useHistory();
    const [present] = useIonToast();

    const scanQRCode = async () => {
        try {
          const result = await CapacitorBarcodeScanner.scanBarcode({
            hint: 0,
          });

          console.log("QR Code Scan Result: ", result);

          if (result.ScanResult) {
            history.push(`/candidate/pre-exam/${result?.ScanResult}`)
          }
        } catch (error: any) {
          present({ message: error.message || 'Failed to verify exam QR code', duration: 2000, position: 'bottom', color: 'danger' });
          console.error(error);
        }
      };
      
  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />
        <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="rounded-4xl bg-linear-to-br from-blue-600 via-sky-600 to-blue-500 p-6 shadow-2xl shadow-slate-400/10 text-white overflow-hidden">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <p className="text-xs tracking-[0.24em] text-slate-200/90">
                    Hello, {user?.name || "User"}
                  </p>
                  <IonText className="text-lg font-semibold sm:text-xl">
                    Ready to take your Exam?
                  </IonText>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <IonButton onClick={() => scanQRCode()} fill='clear' className='w-full'>
                    <div className="shadow-md bg-(--ion-color-light) p-2 rounded-2xl w-full sm:w-1/2 flex justify-center items-center gap-2">
                      <ScanQrCodeIcon className='w-9 h-9 text-(--ion-color-primary)' />
                      <div className=" flex flex-col justify-start items-start">
                      <IonText className="mt-3 text-md font-semibold text-(--ion-color-primary)">
                          Scan Exam QR Code
                        </IonText>
                        <p className="text-xs leading-6 text-(--ion-color-primary)">
                          Scan QR Code to start your exam
                        </p>
                      </div>
                      
                    </div>
                    </IonButton>
                  </div>
                  <div>
            {qr && <img src={qr} alt="QR Code" />}
        </div>

                <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                  <div className="rounded-4xl bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                        <ListIcon size={20} />
                      </div>
                      <div>
                        <Link to={'/exams'}>
                          <p className="text-sm font-semibold text-slate-900">
                            Exam List
                          </p>
                          <p className="text-xs text-slate-500">View all exams</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-4xl bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <BarChart2Icon size={20} />
                      </div>
                      <div>
                        <Link to={'/candidate/result'}>
                          <p className="text-sm font-semibold text-slate-900">
                            Results
                          </p>
                          <p className="text-xs text-slate-500">
                            Check performance
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* <div className="rounded-4xl bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <BookmarkIcon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Bookmarks</p>
                        <p className="text-xs text-slate-500">Save your favorites</p>
                      </div>
                    </div>
                  </div> */}
                  <div className="rounded-4xl bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <Link to={'/profile'}>
                          <p className="text-sm font-semibold text-slate-900">
                            Profile
                          </p>
                          <p className="text-xs text-slate-500">View account</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <section className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
                      Last exam done
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">
                      Physics daily quiz
                    </h2>
                  </div>
                  <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                    45 Minutes
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="text-slate-500">Score</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">
                      89%
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="text-slate-500">Correct</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">
                      31
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="text-slate-500">Time used</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">
                      37m
                    </p>
                  </div>
                </div>
              </section> */}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default CandidateDashboard