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


        // if (event.request.method === 'GET' &&
        //     event.request.headers.get('accept').indexOf('text/html') !== -1) {
        //     console.log('Handling fetch event for', event.request.url);
        //     event.respondWith(
        //         fetch(event.request).catch(function (e) {
        //             console.error('Fetch failed; returning offline page instead.', e);
        //             // return caches.open(OFFLINE_CACHE).then(function (cache) {
        //             //     return cache.match(OFFLINE_URL);
        //             // });
        //         })
        //     );
        // }
    });
})();