function submitEditProfile(event) {
    event.preventDefault();
    const authorizedUsername = localStorage.getItem('authorizedUsername');
    const updatedUserData = {
        name: document.getElementById('edit-name').value,
        username: document.getElementById('edit-username').value,
        email: document.getElementById('edit-email').value,
        course: document.getElementById('edit-course').value,
        accountType: document.getElementById('edit-accountType').value,
        description: document.getElementById('edit-description').value, 
        password: document.getElementById('edit-password').value,
        oldPassword: document.getElementById('edit-old-password').value
    };

    fetch(`/users/${authorizedUsername}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUserData)
    })
    .then(response => {
        if (response.ok) {
            console.log('User updated successfully');
            alert('You need to sign back for the changes to take effect. :)');
            logout();
        } else if (response.status === 401) {
            alert('Old password is incorrect');
        } else {
            console.error('Error updating user:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error updating user:', error);
    });

    closeEditProfilePopup();
}

function openEditProfilePopup() {
    document.getElementById('edit-profile-popup').style.display = 'block';

    document.getElementById('select_img').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
}

function closeEditProfilePopup() {
    document.getElementById('edit-profile-popup').style.display = 'none';
}

function populateEditForm(userData) {
    document.getElementById('edit-name').value = userData.name;
    document.getElementById('edit-username').value = userData.username;
    document.getElementById('edit-email').value = userData.email;
    document.getElementById('edit-course').value = userData.course;
    document.getElementById('edit-accountType').value = userData.accountType;
    document.getElementById('edit-description').value = userData.description;
    ddocument.getElementById('edit-password').value = userData.password;
}

function loadUserProfile() {
    const authorizedUsername = localStorage.getItem('authorizedUsername');
    fetch(`/users/${authorizedUsername}`)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch user data');
        }
    })
    .then(userData => {
        populateEditForm(userData);
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
    });
}

function updateProfilePicture(base64String) {
    const authorizedUsername = localStorage.getItem('authorizedUsername');
    fetch(`/users/${authorizedUsername}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profilePic: base64String })
    })
    .then(response => {
        if (response.ok) {
            console.log('Profile picture updated successfully');
            window.location.reload();
        } else {
            console.error('Error updating profile picture:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error updating profile picture:', error);
    });
}

document.getElementById('select_img').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});


document.getElementById('fileInput').onchange = function(event) {
    const [file] = event.target.files;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64String = e.target.result;
            document.getElementById('pfpSelf').src = base64String;
            currentProfilePictureBase64 = base64String; 
            updateProfilePicture(base64String)
        };
        reader.readAsDataURL(file);
    }
};

function checkEditParameter() {
    const edit = new URLSearchParams(window.location.search).get('edit');
    if (edit === 'true') {
        openEditProfilePopup();
    }
}


function checkLogoutParameter() {
    const logout1 = new URLSearchParams(window.location.search).get('logout');
    if (logout1 === 'true') {
        logout();
    }
}

function logout() {
    const cookies = document.cookie.split(';');
    goToHomePage(); 
    fetch('/logout')
    .then(response => {
      if(response.ok) {
        console.log("Logged out successfully");
        localStorage.clear();
      }
    })
    .catch(error => console.error('Logout failed', error));
    localStorage.clear()
    goToHomePage();
}


document.addEventListener('DOMContentLoaded', () => {
    checkEditParameter();
    loadUserProfile();
    checkLogoutParameter();
});