function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Get registered users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user with matching username
    const user = users.find(u => u.username === username);
    
    if (!user) {
        alert('User not found. Please register first.');
        return false;
    }

    // In a real app, you would hash the password before comparing
    if (user.password !== password) {
        alert('Incorrect password.');
        return false;
    }

    // Login successful
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'index.html';
    return false;
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    // Create new user object with password included
    const newUser = {
        username,
        email,
        password, // In a real app, this should be hashed
        id: Date.now(),
        created: new Date()
    };

    // Store user data
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if username already exists
    if (users.some(user => user.username === username)) {
        alert('Username already exists!');
        return false;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login after registration
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    window.location.href = 'index.html';
    return false;
}

// Modify the checkAuth function to allow access to register page
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const isAuthPage = window.location.href.includes('login.html') || 
                      window.location.href.includes('register.html');
    
    if (!currentUser && !isAuthPage) {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Add password strength checker
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', () => {
            const strength = checkPasswordStrength(passwordInput.value);
            strengthIndicator.className = 'password-strength ' + strength.className;
            strengthIndicator.textContent = 'Password Strength: ' + strength.text;
        });
    }
});

function checkPasswordStrength(password) {
    const strength = {
        0: { text: 'Very Weak', className: 'very-weak' },
        1: { text: 'Weak', className: 'weak' },
        2: { text: 'Medium', className: 'medium' },
        3: { text: 'Strong', className: 'strong' },
        4: { text: 'Very Strong', className: 'very-strong' }
    };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
    if (password.match(/\d/)) score++;
    if (password.match(/[^a-zA-Z\d]/)) score++;

    return strength[score];
}

// Add authentication check to all pages except login
if (!window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
    checkAuth();
}
