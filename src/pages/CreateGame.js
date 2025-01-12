import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function CreateGame() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    location: '',
    date: '',
    time: '',
    eventLength: '',
    whatsappLink: '',
    pin: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel?')) {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'games'), {
        ...formData,
        createdAt: Timestamp.now()
      });
      alert('Game created and saved to Firestore!');
      navigate('/');
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Failed to create the game.');
    }
  };

  const steps = [
    { label: 'Location', placeholder: 'Enter game location', name: 'location', type: 'text' },
    { label: 'Date', placeholder: '', name: 'date', type: 'date' },
    { label: 'Time', placeholder: '', name: 'time', type: 'time' },
    { label: 'Event Length (minutes)', placeholder: 'Enter event duration', name: 'eventLength', type: 'number' },
    { label: 'WhatsApp Link', placeholder: 'Paste the WhatsApp group link', name: 'whatsappLink', type: 'url' },
    { label: 'PIN', placeholder: 'Enter a PIN', name: 'pin', type: 'password' },
  ];

  const currentStep = steps[step - 1];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Game</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>{currentStep.label}</label>
        <input
          type={currentStep.type}
          name={currentStep.name}
          placeholder={currentStep.placeholder}
          value={formData[currentStep.name]}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <div style={styles.buttonGroup}>
          {step > 1 && (
            <button type="button" onClick={prevStep} style={styles.button}>
              Back
            </button>
          )}
          {step < steps.length ? (
            <button type="button" onClick={nextStep} style={styles.button}>
              Next
            </button>
          ) : (
            <button type="submit" style={styles.button}>
              Create Game
            </button>
          )}
          <button type="button" onClick={handleCancel} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>

      <p style={styles.stepIndicator}>Step {step} of {steps.length}</p>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D6F8D6',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Press Start 2P', cursive",
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    color: '#293F14',
    marginBottom: '30px',
    textShadow: '2px 2px #7FC6A4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  label: {
    fontSize: '16px',
    color: '#293F14',
  },
  input: {
    padding: '10px',
    width: '250px',
    borderRadius: '8px',
    border: '2px solid #7FC6A4',
    fontSize: '14px',
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid #5D737E',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '2px 2px #7FC6A4',
  },
  cancelButton: {
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid #293F14',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '2px 2px #7FC6A4',
  },
  stepIndicator: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#5D737E',
  },
};

export default CreateGame;
