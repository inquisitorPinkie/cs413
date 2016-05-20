function layouts()
{

	elements = {
		
		END : new newText("Time's Up!", {font : '34px Arial', fill : 'black', align : 'center', wordWrap : true, wordWrapWidth : 200})
			.pos(100, 100),
		button : new newButton('red', 'pink', 'green')
			.click(function(md){
				})
			.pos(100, 200),
		
		sg_backprint : new newSprite('sg_backprint')
			.pos(100, 95),
		
		start_game_button : new newButton('sg_up', 'sg_hd', 'sg_hd')
			.click(function(md)
				{
					// the logic for the falling menu button
					if(start_button_fallen == false && start_button_fixed == false)
					{
						createjs.Tween.get(elements.start_game_button.g.position).to({x: 100, y: 350}, 1000, createjs.Ease.bounceOut);
						start_button_fallen = true;
						elements.start_game_button.g.mouseover = function(md)
						{
							elements.start_game_button.g.mousedown = function(md)
							{
								var dx = md.data.originalEvent.pageX - elements.start_game_button.g.x;
								var dy = md.data.originalEvent.pageY - elements.start_game_button.g.y;
								elements.start_game_button.g.mousemove = function(md)
								{
									var x = md.data.originalEvent.pageX - dx;
									var y = md.data.originalEvent.pageY - dy;
									elements.start_game_button.g.x = x;
									elements.start_game_button.g.y = y;
									if(Math.pow(x - 100, 2) + Math.pow(y - 95, 2) < 100) // we have put the thing back in its spot
									{
										elements.start_game_button.g.x = 100;
										elements.start_game_button.g.y = 95;
										elements.start_game_button.g.mousemove = null;
										elements.start_game_button.g.mouseup = null;
										setTimeout(function()
										{
											button_func(elements.start_game_button);
											start_button_fixed = true;
										}, 500);
									}
								};
								elements.start_game_button.g.mouseup = function(md)
								{
									var x = elements.start_game_button.g.x;
									createjs.Tween.get(elements.start_game_button.g.position).to({x: x, y: 350}, 1000, createjs.Ease.bounceOut);
									elements.start_game_button.g.mousemove = null;
								};
							};
						};
					}
					else if(start_button_fixed == true)
					{
						start();
					}
				})
			.anchor(0.5, 0.5)
			.pos(100, 95),
		
		credits_button : new newButton('credits_up', 'credits_hd', 'credits_hd')
			.click(function(md)
				{
					state_stack.push('credits');
				})
			.pos(100, 200),
		
		credits_text : new newText("Art and sound by Gage Cottrell (c) 2016",
			{font : '34px Arial', fill : 'white', align : 'center', wordWrap : true, wordWrapWidth : 300})
			.pos(50, 100),
		
		back_button_credits : new newButton('back_up', 'back_hd', 'back_hd')
			.click(function(md)
				{
					if(state_stack.is_empty() == false)
						state_stack.pop();
				})
			.pos(5, 295),
			
		back_button_game : new newButton('back_up', 'back_hd', 'back_hd')
			.click(function(md)
				{
					if(state_stack.is_empty() == false)
						state_stack.pop();
				})
			.pos(5, 295)
	};

	states = {
		top : construct_graph(new PIXI.Container(0x0, true))
			.down()
			.create('sg_backprint')
			.create('start_game_button')
			.create('credits_button')
		.end(),
		
		credits : construct_graph(new PIXI.Container(0, false))
			.down()
			.create('credits_text')
			.create('back_button_credits')
		.end(),
		
		game : construct_graph(new PIXI.Container(0, true))
			.down()
			.create('back_button_game')
		.end()
	};
}