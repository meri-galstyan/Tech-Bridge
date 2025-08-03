// volunteer.js

window.onload = async function () {
  const listContainer = document.getElementById('request-list');
  listContainer.innerHTML = '<p>Loading help requests...</p>';

  try {
    const res = await fetch('http://localhost:5050/help-requests');
    const data = await res.json();
    listContainer.innerHTML = ''; // clear "loading..." text

    if (data.length === 0) {
      listContainer.innerHTML = '<p>No help requests at the moment.</p>';
      return;
    }

    data.forEach(req => {
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
  } catch (err) {
    console.error("Error fetching help requests:", err);
    listContainer.innerHTML = '<p>Error loading help requests.</p>';
  }
};

async function respondToRequest(requestId, decision) {
  try {
    const res = await fetch(`http://localhost:5050/request/${requestId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      document.getElementById(`request-${requestId}`).remove();
    } else {
      alert(`❌ Failed: ${data.message}`);
    }
  } catch (err) {
    console.error("❌ Server error:", err);
    alert("❌ Server error.");
  }
}
