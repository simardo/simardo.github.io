(async function () {
    self.addEventListener('install', e => {
        console.log('installed');

        caches.open('my-cache').then(c => {
            c.addAll(['https://simardo.github.io/carte/', 'https://simardo.github.io/carte/225x300.png', 'https://simardo.github.io/carte/carte-ul.png']);
        });
    });

    self.addEventListener('fetch', event => {
        console.log('fetch', event.request);

        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response || fetch(event.request);
            })
        );
    });
})();