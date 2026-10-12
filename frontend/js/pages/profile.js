// Profile Page
function renderProfile() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <div class="card" style="max-width: 600px; margin: 40px auto;">
                    <h2>My Profile</h2>
                    <div id="profileAlert"></div>
                    
                    <div id="profileContent">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Loading profile...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadProfileData();
}

async function loadProfileData() {
    try {
        const user = await API.getProfile();
        renderProfileForm(user);
    } catch (error) {
        showAlert('profileAlert', error.message, 'error');
    }
}

function renderProfileForm(user) {
    const content = document.getElementById('profileContent');
    
    content.innerHTML = `
        <form id="profileForm">
            <div class="form-group">
                <label for="profUsername">Username</label>
                <input type="text" id="profUsername" value="${user.username || ''}" placeholder="Username">
            </div>

            <div class="form-group">
                <label for="profEmail">Email</label>
                <input type="email" id="profEmail" value="${user.email || ''}" placeholder="Email">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">Save Changes</button>
        </form>

        <div style="border-top: 1px solid var(--border-color); padding-top: 25px; margin-top: 25px;">
            <h3>Security</h3>
            <button type="button" class="btn btn-secondary" id="changePasswordBtn">Change Password</button>
        </div>
    `;

    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const profileData = {
            username: document.getElementById('profUsername').value,
            email: document.getElementById('profEmail').value
        };

        try {
            await API.updateProfile(profileData);
            showAlert('profileAlert', 'Profile updated successfully!', 'success');
            currentUser = await API.getProfile();
            updateUI();
        } catch (error) {
            showAlert('profileAlert', error.message, 'error');
        }
    });

    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        renderChangePasswordModal();
    });
}

function renderChangePasswordModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2>Change Password</h2>
        <div id="passwordAlert"></div>
        <form id="passwordForm">
            <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" required placeholder="Enter current password">
            </div>

            <div class="form-group">
                <label for="newPassword">New Password</label>
                <input type="password" id="newPassword" required placeholder="Enter new password">
            </div>

            <div class="form-group">
                <label for="confirmNewPassword">Confirm New Password</label>
                <input type="password" id="confirmNewPassword" required placeholder="Confirm new password">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">Change Password</button>
        </form>
    `;

    modal.style.display = 'flex';

    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmPassword) {
            showAlert('passwordAlert', 'New passwords do not match', 'error');
            return;
        }

        try {
            await API.changePassword(currentPassword, newPassword);
            showAlert('passwordAlert', 'Password changed successfully!', 'success');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 1500);
        } catch (error) {
            showAlert('passwordAlert', error.message, 'error');
        }
    });
}
