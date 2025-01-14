import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

function CreateMatchPlanPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matchPlanCreated, setMatchPlanCreated] = useState(false);
  const [matchSettings, setMatchSettings] = useState({
    matchType: 'round-robin',
    matchDuration: 20,
    homeAndAway: false,
  });

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);
        if (gameSnap.exists()) {
          const game = gameSnap.data();
          setGameData(game);

          if (game.matchPlanCreated) {
            setMatchPlanCreated(true);
          }

          const teamsData = [];
          for (const teamId of game.participatingTeams) {
            const teamRef = doc(db, 'teams', teamId);
            const teamSnap = await getDoc(teamRef);
            if (teamSnap.exists()) {
              teamsData.push({ id: teamId, ...teamSnap.data() });
            }
          }
          setTeams(teamsData);
        } else {
          alert('Game not found.');
          navigate('/start-game');
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchGameData();
  }, [gameId, navigate]);

  const generateMatchPlan = async () => {
    if (teams.length < 2) {
      alert('At least two teams are required to generate a match plan.');
      return;
    }

    const matches = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          teamA: teams[i].id,
          teamB: teams[j].id,
          scoreA: 0,
          scoreB: 0,
          played: false,
        });

        if (matchSettings.homeAndAway) {
          matches.push({
            teamA: teams[j].id,
            teamB: teams[i].id,
            scoreA: 0,
            scoreB: 0,
            played: false,
          });
        }
      }
    }

    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        matchPlan: matches,
        matchPlanCreated: true,
      });
      alert('🔥 Match plan created successfully!');
      navigate(`/match-overview/${gameId}`);
    } catch (error) {
      console.error('Error creating match plan:', error);
      alert('Failed to create match plan.');
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMatchSettings({
      ...matchSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  if (!gameData) return <p style={styles.loadingText}>Loading... ⚙️</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎮 Match Plan for {gameData.location}</h1>

      <div style={styles.settingsBox}>
        <label style={styles.label}>🗓️ Match Type:</label>
        <select name="matchType" value={matchSettings.matchType} onChange={handleSettingsChange} style={styles.select}>
          <option value="round-robin">Round Robin</option>
          <option value="knockout">Knockout</option>
        </select>

        <label style={styles.label}>⏱️ Match Duration (minutes):</label>
        <input
          type="number"
          name="matchDuration"
          value={matchSettings.matchDuration}
          onChange={handleSettingsChange}
          min="5"
          max="90"
          style={styles.input}
        />

        <label style={styles.label}>
          <input
            type="checkbox"
            name="homeAndAway"
            checked={matchSettings.homeAndAway}
            onChange={handleSettingsChange}
            style={styles.checkbox}
          />
          🔄 Home and Away Matches
        </label>

        {!matchPlanCreated ? (
          <button style={styles.generateButton} onClick={generateMatchPlan}>🚀 Generate Match Plan</button>
        ) : (
          <p style={styles.noticeText}>⚠️ Match plan already created.</p>
        )}
      </div>

      <button style={styles.backButton} onClick={() => navigate('/start-game')}>⬅️ Back</button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D6F8D6',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Press Start 2P', cursive",
    color: '#293F14',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    color: '#293F14',
    textShadow: '3px 3px #7FC6A4',
    marginBottom: '20px',
    padding: '0 10px',
    lineHeight: '1.5',
  },
  settingsBox: {
    backgroundColor: '#7FC6A4',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '4px 4px #386C0B',
    border: '3px solid #386C0B',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    color: '#293F14',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #386C0B',
    backgroundColor: '#D6F8D6',
    color: '#293F14',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #386C0B',
    backgroundColor: '#D6F8D6',
    color: '#293F14',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '15px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  checkbox: {
    marginRight: '10px',
    transform: 'scale(1.3)',
  },
  generateButton: {
    width: '100%',
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '12px 0',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    border: '2px solid #293F14',
    boxShadow: '3px 3px #293F14',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease-in-out',
  },
  generateButtonHover: {
    backgroundColor: '#293F14',
    transform: 'translateY(-2px)',
  },
  noticeText: {
    fontSize: '14px',
    color: '#C0392B',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  backButtonContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '30px',
  },
  backButton: {
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px 25px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '2px solid #293F14',
    boxShadow: '3px 3px #293F14',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  loadingText: {
    fontSize: '18px',
    color: '#5D737E',
    fontWeight: 'bold',
  },
};

export default CreateMatchPlanPage;
