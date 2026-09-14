import { IonButton, IonContent, IonPage, IonText } from '@ionic/react'
import { ArrowRightIcon, BarChart2Icon, CheckCircle2Icon, ListIcon, Search, ShieldCheckIcon, TrendingUpIcon, UserIcon } from 'lucide-react'
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import TopNav from '../../components/TopNav'

const stats = [
  { label: 'Active organizations', value: '124', icon: ListIcon, color: 'bg-sky-100 text-sky-600' },
  { label: 'Superadmins', value: '18', icon: UserIcon, color: 'bg-violet-100 text-violet-600' },
  { label: 'Pending approvals', value: '9', icon: ShieldCheckIcon, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'System health', value: '99.98%', icon: BarChart2Icon, color: 'bg-slate-100 text-slate-700' },
]

const quickActions = [
  { title: 'Manage organizations', subtitle: 'Approve or update organization accounts', icon: ListIcon, route: '/super/organizations' },
  { title: 'Review approvals', subtitle: 'Pending admin and exam requests', icon: ShieldCheckIcon, route: '/super/approvals' },
  { title: 'Audit logs', subtitle: 'Track changes and security events', icon: TrendingUpIcon, route: '/super/audit' },
  { title: 'Manage superadmins', subtitle: 'Invite or remove admin users', icon: UserIcon, route: '/super/admins' },
]

const activityFeed = [
  { title: 'New org application submitted', description: 'BrightLearn Academy requested access.', time: '12 min ago', status: 'Review', badge: 'Pending' },
  { title: 'Security policy updated', description: 'Password policy changed for all accounts.', time: '1h ago', status: 'Completed', badge: 'Success' },
  { title: 'Exam flagged for review', description: 'Chemistry finals content submitted.', time: '2h ago', status: 'Pending', badge: 'Alert' },
]

const SuperDashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />

        <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="rounded-4xl bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl shadow-slate-950/20 ring-1 ring-white/10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Superadmin dashboard</p>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Welcome back, {user?.name || 'Super Admin'}
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                    Manage organizations, review approvals, and monitor system health from one central control panel.
                  </p>
                </div>

                <div className="rounded-4xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Today’s overview</p>
                      <p className="mt-2 text-3xl font-semibold text-white">86 active tasks</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-sky-300">
                      <ShieldCheckIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-200 ring-1 ring-white/10">
                      <p className="text-slate-400">Pending approvals</p>
                      <p className="mt-2 text-2xl font-semibold text-white">9</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-200 ring-1 ring-white/10">
                      <p className="text-slate-400">Active reports</p>
                      <p className="mt-2 text-2xl font-semibold text-white">14</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 shadow-inner shadow-white/5">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search superadmin actions"
                    className="w-full rounded-3xl bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
                <IonButton className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400" routerLink="/super/alerts">
                  View alerts
                </IonButton>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <section className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Quick actions</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Superadmin priorities</h2>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    Manage all
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {quickActions.map((action) => (
                    <div key={action.title} className="rounded-[1.75rem] border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-300/10">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                          <p className="mt-2 text-sm text-slate-500">{action.subtitle}</p>
                        </div>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-3xl ${action.title === 'Review approvals' ? 'bg-emerald-100 text-emerald-700' : action.title === 'Manage organizations' ? 'bg-sky-100 text-sky-600' : action.title === 'Audit logs' ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-700'}`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <IonButton routerLink={action.route} className="mt-6 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-slate-900/10" size="small">
                        Open
                      </IonButton>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-[1.75rem] bg-slate-50 p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-3xl ${stat.color}`}>
                          <stat.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                          <p className="mt-2 text-2xl font-semibold text-slate-950">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Recent activity</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Audit timeline</h2>
                  </div>
                  <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    {activityFeed.length} updates
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {activityFeed.map((item) => (
                    <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-slate-950">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                        </div>
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                          {item.badge}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                        <div className="inline-flex items-center gap-2 text-slate-500">
                          <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                          <span>{item.status}</span>
                        </div>
                        <p>{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">System summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Latest operational snapshot</h2>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Export report
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                  <p className="text-sm text-slate-500">Uptime</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">99.98%</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                  <p className="text-sm text-slate-500">Active sessions</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">1,420</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                  <p className="text-sm text-slate-500">New signups</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">37</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                  <p className="text-sm text-slate-500">Open tickets</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">12</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default SuperDashboard
