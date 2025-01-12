import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function PlayersManagement() {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersCollection = await getDocs(collection(db, 'players'));
        const playersData = playersCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlayers(playersData);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
  }, []);

  const handleDeletePlayer = async (player) => {
    const userPin = prompt("Enter PIN to delete:");
    if (userPin === player.pin) {
      await deleteDoc(doc(db, 'players', player.id));
      alert('Player deleted successfully!');
      setPlayers(players.filter(p => p.id !== player.id));
    } else {
      alert("Incorrect PIN. Cannot delete the player.");
    }
  };

  const handleEditPlayer = (playerId) => {
    navigate(`/edit-player/${playerId}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Players Management</h1>

      <button style={styles.addButton} onClick={() => navigate('/add-player')}>
        Add New Player
      </button>

      <h2 style={styles.subTitle}>All Players</h2>
      <div style={styles.playerList}>
        {players.length > 0 ? (
          players.map(player => (
            <div key={player.id} style={styles.playerCard}>
              <p><strong>Name:</strong> {player.firstName} {player.lastName}</p>
              <p><strong>Nationality:</strong> {player.nationality}</p>
              <p><strong>Position:</strong> {player.favoritePosition}</p>
              <p><strong>Power Rating:</strong> {player.powerRating}</p>

              <div style={styles.buttonGroup}>
                <button style={styles.editButton} onClick={() => handleEditPlayer(player.id)}>Edit</button>
                <button style={styles.removeButton} onClick={() => handleDeletePlayer(player)}>Remove</button>
              </div>
            </div>
          ))
        ) : (
          <p>No players found.</p>
        )}
      </div>

      <button style={styles.backButton} onClick={() => navigate('/')}>Back to Main Menu</button>
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
  addButton: { backgroundColor: '#386C0B', color: '#FFF', padding: '10px', marginBottom: '20px' },
  subTitle: { fontSize: '18px', marginTop: '20px' },
  playerList: { display: 'flex', flexWrap: 'wrap', gap: '20px' },
  playerCard: { backgroundColor: '#7FC6A4', padding: '15px', borderRadius: '10px', width: '250px' },
  buttonGroup: { display: 'flex', justifyContent: 'space-between', marginTop: '10px' },
  editButton: { backgroundColor: '#7FC6A4', padding: '5px 10px' },
  removeButton: { backgroundColor: '#FF4D4D', padding: '5px 10px' },
  backButton: { marginTop: '30px', backgroundColor: '#5D737E', padding: '10px 20px' },
};

export default PlayersManagement;
