import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function CreateTeam() {
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState({
    name: '',
    shortcut: '',
    color: '#386C0B',
    playerCount: 4,
    tactic: 1,
    entranceSong: '',
    pin: '',
  });

  const handleChange = (e) => {
    setTeamData({ ...teamData, [e.target.name]: e.target.value });
  };

  const handlePlayerCountChange = (e) => {
    setTeamData({ ...teamData, playerCount: parseInt(e.target.value), tactic: 1 });
  };

  const handleTacticSelect = (tactic) => {
    setTeamData({ ...teamData, tactic });
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await addDoc(collection(db, 'teams'), {
          ...teamData,
          createdAt: Timestamp.now(),
        });
        alert('Team created successfully!');
        navigate('/teams-management');
      } catch (error) {
        console.error('Error creating team:', error);
        alert('Failed to create team.');
      }
    };

  const renderTacticImages = () => {
    const images = [1, 2, 3].map((num) => ({
      src: `/images/Tactics/${teamData.playerCount}_players_${num}.png`,
      id: num,
    }));

    return images.map((img) => (
      <img
        key={img.id}
        src={img.src}
        alt={`Tactic ${img.id}`}
        style={{
          ...styles.tacticImage,
          border: teamData.tactic === img.id ? '3px solid #386C0B' : '2px solid #5D737E',
        }}
        onClick={() => handleTacticSelect(img.id)}
      />
    ));
  };

  return (
       <>
         <div style={styles.container}>
           <h1 style={styles.title}>Create New Team</h1>
           <form onSubmit={handleSubmit} style={styles.form}>
             {/* ✅ Team Name Field */}
             <label style={styles.label}>Team Name</label>
             <input
               type="text"
               name="name"
               placeholder="Name of your team"
               value={teamData.name}
               onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
               required
               style={styles.input}
             />

             {/* ✅ Team Shortcut Field */}
             <label style={styles.label}>Team Shortcut</label>
             <input
               type="text"
               name="shortcut"
               placeholder="ABC"
               value={teamData.shortcut}
               onChange={(e) => {
                 const value = e.target.value.toUpperCase().slice(0, 3);
                 setTeamData({ ...teamData, shortcut: value });
               }}
               required
               style={styles.shortcutInput}
             />

             {/* ✅ Team Color */}
             <label style={styles.label}>Team Color</label>
             <input
               type="color"
               name="color"
               value={teamData.color}
               onChange={handleChange}
               style={styles.colorInput}
             />

             {/* ✅ Number of Players */}
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

             {/* ✅ Tactic Selection */}
             <label style={styles.label}>Select Tactic</label>
             <div style={styles.tacticContainer}>{renderTacticImages()}</div>

             {/* ✅ Entrance Song */}
             <label style={styles.label}>Entrance Song (Spotify Link)</label>
             <input
               type="url"
               name="entranceSong"
               placeholder="Paste Spotify link"
               value={teamData.entranceSong}
               onChange={handleChange}
               style={styles.input}
             />

             {/* ✅ PIN */}
             <label style={styles.label}>PIN (for Editing/Deleting)</label>
             <input
               type="password"
               name="pin"
               placeholder="Enter PIN"
               value={teamData.pin}
               onChange={handleChange}
               style={styles.input}
               required
             />

             <button type="submit" style={styles.button}>Create Team</button>
           </form>

           <button style={styles.backButton} onClick={() => navigate('/teams-management')}>
             Back
           </button>
         </div>
       </>

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
  shortcutInput: {
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #7FC6A4',
    fontSize: '20px',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    width: '100px',
    alignSelf: 'center',
  },

};

export default CreateTeam;
