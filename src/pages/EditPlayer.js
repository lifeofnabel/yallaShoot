import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, Timestamp, collection, getDocs } from 'firebase/firestore';

function EditPlayer() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [pinVerified, setPinVerified] = useState(false);

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

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        ...playerData,
        updatedAt: Timestamp.now(),
        profilePicture: profilePicture ? profilePicture.name : playerData.profilePicture,
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
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={playerData.firstName}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={playerData.lastName}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="nationality"
          placeholder="Nationality"
          value={playerData.nationality}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <select
          name="favoritePosition"
          value={playerData.favoritePosition}
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
          value={playerData.powerRating}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input type="file" onChange={handleFileChange} style={styles.input} />

        <input
          type="password"
          name="pin"
          placeholder="Update PIN"
          value={playerData.pin}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>Update Player</button>
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

export default EditPlayer;
