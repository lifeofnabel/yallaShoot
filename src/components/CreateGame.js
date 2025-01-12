import React from 'react';

function CreateGame() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Game</h1>
      <form style={styles.form}>
        <label style={styles.label}>Location</label>
        <input type="text" placeholder="Enter location" style={styles.input} />

        <label style={styles.label}>Date</label>
        <input type="date" style={styles.input} />

        <label style={styles.label}>Time</label>
        <input type="time" style={styles.input} />

        <label style={styles.label}>Event Length (minutes)</label>
        <input type="number" placeholder="Enter event length" style={styles.input} />

        <label style={styles.label}>WhatsApp Link</label>
        <input type="url" placeholder="Enter WhatsApp link" style={styles.input} />

        <label style={styles.label}>PIN</label>
        <input type="password" placeholder="Enter PIN" style={styles.input} />

        <button type="submit" style={styles.button}>Create Game</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D6F8D6', // Nyanza
    color: '#293F14', // Pakistan Green
    fontFamily: "'Press Start 2P', cursive", // Old-school font
    minHeight: '100vh',
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '400px',
    margin: '0 auto',
    gap: '15px',
  },
  label: {
    fontSize: '14px',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '2px solid #7FC6A4', // Cambridge Blue
    fontSize: '14px',
  },
  button: {
    backgroundColor: '#386C0B', // Office Green
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
};

export default CreateGame;
