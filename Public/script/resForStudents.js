const tbody = document.querySelector('.table-container tbody');

while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
}
fetch(`/users/students`)
    .then(response => response.json())
    .then(users => {
        const data = users.students;
        data.forEach(student => {
            const row = document.createElement('tr');
            const usernameCell = document.createElement('td');
            usernameCell.textContent = student.username;
            row.appendChild(usernameCell);
            const actionsCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Reserve For Student';
            editButton.addEventListener('click', function() {
                window.location.href = `reserveForStudent?studentUsername=${encodeURIComponent(student.username)}`;
            });
            actionsCell.appendChild(editButton);
            row.appendChild(actionsCell);
            tbody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching students:', error);
    });

    document.getElementById('studentNameFilter').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const filterValue = studentNameFilter.value;
            if(filterValue != "")
                tbody.innerHTML = '';
            filterStudents(); 
        }
    });

    async function filterStudents() {
        const inputName = document.getElementById('studentNameFilter').value.toLowerCase();
        tbody.innerHTML = ''; 
    
        await fetch(`/users/students`)
            .then(response => response.json())
            .then(users => {
                const filteredStudents = users.students.filter(student => student.username.toLowerCase().includes(inputName));
                filteredStudents.forEach(student => {
                    const row = document.createElement('tr');
                    const nameCell = document.createElement('td');
                    nameCell.textContent = student.username;
                    row.appendChild(nameCell);
    
                    const actionsCell = document.createElement('td');
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.addEventListener('click', function() {
                        window.location.href = `reserveForStudent?studentUsername=${encodeURIComponent(student.username)}`; 
                    });
                    actionsCell.appendChild(editButton);
                    row.appendChild(actionsCell);
    
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching students:', error);
            });
    }
    