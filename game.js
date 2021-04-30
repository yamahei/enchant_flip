var fullPathOfRootDir = function(fileName){
  return fileName;
  /*var _path = location.pathname;
  var path = _path.substring(0, _path.lastIndexOf('/') + 1);
  if(fileName){ return path + fileName; }
  else{ return path; }*/
};

var APP = {MODE: {FREE: "FREE", SHARE: "SHARE"}};
var APP_MODE = APP.MODE.FREE;
var FPS = 24;
var DATAKEY = 'FLIP_DATA';
var DATAKEY_HISCORES = 'HISCORES';
var DATAKEY_HISCORE = 'HISCORE';
var DATAKEY_HISTAGE = 'HISTAGE';
var DATAKEY_LASTSTAGE = 'LASTSTAGE';

var IMG_TITLE = fullPathOfRootDir('resource/title.gif');
var IMG_EFFECT = fullPathOfRootDir('resource/effect.gif');
var IMG_CARD = fullPathOfRootDir('resource/card.gif');
var IMG_BAR = fullPathOfRootDir('bar.png');
var IMG_CHAR_SNOW = fullPathOfRootDir('resource/char_snow.gif');
var IMG_CHAR_FRAME = fullPathOfRootDir('resource/char_frame.gif');
var IMG_CHAR_GIRL = fullPathOfRootDir('resource/char_girl.gif');
var IMG_CHAR_SWITCH = fullPathOfRootDir('resource/char_dwarf.gif');
var IMG_CHAR_JOKER = fullPathOfRootDir('resource/char_magician.gif');
var IMG_CHAR_FAIRY = fullPathOfRootDir('resource/char_fairy.gif');

var IMG_BG_1_GLASS_GROUND = fullPathOfRootDir('resource/bg_glass-ground.png');
var IMG_BG_2_STEPPE_COBBLED = fullPathOfRootDir('resource/bg_steppe-cobbled.png');
//var IMG_BG_3_GLASS_FENCE = fullPathOfRootDir('resource/bg_glass-fence.png');
var IMG_BG_3_GLASS_TILE = fullPathOfRootDir('resource/bg_glass-tile.png');
var IMG_BG_4_LAND_GRAVEL = fullPathOfRootDir('resource/bg_land-gravel.png');
var IMG_BG_5_LAND_WEED = fullPathOfRootDir('resource/bg_land-weed.png');
var IMG_BG_6_DIRT_LEDGE = fullPathOfRootDir('resource/bg_dirt-ledge.png');
var IMG_BG_7_DIRT_GRAVEL = fullPathOfRootDir('resource/bg_dirt-gravel.png');
var IMG_BG_8_LAVA_ORE = fullPathOfRootDir('resource/bg_lava-ore.png');

var SOUND_CLEAR = fullPathOfRootDir('resource/clear_animal01.mp3');
var SOUND_OVER = fullPathOfRootDir('resource/gameover_animal02.mp3');
var SOUND_HURRY = fullPathOfRootDir('resource/hurry_beep12.mp3');
var SOUND_MEMORIZE = fullPathOfRootDir('resource/memorize_whistle00.mp3');
var SOUND_START = fullPathOfRootDir('resource/start_whistle02.mp3');
var SOUND_FLIP = fullPathOfRootDir('resource/flip_sha00.mp3');
var SOUND_BINGO = fullPathOfRootDir('resource/bingo_coin03.mp3');
var SOUND_NG = fullPathOfRootDir('resource/NG_beep14.mp3');
//var SOUND_SEC = fullPathOfRootDir('resource/sec_kachi24.mp3');
var SOUND_FRAME = fullPathOfRootDir('resource/frame_fire01.mp3');
var SOUND_ICE = fullPathOfRootDir('resource/icing_freeze04.mp3');
var SOUND_MOVE = fullPathOfRootDir('resource/move_step04_m.mp3');
var SOUND_POISON = fullPathOfRootDir('resource/poison_fm008.mp3');
var SOUND_AHA = fullPathOfRootDir('resource/aha_voice015.mp3');


