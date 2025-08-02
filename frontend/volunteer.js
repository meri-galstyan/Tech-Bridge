// volunteer_dashboard.js

fetch('http://localhost:5050/help-requests')
  .then(res => res.json())
  .then(data => {
    const listContainer = document.getElementById('request-list');
    listContainer.innerHTML = ''; // clear "loading..." text

    if (data.length === 0) {
      listContainer.innerHTML = '<p>No help requests at the moment.</p>';
      return;
    }

    data.forEach(req => {
      const item = document.createElement('div');
      item.classList.add('request-card');
      item.innerHTML = `
        <h3>${req.name}</h3>
        <p><strong>Contact:</strong> ${req.contactMethod === 'Phone' ? req.phone : req.email || req.phone}</p>
        <p><strong>Help Needed:</strong> ${req.helpTypes.join(', ')}</p>
        <p><strong>Description:</strong> ${req.description}</p>
        <p><strong>Urgency:</strong> ${req.urgency}</p>
        <p><strong>Location:</strong> ${req.city}, ${req.zip}</p>
      `;
      listContainer.appendChild(item);
    });
  })
  .catch(err => {
    document.getElementById('request-list').innerHTML = '<p>Error loading help requests.</p>';
    console.error("Error fetching help requests:", err);
  });
