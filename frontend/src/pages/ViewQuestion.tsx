import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonInput,
  IonRadioGroup,
  IonRadio,
  useIonToast,
  useIonAlert,
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { close, arrowBack, pencil, trash, checkmark } from 'ionicons/icons';
import TopNav from '../components/TopNav';
import { useAuth } from '../contexts/AuthContext';
import { questionApi } from '../services/questionApi';
import { useHistory, useParams } from 'react-router-dom';

interface Option {
  text: string;
  isCorrect: boolean;
}

interface QuestionData {
  _id: string;
  exam: string;
  text: string;
  questionCode: string;
  options: Option[];
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface RouteParams {
  id: string;
}

const ViewQuestion: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<RouteParams>();
  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();
  const history = useHistory();

  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Edit form state – mirrors AddQuestion structure
  const [editForm, setEditForm] = useState({
    text: '',
    options: [] as Option[],
  });

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const response = await questionApi.getQuestion(id);
      setQuestion(response?.data);
      // Pre-populate edit form whenever data is (re)loaded
      setEditForm({
        text: response?.data?.text,
        options: response?.data?.options.map((o: Option) => ({ ...o })),
      });
    } catch (error: any) {
      console.error('Error fetching question:', error);
      present({
        message: error.message || 'Failed to fetch question',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Edit form helpers ────────────────────────────────────────────────────
  const handleEditTextChange = (value: string) => {
    setEditForm((prev) => ({ ...prev, text: value }));
  };

  const handleOptionTextChange = (index: number, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, text: value } : opt,
      ),
    }));
  };

  const handleCorrectOptionChange = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      })),
    }));
  };

  const handleAddOption = () => {
    setEditForm((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  // ─── Save edits ───────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editForm.text.trim()) {
      present({ message: 'Question cannot be empty', duration: 2000, position: 'bottom', color: 'danger' });
      return;
    }
    if (editForm.options.length < 2) {
      present({ message: 'Options must be at least 2', duration: 2000, position: 'bottom', color: 'danger' });
      return;
    }
    if (editForm.options.length > 5) {
      present({ message: 'Options cannot be more than 5', duration: 2000, position: 'bottom', color: 'danger' });
      return;
    }
    if (!editForm.options.every((o) => o.text.trim())) {
      present({ message: 'Each option must have text', duration: 2000, position: 'bottom', color: 'danger' });
      return;
    }
    if (!editForm.options.some((o) => o.isCorrect)) {
      present({ message: 'Please select the correct answer', duration: 2000, position: 'bottom', color: 'danger' });
      return;
    }

    setSaveLoading(true);
    try {
      await questionApi.updateQuestion(id, {
        text: editForm.text.trim(),
        options: editForm.options,
        exam: question?.exam ?? '',
      });
      present({ message: 'Question updated successfully!', duration: 2000, position: 'bottom', color: 'success' });
      setIsEditing(false);
      await fetchQuestion(); // refresh displayed data
    } catch (error: any) {
      console.error('Error updating question:', error);
      present({ message: error.message || 'Failed to update question', duration: 2000, position: 'bottom', color: 'danger' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form back to server data
    if (question) {
      setEditForm({
        text: question.text,
        options: question.options.map((o) => ({ ...o })),
      });
    }
    setIsEditing(false);
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = () => {
    presentAlert({
      header: 'Delete Question',
      message: 'Are you sure you want to delete this question? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await questionApi.deleteQuestion(id);
              present({ message: 'Question deleted successfully', duration: 2000, position: 'bottom', color: 'success' });
              history.goBack();
            } catch (error: any) {
              present({ message: error.message || 'Failed to delete question', duration: 2000, position: 'bottom', color: 'danger' });
            }
          },
        },
      ],
    });
  };

  // ─── Status colour helper ─────────────────────────────────────────────────
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-700';
      case 'pending':  return 'bg-yellow-500/10 text-yellow-700';
      case 'rejected': return 'bg-red-500/10 text-red-700';
      default:         return 'bg-blue-500/10 text-blue-700';
    }
  };

  const canEdit = user?.role === 'examiner' || user?.role === 'admin';

  return (
    <IonPage>
      <IonContent fullscreen>
        <TopNav />

        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
          {/* Back button */}
          <div className="mb-4">
            <IonButton fill="clear" color="primary" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} slot="start" />
              Back
            </IonButton>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <IonSpinner name="crescent" color="primary" />
            </div>
          )}

          {/* Question card */}
          {!loading && question && (
            <div className="rounded-2xl bg-white shadow-sm border border-(--ion-color-primary)/10 overflow-hidden">

              {/* ── Header ─────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-xs text-slate-400 shrink-0">
                    Code: {question.questionCode}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(question.status)}`}
                  >
                    {question.status}
                  </span>
                </div>

                {/* Action buttons – only for authorised roles */}
                {canEdit && !isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <IonButton
                      fill="outline"
                      shape="round"
                      size="small"
                      color="primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <IonIcon icon={pencil} slot="start" />
                      Edit
                    </IonButton>
                    <IonButton
                      fill="outline"
                      shape="round"
                      size="small"
                      color="danger"
                      onClick={handleDelete}
                    >
                      <IonIcon icon={trash} slot="start" />
                      Delete
                    </IonButton>
                  </div>
                )}
              </div>

              {/* ── View Mode ──────────────────────────────────────────── */}
              {!isEditing && (
                <div className="p-4 space-y-5">
                  {/* Question text */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Question</p>
                    <p className="text-base text-slate-900 font-medium leading-relaxed">
                      {question.text}
                    </p>
                  </div>

                  {/* Options */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Options</p>
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
                            option.isCorrect
                              ? 'border-emerald-400 bg-emerald-50'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          {/* Circle indicator */}
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                              option.isCorrect
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-300 text-slate-400'
                            }`}
                          >
                            {
                                option.isCorrect ? '✓' : ''
                                // String.fromCharCode(65 + index)
                            }
                          </span>
                          <span
                            className={`text-sm ${
                              option.isCorrect ? 'text-emerald-800 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            {option.text}
                          </span>
                          {option.isCorrect && (
                            <span className="ml-auto text-xs text-emerald-600 font-semibold shrink-0">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Edit Mode (mirrors AddQuestion) ────────────────────── */}
              {isEditing && (
                <div className="p-4 space-y-4">
                  <IonText color="primary" className="font-semibold text-base">
                    Edit Question
                  </IonText>

                  {/* Question text input */}
                  <IonInput
                    type="text"
                    label="Question"
                    labelPlacement="floating"
                    placeholder="Enter question"
                    value={editForm.text}
                    onIonChange={(e) => handleEditTextChange(e.detail.value ?? '')}
                    disabled={saveLoading}
                    className="text-sm"
                  />

                  {/* Options with radio group for correct answer */}
                  <div>
                    <p className="text-xs text-slate-500 mb-2">
                      Select the radio button next to the correct answer
                    </p>
                    <IonRadioGroup
                      value={editForm.options.findIndex((o) => o.isCorrect)}
                      onIonChange={(e) => handleCorrectOptionChange(e.detail.value)}
                    >
                      {editForm.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <IonRadio value={index} />
                          <IonInput
                            className="flex-1"
                            value={option.text}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            onIonChange={(e) =>
                              handleOptionTextChange(index, e.detail.value ?? '')
                            }
                            disabled={saveLoading}
                          />
                          {editForm.options.length > 1 && (
                            <IonButton
                              color="danger"
                              shape="round"
                              fill="solid"
                              size="small"
                              onClick={() => handleRemoveOption(index)}
                              disabled={saveLoading}
                            >
                              <IonIcon icon={close} />
                            </IonButton>
                          )}
                        </div>
                      ))}
                    </IonRadioGroup>

                    <IonButton
                      color="primary"
                      shape="round"
                      fill="outline"
                      size="small"
                      onClick={handleAddOption}
                      disabled={saveLoading || editForm.options.length >= 5}
                    >
                      Add Option
                    </IonButton>
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-2 pt-2">
                    <IonButton
                      expand="block"
                      shape="round"
                      color="primary"
                      onClick={handleSaveEdit}
                      disabled={saveLoading}
                    >
                      {saveLoading ? <IonSpinner name="crescent" /> : 'Save Changes'}
                    </IonButton>
                    <IonButton
                      expand="block"
                      shape="round"
                      fill="outline"
                      color="danger"
                      onClick={handleCancelEdit}
                      disabled={saveLoading}
                    >
                      Cancel
                    </IonButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && !question && (
            <div className="text-center py-16 text-slate-500">
              <p>Question not found</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ViewQuestion;