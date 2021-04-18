/* sprite manage base for first-seed-material's image(24 x 32) */
var SpriteBase = enchant.Class.create(enchant.Sprite, {
  initialize: function(image){
    enchant.Sprite.call(this, 24, 32);
    this.image = enchant.Core.instance.assets[image];
    this.addEventListener('enterframe', function(e) { this.enterFrame(e); });
  },
  remove: function(){ this.parentNode.removeChild(this); },
  enterFrame: function(e){ /* SpriteBase::enterFrame */ },
  superposTop: function(){
    var parent = this.parentNode;
    if(parent.childNodes.length > 1){
      parent.removeChild(this);
      parent.addChild(this);
    }
  },
  dummy: function(){}
});

/* sprite manage base for first-seed-material's character(24 x 32) */
var ANIME = {
  DIRECTION: { UP: 0, RIGHT: 3, DOWN: 6, LEFT: 9},
  ACTION: { STAND: 0, WALK: 1, LOOP: 2, JUMP: 3},
  FRAMES: { WALK: [1, 0, 1, 2], LOOP: [0, 3, 6, 9] },
  UNIT: 4
};

var CharAnimation = enchant.Class.create({
  initialize: function(){
    this._animationCounter = 0;
    this._direction = ANIME.DIRECTION.DOWN;
    this._action = ANIME.ACTION.STAND;
  },
  frameNo: { get: function(){
    switch(this._action){
      case ANIME.ACTION.STAND:
        return this._direction + 1;// offset for stand
      case ANIME.ACTION.WALK:
        this.countUp();
        return this._direction + ANIME.FRAMES.WALK[this._animationCounter];
      case ANIME.ACTION.LOOP:
        this.nextDirection();
        return this._direction + 1;// offset for stand
      case ANIME.ACTION.JUMP:
        return this._direction + 0;// offset for jump
    }
  }},
  currentAction: { get: function(){ return this._action; } },
  setAction: function(a){ this._action = a; },
  doStand: function(){ this.setAction(ANIME.ACTION.STAND); },
  doWalk: function(){ this.setAction(ANIME.ACTION.WALK); },
  doLoop: function(){ this.setAction(ANIME.ACTION.LOOP); },
  doJump: function(){ this.setAction(ANIME.ACTION.JUMP); },
  getDirection: function(){ return this._direction; },
  setDirection: function(d){ this._direction = d; },
  setDirectionFromVector: function(v, w){
    var direction;
    if(v == 0 && w == 0){
      direction = ANIME.DIRECTION.DOWN;
    }else if(v == 0){
      direction = (w > 0) ? ANIME.DIRECTION.DOWN : ANIME.DIRECTION.UP;
    }else if(w == 0){
      direction = (v > 0) ? ANIME.DIRECTION.RIGHT : ANIME.DIRECTION.LEFT;
    }else{
      var a = w / v;
      if(-1 < a && a < 1){
        direction = (v > 0) ? ANIME.DIRECTION.RIGHT : ANIME.DIRECTION.LEFT;
      }else{
        direction = (w > 0) ? ANIME.DIRECTION.DOWN : ANIME.DIRECTION.UP;
      }
    }
    this.setDirection(direction);
  },
  turnUp: function(){ this.setDirection(ANIME.DIRECTION.UP); },
  turnRight: function(){ this.setDirection(ANIME.DIRECTION.RIGHT); },
  turnDown: function(){ this.setDirection(ANIME.DIRECTION.DOWN); },
  turnLeft: function(){ this.setDirection(ANIME.DIRECTION.LEFT); },
  countUp: function(){ this._animationCounter = ++this._animationCounter % ANIME.UNIT; },
  nextDirection: function(){
    switch(this._direction){
      case ANIME.DIRECTION.UP: this._direction = ANIME.DIRECTION.RIGHT; break;
      case ANIME.DIRECTION.RIGHT: this._direction = ANIME.DIRECTION.DOWN; break;
      case ANIME.DIRECTION.DOWN: this._direction = ANIME.DIRECTION.LEFT; break;
      case ANIME.DIRECTION.LEFT: this._direction = ANIME.DIRECTION.UP; break;
    }
  },
  dummy: function(){}
});

