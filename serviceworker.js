self.addEventListener('push', (event) => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/images/notification-icon.png', // Add an icon for your notification
        badge: '/images/notification-badge.png',
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
