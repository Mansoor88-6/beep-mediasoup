/* eslint-disable no-restricted-globals */

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Get the original URL from the notification data
  const urlToOpen = event.notification.data?.url || '/';

  // This will focus on the existing tab if it exists, or create a new one if it doesn't
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then(function (clientList) {
        // If we have a client, focus it
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no client is found, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function (event) {
  console.log('Notification closed:', event);
});

// Service worker installation
self.addEventListener('install', function (event) {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', function (event) {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});