var CHAR = {
  POSITION: { UPPER: 1, LOWER: 2, LEFT: 3, RIGHT: 4 },
  STATE: { WAIT: 0, WALK: 1, STAY: 3, GO: 4, ACTION: 5, LAPSE: 6, EVEPORATE: 7 },
  COUNT: { APPEAR: 12, STAY: 24 * 4, GO: 12, ACTION: 12, LEAVE: 24, EVEPORATE: 8 },
  CARD_OFFSET: { x: 0, y: -12 }
};
var FAIRY = {
  MAX_SPEED: 8,
  MAX_TRACK: FPS * 1.5
};
var SpriteFairy = enchant.Class.create(SpriteBase, {
  initialize: function(controller){
    SpriteBase.call(this, IMG_CHAR_FAIRY);
    var game = enchant.Core.instance;
    this.controller = controller;
    this.leaving = false;
    this.active = true;
    this.anime = new CharAnimation();
    this.anime.doWalk();
    this.v = 0; this.w = 0;
    this.counter = 0;
    this.setStartPoint();
    this._toX = this.x;
    this._toY = this.y;
    this.toX = (game.width - this.width) / 2;
    this.toY = ((game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) - this.height) / 2;
  },
  setStartPoint: function(){
    var game = enchant.Core.instance;
    var cx = (game.width - this.width) / 2;
    var cy = ((game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0))) / 2;
    var r = Math.sqrt(cx*cx + cy*cy) + this.width * 2;
    rad = Math.floor(Math.random() * 360) * (Math.PI / 180);
    this.x = (cx + Math.sin(rad) * r) - (this.width / 2);
    this.y = (cy + Math.cos(rad) * r) - (this.height / 2);
    this.startPoint = { x: this.x, y: this.y };
  },
  enterFrame: function(e){
    if(!this.active) return;
    var game = enchant.Core.instance;
    if(this.anime.getDirection() != ANIME.DIRECTION.DOWN){
      if(game.frame % 3 == 0) { this.anime.nextDirection(); }
    }
    this.frame = this.anime.frameNo;

    var dx = this._toX - this.toX;
    var dy = this._toY - this.toY;
    var distance = Math.sqrt(dx*dx + dy*dy);
    if(distance < FAIRY.MAX_SPEED){
      this.counter += 1;
      var fx = this.x - this.toX;
      var fy = this.y - this.toY;
      var far = Math.sqrt(fx*fx + fy*fy);
      if(far < FAIRY.MAX_SPEED * 2.5 || this.counter > FPS * 2.5){
        if(this.anime.getDirection() == ANIME.DIRECTION.DOWN){
          this.anime.nextDirection();
        }
        var margin = game.width * 0.15;
        var margin2 = margin * 2;
        this.toX = margin +  (Math.random() * (game.width  - margin2 - this.width ));
        this.toY = margin +  (Math.random() * ((game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) - margin2 - this.height));
      }
    }else{
      this.counter = 0;
      this._toX = this.toX + (dx / distance);
      this._toY = this.toY + (dy / distance);
    }
    this.v += (this.x < this._toX) ? 1 : -1;
    this.w += (this.y < this._toY) ? 1 : -1;
    if(Math.abs(this.v) > FAIRY.MAX_SPEED) this.v = (Math.abs(this.v) / this.v) * FAIRY.MAX_SPEED;
    if(Math.abs(this.w) > FAIRY.MAX_SPEED) this.w = (Math.abs(this.w) / this.w) * FAIRY.MAX_SPEED;
    this.x += this.v;
    this.y += this.w;
    if(this.leaving){
      if(this.x<-this.width || game.width<this.x || this.y<-this.height || game.height<this.y){
        this.remove();
        this.active = false;
      }
    }
  },
  leave: function(){
    this.leaving = true;
    this.toX = this.startPoint.x;
    this.toY = this.startPoint.y;
  },
  dummy: function(){}
});


