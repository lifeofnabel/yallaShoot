import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

function MatchOverviewPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [gameData, setGameData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [showTable, setShowTable] = useState(false);  // ✅ Zustand für Tabelle
  const handleShowTable = () => {
    setShowTable(!showTable);  // Öffnen/Schließen der Tabelle

    if (!showTable) {
      // ✅ Tabelle nur berechnen, wenn sie angezeigt werden soll
      const updatedStandings = calculateStandings();
      console.log("Standings recalculated:", updatedStandings);  // Debugging
    }
  };

  // ✅ Spiel- und Teamdaten laden
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);

        if (gameSnap.exists()) {
          const game = gameSnap.data();
          setGameData(game);
          setMatches(game.matchPlan || []);

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
          alert('Game not found');
          navigate('/start-game');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchGameData();
  }, [gameId, navigate]);

  // ✅ Teamnamen anhand der ID finden
  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.shortcut : 'Unknown';
  };

  // ✅ Tabelle korrekt berechnen
const calculateStandings = () => {
  const standings = {};

  // ✅ Initialisiere alle Teams
  teams.forEach((team) => {
    standings[team.id] = {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    };
  });

  // ✅ Durch alle Matches iterieren
  matches.forEach((match) => {
    const { teamA, teamB, events = [], status } = match;

    // ❗ Fehlerbehandlung für fehlende Teams
    if (!teamA || !teamB || !standings[teamA] || !standings[teamB]) {
      console.warn(`❗ Ungültige Teamdaten in Match:`, match);
      return;  // ❗ Überspringe dieses Match
    }

    if (status === 'finished') {
      let scoreA = 0;
      let scoreB = 0;

      // ✅ Tore korrekt berechnen
      events.forEach((event) => {
        if (event.type === 'goal') {
          const playerTeam = teams.find((team) => team.players?.includes(event.playerId))?.id;

          if (playerTeam === teamA) {
            scoreA++;
          } else if (playerTeam === teamB) {
            scoreB++;
          } else {
            console.warn(`❗ Spieler mit ID ${event.playerId} gehört keinem Team an.`);
          }
        }
      });

      // ✅ Spiele aktualisieren
      standings[teamA].played += 1;
      standings[teamB].played += 1;

      standings[teamA].goalsFor += scoreA;
      standings[teamA].goalsAgainst += scoreB;

      standings[teamB].goalsFor += scoreB;
      standings[teamB].goalsAgainst += scoreA;

      // ✅ Siege, Unentschieden, Niederlagen & Punkte aktualisieren
      if (scoreA > scoreB) {
        standings[teamA].wins += 1;
        standings[teamA].points += 3;
        standings[teamB].losses += 1;
      } else if (scoreA < scoreB) {
        standings[teamB].wins += 1;
        standings[teamB].points += 3;
        standings[teamA].losses += 1;
      } else {
        standings[teamA].draws += 1;
        standings[teamB].draws += 1;
        standings[teamA].points += 1;
        standings[teamB].points += 1;
      }
    }
  });

  return standings;
};

  const standings = calculateStandings();

  if (!gameData) return <p style={styles.loadingText}>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Match Overview</h1>

      {/* ✅ Button zum Einblenden der Tabelle */}
      <button
        style={styles.showTableButton}
        onClick={handleShowTable}  //
      >
        {showTable ? '🔽 Hide Table' : '📊 Show Table'}
      </button>

      {/* ✅ Dynamische Tabelle */}
        {showTable && (
          <div style={styles.tableContainer}>
            <h2 style={styles.sectionTitle}>🏆 Standings</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>PL</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>F</th>
                  <th>A</th>
                  <th>PTS</th>
                </tr>
              </thead>
              <tbody>
          {teams.map((team) => (
                  <tr key={team.id}>
                    <td>{getTeamName(team.id)}</td>
                    <td>{standings[team.id]?.played}</td>
                    <td>{standings[team.id]?.wins}</td>
                    <td>{standings[team.id]?.draws}</td>
                    <td>{standings[team.id]?.losses}</td>
                    <td>{standings[team.id]?.goalsFor}</td>
                    <td>{standings[team.id]?.goalsAgainst}</td>
                    <td>{standings[team.id]?.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}

      {/* ✅ Spieleliste */}
      <h2 style={styles.sectionTitle}>🎮 Matches</h2>
      <div style={styles.matchList}>
        {matches.map((match, index) => (
          <div key={index} style={styles.matchCard} onClick={() => navigate(`/match-details/${gameId}/${index}`)}>
            <p style={styles.matchTeams}>
              {getTeamName(match.teamA)} vs {getTeamName(match.teamB)}
            </p>

            {/* ✅ Status und Ergebnis anzeigen */}
            <p style={match.status === 'live' ? styles.liveStatus : match.status === 'finished' ? styles.finishedStatus : styles.notPlayedStatus}>
              {match.status === 'live' ? '🟢 Live' : match.status === 'finished' ? '🔴 Finished' : '⏳ Not Played'}
            </p>

            <p style={styles.matchScore}>
              {match.status !== 'not-started' ? `Score: ${match.scoreA} - ${match.scoreB}` : 'Score: -'}
            </p>

            <button style={styles.enterButton}>⚡ Enter Match</button>
          </div>
        ))}
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
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    color: '#293F14',
    textShadow: '3px 3px #7FC6A4',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '10px',
  },
  showTableButton: {
    backgroundColor: '#386C0B',
    color: '#FFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid #293F14',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  tableContainer: {
    marginBottom: '30px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '4px 4px #386C0B',
  },
  matchList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  matchCard: {
    backgroundColor: '#7FC6A4',
    padding: '15px',
    borderRadius: '10px',
    border: '2px solid #386C0B',
    cursor: 'pointer',
    boxShadow: '4px 4px #293F14',
  },
  enterButton: {
    backgroundColor: '#386C0B',
    color: '#FFF',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  backButton: {
    marginTop: '30px',
    backgroundColor: '#5D737E',
    color: '#FFF',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  liveStatus: {
    color: '#00FF00',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '5px',
  },

  finishedStatus: {
    color: '#FF0000',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '5px',
  },

  notPlayedStatus: {
    color: '#FFA500',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '5px',
  },

  matchScore: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#293F14',
  },
};

export default MatchOverviewPage;
