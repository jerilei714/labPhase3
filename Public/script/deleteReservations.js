document.addEventListener('DOMContentLoaded', function () {
    let selectedSeat = null;
    let currentLab = null;
    let defaultTotalSeats = 40;
    let date = document.getElementById('date').value;
    let startTime = document.getElementById('StartTime').value;
    let endTime = document.getElementById('EndTime').value;
     const authorizedUsername = localStorage.getItem('authorizedUsername');
    function deleteReservation(reservationId, seat) {
        fetch(`/reservations/${reservationId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete reservation');
                }
                return response.json();
            })
            .then(data => {
                console.log('Reservation deleted successfully:', data);
                if (seat) {
                    seat.classList.remove('selected');
                }
                hidePopup();
            })
            .catch(error => {
                console.error('Error deleting reservation:', error);
            });
    }
    
    function generateSeats(seatContainer, seatCount) {
        seatContainer.innerHTML = '';
        for (let i = 1; i <= seatCount; i++) {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            seat.innerText = i;
            seat.addEventListener('click', function () {
                showPopup(seat);
            });
            seatContainer.appendChild(seat);
        }
    }

    async function viewAvailability() {
        try {
            currentLab = document.getElementById('lab').value;
            const selectedDate = document.getElementById('date').value;
            let startTime = document.getElementById('StartTime').value;
            let endTime = document.getElementById('EndTime').value;
            let reservationStartDateTime = new Date(`${selectedDate} ${startTime}`);
            reservationStartDateTime.setMinutes(reservationStartDateTime.getMinutes() + 10);
            let currentTime = new Date();
            if (currentTime >= reservationStartDateTime) {
                const response = await fetch(`/seats/available/${currentLab}?date=${encodeURIComponent(selectedDate)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch available seats');
                }
                const availableSeatCount = await response.json();
                const availabilityResults = document.getElementById('availability-results');
                availabilityResults.innerHTML = `<h3>${currentLab} Availability</h3><p class="Available">Available Seats: ${availableSeatCount}</p>`;
                availabilityResults.style.display = 'block';
                const seatContainer = document.createElement('div');
                seatContainer.classList.add('seat-container');
                const labInfoResponse = await fetch(`/labs/name/${encodeURIComponent(currentLab)}`);
                if (!labInfoResponse.ok) {
                    throw new Error('Failed to fetch lab info');
                }
                const labInfo = await labInfoResponse.json();
                defaultTotalSeats = labInfo.total_seats;
                await generateSeats(seatContainer, defaultTotalSeats);
                availabilityResults.appendChild(seatContainer);
                const reservedSeatsResponse = await fetch(`/reservedseats/lab/${currentLab}?date=${selectedDate}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`);
                if (!reservedSeatsResponse.ok) {
                    throw new Error('Failed to fetch reserved seats');
                }
                const reservedSeatsData = await reservedSeatsResponse.json();
        
                reservedSeatsData.forEach(reservation => {
                    const seat = seatContainer.querySelector(`.seat:nth-child(${reservation.seat_number})`);
                    if (seat) {
                        seat.classList.add('selected');
                        seat.dataset.reservationId = reservation.reservation_id;
                    }
                });
            } else {
                const availabilityResults = document.getElementById('availability-results');
                availabilityResults.innerHTML = `<p>You can only delete reservations 10 minutes past their start time.</p>`;
                availabilityResults.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching available seats:', error);
        }
    }    

    function showPopup(seat) {
    const popup = document.querySelector('.popup-contents');
    const reservationId = seat.dataset.reservationId;
    const decrementedId = reservationId;

    if (!reservationId) {
        console.log("This seat is unreserved. You can only delete reserved seats.");
    }

    fetch(`/reservations/${decrementedId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch reservation details');
            }
            return response.json();
        })
        .then(reservation => {
            document.querySelector('#popup-date').innerHTML = reservation.reserve_date;
            document.querySelector('#popup-time').textContent = reservation.reserve_time;
            document.querySelector('#userName').innerHTML = reservation.username;
            document.querySelector('.seatNumber').innerHTML = seat.innerText;
            document.querySelector('#date-reserved').innerHTML = new Date(reservation.tnd_requested).toLocaleDateString('en-GB').split('/').join(' - ');
            const deleteButton = document.getElementById('deleteButton');
            deleteButton.dataset.reservationId = decrementedId;
            deleteButton.onclick = () => {
                deleteReservation(decrementedId, seat);
            };
            const userNameElement = document.querySelector('#userName');
            const anchorElement = document.createElement('a');
            anchorElement.id = "userName"
            anchorElement.innerHTML = reservation.username;
            if (reservation.username != "Anonymous") {
                anchorElement.classList.add("userName")
                anchorElement.href = `viewProfile?username=${encodeURIComponent(reservation.username)}`
            } else {
                userNameElement.classList.remove("userName")
            }
            popup.style.display = 'flex';
            userNameElement.parentNode.replaceChild(anchorElement, userNameElement)
        })
        .catch(error => {
            console.error('Error fetching reservation details:', error);
        });
    }
    

    function hidePopup() {
        const popup = document.querySelector('.popup-contents');
        popup.style.display = 'none';
    }

    document.getElementById('buttonForAvailibility').addEventListener('submit', function (event) {
        event.preventDefault();
        viewAvailability();
    });

    window.hideIt = function () {
        hidePopup();
    };
});