var SpriteInterfere = enchant.Class.create(SpriteBase, {
  initialize: function(image, controller, position){
    SpriteBase.call(this, image);
    this.controller = controller;
    this.anime = new CharAnimation();
    this.stayingPos = this.getStayingPos(position);
    this.x = this.stayingPos.hideX;
    this.y = this.stayingPos.hideY;
    this.status = CHAR.STATE.WAIT;
    this.nextStatus = CHAR.STATE.WAIT;
    this.counter = 0;
    this.counterMax = 0;
    this.action = false;
    this.visible = false;
  },
  getStayingPos: function(position){
    var game = enchant.Core.instance;
    var gameW = game.width; var gameH = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0));
    var charW = this.width; var charH = this.height;
    var centerX = (gameW - charW) / 2;
    var centerY = (gameH - charH) / 2;
    switch(position){
      case CHAR.POSITION.UPPER:
        return { hideX: centerX, hideY: -charH
               , stayX: centerX, stayY: (charH * 0.5) };//stayY: 0
      case CHAR.POSITION.LOWER:
        return { hideX: centerX, hideY: gameH
               , stayX: centerX, stayY: gameH - (charH * 1.5) };//stayY: gameH - charH
      case CHAR.POSITION.LEFT:
        return { hideX: -charW, hideY: centerY
               , stayX: 0, stayY: centerY };
      case CHAR.POSITION.RIGHT:
        return { hideX: gameW, hideY: centerY
               , stayX: gameW - charW, stayY: centerY };
    }
  },
  evaporate: function(){
    if(this.status != CHAR.STATE.EVEPORATE && this.status != CHAR.STATE.LAPSE){
      this.status = CHAR.STATE.EVEPORATE;
      this.counter = 0;
      this.counterMax = CHAR.COUNT.EVEPORATE;
      this.anime.doLoop();
      var effect = new SpriteEffect(EFFECT.TYPE.FLIP);
      var char = this;
      effect.setChar(char, 
        function(){ return char.status == CHAR.STATE.EVEPORATE ? true : false; }, 
        function(){ return char.status != CHAR.STATE.EVEPORATE ? true : false; }
      );
      this.parentNode.addChild(effect);
    }
  },
  doAction: function(){ alert('override doAction, goto target location!'); },
  leave: function(){
    var action = this.action;
    var status = this.status;
    if(action == false && status != CHAR.STATE.STAY) return;
    if(action == true && status != CHAR.STATE.GO && status != CHAR.STATE.ACTION) return;
    this.forceLeave();
  },
  forceLeave: function(){
    if(this.status == CHAR.STATE.EVEPORATE) return;
    this.status = CHAR.STATE.WALK;//to leave
    this.nextStatus = CHAR.STATE.LAPSE;
    this.fromX = this.x; this.fromY = this.y;
    this.goalX = this.stayingPos.hideX;
    this.goalY = this.stayingPos.hideY;
    this.anime.doWalk();
    var v = this.goalX - this.fromX;
    var w = this.goalY - this.fromY;
    this.anime.setDirectionFromVector(v, w);
    this.counter = 0;
    this.counterMax = CHAR.COUNT.LEAVE;
  },
  enterFrame: function(e){
    switch(this.status){
      case CHAR.STATE.WAIT: 
        this.status = CHAR.STATE.WALK;//to appear
        this.nextStatus = CHAR.STATE.STAY;
        this.fromX = this.x; this.fromY = this.y;
        this.goalX = this.stayingPos.stayX;
        this.goalY = this.stayingPos.stayY;
        this.anime.doWalk();
        var v = this.goalX - this.fromX;
        var w = this.goalY - this.fromY;
        this.anime.setDirectionFromVector(v, w);
        this.counter = 0;
        this.counterMax = CHAR.COUNT.APPEAR;//TODO: stage shorter 
        this.visible = true;
        break;
      case CHAR.STATE.WALK: 
        var v = (this.goalX - this.fromX) / this.counterMax;
        var w = (this.goalY - this.fromY) / this.counterMax;
        this.x += v; this.y += w;
        if(this.counter++ >= this.counterMax){
          this.x = this.goalX;
          this.y = this.goalY;
          this.status = this.nextStatus;
          this.counter = 0;
        }
        break;
      case CHAR.STATE.STAY:
        this.anime.doStand();
        this.anime.setDirection(ANIME.DIRECTION.DOWN);
        if(this.counter++ >= CHAR.COUNT.STAY) {
          this.status = CHAR.STATE.GO;
        }
        break;
      case CHAR.STATE.GO:
        if(this.actionInit()){
          this.status = CHAR.STATE.ACTION;
        }else{
          this.leave();
        }
        break;
      case CHAR.STATE.ACTION:
        if(!this.isActionDoing()) {
          if(this.canActionDone()) this.actionDone();
          this.leave();
        } else {
          if(!this.canActionDone()) this.leave();
        }
        break;
      case CHAR.STATE.EVEPORATE:
        this.y += (this.counter - this.counterMax);
        if(this.counter++ >= this.counterMax) this.status = CHAR.STATE.LAPSE;
        break;
    }
    this.frame = this.anime.frameNo;
  },
  actionInit: function(){ return false;/*alert('override actionInit!');*/ },
  isActionDoing: function(){ alert('override actionDoing!'); },
  canActionDone: function(){ alert('override actionDoing!'); },
  actionDone: function(){ alert('override actionDone!'); },
  dummy: function(){}
});

