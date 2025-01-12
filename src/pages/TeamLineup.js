import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

function TeamLineup() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [teamData, setTeamData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [lineup, setLineup] = useState([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

  // ✅ Fetch team and player data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamRef = doc(db, 'teams', teamId);
        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
          alert('Team not found');
          navigate('/teams-management');
          return;
        }

        const team = teamSnap.data();
        setTeamData(team);

        const savedLineup = team.players || [];
        const filledLineup = await Promise.all(
                               savedLineup.map(async (playerId) => {
                                 if (playerId) {
                                   const playerDoc = await getDoc(doc(db, 'players', playerId));
                                   return playerDoc.exists() ? { id: playerDoc.id, ...playerDoc.data() } : null;
                                 }
                                 return null;
                               })
                             );

        setLineup([
          ...filledLineup,
          ...Array(Math.max(0, (team.playerCount || 0) - filledLineup.length)).fill(null)
        ]);

        const playersSnap = await getDocs(collection(db, 'players'));
        const playersData = playersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlayers(playersData);

      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load data.');
        navigate('/teams-management');
      }
    };

    fetchData();
  }, [teamId, navigate]);

  // ✅ PIN Verification
  useEffect(() => {
    if (teamData && !pinVerified) {
      const userPin = prompt("Enter PIN to access the lineup:");
      if (userPin === null) {
        alert("PIN entry canceled.");
        navigate('/teams-management');
      } else if (userPin === teamData.pin) {
        setPinVerified(true);
      } else {
        alert("Incorrect PIN. Access denied.");
        navigate('/teams-management');
      }
    }
  }, [teamData, pinVerified, navigate]);

  // ✅ Open player selection overlay
  const handleSelectPlayer = (index) => {
    setSelectedSlotIndex(index);
    setShowPlayerSelection(true);
  };

  // ✅ Assign player to slot
  const assignPlayerToSlot = (player) => {
    const updatedLineup = [...lineup];
    updatedLineup[selectedSlotIndex] = player;
    setLineup(updatedLineup);
    setShowPlayerSelection(false);
  };

  // ✅ Save lineup to Firestore
