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

              {/* ✅ Add the WhatsApp Link Here */}
                {game.whatsappLink ? (
                  <a
                    href={game.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.whatsappLink}
                  >
                    <img
                      src="/images/whatsapp-icon.png"
                      alt="Join WhatsApp Group"
                      style={styles.whatsappIcon}
                    />
                    Join Game Chat
                  </a>
                ) : (
                  <p style={{ color: '#C0392B', marginTop: '10px' }}>No WhatsApp Group</p>
                )}

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
                      {team.shortcut}
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
    backgroundColor: '#D6F8D6',  // ✅ Nyanza background
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    fontFamily: "'Press Start 2P', cursive",  // ✅ Retro font
  },

  title: {
    fontSize: '32px',
    color: '#293F14',  // ✅ Pakistan Green
    textShadow: '4px 4px #7FC6A4',  // ✅ Cambridge Blue shadow
    marginBottom: '40px',
    textAlign: 'center',
  },

  noGamesText: {
    fontSize: '16px',
    color: '#5D737E',  // ✅ Payne's Gray
    marginTop: '20px',
  },

  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    justifyItems: 'center',
    width: '100%',
    maxWidth: '1200px',
  },

  gameCard: {
    backgroundColor: '#7FC6A4',  // ✅ Cambridge Blue
    padding: '20px',
    width: '280px',
    borderRadius: '15px',
    border: '3px solid #5D737E',  // ✅ Payne's Gray border
    boxShadow: '8px 8px 0px #293F14',  // ✅ Pakistan Green shadow
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  },

  gameTitle: {
    fontSize: '20px',
    color: '#293F14',
    marginBottom: '15px',
    textAlign: 'center',
  },

  teamIcons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    justifyContent: 'center',
  },

  teamCircle: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#386C0B',  // ✅ Office Green
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '3px 3px #293F14',  // ✅ Pakistan Green shadow
  },

  buttonGroup: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },

  chooseTeamButton: {
    backgroundColor: '#386C0B',  // ✅ Office Green
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '12px',
    textTransform: 'uppercase',
    border: '2px solid #293F14',
    cursor: 'pointer',
    boxShadow: '4px 4px 0px #293F14',
    transition: 'all 0.2s ease',
  },

  removeButton: {
    backgroundColor: '#C0392B',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '12px',
    textTransform: 'uppercase',
    border: '2px solid #293F14',
    cursor: 'pointer',
    boxShadow: '4px 4px 0px #293F14',
    transition: 'all 0.2s ease',
  },

  backButton: {
    marginTop: '30px',
    backgroundColor: '#5D737E',  // ✅ Payne's Gray
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    border: '2px solid #293F14',
    cursor: 'pointer',
    boxShadow: '4px 4px 0px #293F14',
  },

  whatsappLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '15px',
    padding: '10px 20px',
    textDecoration: 'none',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: '12px',
    backgroundColor: '#25D366',
    borderRadius: '8px',
    boxShadow: '4px 4px 0px #293F14',
    border: '2px solid #293F14',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  whatsappIcon: {
    width: '20px',
    height: '20px',
  },
};

export default SetGame;
