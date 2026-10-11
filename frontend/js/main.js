// Main Application Logic
let currentUser = null;
let currentPage = 'home';

// Pages available to authenticated users
const authenticatedPages = ['profile', 'reference', 'assessment', 'result'];
const publicPages = ['home', 'login', 'register'];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await checkAuthentication();
});

async function checkAuthentication() {
    try {
        const authCheck = await API.checkAuth();
        if (authCheck.authenticated) {
            currentUser = await API.getCurrentUser();
            updateUI();
            navigateTo('home');
        } else {
            updateUI();
            navigateTo('login');
        }
    } catch (error) {
        console.log('Not authenticated');
        updateUI();
        navigateTo('login');
    }
}

function setupEventListeners() {
    // Close modal when clicking X
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function updateUI() {
    const nav = document.getElementById('nav');
    const usernameEl = document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn');

    nav.innerHTML = '';

    if (currentUser) {
        // Show navigation for authenticated users
        const pages = [
            { name: 'Home', id: 'home' },
            { name: 'Assessment', id: 'assessment' },
            { name: 'Reference', id: 'reference' }
        ];

        pages.forEach(page => {
            const link = document.createElement('a');
            link.textContent = page.name;
            link.className = currentPage === page.id ? 'active' : '';
            link.onclick = () => navigateTo(page.id);
            nav.appendChild(link);
        });

        usernameEl.textContent = `Welcome, ${currentUser.username}`;
        logoutBtn.style.display = 'inline-block';
    } else {
        // Show navigation for non-authenticated users
        const pages = [
            { name: 'Home', id: 'home' },
            { name: 'Login', id: 'login' },
            { name: 'Register', id: 'register' }
        ];

        pages.forEach(page => {
            const link = document.createElement('a');
            link.textContent = page.name;
            link.className = currentPage === page.id ? 'active' : '';
            link.onclick = () => navigateTo(page.id);
            nav.appendChild(link);
        });

        usernameEl.textContent = '';
        logoutBtn.style.display = 'none';
    }
}

function navigateTo(page, param = null) {
    // Check authentication
    if (authenticatedPages.includes(page) && !currentUser) {
        navigateTo('login');
        return;
    }

    currentPage = page;
    updateUI();

    // Remove active state from all nav links and set active for current
    document.querySelectorAll('.nav a').forEach(link => {
        link.classList.remove('active');
    });

    switch (page) {
        case 'home':
            renderHome();
            break;
        case 'login':
            renderLogin();
            break;
        case 'register':
            renderRegister();
            break;
        case 'profile':
            renderProfile();
            break;
        case 'assessment':
            renderAssessment();
            break;
        case 'result':
            renderResult(param);
            break;
        case 'reference':
            renderReference();
            break;
        default:
            renderHome();
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

async function logout() {
    try {
        await API.logout();
        currentUser = null;
        currentPage = 'home';
        updateUI();
        navigateTo('login');
        showAlert('', 'Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function showAlert(elementId, message, type = 'info') {
    const alertElement = document.getElementById(elementId);
    if (!alertElement) {
        console.error(`Alert element ${elementId} not found`);
        return;
    }

    const alertClasses = {
        'success': 'alert-success',
        'error': 'alert-error',
        'warning': 'alert-warning',
        'info': 'alert-info'
    };

    const alertClass = alertClasses[type] || alertClasses['info'];
    alertElement.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertElement.innerHTML = '';
    }, 5000);
}

// Export functions for use in other modules
window.navigateTo = navigateTo;
window.showAlert = showAlert;
