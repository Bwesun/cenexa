import {
  IonPage, IonHeader, IonContent, IonTitle, IonToolbar,
  IonInput, IonButton, IonItem, IonLabel, IonToast, IonLoading,
  IonButtons,
  IonIcon
} from '@ionic/react';
import { useState } from 'react';
import { resetPassword } from '../../../services/resetPasswordAuth';
import { useHistory, useLocation } from 'react-router-dom';
import { closeOutline } from 'ionicons/icons';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation<{ email?: string }>();
  const email = location.state?.email || '';

  const handleReset = async () => {
    if (!password || !confirm) return setToast({ show: true, message: 'Fill both fields' });
    if (password !== confirm) return setToast({ show: true, message: 'Passwords do not match' });

    setLoading(true);
    try {
      const res = await resetPassword(email, password);
      setLoading(false);
      setToast({ show: true, message: res.message || 'Password reset' });

      if (res.message && res.message.toLowerCase().includes('successful')) {
        setTimeout(() => history.push('/login'), 1200);
      }
    } catch (err) {
      setLoading(false);
      setToast({ show: true, message: 'Error resetting password' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className='bg-gradient-to-r ion-padding-horizontal'><IonTitle color={'light'}>Reset Password</IonTitle>
        <IonButtons slot="end">
                    <IonButton routerLink='/login'>
                      <IonIcon icon={closeOutline} color="light" slot="icon-only" />
                    </IonButton>
                  </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem lines='none' className='text-gray-600 mb-4 border-b border-gray-300'>
          <IonInput 
            type="password" 
            label='New Password'
            placeholder='Enter New Password'
            labelPlacement='floating'
            required
            color='primary'
            value={password} 
            onIonChange={e => setPassword(e.detail.value!)} />
        </IonItem>
        <IonItem lines='none' className='text-gray-600 border-b border-gray-300 mb-4'>
          <IonInput 
            type="password" 
            label='Confirm Password'
            placeholder='Confirm New Password'
            labelPlacement='floating'
            required
            color='primary'
            value={confirm} 
            onIonChange={e => setConfirm(e.detail.value!)} />
        </IonItem>

        <IonButton expand="block" onClick={handleReset}>Reset Password</IonButton>

        <IonLoading isOpen={loading} message={'Resetting password...'} />
        <IonToast
          isOpen={toast.show}
          message={toast.message}
          duration={2500}
          onDidDismiss={() => setToast({ show: false, message: '' })}
        />
      </IonContent>
    </IonPage>
  );
};

export default ResetPasswordPage;
