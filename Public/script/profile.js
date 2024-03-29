const username = document.getElementById('username');
const name = document.getElementById('name');
const password = document.getElementById('password');
const email = document.getElementById('email');
const course = document.getElementById('course');
const accountType = document.getElementById('accountType');
let authorizedUsername = sessionStorage.getItem('authorizedUsername');
const display_pfp = document.getElementById('pfpSelf');
const tbody = document.querySelector('.table-container tbody');

fetch(`/users/${authorizedUsername}`)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch user data');
        }
    })
    .then(user => {
        name.innerHTML = user.name;
        username.innerHTML = user.username;
        email.innerHTML = user.email;
        course.innerHTML = user.course;
        accountType.innerHTML = user.accountType;
        description.innerHTML = user.description;
        
        if (user.profilePic) {
            display_pfp.src = user.profilePic;
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
    });

    fetch(`/reservations/userReservations/${authorizedUsername}`)
    .then(response => response.json())
    .then(data => {
        const reservations = data.userReservations;
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


function logout() {
    sessionStorage.removeItem('authorized');
    sessionStorage.removeItem('authorizedUsername');
    
    goToHomePage();
}

function goToHomePage() {
    window.location.href = '../';
}

function deleteUser() {
    fetch(`/users/${authorizedUsername}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to delete user');
        }
    })
    .then(data => {
        logout();
    })
    .catch(error => {
        console.error('Error deleting user:', error);
    });
}

function reset() {
    sessionStorage.clear();
    localStorage.clear();
    goToHomePage();
}

document.getElementById('fileInput').addEventListener('change', function(event) {
    if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
            document.getElementById('pfpSelf').src = e.target.result;
        }
        
        reader.readAsDataURL(event.target.files[0]);
    }
});
