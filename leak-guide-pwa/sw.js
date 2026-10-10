// 対処ガイド: ページ本体(HTML・画像・アイコン)だけをキャッシュします。入力内容や個人情報は扱いません。
var V = 'leak-guide-v1';
var FILES = ['./', './index.html', './manifest.webmanifest', './leak-hero.jpg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon-180.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(V).then(function(c){
    // 1つ取得に失敗しても、インストール全体は止めない
    return Promise.all(FILES.map(function(u){ return c.add(u).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== V; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var r = e.request;
  if(r.method !== 'GET') return;
  var u = new URL(r.url);
  if(u.origin !== location.origin) return;
  if(r.mode === 'navigate'){
    // ページは通信できるときは最新を取得し、オフラインならキャッシュを表示
    e.respondWith(fetch(r).then(function(res){
      var c = res.clone(); caches.open(V).then(function(x){ x.put('./index.html', c); }); return res;
    }).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(r, {ignoreSearch:true}).then(function(c){
    return c || fetch(r).then(function(res){
      if(res && res.ok){ var cc = res.clone(); caches.open(V).then(function(x){ x.put(r, cc); }); }
      return res;
    });
  }));
});
