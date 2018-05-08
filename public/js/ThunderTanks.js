var mySessionId;
var currentStateDiv = $('#currentState');
var updatedScore = $('#updatedScore');
if (typeof io != 'undefined') {
    var multiplayerConn = io.connect('/room');
	var commandConn = io.connect('http://127.0.0.1:5050/command');
    multiplayerConn.on('connect', function() {
        console.log("connected to multiplayer server");
        mySessionId = multiplayerConn.id;
        $('#session-id').text(mySessionId);
        tt.alerts.connected();
    });
    commandConn.on('connect', function() {
        console.log('command server connected');
    })
}
var tt = (function(tt) {
    /** @type JSGameSoup */
    tt.game;

    // this entity gets a high priority for debugging/drawing collission borders
    tt.priority = 1;

    /** @type String The URL path (without trailing /) */

    tt.urlPath = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/') - (/\/$/.test(window.location.pathname) ? 1 : 0));
	   
	// draws collision boundaries
    tt.debug = false;

    var _private = {
        /** Tanks by id **/
        tanks: {},

        tankArray: [],

        /** @type Array */
        obstacles: [],

        /** @type Array */
        bullets: [],

        playerTankDeployed: false,

        isGameinPause: false
    };

    /**
     * Game Update (collision checks)
     *
     * @param {JSGameSoup} gs JSGameSoup instance
     */
    tt.update = function(gs) {
        //collide bullets and map objects
        collide.aabb(_private.bullets, _private.obstacles);

        // collide bullets and bullets
        collide.circles(_private.bullets, _private.bullets);

        // collide bullets and tanks
        collide.aabb(_private.bullets, _private.tankArray);


        // collide tanks and map objects
        collide.aabb(_private.tankArray, _private.obstacles);

        // collide tanks and tanks
        //collide.aabb(_private.tankArray, _private.tankArray);

        return;
    }

    tt.draw = function(c, gs) {
      /** draw collision areas */
      if (tt.debug) {
        var entities = _private.tankArray.concat(_private.obstacles);

        c.lineWidth = 1;
        for(var i = 0; i < entities.length; i++) {
          // draw aabb collision box
          if (entities[i].get_collision_aabb) {
            var aabb = entities[i].get_collision_aabb();
            c.strokeStyle = '#ff0000';
            c.rect(aabb[0], aabb[1], aabb[2], aabb[3]);
            c.stroke();
          }

          // draw circle collision box
          if (entities[i].get_collision_circle) {
            var circle = entities[i].get_collision_circle();
            c.strokeStyle = '#0000ff';
            c.beginPath();
            c.arc(circle[0][0], circle[0][1], circle[1], 0, 2 * Math.PI, false);
            c.stroke();
          }

          // draw polygon collision box
          if (entities[i].get_collision_poly) {
            var poly = entities[i].get_collision_poly();
            c.strokeStyle = '#ff00ff';
            c.beginPath();
            c.moveTo(poly[0][0],poly[0][1]);
            for(var p = 1; p < poly.length; p++) {
              c.lineTo(poly[p][0],poly[p][1]);
            }
            c.closePath();
            c.stroke();
          }
        }
      }
    }

    /**
     * @param {Object} data  The tanks data (id, x, y)
     * @param {Boolean} remote  True if the tanks is a remote tanks
     */
    tt.addTank = function(data, remote) {
        tt.game.addEntity(_private.tanks[data.id] = new Tank(tt, data, remote));
        _private.tankArray = $.map(_private.tanks, function(value,index) { return value;})
        return _private.tanks[data.id];
    }

    tt.addMap = function(mapConfig) {
        var map = new Map(tt, mapConfig);
        tt.game.addEntity(map);
        return map;
    }

    tt.addObstacle = function(obst) {
        tt.game.addEntity(obst);
        _private.obstacles.push(obst);
        return obst;
    }

    tt.getObstacles = function() {
        return _private.obstacles;
    }

    /** Adds a bullet to the game.
     *
     * @param {int} startx The starting x coordinate.
     * @param {int} starty The starting y coordinate.
     * @param {int} targetx The target x coordinate.
     * @param {int} targety The target y coordinate.
     * @returns {Bullet} An instance of a Bullet.
     */
    tt.addBullet = function(startx, starty, targetx, targety, sessionId) {
        var sessionIdId = sessionId || mySessionId;
        var b = new Bullet(tt, _private.bullets.length, startx, starty, targetx, targety, 5, sessionIdId);
        _private.bullets.push(b);
        tt.game.addEntity(b);
        return b;
    }

    tt.removeTank = function(id, session) {
        var tank = _private.tanks[id];

        // remove the tank from the game
        tt.game.delEntity(tank);
        delete _private.tanks[id];
        _private.tankArray = $.map(_private.tanks, function(value,index) { return value;});

        // sometimes tank is undefined, not sure why,
        if (tank) {
          // if this was not a remote tank
          if (!tank.isRemote()) {
              // show alert
              tt.alerts.killed();
              _private.playerTankDeployed = false;

              // tell server this tank is dead
              if (typeof multiplayerConn != 'undefined') {
                  multiplayerConn.emit('tank-killed', session);
              }
          }
        }

        return
    };

    tt.removeBullet = function(bulletIndex) {
        tt.game.delEntity(_private.bullets[bulletIndex]);
        delete _private.bullets[bulletIndex];
    };

    // defines clickable area
    tt.pointerBox = function() {
        return [0, 0, tt.game.width, tt.game.height];
    }

    tt.pointerDown = function(button) {
        if (!_private.playerTankDeployed) {
            _private.playerTankDeployed = true;
            var mouseposition = tt.game.pointerPosition,
                mousex = mouseposition[0],
                mousey = mouseposition[1];

            switch (button) {
                case 0:
                    if (typeof multiplayerConn != 'undefined') {
                        multiplayerConn.emit('add-player-tank', {x: mousex, y:mousey});
                    } else {
                        tt.addTank({id: 'player', x: mousex, y:mousey}, false);
                    }
                    break;
                case 2:
                    break;
            }

            tt.alerts.clear();
        }
    };

    tt.keyDown_13 = function() {
        if (!_private.playerTankDeployed) {
            _private.playerTankDeployed = true;

            var randomX = Math.floor(Math.random() * 0.8 * tt.game.width) + tt.game.width/9;
            var randomY = Math.floor(Math.random() * 0.8 * tt.game.height) + tt.game.height/9;

            if (typeof multiplayerConn != 'undefined') {
                multiplayerConn.emit('add-player-tank', {x: randomX, y:randomY});
            } else {
                tt.addTank({id: 'player', x: randomX, y:randomY}, false);
            }

            tt.alerts.clear();
        }
    };

    // init
    (function() {
        JSGameSoup.ready(function() {
            // use the DIV tag with Id of 'surface' as our game surface
            tt.game = new JSGameSoup("game", 60);

            // add this instance of ThunderTanks
            tt.game.addEntity(tt);

            // add an instance of the map               
            tt.addMap(TTMaps.Classic);

            // launch the game
            tt.game.launch();

            if (typeof multiplayerConn != 'undefined') {
                multiplayerConn.on('add-tank', function (data) {
                    if (!_private.isGameinPause) {
                        tt.addTank(data, data.id !== multiplayerConn.id);
                    }
                });
                multiplayerConn.on('add-bullet', function (data) {
                    if (!_private.isGameinPause) {
                        // add bullet
                        tt.addBullet(data.startx, data.starty, data.targetx, data.targety, data.sessionIdOfInitator);
                    }
                });
                multiplayerConn.on('remote-tank-update', function (data) {
                    if (!_private.isGameinPause) {
                        // update tank
                        _private.tanks[data.id].remoteUpdate(data);
                    }
                });
                multiplayerConn.on('remove-tank', function (id) {
                    if (!_private.isGameinPause) {
                        tt.removeTank(id);
                    }
                });

                multiplayerConn.on('update-score', function(newScore) {
                    updatedScore.text(JSON.stringify(newScore));
                });

                multiplayerConn.on('admin-reset', function() {
                    console.log('got reset');
                    currentStateDiv.text('Go Go Go!');
                    currentStateDiv.addClass('admin-green');
                    currentStateDiv.removeClass('admin-red');
                    _private.isGameinPause = false;
                });
                multiplayerConn.on('admin-pause', function() {
                    console.log('got pause');
                    currentStateDiv.text('Paused!');
                    currentStateDiv.addClass('admin-red');
                    currentStateDiv.removeClass('admin-green');
                    _private.isGameinPause = true;
                });
                multiplayerConn.on('admin-resume', function() {
                    console.log('got resume');
                    currentStateDiv.text('Resumed!');
                    currentStateDiv.addClass('admin-green');
                    currentStateDiv.removeClass('admin-red');
                    _private.isGameinPause = false;
                });
                commandConn.on('action', function(data) {
                    // console.log('got command action ' + data.action);
                    if (mySessionId && _private.tanks[mySessionId] && !_private.isGameinPause) {
                        _private.tanks[mySessionId].commandUpdate(data);
                    }
                });
            } else {
                tt.alerts.addAlert('info','Click anywhere to deploy a tank.');

                // enemy in the opposite corner
                tt.addTank({id:'enemy1', x: tt.game.width - 100, y: tt.game.height - 100}, true);
            }

        });
    })();

    return tt;
})(tt || {});
