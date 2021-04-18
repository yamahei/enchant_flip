
/* title manage */
var GameTitleGroup = enchant.Class.create(GroupBase, {
  initialize: function(controller){//controller is GameController
    GroupBase.call(this, controller);
    var game = enchant.Core.instance;
    this.obj = {
      logo: this.setTitle(),
      newGame: this.setNewGame(),
      _continue: this.setContinue()
    };
    this.addChild(this.obj.logo);
    this.addChild(this.obj.newGame);
    this.addChild(this.obj._continue);
    this.terminate();//to stop auto start.
  },
  init: function(lastStage){
    this.x = 0; this.y = 0;
    this.visible = true;
    this.eventing = false;
    for(var key in this.obj){
      var obj = this.obj[key];
      obj.visible = true;
      obj.blink = false;
    }
    this.obj.logo.counter = FPS * 10;
    this.obj.newGame.counter = Math.floor(FPS * 0.5);
    this.obj._continue.counter = Math.floor(FPS * 0.5);
    this.obj._continue.visible = (lastStage <= 1) ? false : true;
  },
  terminate: function(){
    var game = enchant.Core.instance;
    this.x = game.width; this.y = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0));
    this.eventing = false;
    for(var key in this.obj){
      var obj = this.obj[key];
      obj.visible = false;
      obj.blink = false;
      obj.counter = 0;
    }
  },
  TitleToHiScore: function(){ /* TODO: */},
  startNewGame: function(){ this.controller.TitleToGame(false); },
  startContinue: function(){ this.controller.TitleToGame(true); },
  setTitle: function(){
    var game = enchant.Core.instance;
    var logo = game.assets[IMG_TITLE];
    var titleGroup = this;
    var title = new enchant.Sprite(logo.width, logo.height);
    title.image = logo;
    this.selObjectXY(title, -title.height);
    title.addEventListener('enterframe', function(e) {
      if(this.counter < 0) return;
      if(this.counter-- === 0) {
        if(!titleGroup.eventing) titleGroup.TitleToHiScore();
      }
    });
    return title;
  },
  setNewGame: function(){
    var titleGroup = this;
    var func = function(){ titleGroup.startNewGame(); };
    var offsetY = INFO.FONT_SIZE;
    return this.setStartEvent(this.getMutableText('NEW GAME'), func, offsetY);
  },
  setContinue: function(){
    var titleGroup = this;
    var func = function(){ titleGroup.startContinue(); };
    var offsetY = INFO.FONT_SIZE * 2.5;
    return this.setStartEvent(this.getMutableText('CONTINUE'), func, offsetY);
  },
  setStartEvent: function(obj, func, offsetY){
    var titleGroup = this;
    this.selObjectXY(obj, offsetY);
    obj.addEventListener('enterframe', function(e) {
      if(this.counter < 0) return;
      if(this.blink) {
        this.visible = !this.visible;
        if(this.counter-- === 0) {
          this.blink = false;
          func();
        }
      }
    });
    obj.addEventListener('touchend', function(e) {
      if(!titleGroup.eventing && this.visible) {
        titleGroup.eventing = true;
        this.blink = true;
      }
    });
    return obj;
  },
  selObjectXY: function(object, offsetY){
    var game = enchant.Core.instance;
    object.x = (game.width - object.width) / 2;
    object.y = ((game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0)) / 2) + offsetY;
  },
  dummy: function(){}
});


