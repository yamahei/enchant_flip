
/* card manage */
var CARD_STATE = {
  WAIT: 0, STACK: 1, DEAL: 2, SHOW: 3, SHUFFLE1: 4, MEMORIZE: 5, HIDE: 6, SHUFFLE2: 7, READY: 8
};
var SHUFFLE_TYPE = { BEFORE: 0, FORE: 1, BACK: 2 };
//var WAIT_NG_HIDE = 5;
var stageCardGroup = enchant.Class.create(GroupBase, {
  initialize: function(controller){ //controller is GameStageGroup
    GroupBase.call(this, controller);
    this.cards = [];
  },
  terminate: function(){
    this.stop();
    this.removeAllChilds();
  },
  length: { get: function(){ return this.cards.length; }},
  initCard: function(stage){//how many times shuffle.
    this.terminate();

    this.stage = stage;
    this.status = CARD_STATE.WAIT;
    this.lastPositions = [];
    var i, j, card;
    this.cards = [];
    var types = [
      CARD.TYPE.FORE.APPLE, CARD.TYPE.FORE.BANANA, CARD.TYPE.FORE.GRAPE, CARD.TYPE.FORE.ICHIGO,
      CARD.TYPE.FORE.CHERRY, CARD.TYPE.FORE.PINE, CARD.TYPE.FORE.MELON, CARD.TYPE.FORE.SUIKA
    ];

    for (i=0; i<CARD.ALL; i++){//create card instance.
      var type = types[Math.floor(i / 2)];
      card = new SpriteCard(i, type, this);
      card.visible = false;
      this.addChild(card);
      this.cards.push(card);
      card.setEffect();
    }
    
    var suffleCount = this.getShuffleCount(SHUFFLE_TYPE.BEFORE);
    var shuffleIndexes = this.getShuffleIndex();
    
    while(shuffleIndexes.length > 1 && suffleCount > 0){
      var index1 = shuffleIndexes.shift();
      var index2 = shuffleIndexes.shift();
      if (typeof index1 === "undefined") break;
      if (typeof index2 === "undefined") break;
      var type1 = this.cards[index1].type;
      var type2 = this.cards[index2].type;
      if (type1 == type2){
        if (shuffleIndexes.length <= 0){
          break;
        }else{
          shuffleIndexes.push(index1);
          shuffleIndexes.unshift(index2);
        }
      }else{
        this.cards[index1].type = type2;
        this.cards[index2].type = type1;
        suffleCount -= 1;
      }
    }
  },
  canSelect: function(target){
    if (this.controller.status != GAME_STATE.GAMING) return false;
    if (!this._start) return false;//is not in game now
    if (target.surface != CARD.SURFACE.BACK) return false;
    if (target.action != CARD.ACTION.READY) return false;
    var fores = 0;
    for (var i=0; i<this.cards.length; i++){
      var card = this.cards[i];
      if (card.surface == CARD.SURFACE.FORE){
        if (this.action == CARD.ACTION.READY) fores += 1;
        if (this.action == CARD.ACTION.MOVE) fores += 1;
        if (this.action == CARD.ACTION.FLIPFORE) fores += 1;
        if (this.action == CARD.ACTION.JUMP) fores += 1;
        //if(this.action == CARD.ACTION.TREMBLE) fores += 1;
      } else {//CARD.SURFACE.BACK
        if (this.action == CARD.ACTION.FLIPFORE) fores += 1;
      }
      if (fores >= 2) return false;
    }
    return true;
  },
  check: function(){
    var selected = [];
    for (var i=0; i<this.cards.length; i++){
      var card = this.cards[i];
      if (card.surface == CARD.SURFACE.FORE){
        if (card.action == CARD.ACTION.READY || card.action == CARD.ACTION.TREMBLE)
          selected.push(card);
      }
    }
    if (selected.length > 2) throw('too many fore card: ' + selected.length);
    var manager = this;
    var controller = this.controller;
    var cardmng = this;
    var checkDokuro = function(card){
      if (card.type == CARD.TYPE.FORE.DOKURO){
        controller.stageSignal(CALL_SIGNAL.NG);
        manager.lastPositions.push({x: card.x, y: card.y});
        var func = function(){ this.evaporate() };
        card.tremble(func);
        return true;
      } else {
        return false;
      }
    };
    if (selected.length === 1){
      if (checkDokuro(selected[0])){
        this.controller.stageSignal(CALL_SIGNAL.NG);
      }
    } else if (selected.length === 2){
      for (var i=0; i<2; i++){
        var j = 1-i;
        if (checkDokuro(selected[i])){
          this.controller.stageSignal(CALL_SIGNAL.NG);
          selected[j].forceFlipBack(undefined);
          return;
        }
      }
      if (selected[0].type == selected[1].type){
        var index = enchant.Core.instance.frame % 2;
        this.lastPositions.push({x: selected[index].x, y: selected[index].y});
        this.lastPositions.push({x: selected[1-index].x, y: selected[1-index].y});
        selected[0].evaporate(0);
        selected[1].evaporate(0);
        this.controller.stageSignal(CALL_SIGNAL.BINGO);
        //this.checkClear();
      } else {
        selected[0].forceFlipBack(undefined);
        selected[1].forceFlipBack(undefined);
        this.controller.playSound(SOUND_NG);
        this.controller.stageSignal(CALL_SIGNAL.NG);
      }
    }
  },
  checkClear: function(){
    return this._checkClear();
    //if (this._checkClear()) this.controller.stageSignal(CALL_SIGNAL.CLEAR);
  },
  _checkClear: function(){
    if (!this.allCardReady) return false;
    if (this.cards.length <= 1) return true;
    var i;
    var types = [];
    for (i=0; i<this.cards.length; i++){
      var card = this.cards[i];
      var action = card.action;
      var type = card.type;
      var state = card.state;
      if(action != CARD.ACTION.EVAPORATE){
        if (type != CARD.TYPE.FORE.DOKURO && state != CARD.STATE.ICED) types.push(type);
      }
    }
    var pairCount = 0;
    while (types.length > 0){
      var t = types.shift();
      for (i=0; i<types.length; i++){
        if (t == types[i]) {
          if (++pairCount >= 2) return false;
        }
      }
    }
    this.controller.playSound(SOUND_CLEAR);
    return true;
  },
  clearBonus: function(stage){
    if (this.cards.length > 0){
      var score = 0;
      var card = this.cards.shift();
      var func = function(){ this.evaporate(); };
      if (card.type == CARD.TYPE.FORE.DOKURO){
        score += CARD.SCORE.DOKURO * stage;
      } else if (card.state == CARD.STATE.BURNED){
        score += CARD.SCORE.BURNED * stage;
      } else if (card.state == CARD.STATE.ICED){
        score += CARD.SCORE.ICED * stage;
      } else {
        score += CARD.SCORE.NORMAL * stage;
      }
      card.flipFore(func);
      return score;
    } else {
      return 0;
    }
  },
  evaporate: function(card){
    for (var i=0; i<this.cards.length; i++){
      var _card = this.cards.shift();
      if (_card.no != card.no) this.cards.push(_card);
    }
    card.remove();
    this.checkClear();
  },
  deal: function(){
    this.stackCard();
  },
  stackCard: function(){
    this.status = CARD_STATE.STACK;
    var game = enchant.Core.instance;
    var baseToY = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) - this.cards[0].height - 1;
    for (var i=0; i<this.cards.length; i++){
      var card = this.cards[this.cards.length - i - 1];
      card.x = (game.width - card.width) / 2;
      card.y = -(card.height * 3) * (i + 1);
      card.visible = true;
      card.move(card.x, baseToY - (i/4), 0, undefined);
    }
  },
  dealCard: function(){
    this.status = CARD_STATE.DEAL;
    var game = enchant.Core.instance;
    for (var i=0; i<this.cards.length; i++){
      var card = this.cards[i];
      var cardW = card.width;
      var cardH = card.height;
      var space = (game.width - (cardW * 4)) / 5;
      var offsetY = ((game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) / 2) - ((cardH * 2) + (space * 1));
      var x = (space * 1) + (i % 4) * (cardW + space);
      var y = offsetY + Math.floor(i / 4) * (cardH + space);
      card.move(x, y, i, undefined);
    }
  },
  memorizeWait: function(){
    this.status = CARD_STATE.MEMORIZE;
    this.controller.stageSignal(CALL_SIGNAL.MEMORIZE);
    this.wait = INFO.TIME.MEMORIZE * FPS;
    //this.wait = MEMORIZE_TIME * FPS;
  },
  showAllCard: function(status){
    if (status) this.status = status;
    for (var i=0; i<this.cards.length; i++){
      this.cards[i].forceFlipFore(undefined);
    }
  },
  hideAllCard: function(status){
    if (status) this.status = status;
    var cardmng = this;
    for (var i=0; i<this.cards.length; i++){
      var card = this.cards[i];
      if (card.surface != CARD.SURFACE.BACK) card.forceFlipBack(undefined);
    }
  },
  shuffleCard: function(status, shuffleCount){
    if (status) this.status = status;
    if (shuffleCount * 2 > this.cards.length) shuffleCount = Math.floor(this.cards.length / 2);
    var shuffle = this.getShuffleIndex();
    for (var i=0; i < shuffleCount; i+=2){
      var card1 = this.cards[shuffle[i+0]];
      var card2 = this.cards[shuffle[i+1]];
      card1.jump(card2.x, card2.y, i * Math.floor(FPS / 3), undefined);
      card2.jump(card1.x, card1.y, i * Math.floor(FPS / 3), undefined);
    }
  },
  getShuffleIndex: function(){
    var game = enchant.Core.instance;
    var count = (game.frame % 32) + 32;
    for(var i=0; i<count; i++){ var x = Math.random();}//can init ?
    var i;
    var c = [];
    for (i=0; i<this.cards.length; i++){ c.push(i); }
    var r = [];
    while(c.length > 0){ r.push(c.splice(Math.floor(Math.random() * c.length), 1)); }
    return r;
  },
  getShuffleCount: function(shuffleType){
    var SHUFFLE_MINSTAGE = 2;
    if(this.stage < SHUFFLE_MINSTAGE) return;
    var level = this.stage - SHUFFLE_MINSTAGE;
    var section = Math.floor(level / 4);
    var patterns = {};
    patterns[SHUFFLE_TYPE.BEFORE] = "SNNSNNNS";
    patterns[SHUFFLE_TYPE.FORE] =   "NSNH-SNH-";
    patterns[SHUFFLE_TYPE.BACK] =   "NNSNNH-Q---";
    var pattern = patterns[shuffleType];
    var key = "";
    if(pattern.length <= section){ key = "F";}//full
    else{
      var index = section;
      while(index >= 0){
        key = pattern.substr(index , 1);
        if(key != "-") break;
        if(--index < 0) key = "";
      }
    }
    var count;
    switch(key){
      case 'F': count = 4; break;//full
      case 'S': count = level - (section * 4) + 1; break;//single
      case 'H': count = Math.floor((level - (index * 4)) / 2) + 1; break;//half
      case 'Q': count = Math.floor((level - (index * 4)) / 4) + 1; break;//quarter
      case 'N': count = 0; break;//none
      default: throw 'invalid logic!';
    }
    return count;
  },
  signalAhHa: function(){
    for(var i=0; i<this.cards.length; i++){
      //this.cards[i].turn();
      var card = this.cards[i];
      var func = function(){ this.forceFlipBack(undefined); }
      if(card.surface == CARD.SURFACE.BACK) card.flipFore(func);
    }
  },
  dealComplete: { get: function(){ return (this.status == CARD_STATE.READY);} },
  allCardReady: { get: function(){
    var _A = CARD.ACTION;
    for (var i=0; i<this.cards.length; i++){
      var card = this.cards[i];
      if (card.type != CARD.TYPE.FORE.DOKURO){
        if (card.action != _A.READY && card.action != _A.EVAPORATE) return false;
      }
    }
    return true;
  }},
  enterFrame: function(){
    if (this.status == CARD_STATE.WAIT) return;
    switch(this.status){
      case CARD_STATE.STACK: if (this.allCardReady) this.dealCard(); break;
      case CARD_STATE.DEAL: if (this.allCardReady) this.showAllCard(CARD_STATE.SHOW); break;
      case CARD_STATE.SHOW:
        if (this.allCardReady) this.shuffleCard(CARD_STATE.SHUFFLE1, this.getShuffleCount(SHUFFLE_TYPE.FORE));
        break;
      case CARD_STATE.SHUFFLE1: if (this.allCardReady) this.memorizeWait(); break;
      case CARD_STATE.MEMORIZE: if (this.wait-- <= 0) this.hideAllCard(CARD_STATE.HIDE); break;
      case CARD_STATE.HIDE: 
        if (this.allCardReady) this.shuffleCard(CARD_STATE.SHUFFLE2, this.getShuffleCount(SHUFFLE_TYPE.BACK)); 
        break;
      case CARD_STATE.SHUFFLE2: if (this.allCardReady) this.status = CARD_STATE.READY; break;      
    }
  },
  dummy: function(){}
});

