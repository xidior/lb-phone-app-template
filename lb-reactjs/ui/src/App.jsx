import { useEffect, useState } from 'react';
import Frame from './components/Frame';
import Login from './pages/Login';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard';

import './App.css';

const devMode = !window.invokeNative;

const App = () => {
    const [theme, setTheme] = useState('light');
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (devMode) {
            document.getElementsByTagName('html')[0].style.visibility = 'visible';
            document.getElementsByTagName('body')[0].style.visibility = 'visible';
            return;
        } else {
            if (window.getSettings && window.onSettingsChange) {
                window.getSettings().then((settings) => setTheme(settings.display.theme));
                window.onSettingsChange((settings) => setTheme(settings.display.theme));
            }
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
    };

    const content = (
        <div className='app' data-theme={theme}>
            <div className='app-wrapper'>
                {!user ? (
                    <Login onLogin={handleLogin} />
                ) : user.userType === 'passenger' ? (
                    <PassengerDashboard user={user} onLogout={handleLogout} />
                ) : (
                    <DriverDashboard user={user} onLogout={handleLogout} />
                )}
            </div>
        </div>
    );

    // Wrap in Frame for dev mode
    if (devMode) {
        return (
            <div className='dev-wrapper'>
                <Frame>{content}</Frame>
            </div>
        );
    }

    return content;
};

export default App;
