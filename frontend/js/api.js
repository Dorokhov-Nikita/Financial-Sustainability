// API Configuration and Methods
const API_BASE_URL = 'http://localhost:5000/api';

class API {
    
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    static register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
    }

    static login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    static logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    static checkAuth() {
        return this.request('/auth/check');
    }

    static getCurrentUser() {
        return this.request('/auth/me');
    }

    // Profile endpoints
    static getProfile() {
        return this.request('/profile/');
    }

    static updateProfile(data) {
        return this.request('/profile/', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static changePassword(currentPassword, newPassword) {
        return this.request('/profile/change-password', {
            method: 'POST',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
    }

    // Assessment endpoints
    static analyzeAssessment(modelType, features) {
        return this.request('/assessment/analyze', {
            method: 'POST',
            body: JSON.stringify({
                model_type: modelType,
                features: features
            })
        });
    }

    static getAssessmentHistory() {
        return this.request('/assessment/history');
    }

    static getAssessment(id) {
        return this.request(`/assessment/${id}`);
    }

    static getFeatures() {
        return this.request('/assessment/features');
    }

    static getAssessments() {
        return this.request('/assessment/history').then(data => data.assessments || []);
    }

    static getDashboard() {
        return this.request('/assessment/dashboard');
    }
}
