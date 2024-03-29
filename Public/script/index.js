    fetch('/most-reserved-labs')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const container = document.getElementById('featured-labs-container');
        data.forEach(lab => {
            const labDiv = document.createElement('div');
            labDiv.className = 'lab';
            labDiv.innerHTML = `
                <h3>${lab.lab_name}</h3>
                <p>Located in ${lab.location}</p>
                <p>Current Total Reservations: ${lab.reservations}</p>
            `;
            container.appendChild(labDiv);
        });
    })
    .catch(error => console.error('Error fetching featured labs:', error));
