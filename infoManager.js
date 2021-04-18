
/* info manage */
var INFO = {
  TIME: { MAX: 64, HURRY: 16, REWARD: 4, PENALTY: 2, CAST_FOREOFFSET: 4, CAST_BACKOFFSET: 6, /*CAST_INTERVAL: 3,*/ BETWEEN_STAGE: 1.5, MEMORIZE: 4 },
  FONT_SIZE: 16
};
var StageInfoGroup = enchant.Class.create(GroupBase, {
  initialize: function(controller){ //controller is GameStageGroup
    GroupBase.call(this, controller);
    this.terminate();//to stop auto start.
  },
  init: function(stage){
    this.terminate();
    var game = enchant.Core.instance;
    var infoGroup = this;
    this.bingo = 0;
    this.halfd = false;
    this.hurried = false;
    this.overed = false;
    this.setStageTime(stage);//sec
    //timer
    this.bar = new enchant.ui.Bar(0, 0);
    this.bar.image = game.assets[IMG_BAR];
    this.bar.addEventListener('enterframe', function(e){
      var timer = infoGroup.timer;
      var maxTimer = infoGroup.maxTime * FPS;//msec
      var hurry = infoGroup.hurryTime * FPS;//msec
      this.value = (timer / maxTimer) * game.width;
      this.visible = (timer <= hurry) ? !this.visible : true;
    });
    this.addChild(this.bar);
    //score
    this.score = this.getMutableText(infoGroup.controller.currentScoreText);
    this.score.x = 0; this.score.y = 2;
    this.score.addEventListener('enterframe', function(e){
      this.setText(infoGroup.controller.currentScoreText);
    });
    this.addChild(this.score);
  },
  terminate: function(){
    this.stop();
    this.removeAllChilds();
  },
  enterFrame: function(){
    if(!this._start) return;
    this.timer -= 1;
    var hurry = this.hurryTime * FPS;
    if(this.timer <= hurry && !this.hurried){
      this.controller.stageSignal(CALL_SIGNAL.HURRY);
      this.hurried = true;
    }
    var half = this.halfTime * FPS;
    if(this.timer <= half && !this.halfd){
      this.controller.stageSignal(CALL_SIGNAL.HALF);
      this.halfd = true;
    }
    if(this.timer <= 0 && !this.overed){
      this.controller.stageSignal(CALL_SIGNAL.OVER);
      this.controller.playSound(SOUND_OVER);
      this.overed = true;
    }
    if(this.timer < 0) this.timer = 0;
  },
  setStageTime: function(stage){
    var per = (stage > 100) ? 50 : Math.floor(100 - stage / 2);
    this.maxTime = Math.floor((INFO.TIME.MAX / 100) * per);
    this.hurryTime = Math.floor(this.maxTime * (INFO.TIME.HURRY / INFO.TIME.MAX));
    this.halfTime = Math.floor(this.maxTime / 2);
  },
  clearTimer: function(){ this.timer = 0; },
  fillTimer: function(){ this.timer = this.maxTime * FPS; },
  timerRemain: {
    get: function(){ 
      return this.timer > 0 ? Math.floor((this.timer + FPS) / FPS) : 0; 
    }
  },
  timerAdd: function(sec){
    this.timer += sec * FPS;
    if(this.timer < 0) this.timer = 0;
    if(this.timer > this.maxTime * FPS) this.timer = this.maxTime * FPS;
  },
  signalAhHa: function(){
    var game = enchant.Core.instance;
    var label = this.getMutableText('Ah-Ha!');
    label.x = (game.width - label.width) / 2;
    label.y = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0));
    var centerY = ((game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) - label.height) / 2;
    var add = 1;
    label.addEventListener('enterframe', function(e){
      if(this.y > centerY){
        this.y = Math.floor((this.y + centerY) / 2);
      }else{
        this.y -= add;
        add *= 2;
      }
      if((this.y + this.height) < 0) this.parentNode.removeChild(this);
    });
    this.addChild(label);
  },
  reward: function(bingo){
    this.timerAdd(INFO.TIME.REWARD);
    if(bingo > 1){ this.labelCombo(bingo); }
  },
  penalty: function(){ this.timerAdd(-INFO.TIME.PENALTY); },
  setLabelStayCenter: function(text, life, clickFunc){
    var game = enchant.Core.instance;
    var label = this.getMutableText(text);
    label.y = ((game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) - label.height) / 2;
    if(life > 0){
      label.addEventListener('enterframe', function(e){
        if(life-- < 0) this.parentNode.removeChild(this);
      });
    }
    if(clickFunc){
      label.addEventListener('touchend', function(e) { clickFunc(e) });
    }
    this.addChild(label);
  },
  labelStage: function(stage){
    var game = enchant.Core.instance;
    var labelLife = FPS * 2;
    var _stageNo = '00' + stage;
    var text = 'STAGE' + _stageNo.substr(_stageNo.length - 2, 2);
    this.setLabelStayCenter(text, labelLife, undefined);
  },
  labelMemorize: function(){
    var game = enchant.Core.instance;
    var label = this.getMutableText('MEMORIZE');
    var speed = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) / (FPS * INFO.TIME.MEMORIZE);
    //var speed = game.height / (FPS * MEMORIZE_TIME);
    label.y = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0));
    label.addEventListener('enterframe', function(e){
      this.y -= speed;
      if((this.y + this.height) < 0) this.parentNode.removeChild(this);
    });
    this.addChild(label);
    this.controller.playSound(SOUND_MEMORIZE);
  },
  labelStart: function(){
    var game = enchant.Core.instance;
    var label = this.getMutableText('START');
    label.x = game.width;
    label.y = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) / 2;
    var centerX = (game.width - label.width) / 2;
    var add = 1;
    label.addEventListener('enterframe', function(e){
      if(this.x > centerX){
        this.x = Math.floor((this.x + centerX) / 2);
      }else{
        this.x -= add;
        add *= 2;
      }
      if((this.x + this.width) < 0) this.parentNode.removeChild(this);
    });
    this.addChild(label);
    this.controller.playSound(SOUND_START);
  },
  labelHurry: function(){
    var game = enchant.Core.instance;
    var label = this.getMutableText('HURRY!');
    var speed = game.width / (FPS * 1.5);
    label.x = game.width;
    label.y = ((game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) - label.height) / 2;
    label.addEventListener('enterframe', function(e){
      this.x -= speed;
      if((this.x + this.width) < 0) this.parentNode.removeChild(this);
    });
    this.addChild(label);
    this.controller.playSound(SOUND_HURRY);
  },
  labelClear: function(isPerfect){
    var text = isPerfect ? 'PERFECT!' : 'CLEAR';
    var game = enchant.Core.instance;
    var label = this.getMutableText(text);
    var centerX = (game.width - label.width) / 2;
    label.x = game.width;
    label.y = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) / 2;
    label.addEventListener('enterframe', function(e){
      if(label.x != centerX){
        var gap = Math.floor((centerX - label.x) * 0.8);
        label.x = centerX + gap;
      }
    });
    this.addChild(label);

  },
  labelCombo: function(bingo){
    var game = enchant.Core.instance;
    var label = this.getMutableText('x' + bingo);
    label.x = 0;
    label.y = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) - label.height;
    var counter = Math.floor(game.fps / 2);
    var w = Math.floor(label.height / 2);
    label.addEventListener('enterframe', function(e){
      if(w == 0){
        this.parentNode.removeChild(this);
      }else{
        this.y  -= w;
        w = Math.floor(w / 2);
      }
    });
    this.addChild(label);
  },
  labelGameOver: function(){
    var game = enchant.Core.instance;
    var label = this.getMutableText('GAME OVER');
    var centerY = Math.floor(((game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) - label.height) / 2);
    var speed = -label.height / 2;
    var v = speed;
    var flag = true;
    label.x = (game.width - label.width) / 2;
    label.y = -label.height;
    label.addEventListener('enterframe', function(e){
      if(this.y < centerY){
        this.y += ++v;
        if(v > label.height * 0.7){
          v = (speed *= 0.7);
        }
      } else if(this.y > centerY){
        this.y = Math.floor(this.y - 1);
      }
    });
    var stageInfo = this.controller;
    var func = function(){ stageInfo.gameOver(); };
    label.addEventListener('touchend', function(e) { func(e) });
    this.addChild(label);
    this.controller.playSound(SOUND_OVER);
  },
  dummy: function(){}
});

