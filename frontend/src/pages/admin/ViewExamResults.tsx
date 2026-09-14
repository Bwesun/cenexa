import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  IonInput,
  IonSpinner,
  IonLoading,
  useIonToast,
} from "@ionic/react";
import TopNav from "../../components/TopNav";
import { refreshOutline, search } from "ionicons/icons";
import { useEffect, useState } from "react";
import { resultApi } from "../../services/resultApi";
import { useParams } from "react-router";
import { Bar, BarChart, ResponsiveContainer } from "recharts";
import { ChevronRightCircle, Table, WandSparkles } from "lucide-react";
import * as XLSX from "xlsx";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const ViewExamResults: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [examResultStats, setExamResultStats] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [present] = useIonToast();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [examTitle, setExamTitle] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [broadsheet, setBroadsheet] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingMessage, setGeneratingMessage] = useState<string>("");

  const fetchExamResults = async (page = pagination.page) => {
    try {
      setLoading(true);
      const response = await resultApi.getExamResults(examId, {
        page,
        search: searchTerm,
      });
      const data = response.data;
      // console.log(data)
      setExamResults(data.results || []);
      setPagination({
        page: data.pagination.page || pagination.page,
        limit: data.pagination.limit || pagination.limit,
        total: data.pagination.total || examResults.length,
        totalPages: data.pagination.totalPages || pagination.totalPages,
      });
    } catch (error) {
      console.error("Error fetching exam results:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResultStats = async () => {
    try {
      setLoading(true);
      const response = await resultApi.getExamResultStats(examId);
      setExamResultStats(response?.data || null);
      setExamTitle(response?.data?.exam || "");
    } catch (error) {
      console.error("Error fetching exam result stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateBroadsheet = async () => {
    try {
      setGeneratingMessage("Generating broadsheet...");
      setIsGenerating(true);
      const response = await resultApi.generateBroadsheet(examId);
      setBroadsheet(response.data || []);

      if (response.data?.results?.length === 0) {
        present({
          message: "No results found",
          duration: 2000,
          position: "bottom",
          color: "danger",
        });
        return;
      }

      present({
        message: "Broadsheet generated successfully!",
        duration: 2000,
        position: "bottom",
        color: "success",
      });
    } catch (error) {
      if (error) {
        present({
          message: "Error generating broadsheet",
          duration: 2000,
          position: "bottom",
          color: "danger",
        });
      }
      console.error("Error generating broadsheet:", error);
    } finally {
      setGeneratingMessage("");
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchExamResults();
    fetchExamResultStats();
  }, [examId]);

  const exportToExcel = async () => {
    if (broadsheet === null) {
      present({
        message: "Please Generate Broadsheet first",
        duration: 2000,
        position: "bottom",
        color: "danger",
      });
      return;
    }

    if (broadsheet?.results?.length === 0) {
      present({
        message: "No results found",
        duration: 2000,
        position: "bottom",
        color: "danger",
      });
      return;
    }

    try {
      setGeneratingMessage("Exporting to Excel...");
      setIsGenerating(true);
      const worksheet = XLSX.utils.json_to_sheet(broadsheet?.results);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Broadsheet");

      // Convert to base64
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "base64",
      });

      // Save the file using Capacitor FileSystem
      const fileName = `${examTitle}-broadsheet.xlsx`;
      const file = await Filesystem.writeFile({
        path: fileName,
        directory: Directory.Documents,
        data: excelBuffer,
      });

      // Share the file
      await Share.share({
        title: "Candidate Result Broadsheet",
        text: `Here is the ${examTitle} brodsheet`,
        url: file.uri,
      });

      present({
        message: "Broadsheet exported successfully",
        duration: 2000,
        position: "bottom",
        color: "success",
      });

      console.log("Broadsheet exported and shared:", file.uri);
    } catch (error) {
      if (error) {
        present({
          message: "Error exporting to excel",
          duration: 2000,
          position: "bottom",
          color: "danger",
        });
        return;
      }
      console.error("Error exporting to excel:", error);
    } finally {
      setGeneratingMessage("");
      setIsGenerating(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-3">
              {/* Header */}
              <div>
                <IonText className="text-lg font-bold text-(--ion-color-primary)">
                  Exam Results
                </IonText>
                <p className="text-sm text-gray-500">
                  View results of candidates who sat for the exam
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <IonText className="text-sm text-(--ion-color-primary) font-semibold">
                    {examTitle}
                  </IonText>
                </div>
                <div className="flex justify-end items-center">
                  <IonButton
                    onClick={async () => {
                      setBroadsheet(null);
                      await fetchExamResults();
                      await fetchExamResultStats();
                    }}
                    color="primary"
                    shape="round"
                    title="Refresh"
                  >
                    <IonIcon
                      icon={refreshOutline}
                      slot="icon-only"
                      color="light"
                    ></IonIcon>
                  </IonButton>
                </div>
              </div>

              {/* Exam Results Stats */}
              {examResultStats && (
                // Exam Result Statistics
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Exam Result Statistics
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center border-r border-gray-200 last:border-r-0">
                      <p className="text-2xl font-bold text-gray-900">
                        {examResultStats.totalCandidates}
                      </p>
                      <p className="text-xs text-gray-500">Total Candidates</p>
                    </div>
                    <div className="text-center border-r border-gray-200 last:border-r-0">
                      <p className="text-2xl font-bold text-green-600">
                        {examResultStats.totalPassed}
                      </p>
                      <p className="text-xs text-gray-500">Passed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {examResultStats.totalFailed}
                      </p>
                      <p className="text-xs text-gray-500">Failed</p>
                    </div>
                  </div>

                  {/* Percentage Bar Visual */}
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all duration-500"
                        style={{
                          width: `${(examResultStats.totalPassed / Math.max(1, examResultStats.totalCandidates)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {(
                        (examResultStats.totalPassed /
                          Math.max(1, examResultStats.totalCandidates)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>

                  {/* Generate Broadsheet Button */}
                  <IonButton
                    expand="block"
                    color="primary"
                    onClick={() => {
                      generateBroadsheet();
                      console.log("broadsheet", broadsheet);
                    }}
                    className="mt-4"
                  >
                    <Table size={18} className="mr-3" />
                    Generate Broadsheet
                  </IonButton>
                  <IonButton
                    expand="block"
                    color="primary"
                    onClick={exportToExcel}
                    className="mt-4"
                    fill="outline"
                  >
                    <Table size={18} className="mr-3" />
                    Export to Excel
                  </IonButton>
                </div>
              )}

              {isGenerating && (
                <IonLoading
                  isOpen={isGenerating}
                  onDidDismiss={() => setIsGenerating(false)}
                  message={generatingMessage}
                  spinner="lines"
                  color="dark"
                />
              )}

              {/* SHow broadsheet if populated */}
              {broadsheet && broadsheet?.results.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Broadsheet
                      </p>
                    </div>
                  </div>
                  <table className="w-full h-[10vh] text-[10px] overflow-x-auto overflow-y-scroll text-gray-700">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th>RAN No</th>
                        <th>Name</th>
                        <th>Score</th>
                        <th>Remark</th>
                      </tr>
                    </thead>

                    <tbody>
                      {broadsheet?.results.map((row: any) => (
                        <tr key={row.sn}>
                          <td>{row.sn}</td>
                          <td>{row.ranNo}</td>
                          <td>{row.name}</td>
                          <td>{row.score}</td>
                          <td>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Search Bar */}
              <div className="mt-6">
                <div className="flex gap-2 items-center">
                  <IonInput
                    style={{
                      background: "white",
                    }}
                    type="text"
                    placeholder="Search exams by RAN Number..."
                    value={searchTerm}
                    onIonChange={(e) => setSearchTerm(e.detail.value || "")}
                    className="bg-gray-100"
                  />
                  <IonButton
                    color="primary"
                    fill="clear"
                    onClick={() => fetchExamResults()}
                  >
                    <IonIcon icon={search} slot="icon-only" color="primary" />
                  </IonButton>
                </div>
              </div>
              {/* Loading Spinner */}
              {loading && (
                <div className="flex justify-center flex-col items-center py-8 gap-2">
                  <IonSpinner name="crescent" color="primary" />{" "}
                  <span className="text-(--ion-color-primary)">
                    Loading results...
                  </span>
                </div>
              )}
              {/* Exam results */}
              <div>
                {examResults.length > 0 ? (
                  <>
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <IonText className="text-sm text-(--ion-color-primary) font-semibold">
                            List of Candidates
                          </IonText>
                        </div>
                        <div className="flex justify-end items-center">
                          <IonText className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-(--ion-color-primary) hover:bg-(--ion-color-primary) hover:text-white">
                            Total: {pagination.total}
                          </IonText>
                        </div>
                      </div>
                      <div className="">
                        {/* show list of candidates names , status, score as a card format with name on the left, status on the right top and score on the right bottom */}
                        {examResults.map((result) => (
                          <div
                            key={result._id}
                            className="flex flex-col gap-2 border-b border-gray-300 p-2 mt-4"
                          >
                            <div className="flex items-center justify-between">
                              <IonText className="text-sm text-gray-900 font-semibold">
                                {result?.candidate?.name}
                              </IonText>
                              <IonText
                                className={`text-xs font-semibold ${result?.passed ? "text-green-600" : "text-red-600"}`}
                              >
                                {result?.passed ? "Passed" : "Failed"}
                              </IonText>
                            </div>
                            <div className="flex items-center justify-between">
                              <IonText className="text-xs text-(--ion-color-primary) font-semibold">
                                {result?.totalCorrect} /{" "}
                                {result?.totalCorrect +
                                  result?.totalBlank +
                                  result?.totalIncorrect}
                              </IonText>
                              <IonButton
                                color="primary"
                                fill="clear"
                                size="small"
                                routerLink={`/view-result/${result._id}`}
                              >
                                <ChevronRightCircle size={18} />
                              </IonButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center mt-8">
                    <p className="text-(--ion-color-primary) text-sm">
                      No candidate result found for this exam!
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 0 && (
                  <div className="mt-6 flex justify-between items-center">
                    <IonButton
                      color="primary"
                      shape="round"
                      fill="clear"
                      size="small"
                      onClick={() => {
                        fetchExamResults(pagination.page - 1);
                      }}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </IonButton>
                    {loading ? (
                      <IonSpinner name="dots" color="primary" />
                    ) : (
                      <IonText className="text-sm text-slate-500">
                        Page {pagination.page} of {pagination.totalPages}
                      </IonText>
                    )}
                    <IonButton
                      color="primary"
                      shape="round"
                      fill="clear"
                      size="small"
                      onClick={() => {
                        fetchExamResults(pagination.page + 1);
                      }}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </IonButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ViewExamResults;
