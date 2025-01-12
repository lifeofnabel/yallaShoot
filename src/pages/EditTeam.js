import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

function EditTeam() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      if (teamSnap.exists()) {
        setTeamData(teamSnap.data());
      } else {
        alert('Team not found');
        navigate('/teams-management');
      }
    };

    fetchTeamData();
  }, [teamId, navigate]);

  const handleChange = (e) => {
    setTeamData({ ...teamData, [e.target.name]: e.target.value });
  };

  const handleTacticSelect = (tactic) => {
    setTeamData({ ...teamData, tactic });
  };

  const handlePlayerCountChange = (e) => {
    setTeamData({ ...teamData, playerCount: parseInt(e.target.value), tactic: 1 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        ...teamData,
        updatedAt: Timestamp.now(),
      });
      alert('Team updated successfully!');
      navigate('/teams-management');
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team.');
    }
  };

  const verifyPin = () => {
    const userPin = prompt("Enter PIN to edit:");
    if (userPin === teamData.pin) {
      setPinVerified(true);
    } else {
      alert("Incorrect PIN. Access denied.");
      navigate('/teams-management');
    }
  };

  const renderTacticImages = () => {
    return [1, 2, 3].map((num) => (
      <img
        key={num}
        src={`${process.env.PUBLIC_URL}/images/Tactics/${teamData.playerCount}_players_${num}.png`}
        alt={`Tactic ${num}`}
        style={{
          ...styles.tacticImage,
          border: teamData.tactic === num ? '3px solid #386C0B' : '2px solid #5D737E',
        }}
        onClick={() => handleTacticSelect(num)}
      />
    ));
  };

  if (!teamData) return <p>Loading...</p>;

  if (!pinVerified) {
    verifyPin();
    return null;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Edit Team: {teamData.name}</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Team Name</label>
        <input
          type="text"
          name="name"
          value={teamData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label style={styles.label}>Team Color</label>
        <input
          type="color"
          name="color"
          value={teamData.color}
          onChange={handleChange}
          style={styles.colorInput}
        />

        <label style={styles.label}>Number of Players</label>
        <select
          name="playerCount"
          value={teamData.playerCount}
          onChange={handlePlayerCountChange}
          style={styles.select}
        >
          <option value={4}>4 Players</option>
          <option value={5}>5 Players</option>
          <option value={6}>6 Players</option>
        </select>

        <label style={styles.label}>Select Tactic</label>
        <div style={styles.tacticContainer}>{renderTacticImages()}</div>

        <label style={styles.label}>Entrance Song (YouTube Link)</label>
        <input
          type="url"
          name="entranceSong"
          placeholder="Paste YouTube link"
          value={teamData.entranceSong}
          onChange={handleChange}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>Update Team</button>
      </form>
      <button style={styles.backButton} onClick={() => navigate('/teams-management')}>Back</button>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '300px',
  },
  label: {
    fontSize: '14px',
    color: '#293F14',
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #7FC6A4',
    fontSize: '14px',
    textAlign: 'center',
  },
  select: {
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #7FC6A4',
  },
  colorInput: {
    width: '100%',
    height: '40px',
    borderRadius: '8px',
  },
  tacticContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  tacticImage: {
    width: '80px',
    height: '80px',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  button: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid #5D737E',
    cursor: 'pointer',
    fontSize: '14px',
  },
  backButton: {
    marginTop: '20px',
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid #293F14',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default EditTeam;
