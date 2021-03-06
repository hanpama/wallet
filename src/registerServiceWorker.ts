/* eslint-disable no-console */

import { register } from 'register-service-worker';

if (navigator && navigator.serviceWorker) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.debug('NEW SERVICEWORKER ACTIVATED, RELOADING!');
        if (refreshing) return;
        refreshing = true;
        setTimeout(() => window.location.reload(true), 1000);
    });

    if (process.env.NODE_ENV === 'production') {
        register(`${process.env.BASE_URL}service-worker.js`, {
            ready() {
                console.log(
                    'App is being served from cache by a service worker.\n'
                    + 'For more details, visit https://goo.gl/AFskqB',
                );
            },
            registered() {
                console.log('Service worker has been registered.');
            },
            cached() {
                console.log('Content has been cached for offline use.');
            },
            updatefound() {
                console.log('New content is downloading.');
            },
            updated(registration) {
                console.log('New content is available; please refresh.');

                if (!registration || !registration.waiting) {
                    console.warn('SW fired update(), but without reference to SW', registration);
                    return;
                }

                // eslint-disable-next-line no-alert
                if (window.confirm('A new version of the Wallet is available.\nReload to update?')) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            },
            offline() {
                console.log('No internet connection found. App is running in offline mode.');
            },
            error(error: any) {
                console.error('Error during service worker registration:', error);
            },
        });
    }
}
