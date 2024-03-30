let editingReservationIndex = null;
const authorizedUsername = sessionStorage.getItem('authorizedUsername');
const popup = document.querySelector('.popup');
fetchLabs();

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
            const actionsCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                openPopup(reservation, index);
            });
            actionsCell.appendChild(editButton);
            row.appendChild(actionsCell);
            tbody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching user reservations:', error);
    });

async function isSeatAvailable(labId, seatNumber, date) {
        const response = await fetch(`/reservations/checkAvailability?date=${date}&labId=${labId}&seatNumber=${seatNumber}`);
        const availability = await response.json();
        return availability.isAvailable; 
    }

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

const tbody = document.querySelector('.table-container tbody');
while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
}

function viewAvailability() {
    const labId = document.getElementById('lab').value;
    const date = document.getElementById('date').value;
    fetch(`reservations/byUsername/${authorizedUsername}?labId=${labId}&reserveDate=${date}`)
        .then(response => 
            response.json())
        .then(data => {
            updateReservationsTable(data);
        })
        .catch(error => console.error('Error:', error));
}

function updateReservationsTable(reservations) {
    const tbody = document.querySelector('.table-container tbody');
    tbody.innerHTML = ''; 
    reservations.userReservations.forEach((reservation, index) => {
        const row = document.createElement('tr');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            openPopup(reservation, index);
        });
        row.innerHTML = `
            <td>${reservation.lab_id}</td>
            <td>${reservation.seat_number}</td>
            <td>${reservation.reserve_date}</td>
            <td>${reservation.reserve_time}</td>
            <td>${formatTndRequested(reservation.tnd_requested)}</td>
        `;
        const actionsCell = document.createElement('td');
        actionsCell.appendChild(editButton);
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

let currentEditingReservation = {};

function openPopup(reservation, index) {
    editingReservationIndex = index;
    fillTimeOptions();
    document.getElementById('popup-lab').value = reservation.lab_id || '';
    document.getElementById('popup-seat').value = reservation.seat_number || '';
    document.getElementById('popup-date').value = reservation.reserve_date || '';
    const timeParts = reservation.reserve_time.split(' - ');
    if (timeParts.length === 2) {
        const startTime = timeParts[0].trim(); 
        const endTime = timeParts[1].trim(); 
        document.getElementById('popup-StartTime').value = startTime;
        document.getElementById('popup-EndTime').value = endTime;
    } else {
        console.error('Unexpected format for reservation time:', reservation.reserve_time);
    }
    popup.style.display = "block";

    currentEditingReservation = {
        _id: reservation._id,
        lab_id: reservation.lab_id,
        seat_number: reservation.seat_number,
        reserve_date: reservation.reserve_date,
        reserve_time: reservation.reserve_time,
        username: authorizedUsername
    };
}

function decrementLastHexChar(hexString) {
    let lastChar = hexString[hexString.length - 1];
    let rest = hexString.slice(0, -1);
    let lastNum = parseInt(lastChar, 16) - 1;
    if (lastNum < 0) {
        lastNum = 15;
        rest = decrementLastHexChar(rest);
    }
    lastChar = lastNum.toString(16);
    return rest + lastChar;
}
async function isSeatNumberValid(labName, seatNumber) {
    try {
      const response = await fetch(`/labs/name/${labName}`);
      const lab = await response.json();
      if (lab && lab.total_seats) {
        return seatNumber >= 1 && seatNumber <= lab.total_seats;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking seat number validity:', error);
      throw new Error('Internal server error');
    }
  }
  


/* async function submitEdit(event) {
    event.preventDefault();
    const originalId = currentEditingReservation._id;
    const decrementedId = decrementLastHexChar(originalId);
    const updatedLab = document.getElementById('popup-lab').value;
    const updatedSeat = document.getElementById('popup-seat').value;
    const updatedDate = document.getElementById('popup-date').value;
    const updatedStart = document.getElementById('popup-StartTime').value;
    const updatedEnd = document.getElementById('popup-EndTime').value;

    const seatAvailable = await isSeatAvailable(updatedLab, updatedSeat, updatedDate);
    if (!seatAvailable) {
        alert('This seat is already reserved for the selected date and time. Please choose another seat or time.');
        return; 
    }
    const updatedReservationDetails = {
        lab_id: updatedLab,
        lab_name: updatedLab,
        seat_number: updatedSeat,
        reserve_date: updatedDate,
        reserve_time: updatedStart + " - " + updatedEnd
    };
    fetch(`/reservations/update/${decrementedId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedReservationDetails)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Reservation updated successfully');

            const reservedSeatDetails = {
                lab_id: updatedLab,
                seat_number: updatedSeat,
                reserve_date: updatedDate,
                reserve_time: updatedStart + " - " + updatedEnd
            };

            return fetch(`/reservedseats/updateByReservationId/${decrementedId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservedSeatDetails)
            });
        } else {
            throw new Error('Failed to update reservation');
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Reserved seat updated successfully');
            closeEditProfilePopup();
            window.location.reload();
     
        } else {
            console.error('Failed to update reserved seat');
        }
    })
    .catch(error => {
        console.error('Error updating reservation or reserved seat:', error);
    });
}  */

async function submitEdit(event) {
    event.preventDefault();
    const originalId = currentEditingReservation._id;
    const decrementedId = decrementLastHexChar(originalId);
    const updatedLab = document.getElementById('popup-lab').value;
    const updatedSeat = document.getElementById('popup-seat').value;
    const updatedDate = document.getElementById('popup-date').value;
    const updatedStart = document.getElementById('popup-StartTime').value;
    const updatedEnd = document.getElementById('popup-EndTime').value;

    try {
        const seatAvailable = await isSeatAvailable(updatedLab, updatedSeat, updatedDate);
        if (!seatAvailable) {
            alert('This seat is already reserved for the selected date and time. Please choose another seat or time.');
            return;
        }

        const seatValid = await isSeatNumberValid(updatedLab, updatedSeat);
        if (!seatValid) {
            alert('Invalid seat number. Please choose a valid seat.');
            return;
        }

        const updatedReservationDetails = {
            lab_id: updatedLab,
            lab_name: updatedLab,
            seat_number: updatedSeat,
            reserve_date: updatedDate,
            reserve_time: updatedStart + " - " + updatedEnd
        };

        const reservationResponse = await fetch(`/reservations/update/${decrementedId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedReservationDetails)
        });

        const reservationData = await reservationResponse.json();

        if (reservationData.success) {
            console.log('Reservation updated successfully');

            const reservedSeatDetails = {
                lab_id: updatedLab,
                seat_number: updatedSeat,
                reserve_date: updatedDate,
                reserve_time: updatedStart + " - " + updatedEnd
            };

            const reservedSeatResponse = await fetch(`/reservedseats/updateByReservationId/${decrementedId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservedSeatDetails)
            });

            const reservedSeatData = await reservedSeatResponse.json();

            if (reservedSeatData.success) {
                console.log('Reserved seat updated successfully');
                closeEditProfilePopup();
                window.location.reload();
            } else {
                console.error('Failed to update reserved seat');
            }
        } else {
            throw new Error('Failed to update reservation');
        }
    } catch (error) {
        console.error('Error updating reservation or reserved seat:', error);
    }
}


