
/**
 * キャッシュコントロール
 * CACHE_STORAGE_NAME: キャッシュ名
 *     バージョンアップごとにカウントアップ（再キャッシュ用）
 * files_to_cache: 対象ファイルリスト
 *     ここにないとキャッシュされない
 *     パス「../enchant_flip」にて
 *     以下のコマンドを実行する
 *     $ find . -type f | grep "enchant_flip" | grep -v ".git" | sed 's/^\.//'
 */
const CACHE_STORAGE_NAME = 'v1';
const files_to_cache = `
/enchant_flip/apad.png
/enchant_flip/bar.png
/enchant_flip/bgManager.js
/enchant_flip/cardManager.js
/enchant_flip/charManager.js
/enchant_flip/controller.js
/enchant_flip/enchant-plugins/ui.enchant.js
/enchant_flip/enchant-plugins/_memory.enchant.js
/enchant_flip/enchant-plugins/_nineleap.enchant.js
/enchant_flip/enchant-plugins/_twitter.enchant.js
/enchant_flip/enchant.js
/enchant_flip/enchant.min.js
/enchant_flip/font0.png
/enchant_flip/game.js
/enchant_flip/icon0.png
/enchant_flip/index.html
/enchant_flip/infoManager.js
/enchant_flip/LICENSE
/enchant_flip/manifest.webmanifest
/enchant_flip/object.js
/enchant_flip/pad.png
/enchant_flip/promote/commercial_image1024x500.png
/enchant_flip/promote/commercial_image1024x500.xcf
/enchant_flip/promote/editing/bg/bg_dirt-dent.png
/enchant_flip/promote/editing/bg/bg_dirt-gravel.png
/enchant_flip/promote/editing/bg/bg_dirt-ledge.png
/enchant_flip/promote/editing/bg/bg_dirt-moss.png
/enchant_flip/promote/editing/bg/bg_glass-fence.png
/enchant_flip/promote/editing/bg/bg_glass-ground.png
/enchant_flip/promote/editing/bg/bg_glass-tile.png
/enchant_flip/promote/editing/bg/bg_land-gravel.png
/enchant_flip/promote/editing/bg/bg_land-weed.png
/enchant_flip/promote/editing/bg/bg_lava-dirt.png
/enchant_flip/promote/editing/bg/bg_lava-ore.png
/enchant_flip/promote/editing/bg/bg_ore-gravel.png
/enchant_flip/promote/editing/bg/bg_steppe-cobbled.png
/enchant_flip/promote/editing/bg/bg_tile-dent.png
/enchant_flip/promote/editing/bg/bg_tile-ledge.png
/enchant_flip/promote/editing/bg/bg_tile-water.png
/enchant_flip/promote/editing/bg/bg_weed-gravel.png
/enchant_flip/promote/editing/char/card.xcf
/enchant_flip/promote/editing/char/effect.xcf
/enchant_flip/promote/editing/se/aha_voice015.wav
/enchant_flip/promote/editing/se/a_bingo_coin03.wav
/enchant_flip/promote/editing/se/a_clear_animal01.wav
/enchant_flip/promote/editing/se/a_flip_paper00.wav
/enchant_flip/promote/editing/se/a_frame_fire01.wav
/enchant_flip/promote/editing/se/a_gameover_animal02.wav
/enchant_flip/promote/editing/se/a_hurry_beep12.wav
/enchant_flip/promote/editing/se/a_icing_freeze04.wav
/enchant_flip/promote/editing/se/a_memorize_whistle00.wav
/enchant_flip/promote/editing/se/a_move_step04.wav
/enchant_flip/promote/editing/se/a_NG_beep14.wav
/enchant_flip/promote/editing/se/a_poison_fm008.wav
/enchant_flip/promote/editing/se/a_start_whistle02.wav
/enchant_flip/promote/editing/se/bingo.mp3
/enchant_flip/promote/editing/se/bingo.wav
/enchant_flip/promote/editing/se/bingo_cursor15_d.wav
/enchant_flip/promote/editing/se/clear.wav
/enchant_flip/promote/editing/se/clear_m.wav
/enchant_flip/promote/editing/se/flip_bosu39.wav
/enchant_flip/promote/editing/se/flip_clock01.wav
/enchant_flip/promote/editing/se/flip_mizu07.wav
/enchant_flip/promote/editing/se/framing.mp3
/enchant_flip/promote/editing/se/framing.wav
/enchant_flip/promote/editing/se/gameover.wav
/enchant_flip/promote/editing/se/hurry_pyoro00.wav
/enchant_flip/promote/editing/se/icing3.mp3
/enchant_flip/promote/editing/se/icing3.wav
/enchant_flip/promote/editing/se/move.mp3
/enchant_flip/promote/editing/se/move.wav
/enchant_flip/promote/editing/se/NG.mp3
/enchant_flip/promote/editing/se/NG.wav
/enchant_flip/promote/editing/se/NG_bell06.wav
/enchant_flip/promote/editing/se/NG_byoro03.wav
/enchant_flip/promote/editing/se/NG_cursor00_c.wav
/enchant_flip/promote/editing/se/poisenate3.mp3
/enchant_flip/promote/editing/se/poisenate3.wav
/enchant_flip/promote/editing/se/sec_beep08.wav
/enchant_flip/promote/iconimage36x36.png
/enchant_flip/promote/iconimage48x48.png
/enchant_flip/promote/iconimage512x512.png
/enchant_flip/promote/iconimage72x72.png
/enchant_flip/promote/iconimage_org.xcf
/enchant_flip/promote/promotion180x120.png
/enchant_flip/promote/screenshot/deal.png
/enchant_flip/promote/screenshot/helper.png
/enchant_flip/promote/screenshot/memo.png
/enchant_flip/promote/screenshot/memo_trim.png
/enchant_flip/promote/screenshot/switch.png
/enchant_flip/promote/screenshot/title.png
/enchant_flip/pwa.html
/enchant_flip/pwabuilder-sw.js
/enchant_flip/README.md
/enchant_flip/resource/aha_voice015.mp3
/enchant_flip/resource/aha_voice015.wav
/enchant_flip/resource/bg_dirt-gravel.png
/enchant_flip/resource/bg_dirt-ledge.png
/enchant_flip/resource/bg_glass-ground.png
/enchant_flip/resource/bg_glass-tile.png
/enchant_flip/resource/bg_land-gravel.png
/enchant_flip/resource/bg_land-weed.png
/enchant_flip/resource/bg_lava-ore.png
/enchant_flip/resource/bg_steppe-cobbled.png
/enchant_flip/resource/bingo_coin03.mp3
/enchant_flip/resource/bingo_coin03.wav
/enchant_flip/resource/card.gif
/enchant_flip/resource/char_dwarf.gif
/enchant_flip/resource/char_fairy.gif
/enchant_flip/resource/char_frame.gif
/enchant_flip/resource/char_girl.gif
/enchant_flip/resource/char_magician.gif
/enchant_flip/resource/char_snow.gif
/enchant_flip/resource/clear_animal01.mp3
/enchant_flip/resource/clear_animal01.wav
/enchant_flip/resource/effect.gif
/enchant_flip/resource/flip_sha00.mp3
/enchant_flip/resource/flip_sha00.wav
/enchant_flip/resource/frame_fire01.mp3
/enchant_flip/resource/frame_fire01.wav
/enchant_flip/resource/gameover_animal02.mp3
/enchant_flip/resource/gameover_animal02.wav
/enchant_flip/resource/hurry_beep12.mp3
/enchant_flip/resource/hurry_beep12.wav
/enchant_flip/resource/icing_freeze04.mp3
/enchant_flip/resource/icing_freeze04.wav
/enchant_flip/resource/memorize_whistle00.mp3
/enchant_flip/resource/memorize_whistle00.wav
/enchant_flip/resource/move_step04_m.mp3
/enchant_flip/resource/move_step04_m.wav
/enchant_flip/resource/NG_beep14.mp3
/enchant_flip/resource/NG_beep14.wav
/enchant_flip/resource/poison_fm008.mp3
/enchant_flip/resource/poison_fm008.wav
/enchant_flip/resource/start_whistle02.mp3
/enchant_flip/resource/start_whistle02.wav
/enchant_flip/resource/title.gif
/enchant_flip/stageManager.js
/enchant_flip/strage.js
/enchant_flip/titleManager.js
`.split("\n")
.map(function(line){
  return line.replace(/^\s+|\s+$/g, "");
})
.filter(function(line){
  return !!line;
});


//Caching Files with Service Worker
//https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_STORAGE_NAME).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STORAGE_NAME)
    .then(function(cache) {
      return cache.addAll(files_to_cache);
    })
  );
});