const handleSaveLineup = async () => {
  try {
    // ✅ Replace undefined with null
    const selectedPlayers = lineup.map(player => player ? player.id : null);

    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      players: selectedPlayers,  // ✅ No undefined values
    });

    alert('Lineup saved successfully!');
  } catch (error) {
    console.error('Error saving lineup:', error);
    alert('Failed to save lineup.');
  }
};

  if (!teamData || !pinVerified) {
    return <p>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{teamData.name} - Lineup</h1>

      <img
        src={`${process.env.PUBLIC_URL}/images/Tactics/${teamData.playerCount}_players_${teamData.tactic}.png`}
        alt="Tactic"
        style={styles.tacticImage}
      />

      {/* ✅ Display all slots */}
      <div style={styles.lineupContainer}>
        {lineup.map((player, index) => (
          <div
            key={index}
            style={styles.slot}
            onClick={() => handleSelectPlayer(index)}
          >
{player ? (
  <>
    <p style={styles.playerName}>{player.lastName}, {player.firstName}</p>
    <p style={styles.playerPosition}>
        <span role="img" aria-label="Soccer Ball">⚽</span> {player.favoritePosition}
    </p>
    <p style={styles.playerPower}>
        <span role="img" aria-label="Fire">🔥</span> Power: {player.powerRating}
    </p>
  </>
) : (
  <p style={styles.emptySlot}>+ Slot {index + 1}</p>
)}

          </div>
        ))}
      </div>


      {/* ✅ Player selection overlay */}
{showPlayerSelection && (
  <div style={styles.overlay}>
    <div style={styles.playerSelectionContainer}>
      <h2 style={styles.title}>Select a Player</h2>

      <div style={styles.playerGrid}>
        {players.map((player) => (
          <div
            key={player.id}
            style={styles.playerCard}
            onClick={() => assignPlayerToSlot(player)}
          >
            <div style={styles.playerInfo}>
              <p style={styles.playerName}>{player.lastName}, {player.firstName}</p>
                <p style={styles.playerPosition}>
                  <span role="img" aria-label="Soccer Ball">⚽</span> {player.favoritePosition}
                </p>
                <p style={styles.playerPower}>
                  <span role="img" aria-label="Fire">🔥</span> Power: {player.powerRating}
                </p>
            </div>
          </div>
        ))}
      </div>

      <button style={styles.cancelButton} onClick={() => setShowPlayerSelection(false)}>
        ✖ Cancel
      </button>
    </div>
  </div>
)}

      <button style={styles.saveButton} onClick={handleSaveLineup}>
        Save Lineup
      </button>

      <button style={styles.backButton} onClick={() => navigate('/teams-management')}>
        Back to Teams Management
      </button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D6F8D6',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: "'Press Start 2P', cursive",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    marginBottom: '30px',
    color: '#293F14',
    textShadow: '3px 3px #7FC6A4',
    borderBottom: '3px solid #386C0B',
    paddingBottom: '10px',
    width: 'fit-content',
  },
  tacticImage: {
    width: '60%',
    height: 'auto',
    marginBottom: '40px',
    borderRadius: '15px',
    border: '3px solid #386C0B',
    boxShadow: '4px 4px #5D737E',
  },
  lineupContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '25px',
    width: '80%',
    justifyItems: 'center',
  },
  slot: {
    width: '140px',
    height: '180px',
    backgroundColor: '#7FC6A4',
    borderRadius: '15px',
    cursor: 'pointer',
    textAlign: 'center',
    padding: '10px',
    border: '3px solid #5D737E',
    boxShadow: '4px 4px #386C0B',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.2s',
  },
  slotHover: {
    transform: 'scale(1.05)',
  },
  playerName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#293F14',
    marginBottom: '5px',
  },
  playerPosition: {
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#386C0B',
    marginBottom: '5px',
  },
  playerPower: {
    fontSize: '12px',
    color: '#FFFFFF',
    backgroundColor: '#5D737E',
    padding: '4px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
  },
  emptySlot: {
    fontSize: '14px',
    color: '#293F14',
    fontWeight: 'bold',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  playerSelectionContainer: {
    backgroundColor: '#D6F8D6',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 0 25px rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    width: '85%',
    maxHeight: '85vh',
    overflowY: 'auto',
    border: '4px solid #293F14',
  },
  playerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '25px',
    justifyItems: 'center',
  },
  playerCard: {
    width: '140px',
    height: '200px',
    backgroundColor: '#7FC6A4',
    color: '#293F14',
    borderRadius: '15px',
    textAlign: 'center',
    padding: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '2px solid #5D737E',
    boxShadow: '4px 4px #386C0B',
  },
  playerCardHover: {
    transform: 'scale(1.05)',
  },
  playerInfo: {
    marginTop: '8px',
    fontSize: '12px',
  },
  saveButton: {
    backgroundColor: '#386C0B',
    padding: '12px 25px',
    color: '#FFF',
    marginTop: '30px',
    fontFamily: "'Press Start 2P', cursive",
    borderRadius: '10px',
    border: '3px solid #293F14',
    cursor: 'pointer',
    boxShadow: '3px 3px #5D737E',
    transition: 'transform 0.2s',
  },
  cancelButton: {
    marginTop: '30px',
    backgroundColor: '#C0392B',
    color: '#FFFFFF',
    padding: '12px 25px',
    borderRadius: '10px',
    fontFamily: "'Press Start 2P', cursive",
    border: '3px solid #293F14',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    boxShadow: '3px 3px #5D737E',
  },
  backButton: {
    marginTop: '20px',
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '12px 25px',
    borderRadius: '10px',
    fontFamily: "'Press Start 2P', cursive",
    border: '3px solid #293F14',
    cursor: 'pointer',
    boxShadow: '3px 3px #386C0B',
  },
};

export default TeamLineup;