var InterfereSingleCard = enchant.Class.create(SpriteInterfere, {
  initialize: function(image, controller, position){
    SpriteInterfere.call(this, image, controller, position);
  },
  selectableCard: function(card){ return true;/*alert('must override selectableCard!');*/ },
  charCardOffsetX: { get: function(){ return CHAR.CARD_OFFSET.x; }},
  charCardOffsetY: { get: function(){ return CHAR.CARD_OFFSET.y; }},
  doAction: function(){
    if(this.status == CHAR.STATE.STAY){
      var card = this.controller.getTargetCard(this.selectableCard);
      if(card){
        this.action = true;
        this.status = CHAR.STATE.WALK;//to go
        this.nextStatus = CHAR.STATE.GO;
        this.fromX = this.x; this.fromY = this.y;
        this.goalX = card.x + this.charCardOffsetX;
        this.goalY = card.y + this.charCardOffsetY;
        var v = this.goalX - this.fromX;
        var w = this.goalY - this.fromY;
        this.anime.setDirectionFromVector(v, w);
        this.target = card;
        this.counter = 0;
        this.counterMax = CHAR.COUNT.GO;
      }else{
        this.leave();
      }
    }
  },
  charCountAction: { get: function(){ return CHAR.COUNT.ACTION; }},
  actionInit: function(){
    if(this.status == CHAR.STATE.GO){
      var card = this.target;
      if(!card){ return false; }
      if(card.surface == CARD.SURFACE.BACK){
        if(card.action == CARD.ACTION.READY || card.action == CARD.ACTION.TREMBLE){
          this.status = CHAR.STATE.ACTION;
          this.counter = 0;
          this.counterMax = this.charCountAction;
          this.anime.doLoop();
          return true;
        }
      }
    }
    return false;
  },
  isActionDoing: function(){ return (this.counter++ < this.counterMax) ? true : false; },
  canActionDone: function(){ return this.selectableCard(this.target); },
  actionDone: function(){ alert('must override!'); },
  dummy: function(){}
});

var InterfereSnow = enchant.Class.create(InterfereSingleCard, {
  initialize: function(controller, position){
    InterfereSingleCard.call(this, IMG_CHAR_SNOW, controller, position);
  },
  selectableCard: function(card){
    return (card.state == CARD.STATE.NORMAL) ? true : false;
  },
  actionDone: function(){
    var card = this.target;
    if(card) card.freeze();
  },
  dummy: function(){}
});

var InterfereFrame = enchant.Class.create(InterfereSingleCard, {
  initialize: function(controller, position){
    InterfereSingleCard.call(this, IMG_CHAR_FRAME, controller, position);
  },
  selectableCard: function(card){
    return (card.state != CARD.STATE.BURNED) ? true : false;
  },
  actionDone: function(){
    var card = this.target;
    if(card){
      switch(card.state){
        case CARD.STATE.NORMAL: card.burn(); break;
        case CARD.STATE.ICED: card.melt(); break;
      }
    }
  },
  dummy: function(){}
});

var InterfereGirl = enchant.Class.create(InterfereSingleCard, {
  initialize: function(controller, position){
    InterfereSingleCard.call(this, IMG_CHAR_GIRL, controller, position);
  },
  actionDone: function(){
    var card = this.target;
    if(card) card.touchend({});
  },
  charCardOffsetY: { get: function(){ return 12; }},
  charCountAction: { get: function(){ return 0; }},
  dummy: function(){}
});

