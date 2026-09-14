import React, { useState } from 'react';
import {
  IonPage,
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
  IonIcon,
  IonText,
  IonRadio,
  IonRadioGroup,
} from '@ionic/react';
import { close, options } from 'ionicons/icons';
import { questionApi } from '../../services/questionApi';
import { useHistory, useParams } from 'react-router-dom';

const AddQuestion: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [present] = useIonToast();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        text: '',
    options: [
        {
            text: '',
            isCorrect: false
        },
    ],
    // mark: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddOption = () => {
    setFormData((prev) => ({ ...prev, options: [...prev.options, { text: '', isCorrect: false }] }));
  };

const handleRemoveOption = (index: number) => {
    setFormData((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  };

  const handleOptionChange = (index: number, value: string) => {
  setFormData(prev => ({
    ...prev,
    options: prev.options.map((option, i) =>
      i === index
        ? { ...option, text: value }
        : option
    )
  }));
};

const handleCorrectOptionChange = (index: number) => {
  setFormData(prev => ({
    ...prev,
    options: prev.options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }))
  }));
};

  const validateForm = (): boolean => {
    if (!formData.text.trim()) {
      present({ message: 'Exam title is required', duration: 2000, position: 'bottom', color: 'danger' });
      return false;
    }
    if (!formData.options || formData.options.length <= 0) {
      present({ message: 'Options must be greater than 0', duration: 2000, position: 'bottom', color: 'danger' });
      return false;
    }
   
    // if (!formData.mark || parseInt(formData.mark) <= 0) {
    //   present({ message: 'Marks must be greater than 0', duration: 2000, position: 'bottom', color: 'danger' });
    //   return false;
    // }
    return true;
  };

  const handleSubmit = async () => {
    const correctOption = formData.options.find(option => option.isCorrect);

    if(!formData.text.trim()){
        present({ message: "Question cannot be empty", duration: 2000, position: "bottom", color: "danger" });
        return;
    }

    if(formData.options.length > 5){
        present({ message: "Options cannot be more than 5", duration: 2000, position: "bottom", color: "danger" });
        return;
    }

    if(formData.options.length < 2){
        present({ message: "Options must be at least 2", duration: 2000, position: "bottom", color: "danger" });
        return;
    }

    if (!correctOption) {
    present({ message: "Please select the correct answer", duration: 2000, position: "bottom", color: "danger" });
    return;
    }

    if (!formData.options.every(option => option.text.trim())) {
        present({ message: "Each option must have text", duration: 2000, position: "bottom", color: "danger" });
        return;
    }

    if (!correctOption?.text.trim()) {
    present({ message: "Correct option cannot be empty", duration: 2000, position: "bottom", color: "danger" });
    return;
    }

    if (!validateForm()) return;
    setLoading(true);
    try {
      const examPayload = {
        text: formData.text.trim(),
        options: formData.options,
        exam: id,
        // mark: parseInt(formData.mark),
      };
    //   console.log("Before API: ", examPayload)

      const res = await questionApi.addQuestion(examPayload);

      present({ message: 'Question created successfully!', duration: 2000, position: 'bottom', color: 'success' });
      history.push(`/view-exam/${id}`);
    } catch (error: any) {
      console.error('Error creating question:', error);
      present({ message: error.message || 'Failed to create exam', duration: 2000, position: 'bottom', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <div className="bg-white rounded-xl p-4 md:p-6 lg:p-8 w-full flex justify-center flex-col md:max-w-4xl md:mx-auto shadow-md">
            <div className="flex items-center justify-between w-full">
                <IonText color="primary" className='font-semibold text-lg md:text-xl'>Add Question</IonText>
                <IonButton color="primary" fill="clear" onClick={() => history.goBack()}>
                <IonIcon icon={close} />
                </IonButton>
            </div>
            <form className="space-y-4 mx-auto">
            <IonItem lines='none' className=''>
                <IonInput type="text"  className='text-xs md:text-base' label='Question' labelPlacement='floating' placeholder="Enter question" value={formData.text} onIonChange={(e) => handleInputChange('text', e.detail.value)} disabled={loading} />
            </IonItem>

            <IonRadioGroup
                className='text-xs md:text-base'
                value={formData.options.findIndex(option => option.isCorrect)}
                onIonChange={(e) => handleCorrectOptionChange(e.detail.value)}
                >
                {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs md:text-base">
                    <IonRadio value={index} />

                    <IonInput
                        className='my-1'
                        value={option.text}
                        onIonChange={(e) =>
                        handleOptionChange(index, e.detail.value ?? '')
                        }
                    />
                    {formData.options.length > 1 && (
                        <IonButton color="danger" shape='round' fill="solid" size='small' onClick={() => handleRemoveOption(index)} disabled={loading}> <IonIcon icon={close} /></IonButton>
                    )}
                </div>
                ))}
                <IonButton color="primary" shape='round' fill="outline" onClick={() => handleAddOption()} disabled={loading}>Add Option</IonButton>
                </IonRadioGroup>

            <div className="flex justify-between gap-2 pt-4">
                <IonButton expand="block" shape='round' color="primary" onClick={handleSubmit} disabled={loading}>{loading ? <IonSpinner name="crescent" /> : 'Create Question'}</IonButton>
                <IonButton expand="block" shape='round' fill="outline" color="danger" onClick={() => history.goBack()} disabled={loading}>Cancel</IonButton>
            </div>
            </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AddQuestion;
