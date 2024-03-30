document.addEventListener('DOMContentLoaded', async function () {
    let selectedSeat = null;
    let currentLab = null;
    let defaultTotalSeats = 40;


    async function viewAvailability() {
        try {
            currentLab = document.getElementById('lab').value;
            const selectedDate = document.getElementById('date').value;


            const response = await fetch(`/seats/available/${currentLab}?date=${encodeURIComponent(selectedDate)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch available seats');
            }
            const availableSeatCount = await response.json();
            const availabilityResults = document.getElementById('availability-results');
            availabilityResults.innerHTML = `<h3>${currentLab} Availability</h3><p class="Available">Available Seats: <span class = "seatCount">${availableSeatCount}</span></p>`;
            availabilityResults.style.display = 'block';
            const seatContainer = document.createElement('div');
            seatContainer.classList.add('seat-container');
            const labInfoResponse = await fetch(`/labs/name/${encodeURIComponent(currentLab)}`);
            if (!labInfoResponse.ok) {
                throw new Error('Failed to fetch lab info');
            }
            const labInfo = await labInfoResponse.json();
            defaultTotalSeats = labInfo.total_seats;
            await generateSeats(seatContainer, defaultTotalSeats, currentLab, selectedDate);
            availabilityResults.appendChild(seatContainer);


            const reservedSeatsResponse = await fetch(`/reservedseats/lab/${currentLab}?date=${selectedDate}`);
            const reservedSeatsData = await reservedSeatsResponse.json();


            reservedSeatsData.forEach(reservation => {
                const seat = document.querySelector(`.seat:nth-child(${String(reservation.seat_number)})`);
                if (seat) {
                    seat.classList.add('selected');
                } else {
                    console.log('Seat not found for reservation:', reservation);
                }
            });
        } catch (error) {
            console.error('Error fetching available seats:', error);
        }
    }


    async function generateSeats(seatContainer, seatCount, labId, selectedDate) {
        seatContainer.innerHTML = '';


        try {
            const reservedSeatsResponse = await fetch(`/reservedseats/lab/${labId}?date=${selectedDate}`);
            const reservedSeatsData = await reservedSeatsResponse.json();


            const currentTime = new Date();


            for (let i = 1; i <= seatCount; i++) {
                const seat = document.createElement('div');
                seat.classList.add('seat');


                const reservation = reservedSeatsData.find(seat => seat.seat_number === i);
                if (reservation) {
                    const reservationTime = new Date(reservation.time_reserved);
                    if (reservationTime < currentTime) {
                        await releaseReservation(reservation._id);
                    } else {
                        seat.classList.add('reserved');
                        seat.dataset.reservationId = reservation._id; // Store reservation ID as a dataset attribute
                        seat.addEventListener('click', function () {
                            showReservedPopup(reservation);
                        });
                    }
                } else {
                    seat.addEventListener('click', function () {
                        showPopup(seat);
                    });
                }


                seat.innerText = i;
                seatContainer.appendChild(seat);
            }
        } catch (error) {
            console.error('Error fetching reserved seats data:', error);
        }
    }


    async function releaseReservation(reservationId) {
        try {
            const response = await fetch(`/reservedseats/${reservationId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                console.error('Failed to release reservation');
            }
        } catch (error) {
            console.error('Error releasing reservation:', error);
        }
    }


    function showPopup(seat) {
        if (!seat.classList.contains('reserved')) {
            const date = document.getElementById('date').value;
            const startTime = document.getElementById('StartTime').value;
            const endTime = document.getElementById('EndTime').value;

            selectedSeat = seat;

            const popup = document.querySelector('.popup-contents');
            document.querySelector('#popup-date').innerHTML = date;
            const authorizedUsername = sessionStorage.getItem('authorizedUsername');
            fetch(`/users/${authorizedUsername}`)
                .then(response => response.json())
                .then(user => {
                    document.querySelector('#userName').innerHTML = user.username;
                    const userNameElement = document.querySelector('#userName');
                    userNameElement.addEventListener('click', function () {
                        window.location.href = `viewProfile?username=${encodeURIComponent(user.username)}`;
                    });
                });
            document.querySelector('#popup-time').textContent = startTime + " - " + endTime;
            document.querySelector('.seatNumber').innerHTML = seat.innerText;
            document.querySelector('#date-reserved').innerHTML = new Date().toLocaleDateString('en-GB').split('/').join('-');
            popup.style.display = 'flex';
        }
    }


    function showReservedPopup(reservation) {
        const selectedDate = document.getElementById('date').value;
        const reservationDate = reservation.reserve_date;
        const selectedLab = document.getElementById('lab').value;


        if (selectedDate === reservationDate && selectedLab === currentLab) {
            const popup = document.querySelector('.popup-details-dialog');
            document.querySelector('#popup-date-details').textContent = reservationDate;
            document.querySelector('#popup-time-details').textContent = reservation.reserve_time;
            document.querySelector('.seatNumber').textContent = reservation.seat_number;
            document.querySelector('#userName-details').textContent = reservation.username;
            document.querySelector('#date-reserved-details').textContent = new Date(reservation.tnd_requested).toLocaleDateString('en-GB').split('/').join('-');
            popup.showModal();
        } else {
            console.log('Selected date does not match reservation date or lab does not match.');
        }
    }

    window.reserve = async function () {
        const currentLab = document.getElementById('lab').value;
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('StartTime').value;
        const endTime = document.getElementById('EndTime').value;
        const seatNumber = parseInt(selectedSeat.innerText, 10);
        const isAnonymous = document.getElementById('reserveAnon').checked;


        try {
            const response = await fetch(`/users/${sessionStorage.getItem('authorizedUsername')}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const user = await response.json();
            const labName = document.getElementById('lab').options[document.getElementById('lab').selectedIndex].text;
            const reservationData = {
                lab_id: currentLab,
                lab_name: labName,
                user_id: user._id,
                seat_number: seatNumber,
                username: user.username,
                reserve_date: date,
                reserve_time: startTime + " - " + endTime,
                tnd_requested: new Date().toISOString(),
                anonymous: isAnonymous
            };
            const reservationResponse = await fetch('/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });
            if (!reservationResponse.ok) {
                throw new Error('Failed to make reservation');
            }
            console.log('Reservation successful');
            document.getElementById('reserveAnon').checked = false;
            document.querySelector('.seatCount').innerHTML = Number(document.querySelector('.seatCount').innerHTML) - 1;
            hideIt();
            selectedSeat.classList.add('selected');
            selectedSeat.removeEventListener('click', showPopup);

            const selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats')) || [];
            selectedSeats.push(selectedSeat.innerText);
            sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
        } catch (error) {
            console.error('Error making reservation:', error);
            alert('Error: Could not make reservation');
        }
    };


    function hidePopup() {
        const popup2 = document.querySelector('.popup-details-dialog');
        popup2.close();
        initializeSeatEventListeners();
    }


    window.hideIt = function () {
        const popup = document.querySelector('.popup-contents');
        popup.style.display = 'none';
    };


    document.getElementById('buttonForAvailibility').addEventListener('submit', function (event) {
        event.preventDefault();
        viewAvailability();
    });


    window.hideDetailsDialog = function () {
        hidePopup();
    };


    initializeSeatEventListeners();
});
