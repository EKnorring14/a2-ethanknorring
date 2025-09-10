document.addEventListener('DOMContentLoaded', function() {
  const playerForm = document.getElementById('player-form');
  const playersTable = document.getElementById('players-data');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  let editingId = null;

  // Fetch and display players
  function fetchPlayers() {
    fetch('/players')
      .then(response => response.json())
      .then(players => {
        displayPlayers(players);
      })
      .catch(error => console.error('Error fetching players:', error));
  }

  // Display players in the table
  function displayPlayers(players) {
    playersTable.innerHTML = '';
    
    players.forEach(player => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${player.name}</td>
        <td>${player.position}</td>
        <td>${player.avg}</td>
        <td>${player.obp}</td>
        <td>${player.slg}</td>
        <td>${player.ops}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${player.id}">Edit</button>
          <button class="action-btn delete-btn" data-id="${player.id}">Delete</button>
        </td>
      `;
      
      playersTable.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        editPlayer(id);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        deletePlayer(id);
      });
    });
  }

  // Add or update player
  playerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const playerId = document.getElementById('player-id').value;
    const player = {
      name: document.getElementById('name').value,
      position: document.getElementById('position').value,
      avg: parseFloat(document.getElementById('avg').value),
      obp: parseFloat(document.getElementById('obp').value),
      slg: parseFloat(document.getElementById('slg').value)
    };
    
    if (playerId) {
      player.id = parseInt(playerId);
      updatePlayer(player);
    } else {
      addPlayer(player);
    }
  });

  // Add new player
  function addPlayer(player) {
    fetch('/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(player)
    })
    .then(response => response.json())
    .then(players => {
      displayPlayers(players);
      resetForm();
    })
    .catch(error => console.error('Error adding player:', error));
  }

  // Edit player
  function editPlayer(id) {
    fetch('/players')
      .then(response => response.json())
      .then(players => {
        const player = players.find(p => p.id === id);
        if (player) {
          document.getElementById('player-id').value = player.id;
          document.getElementById('name').value = player.name;
          document.getElementById('position').value = player.position;
          document.getElementById('avg').value = player.avg;
          document.getElementById('obp').value = player.obp;
          document.getElementById('slg').value = player.slg;
          
          submitBtn.textContent = 'Update Player';
          cancelBtn.style.display = 'inline-block';
          editingId = id;
        }
      })
      .catch(error => console.error('Error fetching player for edit:', error));
  }

  // Update player
  function updatePlayer(player) {
    fetch('/players', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(player)
    })
    .then(response => response.json())
    .then(players => {
      displayPlayers(players);
      resetForm();
    })
    .catch(error => console.error('Error updating player:', error));
  }

  // Delete player
  function deletePlayer(id) {
    if (confirm('Are you sure you want to delete this player?')) {
      fetch(`/players/${id}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(players => {
        displayPlayers(players);
        if (editingId === id) {
          resetForm();
        }
      })
      .catch(error => console.error('Error deleting player:', error));
    }
  }

  // Cancel edit
  cancelBtn.addEventListener('click', resetForm);

  // Reset form
  function resetForm() {
    playerForm.reset();
    document.getElementById('player-id').value = '';
    submitBtn.textContent = 'Add Player';
    cancelBtn.style.display = 'none';
    editingId = null;
  }

  // Initial fetch of players
  fetchPlayers();
});