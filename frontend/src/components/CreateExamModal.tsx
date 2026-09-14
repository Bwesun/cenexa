import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonDatetimeButton,
  IonDatetime,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { examApi } from '../services/examApi';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    numberOfQuestions: '',
    instructions: '',
    totalMark: '',
    passingMark: '',
    scheduleStart: new Date().toISOString(),
    scheduleEnd: new Date(Date.now() + 86400000).toISOString(), // Default to 1 day from now
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      present({
        message: 'Exam title is required',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      return false;
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      present({
        message: 'Duration must be greater than 0',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      return false;
    }

    if (!formData.numberOfQuestions || parseInt(formData.numberOfQuestions) <= 0) {
      present({
        message: 'Number of questions must be greater than 0',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      return false;
    }

    if (!formData.totalMark || parseInt(formData.totalMark) <= 0) {
      present({
        message: 'Total marks must be greater than 0',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      return false;
    }

    if (!formData.passingMark || parseInt(formData.passingMark) < 0) {
      present({
        message: 'Passing marks must be 0 or greater',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      return false;
    }

    if (parseInt(formData.passingMark) > parseInt(formData.totalMark)) {
      present({
        message: 'Passing marks cannot be greater than total marks',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      return false;
    }

    const startDate = new Date(formData.scheduleStart);
    const endDate = new Date(formData.scheduleEnd);

    if (startDate >= endDate) {
      present({
        message: 'Schedule start must be before schedule end',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const examPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: parseInt(formData.duration),
        numberOfQuestions: parseInt(formData.numberOfQuestions),
        instructions: formData.instructions.trim(),
        totalMark: parseInt(formData.totalMark),
        passingMark: parseInt(formData.passingMark),
        scheduleStart: new Date(formData.scheduleStart).toISOString(),
        scheduleEnd: new Date(formData.scheduleEnd).toISOString(),
      };

      await examApi.createExam(examPayload);

      present({
        message: 'Exam created successfully!',
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        duration: '',
        numberOfQuestions: '',
        instructions: '',
        totalMark: '',
        passingMark: '',
        scheduleStart: new Date().toISOString(),
        scheduleEnd: new Date(Date.now() + 86400000).toISOString(),
      });

      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating exam:', error);
      present({
        message: error.message || 'Failed to create exam',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="create-exam-modal">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Create New Exam</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <form className="space-y-4">
          {/* Title */}
          <IonItem>
            <IonLabel position="stacked" className="font-semibold">
              Exam Title <span className="text-red-500">*</span>
            </IonLabel>
            <IonInput
              type="text"
              placeholder="Enter exam title"
              value={formData.title}
              onIonChange={(e) => handleInputChange('title', e.detail.value)}
              disabled={loading}
            />
          </IonItem>

          {/* Description */}
          <IonItem>
            <IonLabel position="stacked" className="font-semibold">
              Description
            </IonLabel>
            <IonTextarea
              placeholder="Enter exam description (optional)"
              value={formData.description}
              onIonChange={(e) => handleInputChange('description', e.detail.value)}
              disabled={loading}
              rows={3}
            />
          </IonItem>

          {/* Duration */}
          <IonItem>
            <IonLabel position="stacked" className="font-semibold">
              Duration (minutes) <span className="text-red-500">*</span>
            </IonLabel>
            <IonInput
              type="number"
              placeholder="Enter duration in minutes"
              value={formData.duration}
              onIonChange={(e) => handleInputChange('duration', e.detail.value)}
              disabled={loading}
              min="1"
            />
          </IonItem>

          {/* Number of Questions */}
          <IonItem>
            <IonLabel position="stacked" className="font-semibold">
              Number of Questions <span className="text-red-500">*</span>
            </IonLabel>
            <IonInput
              type="number"
              placeholder="Enter number of questions"
              value={formData.numberOfQuestions}
              onIonChange={(e) => handleInputChange('numberOfQuestions', e.detail.value)}
              disabled={loading}
              min="1"
            />
          </IonItem>

          {/* Total Marks */}
          <IonItem>
            <IonLabel position="stacked" className="font-semibold">
              Total Marks <span className="text-red-500">*</span>
            </IonLabel>
            <IonInput
              type="number"
              placeholder="Enter total marks"
              value={formData.totalMark}
              onIonChange={(e) => handleInputChange('totalMark', e.detail.value)}
              disabled={loading}
              min="1"
            />
          </IonItem>

          {/* Passing Marks */}
          <IonItem>
            <IonLabel position="stacked" className="font-semibold">
              Passing Marks <span className="text-red-500">*</span>
            </IonLabel>
            <IonInput
              type="number"
              placeholder="Enter passing marks"
              value={formData.passingMark}
              onIonChange={(e) => handleInputChange('passingMark', e.detail.value)}
              disabled={loading}
              min="0"
            />
          </IonItem>

          {/* Instructions */}
          <IonItem>
            <IonLabel position="stacked" className="font-semibold">
              Instructions <span className="text-red-500">*</span>
            </IonLabel>
            <IonTextarea
              placeholder="Enter exam instructions"
              value={formData.instructions}
              onIonChange={(e) => handleInputChange('instructions', e.detail.value)}
              disabled={loading}
              rows={3}
            />
          </IonItem>

          {/* Schedule Start */}
          <IonItem>
            <IonLabel position="stacked" className="font-semibold">
              Schedule Start <span className="text-red-500">*</span>
            </IonLabel>
            <IonDatetimeButton datetime="scheduleStartDatetime"></IonDatetimeButton>
            <IonDatetime
              id="scheduleStartDatetime"
              value={formData.scheduleStart}
              onIonChange={(e) => handleInputChange('scheduleStart', e.detail.value)}
              disabled={loading}
              presentation="date-time"
            ></IonDatetime>
          </IonItem>

          {/* Schedule End */}
          <IonItem>
            <IonLabel position="stacked" className="font-semibold">
              Schedule End <span className="text-red-500">*</span>
            </IonLabel>
            <IonDatetimeButton datetime="scheduleEndDatetime"></IonDatetimeButton>
            <IonDatetime
              id="scheduleEndDatetime"
              value={formData.scheduleEnd}
              onIonChange={(e) => handleInputChange('scheduleEnd', e.detail.value)}
              disabled={loading}
              presentation="date-time"
            ></IonDatetime>
          </IonItem>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <IonButton
              expand="block"
              fill="clear"
              color="medium"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </IonButton>
            <IonButton
              expand="block"
              fill="solid"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Create Exam'}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonModal>
  );
};

export default CreateExamModal;