var InterfereSwitch = enchant.Class.create(InterfereSingleCard, {
  initialize: function(controller, position){
    InterfereSingleCard.call(this, IMG_CHAR_SWITCH, controller, position);
  },
  canActionDone: function(){ return true; },
  selectableCard: function(card){
    var cardController = card.controller;
    if(cardController.cards.length == CARD.ALL) return false;
    return cardController.canSelect(card);    
  },
  actionInit: function(){
    if(this.status == CHAR.STATE.GO){
      var card = this.target;
      if(!card){ return false; }
      if(card.surface == CARD.SURFACE.BACK){
        if(card.action == CARD.ACTION.READY || card.action == CARD.ACTION.TREMBLE){
          var lastPosition = this.controller.getCardlastPosition();
          if (!lastPosition) return false;
          var char = this;
          var func = function(){ return (char.status == CHAR.STATE.ACTION) ? true : false; };
          if (!card.carry(func)) return false;
          this.lastPosition = lastPosition;
          this.startPosition = { x: card.x, y: card.y };
          this.status = CHAR.STATE.ACTION;
          this.counter = 0;
          this.counterMax = this.charCountAction;
          this.anime.doWalk();
          var v = this.lastPosition.x - this.startPosition.x;
          var w = this.lastPosition.y - this.startPosition.y;
          this.anime.setDirectionFromVector(v, w);
          return true;
        }
      }
    }
    return false;
  },
  isActionDoing: function(){
    var x0 = this.startPosition.x;
    var y0 = this.startPosition.y;
    var x1 = this.lastPosition.x;
    var y1 = this.lastPosition.y;
    var _x = ((x1 - x0) / this.counterMax);
    var _y = ((y1 - y0) / this.counterMax);
    this.x += _x; this.y += _y;
    var card = this.target;
    card.x += _x; card.y += _y;
    if(this.counter++ <= this.counterMax){
      return true;
    } else {
      card.x = this.lastPosition.x;
      card.y = this.lastPosition.y;
      return false;
    }
  },
  actionDone: function(){/* do nothing */},
  charCardOffsetY: { get: function(){ return 12; }},
  charCountAction: { get: function(){ return CARD.COUNTER.JUMP; }},
  dummy: function(){}
});

var InterfereJoker = enchant.Class.create(InterfereSingleCard, {
  initialize: function(controller, position){
    InterfereSingleCard.call(this, IMG_CHAR_JOKER, controller, position);
  },
  selectableCard: function(card){
    if (card.state != CARD.STATE.NORMAL) return false;
    return (card.type != CARD.TYPE.FORE.DOKURO) ? true : false;
  },
  actionDone: function(){
    var card = this.target;
    if(card) card.poison();
  },
  dummy: function(){}
});


/* sprite manage base for first-seed-material's effect(24 x 32) */
var EFFECT = {
  TYPE: { NONE: -1, FLIP: 0, ICE: 1, FIRE: 2, TWINK_W: 3, TWINK_Y: 4 },
  ANIME: { UNIT: 3, FPS: 8 }
};
var SpriteEffect = enchant.Class.create(SpriteBase, {
  initialize: function(type){
    var game = enchant.Core.instance;
    SpriteBase.call(this, IMG_EFFECT);
    this._type = type;
    this.visible = false;
  },
  setChar: function(char, isActiveFunc, isRemoveFunc){
    this._char = char;
    this._isActiveFunc = isActiveFunc;
    this._isRemoveFunc = isRemoveFunc;
  },
  frameNo: { get: function(){
    var game = enchant.Core.instance;
    var frame = game.frame;
    var fps = EFFECT.ANIME.FPS / FPS;
    var animeOffset = Math.floor(frame * fps) % EFFECT.ANIME.UNIT;
    return (this._type * EFFECT.ANIME.UNIT) + animeOffset;
  }},
  enterFrame: function(e){
    var nowVisible = this.visible;
    if(this._char && this._isActiveFunc) this.visible = this._isActiveFunc();
    if(this.visible) {
      if(nowVisible != this.visible){
        this.x = this._char.x;
        this.y = this._char.y;
      } else {
        this.x += (this._char.x - this.x) * 0.3;
        this.y += (this._char.y - this.y) * 0.3;
      }
      this.superposTop();
      this.frame = this.frameNo;
      if(this._isRemoveFunc) if(this._isRemoveFunc()) this.remove();
    }
  },
  dummy: function(){}
});

