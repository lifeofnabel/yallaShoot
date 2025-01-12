import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, collection, getDocs, deleteDoc } from 'firebase/firestore';

function SetGame() {
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch games and teams from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const gamesSnap = await getDocs(collection(db, 'games'));
        const gamesData = gamesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGames(gamesData);

        const teamsSnap = await getDocs(collection(db, 'teams'));
        const teamsData = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // ✅ Delete game (PIN protected)
  const handleDeleteGame = async (gameId) => {
    const pin = prompt("Enter PIN to delete this game:");
    if (pin) {
      try {
        await deleteDoc(doc(db, 'games', gameId));
        setGames(games.filter(game => game.id !== gameId));
        alert('Game deleted successfully!');
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  // ✅ Navigate to choose teams
  const handleChooseTeams = (gameId) => {
    navigate(`/choose-teams/${gameId}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Manage Fixtures</h1>

      {games.length === 0 ? (
        <p style={styles.noGamesText}>No games created. Click "Create Game" to get started!</p>
      ) : (
        <div style={styles.gamesGrid}>
          {games.map(game => (
            <div key={game.id} style={styles.gameCard}>
              <h3 style={styles.gameTitle}>{game.location}</h3>
              <p><strong>Date:</strong> {game.date}</p>
              <p><strong>Time:</strong> {game.time}</p>
              <p><strong>Length:</strong> {game.eventLength} mins</p>

              {/* ✅ Participating Teams */}
              <div style={styles.teamIcons}>
                {game.participatingTeams?.map(teamId => {
                  const team = teams.find(t => t.id === teamId);
                  return team ? (
                    <div
                      key={team.id}
                      style={{
                        ...styles.teamCircle,
                        backgroundColor: team.color,
                      }}
                    >
                      {team.name.substring(0, 10)}
                    </div>
                  ) : null;
                })}
              </div>

              {/* ✅ Action Buttons */}
              <div style={styles.buttonGroup}>
                <button style={styles.chooseTeamButton} onClick={() => handleChooseTeams(game.id)}>
                  Choose Teams
                </button>
                <button style={styles.removeButton} onClick={() => handleDeleteGame(game.id)}>
                  Remove Game
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button style={styles.backButton} onClick={() => navigate('/')}>
        Back to Main Menu
      </button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D6F8D6',
    padding: '20px',
    minHeight: '100vh',
    fontFamily: "'Press Start 2P', cursive",
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#293F14',
  },
  noGamesText: {
    fontSize: '16px',
    color: '#5D737E',
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  gameCard: {
    backgroundColor: '#7FC6A4',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #386C0B',
    boxShadow: '3px 3px #5D737E',
  },
  gameTitle: {
    fontSize: '18px',
    color: '#293F14',
    marginBottom: '10px',
  },
  teamIcons: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
    justifyContent: 'center',
  },
  teamCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    color: '#FFF',
    fontSize: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '5px',
    boxShadow: '2px 2px #293F14',
  },
  buttonGroup: {
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'space-around',
  },
  chooseTeamButton: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  removeButton: {
    backgroundColor: '#C0392B',
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  backButton: {
    marginTop: '20px',
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default SetGame;
