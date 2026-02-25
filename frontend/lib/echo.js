import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo = null;

if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const backendUrl = apiUrl.replace(/\/api$/, '');

    echo = new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 80,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 443,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiUrl}/broadcasting/auth`,
        auth: {
            headers: {
                Accept: 'application/json',
                Authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '',
            }
        }
    });
}

export default echo;