GAME_WIDTH = 192;
GAME_HEIGHT = 240;

enchant();
//enchant.Sound.enabledInMobileSafari = true;
if(location.protocol == 'file:') enchant.ENV.USE_WEBAUDIO = false;

function init(){

  // if(typeof monaca !== "undefined"){
  if(screen.width < screen.height){
    GAME_HEIGHT = Math.floor((GAME_WIDTH / screen.width) * screen.height);
  }
  // }

  var game = new enchant.Core(GAME_WIDTH, GAME_HEIGHT);//TODO: back event support
  game.fps = FPS;
  game.rootScene.backgroundColor = 'rgb(0, 0, 0)';
  game.preload(
    IMG_TITLE,
    IMG_EFFECT, IMG_CARD,
    IMG_CHAR_SNOW, IMG_CHAR_FRAME, IMG_CHAR_GIRL, IMG_CHAR_SWITCH, IMG_CHAR_JOKER, IMG_CHAR_FAIRY,
    IMG_BG_1_GLASS_GROUND, IMG_BG_2_STEPPE_COBBLED, IMG_BG_3_GLASS_TILE, IMG_BG_4_LAND_GRAVEL,
    IMG_BG_5_LAND_WEED, IMG_BG_6_DIRT_LEDGE, IMG_BG_7_DIRT_GRAVEL, IMG_BG_8_LAVA_ORE,
    SOUND_CLEAR, SOUND_OVER, SOUND_HURRY, SOUND_MEMORIZE, SOUND_START, SOUND_FLIP,
    SOUND_BINGO, SOUND_NG, /*SOUND_SEC,*/ SOUND_FRAME, SOUND_ICE, SOUND_MOVE, SOUND_POISON, SOUND_AHA,
    IMG_BAR
  );
//   // sound preload for monaca
//   if(typeof(monaca) !== 'undefined'){
//     monaca_sound_preload([
//     SOUND_CLEAR, SOUND_OVER, SOUND_HURRY, SOUND_MEMORIZE, SOUND_START, SOUND_FLIP,
//     SOUND_BINGO, SOUND_NG, /*SOUND_SEC,*/ SOUND_FRAME, SOUND_ICE, SOUND_MOVE, SOUND_POISON, SOUND_AHA,
//     ]);
//   }
  game.onload = function(){
    var scene = game.rootScene;
    while(scene.childNodes.length > 0){ scene.removeChild(scene.firstChild);  }
    var controller = new GameController();
  };
  game.start();
};


// /* ************************** */
// /* Extra functiuon for Monaca */

// /* sound cache for Monaca */
// var monaca_sounds = {};

// /* sound preload for Monaca */
// function monaca_sound_preload(soundfiles){
//     if(typeof(monaca) === 'undefined') return;
//     //try{
//         var _path = location.pathname;
//         var path = _path.substring(0, _path.lastIndexOf('/') + 1);
//         //var successFunc = function(){ this.seekTo(0); };
//         //var errorFunc = function(){ console.log("playAudio():Audio Error: " + err); };
//         var func = function(){};
//         monaca_sounds = {};
//         for(var i=0; i<soundfiles.length; i++){
//             var soundfile = soundfiles[i];
//             var soundpath = path + soundfile;
//             if(!monaca_sounds[soundfile]) monaca_sounds[soundfile] = new Media(soundpath, func, func);
//         }
//     //}catch(e){}
// }

// /* sound release for Monaca */
// function monaca_sound_release(){
//     if(typeof(monaca) === 'undefined') return;
//     //try{
//         for(var i=0; i<monaca_sounds.length; i++){ monaca_sounds[i].release(); }
//     //}catch(e){}
// }

// /* sound play for Monaca */
// function monaca_sound_play(soundfile){
//     if(typeof(monaca) === 'undefined') return;
//     //try{
//         var media = monaca_sounds[soundfile];
//         if(media.pause) media.pause();
//         if(media.seekTo) media.seekTo(0);
//         if(media.play) media.play();
//     //}catch(e){}
// }

// /* Extra functiuon for Monaca */
// /* ************************** */

