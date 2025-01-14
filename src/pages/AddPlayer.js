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
    PAC: '',
    SHO: '',
    PAS: '',
    DRI: '',
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
      <h1 style={styles.title}>🕹️ Create New Player</h1>

      <div style={styles.card}>
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

          {/* ✅ Retro FIFA Stats Section */}
          <div style={styles.statsContainer}>
            <input type="number" name="PAC" placeholder="PAC" value={newPlayer.PAC} onChange={handleChange} required style={styles.statInput} />
            <input type="number" name="SHO" placeholder="SHO" value={newPlayer.SHO} onChange={handleChange} required style={styles.statInput} />
            <input type="number" name="PAS" placeholder="PAS" value={newPlayer.PAS} onChange={handleChange} required style={styles.statInput} />
            <input type="number" name="DRI" placeholder="DRI" value={newPlayer.DRI} onChange={handleChange} required style={styles.statInput} />
          </div>

          <input
            type="password"
            name="pin"
            placeholder="Set a PIN (for edit/delete)"
            value={newPlayer.pin}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>⚽ Add Player</button>
        </form>
      </div>

      <button style={styles.backButton} onClick={() => navigate('/players-management')}>
        ⬅️ Back
      </button>
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

  title: {
    fontSize: '28px',
    color: '#293F14',
    marginBottom: '20px',
    textShadow: '3px 3px #7FC6A4',
  },

  card: {
    backgroundColor: '#7FC6A4',
    padding: '25px',
    width: '400px',
    borderRadius: '15px',
    border: '3px solid #386C0B',
    boxShadow: '6px 6px #293F14',
    textAlign: 'center',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #386C0B',
    textAlign: 'center',
    fontSize: '14px',
  },

  select: {
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #386C0B',
    fontSize: '14px',
  },

  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },

  statInput: {
    padding: '8px',
    borderRadius: '8px',
    border: '2px solid #293F14',
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '4px 4px #293F14',
  },

  backButton: {
    marginTop: '20px',
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '10px',
    border: '2px solid #293F14',
    cursor: 'pointer',
  },
};

export default AddPlayer;