function closeEditProfilePopup() {
    popup.style.display = "none";
}
function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ' ' + amPm;
}

function fillTimeOptions() {
    const startTimeSelect = document.getElementById('popup-StartTime');
    const endTimeSelect = document.getElementById('popup-EndTime');
    startTimeSelect.innerHTML = ''; 
    endTimeSelect.innerHTML = ''; 
    let start = new Date(0, 0, 0, 6, 0, 0); 
    const end = new Date(0, 0, 0, 16, 0, 0); 

    while(start <= end) {
        let timeText = formatTime(start);
        startTimeSelect.options.add(new Option(timeText, timeText));
        endTimeSelect.options.add(new Option(timeText, timeText));
        start = new Date(start.getTime() + 30 * 60000); 
    }
}
function setInitialEndTime() {
    const startTimeSelect = document.getElementById('popup-StartTime');
    const endTimeSelect = document.getElementById('popup-EndTime');
    if(startTimeSelect.selectedIndex < 0) {
        startTimeSelect.selectedIndex = 0
    }
    const selectedStartTimeText = startTimeSelect.options[startTimeSelect.selectedIndex].text;
    const startTime = new Date(0, 0, 0, parseInt(selectedStartTimeText.split(':')[0]), parseInt(selectedStartTimeText.split(':')[1].split(' ')[0]));
    const endTime = new Date(startTime.getTime() + 30 * 60000); 

    const formattedEndTime = formatTime(endTime);
    for (let i = 0; i < endTimeSelect.options.length; i++) {
        if (endTimeSelect.options[i].text === formattedEndTime) {
            endTimeSelect.selectedIndex = i;
            break;
        }
    }
}
function updateEndTimeOptions() {
    const startTimeSelect = document.getElementById('popup-StartTime');
    const endTimeSelect = document.getElementById('popup-EndTime');
    const selectedTime = startTimeSelect.value;
    const startTimeIndex = startTimeSelect.selectedIndex;
    while(endTimeSelect.options.length > 0) {
        endTimeSelect.remove(0);
    }
    for(let i = startTimeIndex + 1; i < startTimeSelect.options.length; i++) {
        const optionValue = startTimeSelect.options[i].value;
        const optionText = startTimeSelect.options[i].text;
        endTimeSelect.options.add(new Option(optionText, optionValue));
    }
}

async function fetchLabs() {
    try {
        const response = await fetch('/labs/names/labNames');
        const labNames = await response.json();
        const labSelect = document.getElementById('popup-lab');
        labNames.forEach(lab => {
            const option = document.createElement('option');
            option.value = lab.lab_name;
            option.textContent = lab.lab_name; 
            labSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to fetch lab names:', error);
    }
}

fillTimeOptions();
setInitialEndTime();
document.getElementById('popup-StartTime').addEventListener('change', updateEndTimeOptions);


