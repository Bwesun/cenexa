import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLoading, IonModal, IonPage, IonSpinner, IonText, IonToast } from "@ionic/react";
import {
  ArrowRightIcon,
  BarChart2Icon,
  CheckCircle2Icon,
  Edit2Icon,
  ListIcon,
  Search,
  ShieldCheckIcon,
  Trash2Icon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
  EyeIcon,
  XIcon,
  Check,
  X,
  AlertCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import TopNav from "../../components/TopNav";
import { orgApi } from "../../services/orgApi";
import { useEffect, useRef, useState } from "react";
import { searchOutline } from "ionicons/icons";

const analyticsData = [
  { label: "Total organizations", value: "124", icon: ListIcon, color: "bg-sky-100 text-sky-600" },
  { label: "Active subscriptions", value: "98", icon: ShieldCheckIcon, color: "bg-emerald-100 text-emerald-600" },
  { label: "Pending approvals", value: "9", icon: TrendingUpIcon, color: "bg-violet-100 text-violet-600" },
  { label: "Total users", value: "2,450", icon: UsersIcon, color: "bg-slate-100 text-slate-700" },
];

interface Organization {
  _id?: string;
  name: string;
  description?: string;
  organizationCode?: string;
  organizationNumber?: number;
  status?: "active" | "pending" | "inactive" | string;
  createdAt?: string;
  updatedAt?: string;
}

const Organizations: React.FC = () => {
  const { user } = useAuth();
  const modalRef = useRef<HTMLIonModalElement>(null);
  const detailModalRef = useRef<HTMLIonModalElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: "",
    description: "",
  });

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await orgApi.getAllOrg({
        search: searchQuery,
        page,
        limit,
      });

      setOrganizations(response.data || []);
      setPagination({
        page: response.pagination?.page ?? 1,
        totalPages: response.pagination?.totalPages ?? 1,
        hasNextPage: response.pagination?.hasNextPage ?? false,
        hasPrevPage: response.pagination?.hasPrevPage ?? false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load organizations");
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [page, searchQuery]);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchTerm.trim());
  };

  const handleCreateOrg = async () => {
    console.log("Creating organization:", formData);
    try{
      setCreateLoading(true);
      await orgApi.createOrganization({
        name: formData.organizationName,
        description: formData.description,
      });
      setCreateLoading(false);
      fetchOrganizations();
    } catch (error: any) {
      setError(error.message || "Failed to create organization");
    } finally{
        setCreateLoading(false);
        setError(null);
    }

    setFormData({ organizationName: "", description: ""});
    modalRef.current?.dismiss();
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />
        <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Superadmin</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">Organizations</h1>
                <p className="mt-2 text-sm text-slate-600">Manage all organizations and their settings</p>
              </div>
              <IonButton
                className=""
                onClick={() => modalRef.current?.present()}
              >
                + Create organization
              </IonButton>
            </div>

            {/* Analytics Cards */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {analyticsData.map((stat) => (
                <div key={stat.label} className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
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
            </section>

            {/* Organizations List Section */}
            <section className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">List</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">All organizations</h2>
                </div>
                <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                  {organizations.length} orgs
                </span>
              </div>

              {/* Search Bar */}
              <div className="mt-6">
                <div className="flex gap-2 items-center">
                  <IonInput
                    type="text"
                    placeholder="Search organizations by name..."
                    value={searchTerm}
                    onIonChange={(e) => setSearchTerm(e.detail.value || "")}
                    className="bg-gray-100"
                  />
                  <IonButton color="primary" fill="clear" onClick={handleSearch}>
                    <IonIcon icon={searchOutline} slot="icon-only" />
                  </IonButton>
                </div>
              </div>

              {isLoading ? (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 flex justify-center items-center flex-col">
                  <IonSpinner name="dots" color={"primary"} />
                  <span>Loading organizations...</span>
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {organizations.map((org) => (
                      <div
                        key={org?._id}
                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950 truncate">{org.name}</p>
                              <p className="mt-1 text-xs text-slate-500 truncate">
                                {org.organizationCode ?? `ID No.: ${org.organizationNumber ?? "N/A"}`}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                                org.status?.toLowerCase() === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : org.status?.toLowerCase() === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {org.status?.toLowerCase() === "active" ? <Check size={14} /> : org.status?.toLowerCase() === "pending" ? <AlertCircle size={14} /> : <X size={14} />}
                              <span className="capitalize">{org.status || "Unknown"}</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <IonButton
                              size="small"
                              fill="clear"
                              color="primary"
                              onClick={() => {
                                setSelectedOrg(org);
                                detailModalRef.current?.present();
                              }}
                              title="View details"
                            >
                              <EyeIcon className="h-3.5 w-3.5" />
                            </IonButton>
                            <IonButton
                              size="small"
                              fill="clear"
                              color="dark"
                              title="Edit organization"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </IonButton>
                            <IonButton
                              size="small"
                              fill="clear"
                              color="danger"
                              title="Deactivate organization"
                            >
                              <Trash2Icon className="h-3.5 w-3.5" />
                            </IonButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {organizations.length === 0 && (
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12">
                      <Search className="h-8 w-8 text-slate-400" />
                      <p className="text-center text-sm text-slate-500">No organizations found matching your search.</p>
                    </div>
                  )}

                  {organizations.length > 0 && (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm text-slate-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <IonButton
                          size="small"
                          fill="clear"
                          color={"primary"}
                          shape="round"
                          disabled={!pagination.hasPrevPage}
                          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        >
                          <ChevronLeft size={18} />
                        </IonButton>
                        <IonButton
                          size="small"
                          fill="clear"
                          color={"primary"}
                          shape="round"
                          disabled={!pagination.hasNextPage}
                          onClick={() => setPage((prev) => prev + 1)}
                        >
                          <ChevronRight size={18} />
                        </IonButton>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </IonContent>

      {/* Create Organization Modal */}
      <IonModal ref={modalRef} trigger="open-modal" className="rounded-3xl">
        <IonContent className="ion-padding">
          <div className="mx-auto max-w-2xl py-6 bg-white">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <IonText className="text-2xl font-semibold text-slate-950">Create new organization</IonText>
                <p className="mt-1 text-sm text-slate-600">Fill in the details to register a new organization</p>
              </div>
              <IonButton
              shape="round"
              fill="clear"
                onClick={() => modalRef.current?.dismiss()}
                className=""
              >
                <XIcon className="h-5 w-5 text-(--var-color-primary)" />
              </IonButton>
            </div>

            {createLoading && <IonLoading isOpen={createLoading} message="Creating organization..." />}

            {error && (
              <IonToast
                isOpen={error !== null}
                onDidDismiss={() => setError(null)}
                message={error || ""}
                duration={3000}
                color="danger"
              />
            )}

            <form className="space-y-3">
              <IonItem lines="none">
                <IonInput
                  type="text"
                  label="Organization name"
                  placeholder="Enter Organization name..."
                  labelPlacement="floating"
                  value={formData.organizationName || ""}
                  color={"primary"}
                  onIonInput={(e) => setFormData( {...formData, organizationName: e.detail.value!})}
                  required
                  className="bg-white"
                />
              </IonItem>

              <IonItem lines="none">
                <IonInput
                  type="text"
                  label="Description"
                  placeholder="Enter Description..."
                  labelPlacement="floating"
                  value={formData.description || ""}
                  color={"primary"}
                  onIonInput={(e) => setFormData( {...formData, description: e.detail.value!})}
                  required
                  className="bg-white"
                />
              </IonItem>

              <div className="flex gap-3 pt-4">
                <IonButton
                  expand="block"
                  shape="round"
                  onClick={handleCreateOrg}
                  className=""
                >
                  Create organization
                </IonButton>
                <IonButton
                  expand="block"
                  fill="outline"
                  shape="round"
                  onClick={() => modalRef.current?.dismiss()}
                  className=""
                >
                  Cancel
                </IonButton>
              </div>
            </form>
          </div>
        </IonContent>
      </IonModal>

      {/* Organization Details Modal */}
      <IonModal ref={detailModalRef} className="rounded-3xl">
        <IonContent className="ion-padding">
          {selectedOrg && (
            <div className="mx-auto max-w-2xl py-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">{selectedOrg.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">Complete organization details</p>
                </div>
                <button
                  onClick={() => detailModalRef.current?.dismiss()}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2 hover:bg-slate-100 transition"
                >
                  <XIcon className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Status</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        selectedOrg.status?.toLowerCase() === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : selectedOrg.status?.toLowerCase() === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {selectedOrg.status || "Unknown"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Created at</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedOrg.createdAt ? new Date(selectedOrg.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Organization code</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{selectedOrg.organizationCode || "N/A"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Organization number</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{selectedOrg.organizationNumber ?? "N/A"}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Description</p>
                  <p className="mt-2 text-sm text-slate-900">{selectedOrg.description || "No description available."}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <IonButton
                    expand="block"
                    className="rounded-full border border-slate-200 bg-slate-50 text-slate-700"
                    fill="outline"
                  >
                    <Edit2Icon className="h-4 w-4 mr-2" />
                    Edit
                  </IonButton>
                  <IonButton
                    expand="block"
                    className="rounded-full border border-red-200 bg-red-50 text-red-700"
                    fill="outline"
                  >
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    Delete
                  </IonButton>
                </div>
              </div>
            </div>
          )}
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Organizations;
