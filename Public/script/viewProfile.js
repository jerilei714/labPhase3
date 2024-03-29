const authorizedUsername = localStorage.getItem('authorizedUsername');
const urlParams = new URLSearchParams(window.location.search);
const searchedUser = urlParams.get('username');

const username = document.getElementById('username');
const name = document.getElementById('name');
const email = document.getElementById('email');
const course = document.getElementById('course');
const accountType = document.getElementById('accountType');
const display_pfp = document.getElementById('pfpStudent');
const tbody = document.querySelector('.table-container tbody');
while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
}

fetch(`/users/${searchedUser}`)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch user data');
        }
    })
    .then(user => {
        name.textContent = user.name;
        username.textContent = user.username;
        email.textContent = user.email;
        course.textContent = user.course;
        accountType.textContent = user.accountType;
        description.textContent = user.description;

        if (user.profilePic) {
            display_pfp.src = user.profilePic;
        }
    })
    .catch(error => {
        document.getElementById('profile-detail-container').innerHTML = 'User does not exist';
        document.getElementById('profile-detail-container').style.fontSize = "30px"
        document.querySelector('.profile-picture').innerHTML = "";
        document.getElementById('reservationList').style.display="none"
        document.getElementById('homeContent').style.height="80vh"
    });

    fetch(`/reservations/userReservations/${searchedUser}`)
.then(response => response.json())
.then(data => {
    const reservations = data.userReservations.filter(reservation => !reservation.anonymous); 
    reservations.forEach((reservation, index) => {
        const row = document.createElement('tr');
        const details = [
            reservation.lab_id, 
            reservation.seat_number,
            reservation.reserve_date,
            reservation.reserve_time,
        ];
        
        const formattedTndRequested = formatTndRequested(reservation.tnd_requested);
        details.push(formattedTndRequested);

        details.forEach(detail => {
            const cell = document.createElement('td');
            cell.textContent = detail;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
})
.catch(error => {
    console.error('Error fetching user reservations:', error);
});


    function formatTndRequested(tndRequested) {
        const tndRequestDate = new Date(tndRequested);
        if (isNaN(tndRequestDate)) {
            return 'Invalid Date';
        }
        return tndRequestDate.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
        }).replace(',', '').replace(' ', ' ');
    }

    while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
    }

function goToHomePage() {
    window.location.href = '../';
}
