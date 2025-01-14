import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function StartGamePage() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch games from Firestore
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesSnap = await getDocs(collection(db, 'games'));
        const gamesData = gamesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGames(gamesData);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
  }, []);

  // ✅ Handle Button Click
  const handleButtonClick = (game) => {
        console.log('Game Object:', game);

      if (!game.matchPlanCreated) {
        console.log('Navigating to Create Match Plan');
        navigate(`/create-match-plan/${game.id}`);
      } else {
        console.log('Navigating to Match Overview');
        navigate(`/match-overview/${game.id}`);
      }
    };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎮 Start Game</h1>

      {games.length === 0 ? (
        <p style={styles.noGamesText}>No games available. Create a game to start!</p>
      ) : (
        <div style={styles.gamesGrid}>
          {games.map(game => (
            <div key={game.id} style={styles.gameCard}>
              <h3 style={styles.gameTitle}>{game.location}</h3>
              <p><strong>Date:</strong> {game.date}</p>
              <p><strong>Time:</strong> {game.time}</p>

              <div style={styles.teamIcons}>
                {game.teams?.map((team, index) => (
                  <div
                    key={index}
                    style={{ ...styles.teamCircle, backgroundColor: team.color }}
                  >
                    {team.shortcut}
                  </div>
                ))}
              </div>

              <button
                style={!game.matchPlanCreated ? styles.createButton : styles.continueButton}
                onClick={() => handleButtonClick(game)}
              >
                {!game.matchPlanCreated ? '📝 Create Match Plan' : '▶️ Continue'}
              </button>
            </div>
          ))}
        </div>
      )}

      <button style={styles.backButton} onClick={() => navigate('/')}>
        ⬅️ Back to Main Menu
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
    fontSize: '32px',
    color: '#293F14',
    marginBottom: '30px',
    textShadow: '3px 3px #7FC6A4',
  },

  noGamesText: {
    fontSize: '16px',
    color: '#5D737E',
  },

  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },

  gameCard: {
    backgroundColor: '#7FC6A4',
    padding: '20px',
    borderRadius: '15px',
    border: '3px solid #386C0B',
    boxShadow: '5px 5px #293F14',
    width: '300px',
    textAlign: 'center',
  },

  gameTitle: {
    fontSize: '20px',
    color: '#293F14',
    marginBottom: '10px',
  },

  teamIcons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '10px',
  },

  teamCircle: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '2px 2px #293F14',
  },

  createButton: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    border: '2px solid #293F14',
    cursor: 'pointer',
    boxShadow: '3px 3px #293F14',
    transition: 'transform 0.2s ease',
  },

  continueButton: {
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    border: '2px solid #293F14',
    cursor: 'pointer',
    boxShadow: '3px 3px #293F14',
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
};

export default StartGamePage;
