import { IonButton, IonContent, IonPage } from "@ionic/react";
import {
    ArrowRightIcon,
    BarChartIcon,
    CreditCardIcon,
    MessageSquareIcon,
    ShoppingCartIcon,
    UsersIcon,
} from "lucide-react";
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import TopNav from "../components/TopNav";

const Home: React.FC = () => {
    const { user } = useAuth();
    const role = user?.role;
    const primaryCta = user ? `/${role}/dashboard` : '/login';

    return (
        <IonPage>
            <IonContent fullscreen>
                <TopNav />

                <section className="relative overflow-hidden bg-linear-to-br from-[#0f172a] via-[#1d4ed8] to-[#0ea5e9] text-white">
                    <div className="absolute inset-0" />
                    <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-between px-6 py-16 sm:px-10 lg:px-12">
                        <div className="max-w-3xl">
                            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-white/80 shadow-sm backdrop-blur">
                                Exam made simple
                            </p>
                            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Take every exam with confidence.
                            </h1>
                            <p className="mt-6 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
                                Smart exam plans, progress tracking, and quick review tools built for learners who want the easiest path to exam success.
                            </p>

                            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                                <IonButton routerLink={primaryCta} color={'secondary'} shape="round" fill="solid">
                                    {user ? 'Open Dashboard' : 'Get Started'}
                                </IonButton>
                                {!user && (
                                    <IonButton routerLink="/login"  shape="round" color={'light'} fill="solid">
                                    Login
                                </IonButton>
                                )}
                            </div>
                        </div>

                        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                                    <BarChartIcon size={22} />
                                </div>
                                <h2 className="mt-5 text-lg font-semibold text-white">Track your progress</h2>
                                <p className="mt-3 text-sm leading-6 text-white/80">See practice results and study streaks in one sleek dashboard.</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                                    <UsersIcon size={22} />
                                </div>
                                <h2 className="mt-5 text-lg font-semibold text-white">Collaborative support</h2>
                                <p className="mt-3 text-sm leading-6 text-white/80">Connect with tutors and classmates for smarter preparation.</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                                    <CreditCardIcon size={22} />
                                </div>
                                <h2 className="mt-5 text-lg font-semibold text-white">Secure results</h2>
                                <p className="mt-3 text-sm leading-6 text-white/80">Smart exam-ready workflows that keep you focused and protected.</p>
                            </div>
                        </div>
                    </div>
                </section>


                <section className="bg-slate-100 py-14">
                    <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
                        <div className="grid gap-5 md:grid-cols-3">
                            <div className="rounded-3xl bg-white p-8 shadow-sm">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                    <ArrowRightIcon size={20} />
                                </div>
                                <p className="mt-5 text-3xl font-semibold text-slate-950">Fast start</p>
                                <p className="mt-3 text-sm leading-6 text-slate-600">Launch exam tools in seconds and get immediate momentum.</p>
                            </div>
                            <div className="rounded-3xl bg-white p-8 shadow-sm">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white">
                                    <CreditCardIcon size={20} />
                                </div>
                                <p className="mt-5 text-3xl font-semibold text-slate-950">Trusted workflow</p>
                                <p className="mt-3 text-sm leading-6 text-slate-600">A clean experience for managing exams and results.</p>
                            </div>
                            <div className="rounded-3xl bg-white p-8 shadow-sm">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                                    <UsersIcon size={20} />
                                </div>
                                <p className="mt-5 text-3xl font-semibold text-slate-950">Always supported</p>
                                <p className="mt-3 text-sm leading-6 text-slate-600">Build confidence with exam taking whenever you need it.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </IonContent>
        </IonPage>
    );
};

export default Home;