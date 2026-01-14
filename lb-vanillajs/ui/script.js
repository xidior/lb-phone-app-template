function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    // Show the requested page
    document.getElementById(pageId).classList.add('active');
}

function signUp(role) {
    localStorage.setItem('ubby_role', role);
    // Tell FiveM server the role
    fetchNui('setRole', { role: role });
    
    // Redirect to the correct dashboard
    if (role === 'driver') {
        navigateTo('driver-page');
    } else {
        navigateTo('passenger-page');
    }
}

// Auto-login if role is already saved
window.addEventListener('load', () => {
    const savedRole = localStorage.getItem('ubby_role');
    if (savedRole) {
        if (savedRole === 'driver') {
            navigateTo('driver-page');
        } else {
            navigateTo('passenger-page');
        }
    }
});

function fetchNui(event, data) {
    fetch(`https://${GetParentResourceName()}/${event}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}