
/* top level game manage */
var GameController = enchant.Class.create({
  initialize: function(){
    var game = enchant.Core.instance;

    this.title = new GameTitleGroup(this);
    game.rootScene.addChild(this.title);

    this.stage = new GameStageGroup(this);
    game.rootScene.addChild(this.stage);

    this.storage = new MyLocalStrage(DATAKEY);
    var data = this.storage.get();
    this.data = data || this.getDefaultData();

    this.title.init(this.data[DATAKEY_LASTSTAGE]);

  },
  TitleToHiScore: function(){
    alert('TODO: TitleToHiScore');
  },
  TitleToGame: function(isContinue){
    var stage = isContinue ? this.data[DATAKEY_LASTSTAGE] : 1;
    this.title.terminate();
    this.stage.init(stage);
  },
  GameToTitle: function(){
    this.stage.terminate();
    this.title.init(this.data[DATAKEY_LASTSTAGE]);
  },
  dataUpdate: function(){
    this.storage.set(this.data);
  },
  setLastStage: function(stage){
    this.data[DATAKEY_LASTSTAGE] = stage;
    this.dataUpdate();
  },
  getDefaultData: function(){
    var data = {};
    data[DATAKEY_LASTSTAGE] = 0;
    data[DATAKEY_HISCORES] = [];
    for(var i=5; i>0; i--){
      var hiscore = {};
      hiscore[DATAKEY_HISCORE] = Math.pow(10, i);
      hiscore[DATAKEY_HISTAGE] = i*i;
      data[DATAKEY_HISCORES].push(hiscore);
    }
    return data;
  },
  dummy: function(){}
});

/* group of Stage's childs manage base */
var GroupBase = enchant.Class.create(enchant.Group, {
  initialize: function(controller){
    enchant.Group.call(this);
    this._start = false;
    this.controller = controller;
    this.addEventListener('enterframe', function(e){ this.enterFrame(e); });
  },
  removeAllChilds: function(){
    while(this.childNodes.length > 0) {
      this.removeChild(this.firstChild);
    }
  },
  start: function(){ this._start = true; },
  stop: function(){ this._start = false; },
  isInGame: { get: function(){ return this._start; } },
  init: function(){ alert('called init when navigate!: ' + this); },
  terminate: function(){ alert('called terminate when leave!: ' + this); },
  enterFrame: function(){ /* console.log('enterframe!'); */ },
  playSound: function(file){
    var game = enchant.Core.instance;
    //if(typeof(monaca) === 'undefined'){
      game.assets[file].clone().play();
    //}else{
    //  monaca_sound_play(file);
    //}
  },
  getMutableText: function(text){
    var game = enchant.Core.instance;
    var textWidth = text.length * INFO.FONT_SIZE + 1;// bug of MutableText?
    var textX = (game.width - textWidth) / 2;
    var textY = (game.height - ((APP_MODE == APP.MODE.FREE) ? 30 : 0));
    var textBox = new enchant.ui.MutableText(textX, textY, textWidth, INFO.FONT_SIZE);
    textBox.setText(text);
    return textBox;
  },
  dummy: function(){}
});





