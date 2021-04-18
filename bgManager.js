
/* bg manage */
var BG = {
  SIZE: 16,
  IMAGES: [
    IMG_BG_1_GLASS_GROUND, IMG_BG_2_STEPPE_COBBLED, IMG_BG_3_GLASS_TILE, IMG_BG_4_LAND_GRAVEL, 
    IMG_BG_5_LAND_WEED, IMG_BG_6_DIRT_LEDGE, IMG_BG_7_DIRT_GRAVEL, IMG_BG_8_LAVA_ORE
  ]
};

var StageBGGroup = enchant.Class.create(GroupBase, {
  initialize: function(controller){ //controller is GameStageGroup
    GroupBase.call(this, controller);
    this.terminate();//to stop auto start.
  },
  init: function(stage){
    this.terminate();
    this.image = this.getStageImage(stage);
    console.log(stage + ": " + this.image);
    this.map = this.getMap(stage, this.image);
    this.addChild(this.map);
  },
  terminate: function(){
    this.stop();
    this.removeAllChilds();
  },
  enterFrame: function(){
    if(!this._start) return;
  },
  getMap: function(stage, image){
    var game = enchant.Core.instance;
    var mapW = Math.floor(game.width / BG.SIZE) + 1;
    var mapH = Math.floor(game.height / BG.SIZE) + 1;
    var mabBase = this.getMapBase(mapW, mapH);
    var mapSource = this.drawMapBorder(image, mapW, mapH, mabBase);
    var map = new Map(BG.SIZE, BG.SIZE);
    map.image = game.assets[image];
    map.loadData(mapSource);
    return map;
  },
  getStageImage: function(stage){
    var images = BG.IMAGES;
    var length = images.length;
    var counter = 1, index = 0, max = 0;
    while(stage > counter++){
      if(index >= max){
        index = 0;
        max = (max + 1) % length;
      }else{ index += 1; }
    }
    return images[index];
  },
  drawMapBorder: function(image, mapW, mapH, mabBase){
    var mapSource = [];
    
    for(var y=0; y<mabBase.length; y++){
      var line = [];
      for(var x=0; x<mabBase[y].length; x++){
        if(mabBase[y][x] == 0){
          if(Math.random()*100 < 4){
            line.push(2);
          }else{
            line.push(1);
          }
        }else{//mabBase[y][x] == 1
          var directions = [
             this.getUpperPoint(mapW, mapH, x, y)
            ,this.getRightPoint(mapW, mapH, x, y)
            ,this.getUnderPoint(mapW, mapH, x, y)
            ,this.getLeftPoint(mapW, mapH, x, y)
          ];
          var pattern = '';
          while(directions.length > 0){
            var direction = directions.shift();
            pattern += '' + mabBase[direction.y][direction.x];
          }
          var tiles = {
             '0000': 0
            ,'0110': 3
            ,'0111': 4
            ,'0011': 5
            ,'1110': 6
            ,'1111': 7
            ,'1011': 8
            ,'1100': 9
            ,'1101': 10
            ,'1001': 11
          };
          var tile = tiles[pattern];
          if(typeof tile == 'undefined') tile = 7;
          line.push(tile);
        }
      }
      mapSource.push(line);
    }
    return mapSource;
  },
  getMapBase: function(mapW, mapH){
    var map = [];
    var x, y, i
    for(y=0; y<mapH; y++){
      var line = [];
      for(x=0; x<mapW; x++){ line.push(0); }
      map.push(line);
    }
    var pointCount = 3;
    while(pointCount > 0){
      x = Math.floor(Math.random() * mapW);
      y = Math.floor(Math.random() * mapH);
      if(map[y][x] == 0){
        this.setPoint(map, mapW, mapH, x, y);
        pointCount -= 1;
      }
    }
    return map;
  },
  setPoint: function(map, mapW, mapH, x, y){
    if(map[y][x] != 0){
      return;
    } else {
      map[y][x] = 1;
    }
    var i;
    var upper = this.getUpperPoint(mapW, mapH, x, y);
    var under = this.getUnderPoint(mapW, mapH, x, y);
    var left = this.getLeftPoint(mapW, mapH, x, y);
    var right = this.getRightPoint(mapW, mapH, x, y);
    var point = {};
    if(map[upper.y][upper.x] == 0 && map[under.y][under.x] == 0){
      point = [upper, under][Math.floor(Math.random() * 2)];
      this.setPoint(map, mapW, mapH, point.x, point.y);
    }
    if(map[left.y][left.x] == 0 && map[right.y][right.x] == 0){
      point = [left, right][Math.floor(Math.random() * 2)];
      this.setPoint(map, mapW, mapH, point.x, point.y);
    }
    var _directions = [upper, under, left, right];
    var directions = [];
    while(_directions.length > 0){
      var index = Math.floor(Math.random() * _directions.length);
      directions.push(_directions.splice(index, 1).shift()); 
    }
    var per = 50;
    while(directions.length > 0){
      var direction = directions.shift();
      if(map[direction.y][direction.x] == 0){
        if(Math.random()*100 < per){
          this.setPoint(map, mapW, mapH, direction.x, direction.y);
          break;
        }
      }
      per *= 0.5;
    }
  },
  getUpperPoint: function(mapW, mapH, x, y){
    var _y = (y - 1 + mapH) % mapH;
    return {y: _y, x: x};
  },
  getUnderPoint: function(mapW, mapH, x, y){
    var _y = (y + 1 + mapH) % mapH;
    return {y: _y, x: x};
  },
  getLeftPoint: function(mapW, mapH, x, y){
    var _x = (x - 1 + mapW) % mapW;
    return {y: y, x: _x};
  },
  getRightPoint: function(mapW, mapH, x, y){
    var _x = (x + 1 + mapW) % mapW;
    return {y: y, x: _x};
  },
  dummy: function(){}
});













