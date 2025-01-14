import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

function ChooseTeams() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [allTeams, setAllTeams] = useState([]);
  const [participatingTeams, setParticipatingTeams] = useState([]);

  // ✅ Lade alle Teams & das Spiel
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsSnap = await getDocs(collection(db, 'teams'));
        const teamsData = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllTeams(teamsData);

        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);

        if (gameSnap.exists()) {
          setParticipatingTeams(gameSnap.data().participatingTeams || []);
        } else {
          alert('Game not found!');
          navigate('/set-game');
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, [gameId, navigate]);

  // ✅ Team hinzufügen/entfernen
  const toggleTeamParticipation = async (teamId) => {
    const isParticipating = participatingTeams.includes(teamId);
    const updatedTeams = isParticipating
      ? participatingTeams.filter(id => id !== teamId)
      : [...participatingTeams, teamId];

    setParticipatingTeams(updatedTeams);

    // 🔥 Update in Firestore
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        participatingTeams: updatedTeams,
      });
    } catch (error) {
      console.error('Error updating teams:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Choose Teams for the Game</h2>

      <div style={styles.columns}>
        {/* ✅ Alle Teams */}
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>All Teams</h3>
          {allTeams.filter(team => !participatingTeams.includes(team.id)).map(team => (
            <div
              key={team.id}
              style={{ ...styles.teamCard, backgroundColor: team.color }}
              onClick={() => toggleTeamParticipation(team.id)}
            >
              {team.name}
            </div>
          ))}
        </div>

        {/* ✅ Teilnehmende Teams */}
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Participating Teams</h3>
          {participatingTeams.map(teamId => {
            const team = allTeams.find(t => t.id === teamId);
            return team ? (
              <div
                key={team.id}
                style={{ ...styles.teamCard, backgroundColor: team.color }}
                onClick={() => toggleTeamParticipation(team.id)}
              >
                {team.name}
              </div>
            ) : null;
          })}
        </div>
      </div>

      <button style={styles.backButton} onClick={() => navigate('/set-game')}>
        ✔ Save & Back
      </button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D6F8D6',
    minHeight: '100vh',
    padding: '30px',
    fontFamily: "'Press Start 2P', cursive",
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    color: '#293F14',
    marginBottom: '20px',
  },
  columns: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
  column: {
    width: '40%',
    backgroundColor: '#7FC6A4',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #386C0B',
    boxShadow: '3px 3px #5D737E',
  },
  columnTitle: {
    fontSize: '18px',
    marginBottom: '10px',
  },
  teamCard: {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '2px solid #5D737E',
    boxShadow: '2px 2px #386C0B',
  },
  backButton: {
    marginTop: '20px',
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid #293F14',
  },
};

export default ChooseTeams;
