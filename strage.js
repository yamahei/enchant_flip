var MyLocalStrage = function(){
  if(window.localStorage){
    var arg = (arguments.length) ? arguments[0] : '';
    this.init(arg);
  }else{
    throw "localStorage not available...";
  }
};
(function(){
  MyLocalStrage.enable = (window.localStorage) ? true : false;
  var proto = MyLocalStrage.prototype;
  var myStrage, myData;
  proto.init = function(dataKey){
    this.DATA_KEY = dataKey || '_MyLocalStrage_DATA_KEY_';
    myStrage = window.localStorage;
    myData = JSON.parse(myStrage.getItem(this.DATA_KEY));
  };
  proto.get = function(){ return myData; };
  proto.set = function(data){
    myData = data;
    myStrage.setItem(this.DATA_KEY, JSON.stringify(data));
  };
  proto.remove = function(){ myStrage.removeItem(this.DATA_KEY); };
})();
