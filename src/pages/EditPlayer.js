import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, Timestamp, collection, getDocs } from 'firebase/firestore';

function EditPlayer() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [pinVerified, setPinVerified] = useState(false);

  // ✅ Fetch player and positions
  useEffect(() => {
    const fetchPlayer = async () => {
      const playerRef = doc(db, 'players', playerId);
      const playerSnap = await getDoc(playerRef);
      if (playerSnap.exists()) {
        setPlayerData(playerSnap.data());
      } else {
        alert('Player not found');
        navigate('/players-management');
      }
    };

    const fetchPositions = async () => {
      const positionsCollection = await getDocs(collection(db, 'positions'));
      const positionsData = positionsCollection.docs.map(doc => doc.data().shortcut);
      setPositions(positionsData);
    };

    fetchPlayer();
    fetchPositions();
  }, [playerId, navigate]);

  const verifyPin = () => {
    const userPin = prompt("Enter PIN to edit:");
    if (userPin === playerData.pin) {
      setPinVerified(true);
    } else {
      alert("Incorrect PIN. Access denied.");
      navigate('/players-management');
    }
  };

  const handleChange = (e) => {
    setPlayerData({ ...playerData, [e.target.name]: e.target.value });
  };

  const calculateAVG = () => {
    const { PAC, SHO, PAS, DRI } = playerData;
    const stats = [PAC, SHO, PAS, DRI].map(stat => parseInt(stat) || 0);
    return Math.round(stats.reduce((a, b) => a + b, 0) / stats.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        ...playerData,
        updatedAt: Timestamp.now(),
      });
      alert('Player updated successfully!');
      navigate('/players-management');
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Failed to update player.');
    }
  };

  if (!playerData) return <p>Loading...</p>;

  if (!pinVerified) {
    verifyPin();
    return null;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Edit Player: {playerData.firstName} {playerData.lastName}</h1>

      {/* ✅ FIFA Style Card */}
      <div style={styles.card}>
        <h2 style={styles.avg}>AVG {calculateAVG()}</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statBox}><strong>PAC</strong> {playerData.PAC}</div>
          <div style={styles.statBox}><strong>SHO</strong> {playerData.SHO}</div>
          <div style={styles.statBox}><strong>PAS</strong> {playerData.PAS}</div>
          <div style={styles.statBox}><strong>DRI</strong> {playerData.DRI}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" name="firstName" placeholder="First Name" value={playerData.firstName} onChange={handleChange} required style={styles.input} />
        <input type="text" name="lastName" placeholder="Last Name" value={playerData.lastName} onChange={handleChange} required style={styles.input} />
        <input type="text" name="nationality" placeholder="Nationality" value={playerData.nationality} onChange={handleChange} required style={styles.input} />

        <select name="favoritePosition" value={playerData.favoritePosition} onChange={handleChange} required style={styles.select}>
          <option value="">Select Position</option>
          {positions.map((pos, index) => (
            <option key={index} value={pos}>{pos}</option>
          ))}
        </select>

        {/* ✅ Editable Stats */}
        <input type="number" name="PAC" placeholder="PAC" value={playerData.PAC} onChange={handleChange} required style={styles.input} />
        <input type="number" name="SHO" placeholder="SHO" value={playerData.SHO} onChange={handleChange} required style={styles.input} />
        <input type="number" name="PAS" placeholder="PAS" value={playerData.PAS} onChange={handleChange} required style={styles.input} />
        <input type="number" name="DRI" placeholder="DRI" value={playerData.DRI} onChange={handleChange} required style={styles.input} />

        <button type="submit" style={styles.button}>Save Changes</button>
      </form>

      <button style={styles.backButton} onClick={() => navigate('/players-management')}>⬅️ Back</button>
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
  },

  card: {
    backgroundColor: '#7FC6A4',
    borderRadius: '15px',
    border: '3px solid #386C0B',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '4px 4px #293F14',
    textAlign: 'center',
    width: '300px',
  },

  avg: {
    fontSize: '24px',
    color: '#FFFFFF',
    backgroundColor: '#5D737E',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '2px 2px #293F14',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '10px',
  },

  statBox: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '8px',
    borderRadius: '8px',
    fontWeight: 'bold',
    boxShadow: '2px 2px #293F14',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '300px',
  },

  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #386C0B',
  },

  button: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  backButton: {
    marginTop: '20px',
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px',
    borderRadius: '8px',
  },
};

export default EditPlayer;
