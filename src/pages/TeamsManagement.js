import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function TeamsManagement() {
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsCollection = await getDocs(collection(db, 'teams'));
        const teamsData = teamsCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleEditTeam = (team) => {
    const userPin = prompt("Enter PIN to edit:");
    if (userPin === team.pin) {
      navigate(`/edit-team/${team.id}`);
    } else {
      alert("Incorrect PIN. Access denied.");
    }
  };

  const handleDeleteTeam = async (team) => {
    const userPin = prompt("Enter PIN to delete:");
    if (userPin === team.pin) {
      await deleteDoc(doc(db, 'teams', team.id));
      alert('Team deleted successfully!');
      setTeams(teams.filter(t => t.id !== team.id));
    } else {
      alert("Incorrect PIN. Cannot delete the team.");
    }
  };

  const handleViewLineup = (team) => {
    navigate(`/team-lineup/${team.id}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Teams Management</h1>

      <button style={styles.createButton} onClick={() => navigate('/create-team')}>
        Create New Team
      </button>

      {teams.length === 0 ? (
        <p style={styles.noTeams}>Create the first Team!</p>
      ) : (
        <div style={styles.teamList}>
          {teams.map(team => (
            <div key={team.id} style={{ ...styles.teamCard, backgroundColor: team.color }}>
              <h3>{team.name}</h3>
              <p><strong>Entrance Song:</strong> <a href={team.entranceSong} target="_blank" rel="noopener noreferrer">Listen</a></p>
              <img
                src={`/images/Tactics/${team.playerCount}_players_${team.tactic}.png`}
                alt="Tactic"
                style={styles.tacticImage}
              />
              <div style={styles.buttonGroup}>
                <button style={styles.editButton} onClick={() => handleEditTeam(team)}>Edit</button>
                <button style={styles.removeButton} onClick={() => handleDeleteTeam(team)}>Remove</button>
                <button style={styles.lineupButton} onClick={() => handleViewLineup(team)}>Lineup</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button style={styles.backButton} onClick={() => navigate('/')}>Back to Main Menu</button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D6F8D6',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    fontFamily: "'Press Start 2P', cursive",
  },
  title: {
    fontSize: '24px',
    color: '#293F14',
    textShadow: '2px 2px #7FC6A4',
    marginBottom: '30px',
  },
  createButton: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid #5D737E',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
  },
  noTeams: {
    fontSize: '16px',
    color: '#293F14',
    marginTop: '20px',
  },
  teamList: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    width: '80%',
  },
  teamCard: {
    width: '300px',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #5D737E',
    boxShadow: '3px 3px #386C0B',
    textAlign: 'center',
  },
  tacticImage: {
    width: '100%',
    height: 'auto',
    marginTop: '10px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  editButton: {
    backgroundColor: '#7FC6A4',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  removeButton: {
    backgroundColor: '#FF4D4D',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  lineupButton: {
    backgroundColor: '#5D737E',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  backButton: {
    marginTop: '30px',
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid #293F14',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default TeamsManagement;
