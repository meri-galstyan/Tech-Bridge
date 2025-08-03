window.onload = async function () {
  const listContainer = document.getElementById('request-list');
  const acceptedContainer = document.getElementById('accepted-requests');
  const statsBar = document.getElementById('stats-bar');
  const volunteerId = localStorage.getItem('volunteerId');

  if (!volunteerId) {
    alert("You must log in first.");
    window.location.href = "login.html";
    return;
  }

  listContainer.innerHTML = '<p>Loading help requests...</p>';
  statsBar.textContent = 'Loading your hours...';

  try {
    // Fetch volunteer's current hours
    const hoursRes = await fetch(`http://localhost:5050/volunteer/${volunteerId}/hours`);
    const hoursData = await hoursRes.json();
    statsBar.textContent = `🏅 You’ve earned ${hoursData.hours || 0} community service hour${hoursData.hours === 1 ? '' : 's'}`;

    // Fetch all help requests
    const res = await fetch('http://localhost:5050/help-requests');
    const data = await res.json();
    listContainer.innerHTML = '';
    acceptedContainer.innerHTML = '';

    let hasAccepted = false;

    data.forEach(req => {
      if (req.status === 'Accepted' && req.volunteerId === volunteerId) {
        hasAccepted = true;
        renderAcceptedRequest(req);
        return;
      }

      if (req.status === 'Declined' || req.status === 'Accepted') return;

      const item = document.createElement('div');
      item.classList.add('request-card');
      item.id = `request-${req._id}`;

      item.innerHTML = `
        <h3>${req.name}</h3>
        <p><strong>Contact:</strong> ${req.contactMethod === 'Phone' ? req.phone : req.email || req.phone}</p>
        <p><strong>Help Needed:</strong> ${req.helpTypes?.join(', ') || '—'}</p>
        <p><strong>Description:</strong> ${req.description}</p>
        <p><strong>Urgency:</strong> ${req.urgency}</p>
        <p><strong>Location:</strong> ${req.city}, ${req.zip}</p>
        <button onclick="respondToRequest('${req._id}', 'accept')">✅ Accept</button>
        <button onclick="respondToRequest('${req._id}', 'decline')">❌ Decline</button>
      `;

      listContainer.appendChild(item);
    });

    if (!hasAccepted) {
      acceptedContainer.innerHTML = '<p>No accepted requests yet.</p>';
    }

  } catch (err) {
    console.error("Error loading data:", err);
    statsBar.textContent = '❌ Error loading your hours';
    listContainer.innerHTML = '<p>Error loading help requests.</p>';
  }
};

async function respondToRequest(requestId, decision) {
  const volunteerId = localStorage.getItem('volunteerId');
  if (!volunteerId) {
    alert("You're not logged in.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5050/request/${requestId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, volunteerId })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById(`request-${requestId}`)?.remove();
      document.getElementById(`accepted-${requestId}`)?.remove();

      if (decision === 'accept') {
        const res2 = await fetch(`http://localhost:5050/help-requests`);
        const allRequests = await res2.json();
        const acceptedReq = allRequests.find(r => r._id === requestId);
        if (acceptedReq) renderAcceptedRequest(acceptedReq);
      }

      alert(data.message);
    } else {
      alert(`❌ Failed: ${data.message}`);
    }
  } catch (err) {
    console.error("❌ Server error:", err);
    alert("❌ Server error.");
  }
}

function renderAcceptedRequest(req) {
  const acceptedContainer = document.getElementById('accepted-requests');
  if (!acceptedContainer) return;

  if (acceptedContainer.textContent.includes("No accepted requests")) {
    acceptedContainer.innerHTML = '';
  }

  const item = document.createElement('div');
  item.classList.add('request-card');
  item.id = `accepted-${req._id}`;

  item.innerHTML = `
    <h3>${req.name}</h3>
    <p><strong>Contact:</strong> ${req.contactMethod === 'Phone' ? req.phone : req.email || req.phone}</p>
    <p><strong>Help Needed:</strong> ${req.helpTypes?.join(', ') || '—'}</p>
    <p><strong>Description:</strong> ${req.description}</p>
    <p><strong>Urgency:</strong> ${req.urgency}</p>
    <p><strong>Location:</strong> ${req.city}, ${req.zip}</p>
    <button onclick="completeRequest('${req._id}')">🏅 Completed</button>
    <button onclick="respondToRequest('${req._id}', 'decline')">❌ Decline</button>
  `;

  acceptedContainer.appendChild(item);
}

async function completeRequest(requestId) {
  const volunteerId = localStorage.getItem('volunteerId');
  if (!volunteerId) return alert("You're not logged in.");

  try {
    const res = await fetch(`http://localhost:5050/request/${requestId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteerId })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById(`accepted-${requestId}`)?.remove();
      alert("✅ Marked as completed. Hours awarded!");

      // refresh the hours
      const res2 = await fetch(`http://localhost:5050/volunteer/${volunteerId}/hours`);
      const hoursData = await res2.json();
      document.getElementById('stats-bar').textContent =
        `🏅 You’ve earned ${hoursData.hours || 0} community service hour${hoursData.hours === 1 ? '' : 's'}`;
    } else {
      alert(`❌ Failed: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Server error.");
  }
}
