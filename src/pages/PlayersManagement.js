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

  const calculateAVG = (player) => {
    const { PAC, SHO, PAS, DRI } = player;
    const stats = [PAC, SHO, PAS, DRI].map(stat => parseInt(stat) || 0);
    const avg = Math.round(stats.reduce((a, b) => a + b, 0) / stats.length);
    return avg;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Players Management</h1>

      <button style={styles.addButton} onClick={() => navigate('/add-player')}>
        ➕ Add New Player
      </button>

      <h2 style={styles.subTitle}>All Players</h2>
      <div style={styles.playerList}>
        {players.length > 0 ? (
          players.map(player => (
            <div key={player.id} style={styles.playerCard}>
              <div style={styles.playerHeader}>
                <h3 style={styles.playerName}>{player.firstName} {player.lastName}</h3>
                <p style={styles.playerPosition}>{player.favoritePosition}</p>
              </div>

              <div style={styles.statsContainer}>
                <div style={styles.statBox}><strong>PAC</strong> {player.PAC}</div>
                <div style={styles.statBox}><strong>SHO</strong> {player.SHO}</div>
                <div style={styles.statBox}><strong>PAS</strong> {player.PAS}</div>
                <div style={styles.statBox}><strong>DRI</strong> {player.DRI}</div>
                <div style={styles.avgBox}><strong>AVG</strong> {calculateAVG(player)}</div>
              </div>

              <div style={styles.buttonGroup}>
                <button style={styles.editButton} onClick={() => handleEditPlayer(player.id)}>✏️ Edit</button>
                <button style={styles.removeButton} onClick={() => handleDeletePlayer(player)}>🗑️ Remove</button>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.noPlayersText}>No players found.</p>
        )}
      </div>

      <button style={styles.backButton} onClick={() => navigate('/')}>⬅️ Back to Main Menu</button>
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
    fontSize: '32px',
    color: '#293F14',
    marginBottom: '20px',
    textShadow: '2px 2px #7FC6A4',
  },

  addButton: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '12px 20px',
    fontWeight: 'bold',
    borderRadius: '10px',
    border: '2px solid #293F14',
    boxShadow: '3px 3px #5D737E',
    cursor: 'pointer',
  },

  subTitle: {
    fontSize: '20px',
    marginTop: '30px',
    color: '#293F14',
  },

  playerList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
    marginTop: '20px',
  },

  playerCard: {
    backgroundColor: '#7FC6A4',
    padding: '20px',
    borderRadius: '15px',
    border: '3px solid #386C0B',
    boxShadow: '4px 4px #293F14',
    width: '250px',
    textAlign: 'center',
  },

  playerHeader: {
    marginBottom: '15px',
  },

  playerName: {
    fontSize: '18px',
    color: '#293F14',
  },

  playerPosition: {
    fontSize: '14px',
    color: '#5D737E',
    marginTop: '-5px',
  },

  statsContainer: {
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

  avgBox: {
    gridColumn: 'span 2',
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    boxShadow: '2px 2px #293F14',
  },

  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
  },

  editButton: {
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  removeButton: {
    backgroundColor: '#C0392B',
    color: '#FFFFFF',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  backButton: {
    marginTop: '30px',
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '10px',
    border: '2px solid #293F14',
    cursor: 'pointer',
  },

  noPlayersText: {
    fontSize: '16px',
    color: '#5D737E',
  },
};

export default PlayersManagement;
