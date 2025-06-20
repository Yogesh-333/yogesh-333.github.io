'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "5d0ce3c2876a9f5f43a9cc4db4c02305",
"assets/AssetManifest.bin.json": "5fa3209a32b824ef8dc97dae9ef4f8ae",
"assets/AssetManifest.json": "7a0fa410b19bbf51a8b465ed57386665",
"assets/assets/1.jpg": "e5ab6bf1c208dff1f756f73ad9c2e38f",
"assets/assets/2.jpg": "fd7ac46fb5876d1d7044cb7d490a1eaf",
"assets/assets/3.jpg": "4cd5cf12f887f3b313c6afb2da9413ed",
"assets/assets/4.jpg": "ada9cc86f85df8d1915023f4e969f6f8",
"assets/assets/5.jpg": "a2d82ce8e75fb1aba651688a9053eba8",
"assets/assets/6.jpg": "b6055630ae541c7a316041b23397d32d",
"assets/assets/7.jpg": "de0b149e32765a6e6fff5146219c4f58",
"assets/assets/8.jpg": "9914f12909f7e93e40ae65386b3c5f52",
"assets/assets/9.jpg": "17c86b88bef98d61eefbf48a7e878232",
"assets/assets/aila/1.jpg": "1dafe8b972e66f1cb7d4b7de7ad56f8c",
"assets/assets/aila/2.jpg": "a9a27cc468342def9d16116fdc92952b",
"assets/assets/aila/3.jpg": "a7d1023833dc6cc7f942f2ed56443471",
"assets/assets/aila/4.jpg": "b9e6245a8ff8cb490de3aebf6d2eb3c3",
"assets/assets/aila/5.jpg": "2dfb9fcda4ec76e3b7188d443d3f881e",
"assets/assets/avatar.html": "dd392f951436a55173b48d87fd74d6a3",
"assets/assets/Blogger.png": "7d9baeb6d950dd30a88279ee1b106af5",
"assets/assets/design.png": "6aaec412d8837ac9a83f03f453877606",
"assets/assets/develop.png": "471c2c94d5d04112086eba9fd78c6809",
"assets/assets/download.png": "bd9b76514d68f7e031840dab2f48bc53",
"assets/assets/elisabeth_prager.jpg": "ab9a0492a0b0b0a6ceecf5444110a801",
"assets/assets/email.png": "5eb3c4b86aafbee72b8c471b29413a50",
"assets/assets/female.png": "29c52b49d99a5de88d34ab04aafe3f59",
"assets/assets/GitHub.png": "0c86993e251c6c1344e72ca315bbf274",
"assets/assets/hpod/images-0.jpg": "3e3761a6dc0df5a927ade1f39b1ff59e",
"assets/assets/hpod/images-1.jpg": "5c4b2f7d538f545b0bfe88972de1eea4",
"assets/assets/hpod/images-2.jpg": "1441a17582f4e3086d4403167308adf4",
"assets/assets/hpod/images-3.jpg": "617d226b7c2c0f0d247591266aa2a6d6",
"assets/assets/hpod/images-4.jpg": "23382e44dbc0f5fec7315c502638cc4d",
"assets/assets/hpod/images-5.jpg": "f0d445f23c1f0edcb6a41df6e0b95696",
"assets/assets/hpod/images-6.jpg": "329c0f22486f09896fb5e454d872d949",
"assets/assets/laptop.png": "0b817e50493c0a983a7a0e08df00bd4a",
"assets/assets/LinkedIn.png": "fdf771edfbebc3683ec650003c256aee",
"assets/assets/logo.png": "2f88ae301ba44fa1cbac158c5bf02b1e",
"assets/assets/male.png": "a687ddbf4597360c3b9e293a58b1d829",
"assets/assets/mappin.png": "9cc090022ae31337336d2024160714b8",
"assets/assets/nitika_vyas.jpg": "78a9635000472f0f4db45f01d52e26a4",
"assets/assets/person.png": "00ab70f1c4b3244ef83513e134f458b2",
"assets/assets/person_small.png": "bd4d5399f5eaba7652fc22a26e70b9a3",
"assets/assets/person_small1.png": "ab8229df9fce1ba33d692f0ae30c55a4",
"assets/assets/phone.png": "45903a1ffa9ede882171aca9f71c4c29",
"assets/assets/promote.png": "2bd8adcad79a4ebb80888d1a0583b3c4",
"assets/assets/quote.png": "1a0aa9a06293ac5689bc32012e0e13e6",
"assets/assets/roobai/image-1.png": "fcf878b0dbc7cf8af5a11205de9ec45c",
"assets/assets/roobai/image-2.png": "4db1daafe43a1cc7c3d1c1cf96b0e44c",
"assets/assets/roobai/image-3.png": "fa168353e72ea8349524582e29a7d3f6",
"assets/assets/roobai/image-4.png": "82ce56d729f794f81aa4e453db88159f",
"assets/assets/roobai/image-5.png": "185ccfb8b1dd41cff0f3095c92b0c5e7",
"assets/assets/roobai/image-6.png": "391a264cab7b0b7e772574d11361a857",
"assets/assets/sumithra.jpg": "871e6eae158a0e6bc90e0228af2b8819",
"assets/assets/whatsapp.png": "426617ad28567da23a2346566d84b5a6",
"assets/assets/write.png": "dc4f0d3df06d5fc9b13b9168b88e2560",
"assets/FontManifest.json": "5a32d4310a6f5d9a6b651e75ba0d7372",
"assets/fonts/MaterialIcons-Regular.otf": "488f0c86d9130c074a4acc1f96aa5824",
"assets/NOTICES": "716ddb2e746bf6a35c7f0e96b45b7626",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "4769f3245a24c1fa9965f113ea85ec2a",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "3ca5dc7621921b901d513cc1ce23788c",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "4f9e39764da6e5ca4a7ef235c3dc12fd",
"assets/packages/liquid_glass_renderer/lib/assets/shaders/liquid_glass.frag": "99b50f259017eb072d44ae9f1e654bb1",
"assets/packages/liquid_glass_renderer/lib/assets/shaders/liquid_glass_arbitrary.frag": "cf147b62117ce1f904fd04535deefa9e",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.js.symbols": "bdcd3835edf8586b6d6edfce8749fb77",
"canvaskit/canvaskit.wasm": "7a3f4ae7d65fc1de6a6e7ddd3224bc93",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.js.symbols": "b61b5f4673c9698029fa0a746a9ad581",
"canvaskit/chromium/canvaskit.wasm": "f504de372e31c8031018a9ec0a9ef5f0",
"canvaskit/skwasm.js": "ea559890a088fe28b4ddf70e17e60052",
"canvaskit/skwasm.js.symbols": "e72c79950c8a8483d826a7f0560573a1",
"canvaskit/skwasm.wasm": "39dd80367a4e71582d234948adc521c0",
"favicon.png": "04a9aaf050f7c41c16d0dfbe318aaefb",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c",
"flutter_bootstrap.js": "59b1c034b76fecd7451d59f300402992",
"icons/Icon-192.png": "38c3c1514b4b41fe4d6bf70580782785",
"icons/Icon-512.png": "dfe669ed2ec28d0749af3e31574993e4",
"icons/Icon-maskable-192.png": "38c3c1514b4b41fe4d6bf70580782785",
"icons/Icon-maskable-512.png": "dfe669ed2ec28d0749af3e31574993e4",
"index.html": "1ce03e9282b97e266ff0d7ad45b48b37",
"/": "1ce03e9282b97e266ff0d7ad45b48b37",
"main.dart.js": "099f7e52cc2e282273c714a81d895d76",
"manifest.json": "daddbf91243d85dc2cf36ffffe9f987e",
"version.json": "965fd198e2099a9ae7232ff7dbc2e6a8"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
