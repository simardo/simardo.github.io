self.addEventListener('push', (event) => {
    event.waitUntil(self.registration.showNotification('incoming notification', {
        body: 'Got it!',
    }));
});
