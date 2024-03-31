document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const studentUsername = urlParams.get('studentUsername');
    let selectedSeat = null;
    let currentLab = null;
    let defaultTotalSeats = 40; 
    const authorizedUsername = sessionStorage.getItem('authorizedUsername');

    async function generateSeats(seatContainer, seatCount, labId) {
        seatContainer.innerHTML = '';
        try {
            const selectedDate = document.getElementById('date').value; 
            let startTime = document.getElementById('StartTime').value;
            let endTime = document.getElementById('EndTime').value;
            const reservedSeatsResponse = await fetch(`/reservedseats/lab/${labId}?date=${selectedDate}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`);
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
    

    async function viewAvailability() {
        try {
            currentLab = document.getElementById('lab').value;
            const selectedDate = document.getElementById('date').value; 

            let startTime = document.getElementById('StartTime').value;
            let endTime = document.getElementById('EndTime').value;
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
            await generateSeats(seatContainer, defaultTotalSeats);
            availabilityResults.appendChild(seatContainer);
            const reservedSeatsResponse = await fetch(`/reservedseats/lab/${currentLab}?date=${selectedDate}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`);
            const reservedSeatsData = await reservedSeatsResponse.json();
            reservedSeatsData.forEach(reservation => {
                const seat = seatContainer.querySelector(`.seat:nth-child(${reservation.seat_number})`);
                if (seat) {
                    seat.classList.add('selected');
                    seat.dataset.reservationId = reservation.reservation_id;
                    seat.addEventListener('click', function () {
                        showDefPopup(seat); 
                    });
                }
            });
        } catch (error) {
            console.error('Error fetching available seats:', error);
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

    window.reserve = async function () {
        const currentLab = document.getElementById('lab').value;
        const date = document.getElementById('date').value;
        const StartTime = document.getElementById('StartTime').value;
        const EndTime = document.getElementById('EndTime').value;
        const seatNumber = parseInt(selectedSeat.innerText, 10);
        const studentUsername = urlParams.get('studentUsername');
        const isAnonymous = document.getElementById('reserveAnon').checked; 
    
        try {
            const response = await fetch(`/users/${studentUsername}`);
            if (!response.ok) {
                throw new Error('Failed to fetch student data');
            }
            const student = await response.json();
    
            const labName = document.getElementById('lab').options[document.getElementById('lab').selectedIndex].text;
            const reservationData = {
                lab_id: currentLab,
                lab_name: labName,
                user_id: student._id,
                seat_number: seatNumber,
                username: student.username,
                reserve_date: date,
                reserve_time: StartTime + " - " + EndTime,
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
            hideIt()
            document.getElementById('reserveAnon').checked = false;
            document.querySelector('.seatCount').innerHTML = Number(document.querySelector('.seatCount').innerHTML)-1
            console.log('Reservation successful');
            selectedSeat.classList.add('selected');
            selectedSeat.removeEventListener('click', showPopup);
            viewAvailability()
            const selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats')) || [];
            selectedSeats.push(selectedSeat.innerText);
            sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
        } catch (error) {
            console.error('Error making reservation:', error);
            alert('Error: Could not make reservation');
        }
    };    
    
    
    function showPopup(seat) {
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('StartTime').value;
        const endTime = document.getElementById('EndTime').value;
        if (!seat.classList.contains('selected')) {
            selectedSeat = seat;
            const popup = document.querySelector('.popup-contents'); 
            document.querySelector('#popup-date').textContent = date; 
            fetch(`/users/${studentUsername}`)
                .then(response => response.json())
                .then(user => {
                    document.getElementById('userNamep').innerHTML = studentUsername
                    document.querySelector('#popup-time').textContent = `${startTime} - ${endTime}`; 
                    document.querySelector('.seatNumber').textContent = seat.textContent; 
                    document.querySelector('#date-reserved').textContent = new Date().toLocaleDateString('en-GB').split('/').join('-');
                    popup.style.display = 'flex';
                });
        }
    }

    function showDefPopup(seat) {
        const popup = document.querySelector('#popup-contentsView');
        const reservationId = seat.dataset.reservationId;
        fetch(`/reservations/${reservationId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch reservation details');
                }
                return response.json();
            })
            .then(reservation => {
                document.querySelector('#popup-dateView').innerHTML = reservation.reserve_date;
                document.querySelector('#popup-timeView').textContent = reservation.reserve_time;
                document.querySelector('.seatNumberView').innerHTML = seat.innerText;
                document.querySelector('#date-reservedView').innerHTML = new Date(reservation.tnd_requested).toLocaleDateString('en-GB').split('/').join(' - ');

                const userNameElement = document.querySelector('#userNameView');
                const anchorElement = document.createElement('a');
                anchorElement.id = "userNameView"
                anchorElement.innerHTML = reservation.username;
                if(reservation.username !="Anonymous"){
                    anchorElement.classList.add("userName")
                    anchorElement.href = `viewProfile?username=${encodeURIComponent(reservation.username)}`
                } else{
                    userNameElement.classList.remove("userName")
                }
                popup.style.display = 'flex';
                userNameElement.parentNode.replaceChild(anchorElement, userNameElement);
            })
            .catch(error => {
                console.error('Error fetching reservation details:', error);
            });
    }

    document.getElementById('buttonForAvailibility').addEventListener('submit', function(event) {
        event.preventDefault();
        viewAvailability();
    });

    window.hideIt = function () {
        let popup = document.querySelector('.popup-contents');
        popup.style.display = 'none';
        popup = document.getElementById('popup-contentsView');
        popup.style.display = 'none';
    };
});

