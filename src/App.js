import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import CreateGame from './pages/CreateGame';
import StartGame from './pages/StartGame';
import SetGame from './pages/SetGame';
import History from './pages/History';
import TeamsManagement from './pages/TeamsManagement';
import CreateTeam from './pages/CreateTeam';
import EditTeam from './pages/EditTeam';
import AddPlayer from './pages/AddPlayer';
import PlayersManagement from './pages/PlayersManagement';
import EditPlayer from './pages/EditPlayer';
import TeamLineup from './pages/TeamLineup';




function App() {
  return (
    <Router>
      <div style={styles.appContainer}>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/start-game" element={<StartGame />} />
          <Route path="/create-game" element={<CreateGame />} />
          <Route path="/set-game" element={<SetGame />} />
          <Route path="/players-management" element={<PlayersManagement />} />
          <Route path="/add-player" element={<AddPlayer />} />
          <Route path="/edit-player/:playerId" element={<EditPlayer />} />

          <Route path="/history" element={<History />} />
          <Route path="/teams-management" element={<TeamsManagement />} />
          <Route path="/team-lineup/:teamId" element={<TeamLineup />} />

          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/edit-team/:teamId" element={<EditTeam />} />

        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  appContainer: {
    backgroundColor: '#D6F8D6', // Nyanza background
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Press Start 2P', cursive", // Old-school font
  },
};

export default App;
