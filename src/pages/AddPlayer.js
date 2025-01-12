import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function AddPlayer() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);

  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    lastName: '',
    nationality: '',
    favoritePosition: '',
    powerRating: '',
    pin: '',
  });

  useEffect(() => {
    const fetchPositions = async () => {
      const positionsCollection = await getDocs(collection(db, 'positions'));
      const positionsData = positionsCollection.docs.map(doc => doc.data().shortcut);
      setPositions(positionsData);
    };

    fetchPositions();
  }, []);

  const handleChange = (e) => {
    setNewPlayer({ ...newPlayer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPlayer.pin.trim().length < 4) {
      alert("PIN must be at least 4 characters.");
      return;
    }

    try {
      await addDoc(collection(db, 'players'), {
        ...newPlayer,
        createdAt: Timestamp.now(),
      });
      alert('Player added successfully!');
      navigate('/players-management');
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Add New Player</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={newPlayer.firstName}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={newPlayer.lastName}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="nationality"
          placeholder="Nationality"
          value={newPlayer.nationality}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <select
          name="favoritePosition"
          value={newPlayer.favoritePosition}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="">Select Position</option>
          {positions.map((pos, index) => (
            <option key={index} value={pos}>{pos}</option>
          ))}
        </select>
        <input
          type="number"
          name="powerRating"
          placeholder="Power Rating"
          value={newPlayer.powerRating}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="pin"
          placeholder="Set a PIN (for edit/delete)"
          value={newPlayer.pin}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>Add Player</button>
      </form>
      <button style={styles.backButton} onClick={() => navigate('/players-management')}>Back</button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D6F8D6',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Press Start 2P', cursive",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: { fontSize: '24px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' },
  input: { padding: '10px', borderRadius: '5px' },
  select: { padding: '10px', borderRadius: '5px' },
  button: { backgroundColor: '#386C0B', color: '#FFF', padding: '10px' },
  backButton: { marginTop: '20px', backgroundColor: '#5D737E', padding: '10px' },
};

export default AddPlayer;
