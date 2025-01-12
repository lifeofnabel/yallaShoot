import React from 'react';
import { Link } from 'react-router-dom';

function MainMenu() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>YallaShoot</h1>
      <nav style={styles.menu}>
        <Link to="/start-game" style={styles.button}>Start Game</Link>
        <Link to="/create-game" style={styles.button}>Create new Game</Link>
        <Link to="/set-game" style={styles.button}>Set Fixtures</Link>
        <Link to="/teams-management" style={styles.button}>Teams Management</Link>
        <Link to="/players-management" style={styles.button}>Players Management</Link>
        <Link to="/history" style={styles.button}>History</Link>
      </nav>
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
    justifyContent: 'center',
    fontFamily: "'Press Start 2P', cursive",
  },
  title: {
    fontSize: '36px',
    marginBottom: '40px',
    color: '#293F14',
    textShadow: '2px 2px #7FC6A4',
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '250px',
  },
  button: {
    backgroundColor: '#386C0B',
    color: '#FFFFFF',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    textDecoration: 'none',
    fontSize: '14px',
    border: '2px solid #5D737E',
    boxShadow: '3px 3px #7FC6A4',
    transition: 'transform 0.2s',
  },
};

export default MainMenu;
