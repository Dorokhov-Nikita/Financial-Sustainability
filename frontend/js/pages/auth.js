// Authentication Pages
function renderRegister() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <div class="card" style="max-width: 500px; margin: 40px auto;">
                    <h2>Create Your Account</h2>
                    <div id="registerAlert"></div>
                    
                    <form id="registerForm">
                        <div class="form-group">
                            <label for="regUsername">Username</label>
                            <input type="text" id="regUsername" name="username" required placeholder="Enter username">
                        </div>

                        <div class="form-group">
                            <label for="regEmail">Email</label>
                            <input type="email" id="regEmail" name="email" required placeholder="Enter email">
                        </div>

                        <div class="form-group">
                            <label for="regPassword">Password</label>
                            <input type="password" id="regPassword" name="password" required placeholder="Enter password">
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirm password">
                        </div>

                        <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
                    </form>

                    <p style="text-align: center; margin-top: 20px; color: var(--text-light);">
                        Already have an account? <a href="#" onclick="navigateTo('login')" style="color: var(--primary-color); text-decoration: none; font-weight: 600;">Login</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showAlert('registerAlert', 'Passwords do not match', 'error');
            return;
        }

        try {
            const result = await API.register(username, email, password);
            showAlert('registerAlert', 'Registration successful!', 'success');
            currentUser = result.user;
            updateUI();
            setTimeout(() => navigateTo('home'), 1000);
        } catch (error) {
            showAlert('registerAlert', error.message, 'error');
        }
    });
}

function renderLogin() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <div class="card" style="max-width: 400px; margin: 80px auto;">
                    <h2>Sign In</h2>
                    <div id="loginAlert"></div>
                    
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginUsername">Username</label>
                            <input type="text" id="loginUsername" name="username" required placeholder="Enter username">
                        </div>

                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" name="password" required placeholder="Enter password">
                        </div>

                        <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
                    </form>

                    <p style="text-align: center; margin-top: 20px; color: var(--text-light);">
                        Don't have an account? <a href="#" onclick="navigateTo('register')" style="color: var(--primary-color); text-decoration: none; font-weight: 600;">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const result = await API.login(username, password);
            showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                currentUser = result.user;
                updateUI();
                navigateTo('home');
            }, 1000);
        } catch (error) {
            showAlert('loginAlert', error.message, 'error');
        }
    });
}

