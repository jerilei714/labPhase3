fetchLabs()

function formatDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    return year + '-' + month + '-' + day; 
}
document.getElementById('date').value = formatDate(new Date());
async function fetchLabs() {
    try {
        const response = await fetch('/labs/names/labNames');
        const labNames = await response.json();
        const labSelect = document.getElementById('lab');
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
    const startTimeSelect = document.getElementById('StartTime');
    const endTimeSelect = document.getElementById('EndTime');
    let start = new Date(0, 0, 0, 7, 0, 0);
    const end = new Date(0, 0, 0, 17, 0, 0);
    const interval = 30;

    while(start <= end) {
        const optionText = formatTime(start);
        startTimeSelect.options.add(new Option(optionText, optionText));
        endTimeSelect.options.add(new Option(optionText, optionText));
        start = new Date(start.getTime() + interval * 60000);
    }
}
function setInitialEndTime() {
    const startTimeSelect = document.getElementById('StartTime');
    const endTimeSelect = document.getElementById('EndTime');
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
    const startTimeSelect = document.getElementById('StartTime');
    const endTimeSelect = document.getElementById('EndTime');
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

fillTimeOptions();
setInitialEndTime();
document.getElementById('StartTime').addEventListener('change', updateEndTimeOptions);