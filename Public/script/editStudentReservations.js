const tbody = document.querySelector('.table-container tbody');
const studentNameFilter = document.getElementById('studentNameFilter');

function fetchAndDisplayStudents(filter = '') {
    tbody.innerHTML = '';
    fetch(`/users/students`)
        .then(response => response.json())
        .then(users => {
            users.students
                .filter(student => student.username.toLowerCase().includes(filter.toLowerCase()))
                .forEach(student => {
                    fetch(`/reservations/userReservations/${student.username}`)
                        .then(response => response.json())
                        .then(reservations => {
                            const totalReservedSeats = reservations.userReservations.length;
                            const row = document.createElement('tr');
                            const usernameCell = document.createElement('td');
                            usernameCell.textContent = student.username;
                            row.appendChild(usernameCell);
                            const reservedSeatsCell = document.createElement('td');
                            reservedSeatsCell.textContent = totalReservedSeats;
                            row.appendChild(reservedSeatsCell);
                            const actionsCell = document.createElement('td');
                            const editButton = document.createElement('button');
                            editButton.textContent = 'Edit';
                            editButton.addEventListener('click', function() {
                                window.location.href = `editReservationsContent?studentUsername=${encodeURIComponent(student.username)}`;
                            });
                            actionsCell.appendChild(editButton);
                            row.appendChild(actionsCell);
                            tbody.appendChild(row);
                        })
                        .catch(error => {
                            console.error('Error fetching reservations:', error);
                        });
                });
        })
        .catch(error => {
            console.error('Error fetching students:', error);
        });
}

fetchAndDisplayStudents();

studentNameFilter.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const filterValue = studentNameFilter.value;
        fetchAndDisplayStudents(filterValue);
    }
});