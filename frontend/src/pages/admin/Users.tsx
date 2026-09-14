import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Search, UserPlus, Filter, X, Users as UsersIcon, RefreshCw } from 'lucide-react';
import { close, personAdd, trash, pencil } from 'ionicons/icons';
import TopNav from '../../components/TopNav';
import { userApi } from '../../services/userApi';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserItem {
  _id: string;
  name: string;
  email?: string;
  ranNo: string;
  role: 'examiner' | 'candidate' | 'admin';
  phone?: string;
  association?: string;
  conference?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
}

// ─── Role badge helper ────────────────────────────────────────────────────────
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, string> = {
    examiner: 'bg-purple-100 text-purple-700',
    candidate: 'bg-sky-100 text-sky-700',
    admin: 'bg-amber-100 text-amber-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[role] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {role}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const Users: React.FC = () => {
  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();

  // List state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, totalUsers: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Create-user modal state
  const [showModal, setShowModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    ranNo: '',
    role: 'candidate' as 'examiner' | 'candidate',
    phone: '',
    association: '',
    conference: '',
  });

  // Edit-user modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'candidate' as 'examiner' | 'candidate',
    association: '',
    conference: '',
  });

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await userApi.getAdminOrgUsers({
        page,
        limit: 10,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
      });
      setUsers(res.users ?? []);
      setPagination(res.pagination ?? { page: 1, limit: 10, totalUsers: 0, totalPages: 0 });
    } catch (error: any) {
      present({ message: error.message || 'Failed to load users', duration: 2500, position: 'bottom', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, searchTerm, roleFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
    // re-fetch with new filter
    setLoading(true);
    userApi.getAdminOrgUsers({ page: 1, limit: 10, search: searchTerm || undefined, role: value || undefined })
      .then((res) => {
        setUsers(res.users ?? []);
        setPagination(res.pagination ?? { page: 1, limit: 10, totalUsers: 0, totalPages: 0 });
      })
      .catch((err) => present({ message: err.message || 'Failed to load users', duration: 2500, position: 'bottom', color: 'danger' }))
      .finally(() => setLoading(false));
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (user: UserItem) => {
    presentAlert({
      header: 'Delete User',
      message: `Are you sure you want to delete "${user.name}"? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await userApi.deleteAdminUserById(user._id);
              present({ message: 'User deleted successfully', duration: 2000, position: 'bottom', color: 'success' });
              fetchUsers(currentPage);
            } catch (err: any) {
              present({ message: err.message || 'Failed to delete user', duration: 2500, position: 'bottom', color: 'danger' });
            }
          },
        },
      ],
    });
  };

  // ── Open Edit ────────────────────────────────────────────────────────────
  const openEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: (user.role === 'admin' ? 'examiner' : user.role) as 'examiner' | 'candidate',
      association: user.association ?? '',
      conference: user.conference ?? '',
    });
    setShowEditModal(true);
  };

  // ── Save Edit ────────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      present({ message: 'Name and Phone are required', duration: 2500, position: 'bottom', color: 'danger' });
      return;
    }
    if (!editingUser) return;

    setEditLoading(true);
    try {
      await userApi.updateAdminUserById(editingUser._id, { ...editForm });
      present({ message: 'User updated successfully!', duration: 2000, position: 'bottom', color: 'success' });
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers(currentPage);
    } catch (err: any) {
      present({ message: err.message || 'Failed to update user', duration: 2500, position: 'bottom', color: 'danger' });
    } finally {
      setEditLoading(false);
    }
  };

  // ── Create user ──────────────────────────────────────────────────────────
  const resetForm = () =>
    setForm({ name: '', email: '', password: '', ranNo: '', role: 'candidate', phone: '', association: '', conference: '' });

  const handleCreate = async () => {
    if (!form.name.trim() || !form.password.trim() || !form.ranNo.trim()) {
      present({ message: 'Name, Password and RAN Number are required', duration: 2500, position: 'bottom', color: 'danger' });
      return;
    }
    if (form.password.length < 6) {
      present({ message: 'Password must be at least 6 characters', duration: 2500, position: 'bottom', color: 'danger' });
      return;
    }

    setCreateLoading(true);
    try {
      await userApi.createAdminUsers({ ...form });
      present({ message: 'User created successfully!', duration: 2000, position: 'bottom', color: 'success' });
      setShowModal(false);
      resetForm();
      fetchUsers(1);
    } catch (err: any) {
      present({ message: err.message || 'Failed to create user', duration: 2500, position: 'bottom', color: 'danger' });
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Formatters ───────────────────────────────────────────────────────────
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-5">

            {/* ── Header card ─────────────────────────────────────────── */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Admin Panel</p>
                  <h1 className="mt-1 text-2xl font-bold text-slate-900">Manage Users</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Create and manage examiners and candidates in your organisation.
                  </p>
                </div>
                <IonButton
                  shape="round"
                  color="primary"
                  onClick={() => { resetForm(); setShowModal(true); }}
                >
                  <IonIcon icon={personAdd} slot="start" />
                  Add User
                </IonButton>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-400">Total Users</p>
                  <p className="mt-0.5 text-xl font-bold text-slate-800">{pagination.totalUsers}</p>
                </div>
                <div className="rounded-xl bg-purple-50 px-4 py-3">
                  <p className="text-xs text-purple-400">Examiners</p>
                  <p className="mt-0.5 text-xl font-bold text-purple-700">
                    {users.filter((u) => u.role === 'examiner').length}
                  </p>
                </div>
                <div className="rounded-xl bg-sky-50 px-4 py-3">
                  <p className="text-xs text-sky-400">Candidates</p>
                  <p className="mt-0.5 text-xl font-bold text-sky-700">
                    {users.filter((u) => u.role === 'candidate').length}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Search + filter ──────────────────────────────────────── */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name, email or RAN number..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleFilterChange(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400"
                  >
                    <option value="">All roles</option>
                    <option value="examiner">Examiner</option>
                    <option value="candidate">Candidate</option>
                  </select>
                  <IonButton shape="round" fill="outline" color="primary" size="small" onClick={handleSearch}>
                    <IonIcon icon={personAdd} slot="icon-only" className="hidden" />
                    Search
                  </IonButton>
                  <IonButton
                    shape="round"
                    fill="clear"
                    color="medium"
                    size="small"
                    onClick={() => { setSearchTerm(''); setRoleFilter(''); setCurrentPage(1); fetchUsers(1); }}
                  >
                    <RefreshCw size={16} />
                  </IonButton>
                </div>
              </div>
            </div>

            {/* ── User list ────────────────────────────────────────────── */}
            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
              {/* Loading */}
              {loading && (
                <div className="flex justify-center items-center py-16">
                  <IonSpinner name="crescent" color="primary" />
                </div>
              )}

              {/* Users */}
              {!loading && users.length > 0 && (
                <div className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50 transition-colors sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* Avatar + info */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 font-bold text-base">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email || '—'}</p>
                          <p className="text-xs text-slate-400 font-mono">RAN: {user.ranNo}</p>
                        </div>
                      </div>

                      {/* Meta + actions */}
                      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                        <RoleBadge role={user.role} />
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-slate-400 hidden sm:inline">{formatDate(user.createdAt)}</span>
                        <IonButton
                          fill="outline"
                          shape="round"
                          size="small"
                          color="primary"
                          onClick={() => openEdit(user)}
                        >
                          <IonIcon icon={pencil} slot="icon-only" />
                        </IonButton>
                        <IonButton
                          fill="outline"
                          shape="round"
                          size="small"
                          color="danger"
                          onClick={() => handleDelete(user)}
                        >
                          <IonIcon icon={trash} slot="icon-only" />
                        </IonButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <UsersIcon size={40} className="mb-3 opacity-30" />
                  <p className="text-sm">No users found.</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                </div>
              )}

              {/* Pagination */}
              {!loading && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                  <IonButton
                    fill="outline"
                    size="small"
                    shape="round"
                    disabled={currentPage <= 1}
                    onClick={() => { const p = currentPage - 1; setCurrentPage(p); fetchUsers(p); }}
                  >
                    Previous
                  </IonButton>
                  <span className="text-xs text-slate-500">
                    Page {pagination.page} of {pagination.totalPages} — {pagination.totalUsers} users
                  </span>
                  <IonButton
                    fill="outline"
                    size="small"
                    shape="round"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => { const p = currentPage + 1; setCurrentPage(p); fetchUsers(p); }}
                  >
                    Next
                  </IonButton>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Create User Modal ─────────────────────────────────────────── */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">Create New User</h2>
                <IonButton fill="clear" size="small" color="medium" onClick={() => setShowModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </div>

              {/* Modal body */}
              <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                <IonInput
                  label="Full Name *"
                  labelPlacement="floating"
                  value={form.name}
                  onIonChange={(e) => setForm((f) => ({ ...f, name: e.detail.value ?? '' }))}
                  disabled={createLoading}
                  className="text-sm"
                />
                <IonInput
                  label="Email"
                  labelPlacement="floating"
                  type="email"
                  value={form.email}
                  onIonChange={(e) => setForm((f) => ({ ...f, email: e.detail.value ?? '' }))}
                  disabled={createLoading}
                  className="text-sm"
                />
                <IonInput
                  label="RAN Number *"
                  labelPlacement="floating"
                  value={form.ranNo}
                  onIonChange={(e) => setForm((f) => ({ ...f, ranNo: e.detail.value ?? '' }))}
                  disabled={createLoading}
                  className="text-sm"
                />
                <IonInput
                  label="Password *"
                  labelPlacement="floating"
                  type="password"
                  value={form.password}
                  onIonChange={(e) => setForm((f) => ({ ...f, password: e.detail.value ?? '' }))}
                  disabled={createLoading}
                  className="text-sm"
                />
                <IonInput
                  label="Phone"
                  labelPlacement="floating"
                  type="tel"
                  value={form.phone}
                  onIonChange={(e) => setForm((f) => ({ ...f, phone: e.detail.value ?? '' }))}
                  disabled={createLoading}
                  className="text-sm"
                />

                {/* Role select */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))}
                    disabled={createLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400"
                  >
                    <option value="candidate">Candidate</option>
                    <option value="examiner">Examiner</option>
                  </select>
                </div>

                <IonInput
                  label="Association"
                  labelPlacement="floating"
                  value={form.association}
                  onIonChange={(e) => setForm((f) => ({ ...f, association: e.detail.value ?? '' }))}
                  disabled={createLoading}
                  className="text-sm"
                />
                <IonInput
                  label="Conference"
                  labelPlacement="floating"
                  value={form.conference}
                  onIonChange={(e) => setForm((f) => ({ ...f, conference: e.detail.value ?? '' }))}
                  disabled={createLoading}
                  className="text-sm"
                />
              </div>

              {/* Modal footer */}
              <div className="flex gap-2 border-t border-slate-100 px-5 py-4">
                <IonButton
                  expand="block"
                  shape="round"
                  color="primary"
                  onClick={handleCreate}
                  disabled={createLoading}
                >
                  {createLoading ? <IonSpinner name="crescent" /> : 'Create User'}
                </IonButton>
                <IonButton
                  expand="block"
                  shape="round"
                  fill="outline"
                  color="danger"
                  onClick={() => setShowModal(false)}
                  disabled={createLoading}
                >
                  Cancel
                </IonButton>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit User Modal ───────────────────────────────────────────── */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Edit User</h2>
                  <p className="text-xs text-slate-400 mt-0.5">RAN: {editingUser.ranNo}</p>
                </div>
                <IonButton fill="clear" size="small" color="medium" onClick={() => setShowEditModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </div>

              {/* Modal body */}
              <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                <IonInput
                  label="Full Name *"
                  labelPlacement="floating"
                  value={editForm.name}
                  onIonChange={(e) => setEditForm((f) => ({ ...f, name: e.detail.value ?? '' }))}
                  disabled={editLoading}
                  className="text-sm"
                />
                <IonInput
                  label="Email"
                  labelPlacement="floating"
                  type="email"
                  value={editForm.email}
                  onIonChange={(e) => setEditForm((f) => ({ ...f, email: e.detail.value ?? '' }))}
                  disabled={editLoading}
                  className="text-sm"
                />
                <IonInput
                  label="Phone *"
                  labelPlacement="floating"
                  type="tel"
                  value={editForm.phone}
                  onIonChange={(e) => setEditForm((f) => ({ ...f, phone: e.detail.value ?? '' }))}
                  disabled={editLoading}
                  className="text-sm"
                />

                {/* Role select */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Role *</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as any }))}
                    disabled={editLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400"
                  >
                    <option value="candidate">Candidate</option>
                    <option value="examiner">Examiner</option>
                  </select>
                </div>

                <IonInput
                  label="Association"
                  labelPlacement="floating"
                  value={editForm.association}
                  onIonChange={(e) => setEditForm((f) => ({ ...f, association: e.detail.value ?? '' }))}
                  disabled={editLoading}
                  className="text-sm"
                />
                <IonInput
                  label="Conference"
                  labelPlacement="floating"
                  value={editForm.conference}
                  onIonChange={(e) => setEditForm((f) => ({ ...f, conference: e.detail.value ?? '' }))}
                  disabled={editLoading}
                  className="text-sm"
                />
              </div>

              {/* Modal footer */}
              <div className="flex gap-2 border-t border-slate-100 px-5 py-4">
                <IonButton
                  expand="block"
                  shape="round"
                  color="primary"
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                >
                  {editLoading ? <IonSpinner name="crescent" /> : 'Save Changes'}
                </IonButton>
                <IonButton
                  expand="block"
                  shape="round"
                  fill="outline"
                  color="danger"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                >
                  Cancel
                </IonButton>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Users;
