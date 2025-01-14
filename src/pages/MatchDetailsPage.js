import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

function MatchDetailsPage() {
  const { gameId, matchIndex } = useParams();
  const navigate = useNavigate();

    const [gameData, setGameData] = useState(null);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [matchStatus, setMatchStatus] = useState('not-started');
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);

  // ✅ Daten aus Firestore laden
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);

        if (gameSnap.exists()) {
          const game = gameSnap.data();
          setGameData(game);

          const match = game.matchPlan[matchIndex];
          setEvents(match.events || []);
          setMatchStatus(match.status || 'not-started');
          setScoreA(match.scoreA || 0);
          setScoreB(match.scoreB || 0);

          const teamsData = [];
          const playersData = [];

          for (const teamId of [match.teamA, match.teamB]) {
            if (teamId) {
              const teamRef = doc(db, 'teams', teamId);
              const teamSnap = await getDoc(teamRef);

              if (teamSnap.exists()) {
                const team = { id: teamId, ...teamSnap.data() };
                teamsData.push(team);

                if (team.players && Array.isArray(team.players)) {
                  for (const playerId of team.players) {
                    if (playerId) {
                      const playerRef = doc(db, 'players', playerId);
                      const playerSnap = await getDoc(playerRef);

                      if (playerSnap.exists()) {
                        playersData.push({ id: playerId, ...playerSnap.data() });
                      }
                    }
                  }
                }
              }
            }
          }

          setTeams(teamsData);
          setPlayers(playersData);
        } else {
          alert('❌ Game not found.');
          navigate('/start-game');
        }
      } catch (error) {
        console.error('Error loading game data:', error);
        alert('Fehler beim Laden der Daten.');
      }
    };

    fetchGameData();
  }, [gameId, matchIndex, navigate]);

  // ✅ Ereignis hinzufügen
  const addEvent = () => {
    if (selectedPlayer && selectedEvent) {
      const player = players.find(p => p.id === selectedPlayer);
      const newEvent = {
        playerId: selectedPlayer,
        playerName: `${player.lastName}, ${player.firstName}`,
        type: selectedEvent,
        timestamp: new Date().toISOString(),
      };

      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);


      if (selectedEvent === 'goal') {
        const team = teams.find(team => team.players.includes(selectedPlayer));
        if (team.id === gameData.matchPlan[matchIndex].teamA) {
          setScoreA(prev => prev + 1);
        } else {
          setScoreB(prev => prev + 1);
        }
      }

      setSelectedPlayer('');
      setSelectedEvent('');
    } else {
      alert('Bitte Spieler und Ereignis auswählen.');
    }
  };

  // ✅ Speichern
  const saveMatch = async () => {
    try {
      const updatedMatch = {
        ...gameData.matchPlan[matchIndex],
        events: events,
        status: 'live',
        scoreA: scoreA,
        scoreB: scoreB,
      };

      const updatedMatchPlan = [...gameData.matchPlan];
      updatedMatchPlan[matchIndex] = updatedMatch;

      await updateDoc(doc(db, 'games', gameId), { matchPlan: updatedMatchPlan });
      setMatchStatus('live');
      alert('Spiel gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern des Spiels.');
    }
  };

  // ✅ Spiel beenden
  const finishMatch = async () => {
    try {
      const updatedMatch = {
        ...gameData.matchPlan[matchIndex],
        events: events,
        status: 'finished',
        scoreA: scoreA,
        scoreB: scoreB,
      };

      const updatedMatchPlan = [...gameData.matchPlan];
      updatedMatchPlan[matchIndex] = updatedMatch;

      await updateDoc(doc(db, 'games', gameId), { matchPlan: updatedMatchPlan });
      setMatchStatus('finished');
      alert('Spiel beendet!');
    } catch (error) {
      console.error('Fehler beim Beenden:', error);
      alert('Fehler beim Beenden des Spiels.');
    }
  };

  if (!gameData || teams.length < 2) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚽ Match Details</h1>
      <h2 style={styles.subtitle}>{teams[0].name} vs {teams[1].name}</h2>
      <h3 style={styles.scoreBoard}>{scoreA} - {scoreB}</h3>
      {/* ✅ Event Timeline */}
      <div style={styles.eventsList}>
        <h3 style={styles.eventsTitle}>📜 Ereignisse</h3>
        {events.length === 0 ? (
          <p>Keine Ereignisse eingetragen.</p>
        ) : (
          events.map((event, index) => (
            <p key={index} style={styles.eventItem}>
              {event.type === 'goal' && '⚽'}
              {event.type === 'assist' && '🎯'}
              {event.type === 'yellow-card' && '🟨'}
              {event.type === 'red-card' && '🟥'}
              {event.playerName} - {event.timestamp}
            </p>
          ))
        )}
      </div>


      <p>Status: {matchStatus === 'live' ? '🟢 Live' : matchStatus === 'finished' ? '🔴 Finished' : '⏳ Not Started'}</p>

      {matchStatus !== 'finished' && (
        <div style={styles.eventBox}>
          <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} style={styles.select}>
            <option value="">Spieler auswählen</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.lastName}, {player.firstName}
              </option>
            ))}
          </select>

          <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} style={styles.select}>
            <option value="">Ereignis auswählen</option>
            <option value="goal">⚽ Tor</option>
            <option value="assist">🎯 Vorlage</option>
            <option value="yellow-card">🟨 Gelbe Karte</option>
            <option value="red-card">🟥 Rote Karte</option>
          </select>

          <button style={styles.addButton} onClick={addEvent}>➕ Ereignis hinzufügen</button>
        </div>
      )}

      <button style={styles.saveButton} onClick={saveMatch}>💾 Speichern</button>
      <button style={styles.finishButton} onClick={finishMatch}>🏁 Abpfeifen</button>
      <button style={styles.backButton} onClick={() => navigate(-1)}>⬅️ Zurück</button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D6F8D6',  // Nyanza
    minHeight: '100vh',
    padding: '20px',
    textAlign: 'center',
    fontFamily: "'Press Start 2P', cursive",
  },

  title: {
    fontSize: '32px',
    marginBottom: '10px',
    color: '#293F14',  // Pakistan Green
    textShadow: '3px 3px #7FC6A4',
  },

  subtitle: {
    fontSize: '20px',
    marginBottom: '20px',
    color: '#386C0B',  // Office Green
  },

  scoreBoard: {
    fontSize: '36px',
    fontWeight: 'bold',
    backgroundColor: '#7FC6A4',  // Cambridge Blue
    padding: '10px 20px',
    borderRadius: '10px',
    border: '3px solid #386C0B',
    color: '#293F14',
    boxShadow: '4px 4px #5D737E',
    marginBottom: '20px',
  },

  // ✅ Retro-Style für Event Timeline
  eventsList: {
    backgroundColor: '#386c0b',
    padding: '20px',
    borderRadius: '15px',
    marginTop: '20px',
    width: '80%',
    margin: '0 auto',
    boxShadow: '5px 5px #293F14',
    border: '3px solid #386C0B',
    color: '#FFFFFF',
  },

  eventsTitle: {
    fontSize: '18px',
    color: '#7FC6A4',
    marginBottom: '10px',
    textDecoration: 'underline',
  },

  eventItem: {
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#7FC6A4',
    borderRadius: '10px',
    boxShadow: '2px 2px #386C0B',
    color: '#293F14',
    fontWeight: 'bold',
  },

  // ✅ Select Dropdown für Spieler/Ereignisse
  select: {
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #386C0B',
    backgroundColor: '#7FC6A4',
    color: '#293F14',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '250px',
    boxShadow: '2px 2px #293F14',
    marginBottom: '10px',
  },

  // ✅ Ereignis hinzufügen Button
  addButton: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    border: '2px solid #293F14',
    boxShadow: '3px 3px #5D737E',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  // ✅ Speichern Button
  saveButton: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '12px 25px',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    border: '3px solid #293F14',
    boxShadow: '4px 4px #7FC6A4',
    marginTop: '20px',
    textTransform: 'uppercase',
  },

  // ✅ Spiel beenden Button
  finishButton: {
    backgroundColor: '#C0392B',
    color: '#FFFFFF',
    padding: '12px 25px',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    border: '3px solid #7FC6A4',
    boxShadow: '4px 4px #5D737E',
    marginTop: '10px',
    textTransform: 'uppercase',
  },

  // ✅ Zurück Button
  backButton: {
    marginTop: '20px',
    backgroundColor: '#5D737E',
    color: '#FFFFFF',
    padding: '10px 25px',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '2px solid #293F14',
    boxShadow: '3px 3px #386C0B',
  },
};

export default MatchDetailsPage;
