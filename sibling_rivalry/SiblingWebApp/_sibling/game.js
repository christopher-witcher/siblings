// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
    console.log(path.toString());
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}
AssetManager.prototype.downloadAll = function (callback) {
    if (this.downloadQueue.length === 0) window.setTimeout(callback, 100);
    for (var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function () {
            console.log("dun: " + this.src.toString());
            that.successCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.addEventListener("error", function () {
            that.errorCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.src = path;
        this.cache[path] = img;
    }
}

AssetManager.prototype.getAsset = function (path) {
    //console.log(path.toString());
    return this.cache[path];
}


function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();

    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        if (x < 1024) {
            x = Math.floor(x / 32);
            y = Math.floor(y / 32);
        }

        return { x: x, y: y };
    }

    var that = this;

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousewheel", function (e) {
        that.wheel = e;
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function (drawCallback) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    if (drawCallback) {
        drawCallback(this);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.update();
    this.draw();
    this.click = null;
    this.wheel = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}

function Tile(x,y){
    this.x = x;
    this.y = y;
    this.top = true;
    this.bottom = true;
    this.left = true;
    this.right = true;
    this.color = "Yellow";
}

// GameBoard code below

function GameBoard(game) {
   
    Entity.call(this, game, 0, 0);
    this.board = initializeBoard();
}

GameBoard.prototype = new Entity();
GameBoard.prototype.constructor = GameBoard;

GameBoard.prototype.update = function () {
    Entity.prototype.update.call(this);
}



/*
Method used to build the initial board.
*/
var initializeBoard = function () {

    var output = []

    for (var x = 0; x <= 410; x++) {
        output[x] = [];
        for (var y = 0; y <= WIDTH; y++) {
            output[x][y] = new Tile(20 * x, 20 * y);
        }
    }

    return output;
}


GameBoard.prototype.draw = function (ctx) {
    
    for (var i = 0; i < this.board.length; i++) {
        var therow = this.board[i];
        for (var j = 0; j < therow.length; j++) {
            var thetile = therow[j];
            ctx.fillStyle = thetile.color;
            ctx.fillRect(thetile.x, thetile.y, 20, 20);
        }
    }
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Background.prototype.draw = function (ctx) {
    //Ground to run on
    ctx.fillStyle = "Green";
    ctx.fillRect(0, 500, 10240, 60);
    console.log("This function reached");

    //for (var i = 0; i < board.length; i++) {
    //    var therow = board[i];
    //    for (var j = 0; j < therow.length; j++) {
    //        var thetile = therow[j];
    //        ctx.fillStyle = thetile.color;
    //        ctx.fillRect(thetile.x, thetile.y, 20, 20);
    //    }
    //}
    //vertical grid lines comment out later
    ctx.fillStyle = "Black";
    
    for(var w = 0; w <= WIDTH; w+=20){
        ctx.fillRect(w, 0, 1, HEIGHT);
    }

    for (var h = 0; h <= HEIGHT; h+=20) {
        ctx.fillRect(0, h, WIDTH, 1);
    }
}

function Player(game) {

    Entity.call(this, game, 0, 460);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function () {
    //if (this.game.space) this.jumping = true;

    Entity.prototype.update.call(this);
}

Player.prototype.draw = function(ctx){
    var image = ASSET_MANAGER.getAsset("./img/myMarioSprite.png");
    try {
        ctx.drawImage(image, 0, 408);
    }catch(Exception){
        console.log(Exception.message);
    }
}

//Height and Width Contstants
var HEIGHT = 560;
var WIDTH = 1024;

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/myMarioSprite.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var gameboard = new GameBoard(gameEngine);
     
    var back = new Background(gameEngine);
    var player = new Player(gameEngine);
    gameEngine.addEntity(gameboard);

    gameEngine.addEntity(player);
    gameEngine.addEntity(back);

    
    gameEngine.init(ctx);
    gameEngine.start();
});

function Board() {

    this.board = [];

    for (var x = 0; x <= 410; x++) {
        this.board[x] = [];
        for (var y = 0; y <= WIDTH; y++) {          
            this.board[x][y] = new Tile(20 * x, 20 * y);        
        }
    }
}