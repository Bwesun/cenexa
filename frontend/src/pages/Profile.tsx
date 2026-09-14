import { IonButton, IonContent, IonPage, IonText } from '@ionic/react'
import React, { useState } from 'react'
import TopNav from '../components/TopNav'
import { ChevronRight, Bell, Gift, Users, Settings, Star, Clock, Bookmark } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useHistory } from 'react-router'

interface User {
  name: string
  email: string
  avatar: string
  rewards: number
  dailyPoints: number
  totalPoints: number
  dailyStreak: number
}

interface MenuItem {
  icon: React.ReactNode
  label: string
  description?: string
  badge?: { text: string; color: string }
  onClick?: () => void
}

const Profile: React.FC = () => {
  const {user, logout} = useAuth();
  const history = useHistory();
  const [userFake] = useState<User>({
    name: 'John Mobbin',
    email: 'john.mobbin1@outlook.com',
    avatar: '👨',
    rewards: 22,
    dailyPoints: 22,
    totalPoints: 203,
    dailyStreak: 0,
  })

  const menuItems: MenuItem[] = [
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Notifications',
      onClick: () => {},
    },
    {
      icon: <Gift className="w-5 h-5" />,
      label: 'Rewards',
      onClick: () => {},
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Community',
      onClick: () => {},
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      onClick: () => {},
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: 'Interests',
      onClick: () => {},
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'History',
      onClick: () => {},
    },
    {
      icon: <Bookmark className="w-5 h-5" />,
      label: 'Bookmarks and saves',
      onClick: () => {},
    },
  ]

  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
          {/* Profile Header */}
          <div className="relative">
            {/* Background gradient */}
            <div className="h-32 bg-linear-to-r from-blue-600 via-blue-500 to-indigo-600"></div>

            {/* Profile Card */}
            <div className="px-4 sm:px-6 lg:px-8 pb-6">
              <div className="max-w-2xl mx-auto -mt-16 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Top Section with Avatar and User Info */}
                  <div className="px-6 py-8 sm:px-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center text-4xl border-4 border-white">
                          {/* {user?.avatar} */} 👨
                        </div>
                        {/* User Info */}
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                          <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 flex items-center gap-1">
                            Edit Profile
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 px-6 py-6 sm:px-8 border-t border-gray-100">
                    {/* Rewards Card */}
                    <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                      <div className="text-amber-600 text-2xl font-bold">{userFake.rewards}</div>
                      <div className="text-amber-700 text-xs font-medium mt-1">My Rewards</div>
                    </div>

                    {/* Daily Points Card */}
                    <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                      <div className="text-blue-600 text-2xl font-bold">
                        {userFake.dailyPoints}/{userFake.totalPoints}
                      </div>
                      <div className="text-blue-700 text-xs font-medium mt-1">Daily points</div>
                    </div>

                    {/* Daily Streak Card */}
                    <div className="bg-linear-to-br from-rose-50 to-rose-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                      <div className="text-rose-600 text-2xl font-bold">{userFake.dailyStreak}</div>
                      <div className="text-rose-700 text-xs font-medium mt-1">Daily streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Featured Section */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg">
                      🔵
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">The new Bing</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Explore AI-powered search</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    ✓ Approved
                  </span>
                </div>
              </div>

              {/* Menu Section */}
              <div>
                <IonText className="text-lg font-bold text-gray-900 mb-3 px-2">Account</IonText>
                <div className="bg-white rounded-xl shadow-md overflow-hidden divide-y p-3 divide-gray-100">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between p-4 mb-4 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-gray-500 group-hover:text-blue-600 transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.badge.color}`}>
                            {item.badge.text}
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout Button */}
              <div className="flex justify-center items-center">
                <IonButton color='danger' shape='round' size='small' onClick={() => {
                  logout();
                  history.push('/login');
                }}>
                  Logout
                </IonButton>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Profile