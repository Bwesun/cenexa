import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonPage, IonText, IonSpinner, useIonToast, useIonViewDidEnter, useIonAlert, IonDatetime, IonDatetimeButton, IonItem, IonLabel, IonTextarea, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/react'
import React, { useMemo, useState, useEffect } from 'react'
import { PlayCircle, Filter, ArrowRightIcon, CheckCircle2Icon, ShieldCheckIcon, TrendingUpIcon, Edit, Eye, Trash, Trash2 } from 'lucide-react'
import TopNav from '../../components/TopNav';
import { add, chevronForward, play, search, pencil, close } from 'ionicons/icons';
import Logo from '../assets/ralogo.png';
import { useAuth } from '../../contexts/AuthContext';
import { examApi } from '../../services/examApi';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';

interface RouteParams {
  id: string;
}

const EditExam: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<RouteParams>();
  const examId = id || '';
  const [exam, setExam] = useState<any>();
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [formData, setFormData] = useState({
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

  // Fetch exams on component mount
  useEffect(() => {
    fetchExam();
  }, [id]);

//   Get Exam Details Function
const fetchExam = async () => {
    try{
        setLoading(true);

        const response = await examApi.getExamById(examId);

        if(response.success){
            setExam(response.data);

            setFormData({
              title: response.data.title,
              description: response.data.description,
              duration: response.data.duration.toString(),
              numberOfQuestions: response.data.numberOfQuestions.toString(),
              instructions: response.data.instructions,
              totalMark: response.data.totalMark.toString(),
              passingMark: response.data.passingMark.toString(),
              scheduleStart: response.data.scheduleStart,
              scheduleEnd: response.data.scheduleEnd,
            });
        }
    }catch (error: any) {
      console.error('Error fetching exam:', error);
      present({ message: error.message || 'Failed to fetch exam', duration: 2000, position: 'bottom', color: 'danger' });
    } finally {
      setLoading(false);
    }
}

    // Update Form field Change
    const handleInputChange = (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };
  
    // Validate form
    const validateForm = (): boolean => {
      if (!formData.title.trim()) {
        present({ message: 'Exam title is required', duration: 2000, position: 'bottom', color: 'danger' });
        return false;
      }
      if (!formData.duration || parseInt(formData.duration) <= 0) {
        present({ message: 'Duration must be greater than 0', duration: 2000, position: 'bottom', color: 'danger' });
        return false;
      }
      if (!formData.numberOfQuestions || parseInt(formData.numberOfQuestions) <= 0) {
        present({ message: 'Number of questions must be greater than 0', duration: 2000, position: 'bottom', color: 'danger' });
        return false;
      }
      if (!formData.totalMark || parseInt(formData.totalMark) <= 0) {
        present({ message: 'Total marks must be greater than 0', duration: 2000, position: 'bottom', color: 'danger' });
        return false;
      }
      if (!formData.passingMark || parseInt(formData.passingMark) < 0) {
        present({ message: 'Passing marks must be 0 or greater', duration: 2000, position: 'bottom', color: 'danger' });
        return false;
      }
      if (parseInt(formData.passingMark) > parseInt(formData.totalMark)) {
        present({ message: 'Passing marks cannot be greater than total marks', duration: 2000, position: 'bottom', color: 'danger' });
        return false;
      }
      const startDate = new Date(formData.scheduleStart);
      const endDate = new Date(formData.scheduleEnd);
      if (startDate >= endDate) {
        present({ message: 'Schedule start must be before schedule end', duration: 2000, position: 'bottom', color: 'danger' });
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
  
        await examApi.updateExam(examId, examPayload);
  
        present({ message: 'Exam updated successfully!', duration: 2000, position: 'bottom', color: 'success' });
        history.push('/exams');
      } catch (error: any) {
        console.error('Error updating exam:', error);
        present({ message: error.message || 'Failed to update exam', duration: 2000, position: 'bottom', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };


  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-700';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700';
      case 'rejected':
        return 'bg-slate-500/10 text-slate-700';
      default:
        return 'bg-blue-500/10 text-blue-700';
    }
  };

  return (
    <IonPage>
        <IonHeader>
                <IonToolbar color="primary" className='ion-padding-start'>
                  <IonTitle>Edit Exam - {exam?.examCode}</IonTitle>
                  <IonButtons slot="end">
                    <IonButton onClick={() => history.push('/exams')}>
                      <IonIcon icon={close} />
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
      <IonContent fullscreen className='ion-padding'>

        <div className="p-4 sm:p-6 lg:p-8 bg-white">
          <form className="space-y-4 max-w-2xl mx-auto">
                      <IonItem lines='none'>
                                  <IonLabel position="stacked" className="font-semibold">Exam Title <span className="text-red-500">*</span></IonLabel>
                                  <span className='mb-3'></span>
                                  <IonInput type="text" placeholder="Enter exam title" value={formData.title} onIonChange={(e) => handleInputChange('title', e.detail.value)} disabled={loading} />
                                </IonItem>
                      
                                <IonItem lines='none'>
                                  <IonLabel position="stacked" className="font-semibold">Description</IonLabel>
                                  <span className='mb-3'></span>
                                  <IonTextarea placeholder="Enter exam description (optional)" value={formData.description} onIonChange={(e) => handleInputChange('description', e.detail.value)} disabled={loading} rows={3} />
                                </IonItem>
                      
                                <IonItem lines='none'>
                                  <IonLabel position="stacked" className="font-semibold">Duration (minutes) <span className="text-red-500">*</span></IonLabel>
                                  <span className='mb-3'></span>
                                  <IonInput type="number" placeholder="Enter duration in minutes" value={formData.duration} onIonChange={(e) => handleInputChange('duration', e.detail.value)} disabled={loading} min="1" />
                                </IonItem>
                      
                                <IonItem lines='none'>
                                  <IonLabel position="stacked" className="font-semibold">Number of Questions <span className="text-red-500">*</span></IonLabel>
                                  <span className='mb-3'></span>
                                  <IonInput type="number" placeholder="Enter number of questions" value={formData.numberOfQuestions} onIonChange={(e) => handleInputChange('numberOfQuestions', e.detail.value)} disabled={loading} min="1" />
                                </IonItem>
                      
                                <IonItem lines='none'>
                                  <IonLabel position="stacked" className="font-semibold">Total Marks <span className="text-red-500">*</span></IonLabel>
                                  <span className='mb-3'></span>
                                  <IonInput type="number" placeholder="Enter total marks" value={formData.totalMark} onIonChange={(e) => handleInputChange('totalMark', e.detail.value)} disabled={loading} min="1" />
                                </IonItem>
                      
                                <IonItem lines='none'>
                                  <IonLabel position="stacked" className="font-semibold">Passing Marks <span className="text-red-500">*</span></IonLabel>
                                  <span className='mb-3'></span>
                                  <IonInput type="number" placeholder="Enter passing marks" value={formData.passingMark} onIonChange={(e) => handleInputChange('passingMark', e.detail.value)} disabled={loading} min="0" />
                                </IonItem>
                      
                                <IonItem lines='none'>
                                  <IonLabel position="stacked" className="font-semibold">Instructions <span className="text-red-500">*</span></IonLabel>
                                  <span className='mb-3'></span>
                                  <IonTextarea placeholder="Enter exam instructions" value={formData.instructions} onIonChange={(e) => handleInputChange('instructions', e.detail.value)} disabled={loading} rows={3} />
                                </IonItem>
                      
                                <IonItem lines='none'>
                                  <IonLabel position="stacked" className="font-semibold">Schedule Start <span className="text-red-500">*</span></IonLabel>
                                  <span className='mb-3'></span>
                                  <IonDatetimeButton datetime="scheduleStartDatetime"></IonDatetimeButton>
                                  <IonDatetime id="scheduleStartDatetime" value={formData.scheduleStart} onIonChange={(e) => handleInputChange('scheduleStart', e.detail.value)} disabled={loading} presentation="date-time"></IonDatetime>
                                </IonItem>
                      
                                <IonItem lines='none'>
                                  <IonLabel position="stacked" className="font-semibold">Schedule End <span className="text-red-500">*</span></IonLabel>
                                  <span className='mb-3'></span>
                                  <IonDatetimeButton datetime="scheduleEndDatetime"></IonDatetimeButton>
                                  <IonDatetime id="scheduleEndDatetime" value={formData.scheduleEnd} onIonChange={(e) => handleInputChange('scheduleEnd', e.detail.value)} disabled={loading} presentation="date-time"></IonDatetime>
                                </IonItem>
          
                    <div className="flex gap-2 pt-4">
                        <IonButton expand="block" fill="solid" color="primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? <IonSpinner name="crescent" /> : 'Save Changes'}
                        </IonButton>
                    </div>
                  </form>
        </div>

        
      </IonContent>
    </IonPage>
  );
};

export default EditExam;