/* sprite manage for my cards(24 x 32) */
var CARD = {
  ALL: 16,
  SURFACE: { FORE: 0, BACK: 1 },
  STATE: { NORMAL: 0, BURNED: 1, ICED: 2 },
  ACTION: { READY: 0, MOVE: 1, FLIPFORE: 2, FLIPBACK: 3, JUMP: 4, TREMBLE: 5, WRONG: 6, EVAPORATE: 7, CARRY: 8, TURN: 9 },
  COUNTER: { JUMP: 12, TREMBLE: 12, EVAPORATE: 6, FREEZING: 6, TURN: 24 },
  TYPE: { 
    FORE: {
      WHITE: 0, APPLE: 1, BANANA: 2, GRAPE: 3, MELON: 4, CHERRY: 5, PINE: 6, SUIKA: 7, ICHIGO: 8, DOKURO: 9, BURNED: 10
    },
    BACK: { NORMAL: -1, ICED: -2, BURNED: -3 }
  },
  SCORE: { DOKURO: 4, BURNED: 3, ICED: 2, NORMAL: 1 },
  FRAME: {
    UNIT: 14,
    FORE: {},
    BACK: {}
  }
};

var SpriteCard = enchant.Class.create(SpriteBase, {
  initialize: function(no, type, controller){
    var game = enchant.Core.instance;
    SpriteBase.call(this, IMG_CARD);
    this.no = no;
    this.type = type;
    this.controller = controller;
    this.surface = CARD.SURFACE.BACK;
    this.state = CARD.STATE.NORMAL;
    this.action = CARD.ACTION.READY;
    this.wait = 0; this.counter = 0; this.freezing = 0;
    this.x = game.width; this.y = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0));
    this.addEventListener('touchend', function(e) { this.touchend(e) });
  },
  setEffect: function(){
    var card = this;
    var cardActive = function(){
      if(!card.visible) return false;
      switch(card.action){
        //case CARD.ACTION.FLIPFORE:
        //case CARD.ACTION.FLIPBACK:
        //case CARD.ACTION.FLIPFORE:
        case CARD.ACTION.EVAPORATE:
          return true;
        default: return false;
      }
    };
    var cardRemove = function(){ return card ? false : true; };
    var effect = new SpriteEffect(EFFECT.TYPE.FLIP);
    effect.setChar(card, cardActive, cardRemove);
    this.parentNode.addChild(effect);
  },
  carry: function (func){
    if (this.action == CARD.ACTION.READY){
      this.action = CARD.ACTION.CARRY;
      this.surface = CARD.SURFACE.BACK;
      this.carryingCheck = func;
      this.wait = 0;
      this.sound = SOUND_MOVE;
      return true;
    } else { return false; }
  },
  evaporate: function(wait){
    if(this.action == CARD.ACTION.READY){
      if(this.type == CARD.TYPE.FORE.DOKURO){
        this.sound = SOUND_POISON;
      }else{
        this.sound = SOUND_BINGO;
      }
      this.action = CARD.ACTION.EVAPORATE;
      this.counter = CARD.COUNTER.EVAPORATE;
      this.readyY = this.y;
      this.wait = wait || 0;
    }
  },
  turn: function(){
    if(this.action == CARD.ACTION.READY && this.surface == CARD.SURFACE.BACK){
      this.action = CARD.ACTION.TURN;
      this.counter = CARD.COUNTER.TURN;
      this.readyY = this.y;
      this.wait = 0;
    }
  },
  move: function(toX, toY, wait, callback){
    if(this.action == CARD.ACTION.READY){
      this.action = CARD.ACTION.MOVE;
      this._toX = Math.floor(toX);
      this._toY = Math.floor(toY);
      this.wait = wait || 0;
      this.callback = callback;
      this.sound = SOUND_FLIP;
    }
  },
  jump: function(toX, toY, wait, callback){
    if(this.action == CARD.ACTION.READY){
      this.action = CARD.ACTION.JUMP;
      this._toX = Math.floor(toX);
      this._toY = Math.floor(toY);
      this._toW = (this._toX - this.x) / CARD.COUNTER.JUMP;
      this._toH = (this._toY - this.y) / CARD.COUNTER.JUMP;
      this.counter = CARD.COUNTER.JUMP;
      this.wait = wait || 0;
      this.callback = callback;
      this.sound = SOUND_FLIP;
    }
  },
  flipFore: function(callback){
    if(this.action == CARD.ACTION.READY){
      this.forceFlipFore(callback);
    }
  },
  forceFlipFore: function(callback){
    this.action = CARD.ACTION.FLIPFORE;
    this.surface = CARD.SURFACE.BACK;
    this.readyY = this.y;
    this.wait = 0;
    this.callback = callback;
    this.sound = SOUND_FLIP;
  },
  flipBack: function(callback){
    if(this.action == CARD.ACTION.READY)
    this.forceFlipBack(callback);
  },
  forceFlipBack: function(callback){
    this.action = CARD.ACTION.FLIPBACK;
    this.surface = CARD.SURFACE.FORE;
    this.readyY = this.y;
    this.wait = 0;
    this.callback = callback;
    this.sound = SOUND_FLIP;
  },
  tremble: function(callback){
    if(this.action == CARD.ACTION.READY){
      this.action = CARD.ACTION.TREMBLE;
      this.counter = CARD.COUNTER.TREMBLE;
      this.readyX = this.x;
      this.wait = 0;
      this.sound = undefined;
      this.callback = callback;
    }
  },
  freeze: function(){
    this.state = CARD.STATE.ICED;
    this.freezing = CARD.COUNTER.FREEZING * FPS;
    this.wait = 0;
    this.sound = SOUND_ICE;
  },
  melt: function(){
    if(this.freezing >= 0){
      this.freezing = 0;
      this.tremble(function(){ this.state = CARD.STATE.NORMAL; });
    }
  },
  wrong: function(callback){
    this.tremble(callback);
    this.sound = undefined;
    this.action = CARD.ACTION.WRONG;
  },
  poison: function(){
    if (this.state == CARD.STATE.NORMAL) {
      var controller = this.controller;
      var func = function(){ controller.checkClear(); };
      this.type = CARD.TYPE.FORE.DOKURO;
      this.tremble(func);
      this.sound = SOUND_POISON;
    }
  },
  burn: function(){
    this.state = CARD.STATE.BURNED;
    this.wait = 0;
    this.sound = SOUND_FRAME;
  },
  touchend: function(e){
    var controller = this.controller;
    if(!controller.isInGame) return;
    if(this.controller.canSelect(this) && this.freezing <= 0) {
      this.flipFore(function(){ controller.check(); });
    } else {
      this.tremble(undefined);
    }
  },
  enterFrame: function(e){
    this.frame = this.currentFrame;
    if(this.state == CARD.STATE.ICED){
      if(this.freezing > 0){
        this.freezing -= 1;
      }else{
        this.melt();
      }
    }
    if(this.wait == 0 ){
      this.superposTop();
      if(this.sound) this.controller.playSound(this.sound);
    }
    if(this.wait-- >= 0) return;
    if(this.action == CARD.ACTION.READY) return;
    switch(this.action){
      case CARD.ACTION.MOVE:
        this.x += (this._toX - this.x) * 0.5; this.y += (this._toY - this.y) * 0.5;
        if(Math.round(this.x) == this._toX && Math.round(this.y) == this._toY){
          this.x = this._toX; this.y = this._toY;
          this.action = CARD.ACTION.READY;
          if(this.callback) this.callback();
        }
        break;
      case CARD.ACTION.JUMP:
        var jumping;
        if(this.counter > 0){
          jumping = Math.floor(CARD.COUNTER.JUMP / 2) - this.counter;
          this.x += this._toW; this.y += this._toH + jumping * 1.5;
          this.counter -= 1;
        }else{
          this.counter = 0;
          this.x = this._toX; this.y = this._toY;
          this.action = CARD.ACTION.READY;
          if(this.callback) this.callback();
        }
        break;
      case CARD.ACTION.FLIPFORE:
        if(this.surface == CARD.SURFACE.BACK){
          if(this.scaleX * this.width >= 3){
            this.scaleX /= 2;
            this.y -= (this.scaleX * this.height) / 3;
          }else{
            this.surface = CARD.SURFACE.FORE;
          }
        }else{//this.surface == CARD.SURFACE.FORE
          if(this.scaleX < 0.5){
            this.scaleX *= 2;
            this.y += (this.scaleX * this.height) / 3;
          }else{
            this.scaleX = 1;
            this.y = this.readyY;
            this.action = CARD.ACTION.READY;
            if(this.callback) this.callback();
          }
        }
        break;
      case CARD.ACTION.FLIPBACK:
        if(this.surface == CARD.SURFACE.FORE){
          if(this.scaleX * this.width >= 3){
            this.scaleX /= 2;
            this.y -= (this.scaleX * this.height) / 3;
          }else{
            this.surface = CARD.SURFACE.BACK;
          }
        }else{//this.surface == CARD.SURFACE.BACK
          if(this.scaleX < 0.5){
            this.scaleX *= 2;
            this.y += (this.scaleX * this.height) / 3;
          }else{
            this.scaleX = 1;
            this.y = this.readyY;
            this.action = CARD.ACTION.READY;
            if(this.callback) this.callback();
          }
        }
        break;
      case CARD.ACTION.TREMBLE:
      case CARD.ACTION.WRONG: //same action, but other name
        var game = enchant.Core.instance;
        if(this.counter > 0){
          this.x = this.readyX + ((game.frame % 2) * 2 - 1);
          this.counter -= 1;
        }else{
          this.x = this.readyX;
          this.action = CARD.ACTION.READY;
          if(this.callback) this.callback();
        }
        break;
      case CARD.ACTION.EVAPORATE:
        if(this.counter > 0){
          jumping = this.counter;//CARD.COUNTER.EVAPORATE - this.counter;
          this.y -= jumping * 1.5;
          this.scaleX /= 2;
          this.counter -= 1;
        }else{
          this.counter = 0;
          this.y = this.readyY;
          this.action = CARD.ACTION.READY;
          this.controller.evaporate(this);
        }
        break;
      case CARD.ACTION.CARRY:
        if(!this.carryingCheck()){ this.action = CARD.ACTION.READY; }
        break;
      case CARD.ACTION.TURN:
        if(this.counter > 0){
          var halfCount = CARD.COUNTER.TURN * 0.5;
          var quatCount = CARD.COUNTER.TURN * 0.25;
          var halfValue = this.counter % halfCount;
          var fullAccel = this.counter - halfCount;
          var halfAccel = halfValue - quatCount;
          var section = Math.floor(this.counter / quatCount);
          this.surface = (section == 1 || section == 2) ? CARD.SURFACE.FORE : CARD.SURFACE.BACK;
          var scaleX = Math.abs((halfAccel == 0 ? 1 : halfAccel) / halfCount);
          this.scaleX = Math.floor((scaleX * 10) + 0.5) / 10;
          this.y -= fullAccel * 0.25;
          this.counter -= 1;
        }else{
          this.counter = 0;
          this.scaleX = 1;
          this.y = this.readyY;
          this.action = CARD.ACTION.READY;
          this.surface = CARD.SURFACE.BACK;
        }
        break;
    }
  },
  currentFrame: { get: function(){
    if(this.surface == CARD.SURFACE.BACK){
      switch(this.state){
        case CARD.STATE.NORMAL: return CARD.TYPE.BACK.NORMAL + CARD.FRAME.UNIT;
        case CARD.STATE.ICED: return CARD.TYPE.BACK.ICED + CARD.FRAME.UNIT;
        case CARD.STATE.BURNED: return CARD.TYPE.BACK.BURNED + CARD.FRAME.UNIT;
      }
    }else{//if(this.surface == CARD.SURFACE.FORE){
      switch(this.state){
        case CARD.STATE.NORMAL: return this.type;
        case CARD.STATE.ICED: return this.type;//normally, iced card cant flip fore!
        case CARD.STATE.BURNED: return CARD.TYPE.FORE.BURNED;
      }
    }
  }},
  dummy: function(){}
});

