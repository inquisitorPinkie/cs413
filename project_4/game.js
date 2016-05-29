
var game_scale = 1;
var game_width = 800;
var game_height = 600;

var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(game_width, game_height, {backgroundColor : 0x44bbbb});
gameport.appendChild(renderer.view);

var state_stack = new stackhelper();

var pi = 3.1415926535897932384626433832795028841971;
var pi2 = pi/2;


var tu = new TileUtilities(PIXI);
var su = new SpriteUtilities(PIXI);
var world;
var player;
var camera = {x: 0, y: 0};
var mapArray;

// some useful variables
var FPS = 45;

var gravity = 1/FPS;

var bg_playing = true;

window.onkeydown = function(e)
{
	var key = keycode_to_str(e.keyCode);
	
	if(key == 'M')
	{
		if(bg_playing)
			bg_music.stop();
		if(!bg_playing)
			bg_music.play();
		bg_playing = !bg_playing;
	}
	
	if(player != undefined)
		player.handle_button_down(key);
};
window.onkeyup = function(e)
{
	var key = keycode_to_str(e.keyCode);
	
	if(player != undefined)
		player.handle_button_up(key);
}

function animate()
{
	requestAnimationFrame(animate);
	var stage = states[state_stack.get_top()];
	renderer.render(stage);
	
}

// the game logic

var win = false;

function game_tick()
{
	
	//get_camera_pos(player, camera);
	states.game.x = camera.x;
	states.game.y = camera.y;
	
	player.apply_gravity();
	player.move();
	
	//if(get_block_gid_at(player) != 0)
	{
		// loser
	}
	
	if(player.x < 0) player.x = game_width;
	if(player.y < 0) player.y = game_height;
	if(player.x > game_width) player.x = 0;
	if(player.y > game_height) player.y = 0;
	
	elements.gamebg.g.x = player.x - game_width / game_scale;
	elements.gamebg.g.y = player.y - game_height / game_scale;
	
	if(win == false)
		setTimeout(game_tick, 1000 / FPS);
}

// game mechanics

function hittest_block(who, blocks)
{
	for(var i = 0; i < blocks.length; i++)
		if(tu.hitTestTile(who, mapArray, blocks[i], world, 'every').hit)
			return true;
	return false;
}
function get_block_gid_at(who)
{
	return tu.hitTestTile(who, mapArray, 0, world, 'every').gid;
}

// the entry point to the game
function start()
{
	// reset the world
	if(world != undefined)
	{
		states.game.removeChild(world);
		win = false;
	}
	
	//world = tu.makeTiledWorld("map_json", "tileset.png");
	//states.game.addChild(world);
	
	states.game.scale.x = game_scale;
	states.game.scale.y = game_scale;
	
	elements.gamebg.g.scale.x = 0.5;
	elements.gamebg.g.scale.y = 0.5;
	
	construct_player();
	
	player.x = game_width / 2;
	player.y = game_height / 2;
	
	game_tick();
}

function get_camera_pos(focus, camera) {
  var x = -focus.x*game_scale + game_width/2;
  var y = -focus.y*game_scale + game_height/2;
  x = -Math.max(0, Math.min(world.worldWidth*game_scale - game_width, -x));
  y = -Math.max(0, Math.min(world.worldHeight*game_scale - game_height, -y));
  camera.x = x;
  camera.y = y;
}



function construct_player()
{
	var playerscale = 2;
	
	var tx = new PIXI.BaseTexture.fromImage('dat/airplane.png');
	var frames = [
		new PIXI.Texture(tx, new PIXI.Rectangle(0, 0, 40, 40)),
		new PIXI.Texture(tx, new PIXI.Rectangle(40, 0, 40, 40)),
		new PIXI.Texture(tx, new PIXI.Rectangle(80, 0, 40, 40))
	];
	
	player = new PIXI.Container();
	states.game.addChild(player);
	
	var g = new PIXI.extras.MovieClip(frames);
	player.addChild(g);
	player.g = g;
	
	g.scale.x = playerscale;
	g.scale.y = playerscale;
	
	g.anchor.x = 0.5;
	g.anchor.y = 0.5;
	
	player.g.play();
	player.g.animationSpeed = 0.1;
	
	player.speed = 0;
	player.stalling_speed = 0;
	
	player.facing = 1; // 1 for normal, -1 for upside down; when travelling to the right
	
	player.angle = 0; // angle from vertical
	
	var flags = {
		flipped: false,
		boost: false
	};
	player.state = 'normal';
	
	player.apply_gravity = function()
	{
		var MAX_SPEED = 5;
		var MAX_BOOST = MAX_SPEED * 2;
		
		if(player.angle > 0)
			player.angle = Math.min(pi, player.angle + gravity);
		else
			player.angle = Math.max(-pi, player.angle - gravity);
		
		if(player.state == 'normal')
		{
			if(player.angle > -pi2 && player.angle < pi2)
			{
				player.speed -= (pi2 - Math.abs(player.angle)) * gravity;
				
				if(player.speed < 0)
				{
					player.speed = 0;
					player.stalling_speed = Math.min(player.stalling_speed + gravity, MAX_SPEED);
				}
				else
				{
					player.stalling_speed = 0;
				}
			}
			else
			{
				
				player.speed += Math.abs(pi2 - Math.abs(player.angle)) * gravity * 1.5;
				player.speed = Math.min(MAX_SPEED, player.speed);
			}
		}
		else if(player.state == 'boost')
		{
			player.speed = MAX_BOOST;
		}
		
	};
	
	player.move = function()
	{
		var handling_const = 0.08;
		
		if(flags.W)
		{
			player.angle += -player.facing * handling_const;
		}
		
		if((flags.A || flags.D) && flags.flipped == false)
		{
			flags.flipped = true;
			player.flip();
		}
		
		if(player.angle < -pi) player.angle += 2*pi;
		if(player.angle > pi) player.angle -= 2*pi;
		
		var effective_angle = player.angle - pi2;
		
		player.g.rotation = effective_angle;
		
		var dx = Math.cos(effective_angle) * player.speed;
		var dy = Math.sin(effective_angle) * player.speed;
		
		player.x += dx;
		player.y += dy + player.stalling_speed;
	};
	
	player.handle_button_down = function(button)
	{
		flags[button] = true;
	};
	
	player.handle_button_up = function(button)
	{
		flags[button] = false;
		flags.flipped = false;
	};
	
	player.flip = function()
	{
		player.facing = -player.facing;
		player.g.scale.y = player.facing * playerscale;
	};
	
}





