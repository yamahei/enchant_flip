
/* char manage */
var CAST = {
  OFFSET: { FORE:5, BACK:10 }//percent!
};
var StageCharGroup = enchant.Class.create(GroupBase, {
  initialize: function(controller){ //controller is GameStageGroup
    GroupBase.call(this, controller);
  },
  init: function(stage, type){
    this.terminate();
    this.time = this.controller.info;
    this.setOffset(stage);
    this.positions = [];
    //TODO: chars are change by each stage?
    this.positions.push(CHAR.POSITION.UPPER);
    this.positions.push(CHAR.POSITION.LOWER);
    this.positions.push(CHAR.POSITION.LEFT);
    this.positions.push(CHAR.POSITION.RIGHT);
    this._count = 0;
    this.currentChar = undefined;
    this._realCount = 0;//msec!
    this._preTimer = 0;//sec!
    this._crrTimer = 0;//sec!
    this.went = {};
    this.candi = this.getStageInterferes(stage, type);
    this.interval = this.getStageCastInterval(stage);
  },
  stop: function(){
    var fairy = this.helper;
    if(fairy) fairy.leave();
    this._start = false;
  },
  terminate: function(){
    this.stop();
    this.removeAllChilds();
    this.currentChar = undefined;
    this.helper = undefined;
  },
  enterFrame: function(e){

    var char = this.currentChar;
    if(char){
      if(char.status == CHAR.STATE.LAPSE){
        char.remove();
        this.currentChar = undefined;
      }
    }
    if(!this._start) return false;//is not in game now
    this._realCount += 1;
    this._preTimer = this._crrTimer;
    this._crrTimer = this.time.maxTime - this.time.timerRemain;

    if (this.currentChar) return;
    if (this.helper) {
      if(!this.helper.active) { this.helper = undefined; }
      return;
    }
    var game = enchant.Core.instance;
    if(this.isAppearTime){
      if(this.candi.length > 0){//TODO
        var position = this.positions[Math.floor(Math.random() * this.positions.length)];
        var Interfere = this.candi[0];
        this.candi.push(this.candi.shift());
        this.currentChar = new Interfere(this, position);
        this.addChild(this.currentChar);
      }
    }
  },
  setOffset: function(stage){
    var time = this.time.maxTime;
    this.foreOffset = Math.floor((time / 100) * CAST.OFFSET.FORE) || 1;
    this.backOffset = Math.floor((time / 100) * CAST.OFFSET.BACK) || 1;
  },
  isAppearTime: { get: function(){
    var _realSec = Math.floor(this._realCount / FPS);
    if(this._preTimer == this._crrTimer) return false;
    if(_realSec < this.foreOffset) return false;
    if(this.time.timerRemain < this.backOffset) return false;
    return ((_realSec - this.foreOffset) % this.interval == 0) ? true : false;
  }},
  getTargetCard: function (checkFunc){//return card
    var cardController = this.controller.cards;
    var indexes = cardController.getShuffleIndex();
    while(indexes.length > 0){
      var index = indexes.shift();
      var card = cardController.cards[index];
      if(card.surface == CARD.SURFACE.BACK){
        if(card.action == CARD.ACTION.READY || card.action == CARD.ACTION.TREMBLE){
          if (checkFunc){
            if(checkFunc(card)) return card;
          } else {
            return card;
          }
        }
      }
    }
    return undefined;
  },
  getCardlastPosition: function(){
    var cardController = this.controller.cards;
    return cardController.lastPositions.shift();
  },
  getStageInterferes: function(stage, type){

    var chars = [
      { klass: InterfereGirl,   getFrequency: function(stage, type){
        return type.match(/glass|land|steppe/) ? 8 : 0;
      }},
      { klass: InterfereSwitch, getFrequency: function(stage, type){
        return type.match(/glass|land|steppe/) ? 4 : 8;
      }},
      { klass: InterfereSnow,   getFrequency: function(stage, type){
        if(type.match(/glass|land|steppe/)){
          return (stage < 4) ? stage : 4;
        }else{ return 0; }
      }},
      { klass: InterfereFrame,  getFrequency: function(stage, type){
        if(type.match(/dirt/)){ return 1; }
        if(type.match(/lava/)){ return 2; }
        return 0;
      }},
      { klass: InterfereJoker,  getFrequency: function(stage, type){
        if(stage > 8 && stage % 8 == 0){
          return Math.floor(Math.random() * 6);
        }else{ return 0; }
      }},
    ];
    var interferes = [];

    chars.forEach(function(char){
      var frequency = char.getFrequency(stage, type) || 0;
      for(var i=0; i<frequency; i++){ interferes.push(char.klass); }
    });
    interferes.sort(function(a, b){//shuffle
      return +(new Date()) % 3 - 1;
    });

    return interferes;
  },
  getStageCastInterval: function(stage){
    var staySec = Math.floor(CHAR.COUNT.STAY / FPS);
    var castingTime = this.time.maxTime - (this.foreOffset + this.backOffset);
    var castLen = this.candi.length * (2 + (Math.floor(stage / 16) * 4));
    var interval = Math.floor(castingTime / castLen);
    return (interval < staySec) ? staySec : interval;
  },
  isHelper: { get: function(){
    return this.helper ? true : false;
  }},
  signalHalf: function(){
    var char = this.currentChar;
    if(char) char.forceLeave();
    var fairy = new SpriteFairy(this);
    this.helper = fairy;
    this.addChild(this.helper);
  },
  signalNG: function(){
    var char = this.currentChar;
    var fairy = this.helper;
    if(char){
      if(char.status == CHAR.STATE.STAY) char.doAction();
    }else if(fairy){
      this.controller.stageSignal(CALL_SIGNAL.AH_HA);
    }
  },
  signalOK: function(){
    var char = this.currentChar;
    if(char) char.leave();//TODO: 
    var fairy = this.helper;
    if(fairy) fairy.leave();
  },
  dummy: function(){}
});




