import React, { useRef, useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
  IonIcon,
  IonText,
  useIonToast,
  IonCard,
  IonCardContent,
} from "@ionic/react";

import {
  cloudUploadOutline,
  documentOutline,
  downloadOutline,
  close,
} from "ionicons/icons";

import { useHistory, useParams } from "react-router-dom";
import { questionApi } from "../../services/questionApi";

const UploadBulkQuestions: React.FC = () => {

  const { examId } = useParams<{ examId: string }>();

  const history = useHistory();

  const [present] = useIonToast();

  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const selected = e.target.files?.[0];

    if (!selected) return;

    if (!selected.name.endsWith(".csv")) {

      present({
        message: "Only CSV files are allowed.",
        duration: 2000,
        color: "danger",
      });

      return;

    }

    if (selected.size > 5 * 1024 * 1024) {

      present({
        message: "Maximum file size is 5MB.",
        duration: 2000,
        color: "danger",
      });

      return;

    }

    setFile(selected);

  };

  const uploadQuestions = async () => {

    if (!file) {

      present({
        message: "Please select a CSV file.",
        duration: 2000,
        color: "danger",
      });

      return;

    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const res = await questionApi.uploadBulkQuestions(
        examId,
        formData
      );

      setResult(res.data);

      present({
        message: "Upload completed.",
        duration: 2000,
        color: "success",
      });

    } catch (err: any) {

      present({
        message:
          err?.response?.data?.message ||
          "Upload failed.",
        duration: 3000,
        color: "danger",
      });

    } finally {

      setLoading(false);

    }

  };

  const downloadTemplate = async () => {

    try {
      setLoading(true);
      await questionApi.downloadTemplate();
      present({
        message: "Template downloaded successfully.",
        duration: 2000,
        color: "success",
      });
    } catch (err: any) {
      present({
        message:
          err?.response?.data?.message ||
          "Template download failed.",
        duration: 3000,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }

    // window.open(
    //   `${process.env.REACT_APP_API_URL}/questions/download-template`,
    //   "_blank"
    // );

  };

  return (

    <IonPage>

      <IonContent className="ion-padding">

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">

          <div className="flex justify-between items-center">

            <IonText className="text-xl font-bold">

              Bulk Question Upload

            </IonText>

            <IonButton
              fill="clear"
              onClick={() => history.goBack()}
            >
              <IonIcon icon={close} />
            </IonButton>

          </div>

          <IonButton
            expand="block"
            fill="outline"
            color="primary"
            onClick={downloadTemplate}
            className="mt-4"
          >
            <IonIcon
              slot="start"
              icon={downloadOutline}
            />
            <span className="ml-3">Download CSV Template</span>
          </IonButton>

          <IonCard className="mt-4">

            <IonCardContent>

              <p className="font-semibold">

                Upload Requirements

              </p>

              <ul className="list-disc ml-5 text-sm mt-2">

                <li>CSV files only</li>

                <li>Maximum size: 5MB</li>

                <li>Maximum 300 questions</li>

                <li>
                  Correct Answer must be A-Z
                </li>

              </ul>

            </IonCardContent>

          </IonCard>

          <div className="mt-6">

            <IonButton
              expand="block"
              fill="outline"
              size="small"
              color={"dark"}
              onClick={() => fileInputRef.current?.click()}
            >
              <IonIcon slot="start" icon={cloudUploadOutline} />
              <span className="ml-3">Choose CSV File</span>
            </IonButton>

<input
  ref={fileInputRef}
  type="file"
  accept=".csv"
  onChange={handleFileChange}
  style={{ display: "none" }}
/>

          </div>

          {file && (

            <div className="mt-4">

              <IonText>

                <IonIcon icon={documentOutline} />

                {" "}

                {file.name}

              </IonText>

              <br />

              <IonText color="medium">

                {(file.size / 1024).toFixed(2)} KB

              </IonText>

            </div>

          )}

          <IonButton
            expand="block"
            color="primary"
            className="mt-6"
            disabled={loading}
            onClick={uploadQuestions}
          >

            {loading ? (

              <>
              <IonSpinner />
              <span className="ml-3">Uploading...</span>
              </>

            ) : (

              <>
                <IonIcon
                  slot="start"
                  icon={cloudUploadOutline}
                />
<span className="ml-3">Upload Questions</span>
              </>

            )}

          </IonButton>

          {result && (

            <IonCard className="mt-6">

              <IonCardContent>

                <h3 className="font-bold">

                  Upload Result

                </h3>

                <p>

                  Imported:

                  {" "}

                  {result.imported}

                </p>

                <p>

                  Failed:

                  {" "}

                  {result.failed}

                </p>

                {result.errors?.length > 0 && (

                  <div className="mt-3">

                    {result.errors.map(
                      (err: any, index: number) => (

                        <p
                          key={index}
                          className="text-red-500 text-sm"
                        >

                          Row {err.row}: {err.error}

                        </p>

                      )
                    )}

                  </div>

                )}

              </IonCardContent>

            </IonCard>

          )}

        </div>

      </IonContent>

    </IonPage>

  );

};

export default UploadBulkQuestions;