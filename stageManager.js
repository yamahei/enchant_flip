
/* stage manage */
var GAME_STATE = {
  NONE: -1, STOP: 0, CARDING: 1, GAMING: 2, SCOREING: 3, WAITNEXT: 4, GONEXT: 5
};
var SCORE = {
  BINGO: 1, ESC_DOKURO: 1
};
var CALL_SIGNAL = {
  STAGE: 0, MEMORIZE: 1, START: 2, HURRY: 3, CLEAR: 4, OVER: 5, NG: 6, BINGO: 7, NEXTSTAGE: 8, HALF: 9, AH_HA: 10
};
//var MEMORIZE_TIME = 0.5;
var GameStageGroup = enchant.Class.create(GroupBase, {
  initialize: function(controller){ //controller is GameController
    GroupBase.call(this, controller);
    this.bg = new StageBGGroup(this);
    this.addChild(this.bg);
    this.cards = new stageCardGroup(this);
    this.addChild(this.cards);
    this.char = new StageCharGroup(this);
    this.addChild(this.char);
    this.info = new StageInfoGroup(this);
    this.addChild(this.info);
    this.visible = false;
  },
  init: function(stage){ 
    this.visible = true;
    this.stage = stage;
    this.score = 0;
    this.bingo = 0;
    this.NG = 0;
    this.status = GAME_STATE.NONE;
    this.staging = true;
  },
  terminate: function(){ 
    this.status = GAME_STATE.NONE;
    this.staging = false;
    this.visible = false;
    this.bg.terminate();
    this.info.terminate();
    this.cards.terminate();
    this.char.terminate();
  },
  currentScoreText: { get: function(){
    var length = Math.floor(enchant.Core.instance.width / INFO.FONT_SIZE);
    var text = "" + this.score;
    while(text.length < length){ text = " " + text; }
    return text;
  }},
  stageSignal: function(signal){
    switch(signal){
      case CALL_SIGNAL.STAGE:
        this.bg.init(this.stage);
        this.cards.initCard(this.stage);
        this.info.init(this.stage);
        this.info.labelStage(this.stage);
        this.info.fillTimer();
        this.char.init(this.stage, this.bg.image);
      break;
      case CALL_SIGNAL.MEMORIZE: this.info.labelMemorize(); break;
      case CALL_SIGNAL.START: 
        this.info.labelStart();
        this.info.start();
        this.cards.start();
        this.char.start();
        break;
      case CALL_SIGNAL.HALF: this.char.signalHalf(); break;
      case CALL_SIGNAL.HURRY: this.info.labelHurry(); break;
      case CALL_SIGNAL.CLEAR:
        var isPerfect = (this.NG==0) ? true : false;
        if(isPerfect) this.score += this.stage*this.stage;
        this.cards.stop();
        this.info.stop();
        this.char.stop();
        this.status = GAME_STATE.SCOREING;
        this.info.labelClear(isPerfect);
        break;
      case CALL_SIGNAL.OVER:
        this.info.labelGameOver(); 
        this.char.stop();
        this.cards.stop();
        this.info.stop();
        break;
      case CALL_SIGNAL.BINGO:
        this.bingo += 1;
        this.score += SCORE.BINGO * this.stage * this.bingo;
        this.info.reward(this.bingo);
        this.char.signalOK();
        if(this.cards.checkClear()){
          this.stageSignal(CALL_SIGNAL.CLEAR);
        }else{
          if(!this.char.isHelper){
            if(this.bingo % 3 == 0) this.stageSignal(CALL_SIGNAL.AH_HA);
          }
        }
        break;
      case CALL_SIGNAL.NG:
        this.bingo = 0;
        this.NG += 1;
        this.info.penalty();
        this.char.signalNG();
        break;
      case CALL_SIGNAL.AH_HA:
        this.cards.signalAhHa();
        this.info.signalAhHa();
        this.playSound(SOUND_AHA);
        break;
      case CALL_SIGNAL.NEXTSTAGE:
        if(this.status == GAME_STATE.WAITNEXT) this.stageClear();
        break;
    }
  },
  stageStart: function(){
    this.stageSignal(CALL_SIGNAL.STAGE);
    this.staging = true;
    this.bingo = 0;
    this.NG = 0;
    this.scoreCounted = false;
  },
  stageClear: function(){
    this.controller.setLastStage(this.stage);
    this.stage += 1;
    this.status = GAME_STATE.NONE;
  },
  gameOver: function(){
    this.controller.GameToTitle();
  },
  enterFrame: function(){
    if(!this.staging) return;
    switch(this.status){
      case GAME_STATE.NONE:
        this.status = GAME_STATE.STOP;
        this.stageStart();
        break;
      case GAME_STATE.STOP:
        this.status = GAME_STATE.CARDING;
        this.cards.deal();
        break;
      case GAME_STATE.CARDING://wait until complete dealing cards.
        if(this.cards.dealComplete) {
          this.status = GAME_STATE.GAMING;
          this.stageSignal(CALL_SIGNAL.START);
        }
        break;
      /*case GAME_STATE.GAMING: break;*/
      case GAME_STATE.SCOREING:
        var flgCard = false;
        var flgTime = false;
        var flgChar = false;
        if(this.cards.length > 0){
          this.score += this.cards.clearBonus(this.stage);
        } else { flgCard = true; }
        if(this.info.timerRemain > 0){
          //this.playSound(SOUND_SEC);
          this.score += this.stage;
          this.info.timerAdd(-1);
        }else{ flgTime = true; }
        if(this.char.currentChar){
          this.score += this.stage;
          this.char.currentChar.evaporate();
        }else{ flgChar = true; }
        if(flgCard && flgTime && flgChar){
          this.status = GAME_STATE.WAITNEXT;
          this.wait = INFO.TIME.BETWEEN_STAGE * FPS;
        }
        break;
      case GAME_STATE.WAITNEXT:
        if(this.wait-- <= 0) this.stageSignal(CALL_SIGNAL.NEXTSTAGE);
        break;
    }
  },
  dummy: function(){}
});
