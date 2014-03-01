Tetris = function(id_elem_dom) 
{
	var ref = this;

	// Variables relatives à la partie
	this.turns = 0; // Nombre de tours
	this.points = 0; // Nombre de points
	this.lines = 0; // Nombre de points
	this.duration = 0; // Durée de la partie
	this.grid = []; // Structure de la grille
	this.id_elem_dom = id_elem_dom; // Identifiant de l'élément DOM du tetris

	this.keyPushed = []; // Contient la liste des touchés appuyés
	this.can_call_event = false; // Peut-on appeler d'autres evenements claviers ? (évite le spam)

	// Variables relative au block
	this.current_block = null; // Block courant
	this.next_block = Blocks.get_random_block(); // Block suivant
	this.position_X_current_block = 0; // Position X du block sur la grille
	this.position_Y_current_block = 0; // Position Y du block sur la grille

	this.timer = null; // Le timer qui descend la pièce automatiquement
	this.timeInterval = null; // La durée de l'interval du timer ci dessus
	this.can_auto_push = true; // Peut-on faire descendre la pièce automiquement grace au timer ?

	// Le timer qui compte les secondes
	this.durationInterval = setInterval( function()
	{
		ref.duration++;
		ref.print_points();
	},1000);

	// Initialisation de la grille
	var y,x;
	for(y = 0 ; y < Tetris.NB_CASE_Y ; y++)
	{
		this.grid[y] = [];	

		for(x = 0 ; x < Tetris.NB_CASE_X ; x++)
		this.grid[y][x] = 0;
	}

	// On dessine le tetris 
	this.draw_tetris_structure(id_elem_dom);

	// Les evenements clavier
	var ref = this;
	$(document).off('keydown');
	$(document).on('keydown', function(e) 
	{ 
		// console.log('keyDown : '+e.keyCode);

		var index =  ref.keyPushed.indexOf(e.keyCode);
		if(index == -1) ref.keyPushed.push(e.keyCode);

		// On évite que l'evenement keydown appel plusieurs fois event_key()
		// On préfere gérer les appels suivants a la fonction dans le cas ou on reste appuyer nous même
		// (javascript gère "mal" l'evenement keydown lorsqu'on reste appuyer (par securité j'imagine))
		if(!ref.can_call_event)
		{
			ref.event_key(true);
		}
	})

	$(document).off('keyup');
	$(document).on('keyup', function(e) 
	{ 
		// console.log('keyUp : '+e.keyCode);

		var index =  ref.keyPushed.indexOf(e.keyCode);
		if(index > -1)	ref.keyPushed.splice( index, 1);
	})

	// On peut commencer !
	this.begin_turn();

}

// Quelques constantes
Tetris.CASE_SIZE = 30; // Taille des cases en pixel
Tetris.NB_CASE_X = 10; // Nombre de cases du tetris en largeur
Tetris.NB_CASE_Y = 20; // Nombre de cases du tetris en hauteur

// Codes clavier keyCode des evenements
Tetris.KEY_DOWN  = 40;
Tetris.KEY_LEFT  = 37;
Tetris.KEY_RIGHT = 39; 
Tetris.KEY_UP    = 38; 
Tetris.KEY_SPACE = 32; 


// Constantes globales
DIRECTION_RIGHT = 1;
DIRECTION_LEFT = 2;
DIRECTION_DOWN = 3;

// Démarre un nouveau tour avec une nouvelle pièce
Tetris.prototype.begin_turn = function()
{
	this.keyPushed = [];
	this.turns++;
	this.position_X_current_block = 3;
	this.position_Y_current_block = 0;

	this.can_auto_push = true;

	this.current_block = this.next_block;
	this.next_block = Blocks.get_random_block();

	this.draw_next_block();

	// Dessine le block courant
	this.draw_current_block();


	// Si il y a une collision tout de suite, on a perdu la partie
	if(this.is_game_over())
	{
		this.end_turn();
		this.end_tetris();

		return false;
	}

	this.timeInterval = this.get_time_interval();

	// Initialisation du timer avec une closure
	// this.timer_push_block();
	this.timer = setInterval(
		function(ref)
		{
			return function() { ref.timer_push_block() };
		}(this)
		,this.timeInterval
	);



}

Tetris.prototype.end_turn = function()
{
	clearInterval(this.timer);

	this.current_block = null;
	this.timer = null;
}

Tetris.prototype.end_tetris = function()
{
	clearInterval(this.durationInterval);

	alert('Game Over !');
}

Tetris.prototype.event_key = function(p)
{
	if(this.current_block == null)
	{
		return false;
	}

	var ref = this;
	var timeout_sec;
	var pushed_something = false;
	ref.can_call_event = true;

	if(this.has_pushed(Tetris.KEY_DOWN))
	{
		this.move_block(DIRECTION_DOWN);

		pushed_something = true;
		timeout_sec = 50;
	}

	if(this.has_pushed(Tetris.KEY_LEFT))
	{
		this.move_block(DIRECTION_LEFT);
		pushed_something = true;
		timeout_sec = 50;
	}

	if(this.has_pushed(Tetris.KEY_RIGHT))
	{
		this.move_block(DIRECTION_RIGHT);
		pushed_something = true;
		timeout_sec = 50;
	}

	if(this.has_pushed(Tetris.KEY_UP))
	{
		// On regarde si on peut faire la rotation
		var bool_can_rotate = this.can_rotate(DIRECTION_RIGHT);

		// Si on peut pas ...
		if(!bool_can_rotate)
		{
			// On essaye de faire la rotation en deplacant la piece à droite ou a gauche
			// (pratique quand la piece est "contre" des blocks qui bloquent la rotation)
			if(this.can_rotate(DIRECTION_RIGHT,DIRECTION_RIGHT)) 
			{
				this.move_block(DIRECTION_RIGHT);
				bool_can_rotate = true;
			}
			else if(this.can_rotate(DIRECTION_RIGHT,DIRECTION_LEFT)) 
			{
				this.move_block(DIRECTION_LEFT);
				bool_can_rotate = true;
			}
		}

		// On peut enfin faire la rotation
		if(bool_can_rotate)
		{
			this.current_block.rotate_to(DIRECTION_RIGHT);
			this.draw_current_block(true);

			pushed_something = true;
			timeout_sec = 80;
		}
	}

	if(typeof p !== "undefined" && p) timeout_sec+=70;

	if(fastMode) timeout_sec = 0;

	if(pushed_something)
	{
		setTimeout(function()
		{
			ref.can_call_event = false;
			ref.event_key();
			
		},timeout_sec);
	}
	else
	{
		ref.can_call_event = false;
	}

	

}

Tetris.prototype.has_pushed = function(keyCode)
{
	if(this.keyPushed.indexOf(keyCode) > -1) return true;
	else return false;
}

Tetris.prototype.has_pushed_something = function(keyCode)
{
	if(this.has_pushed(Tetris.KEY_DOWN)) return true;
	else if(this.has_pushed(Tetris.KEY_LEFT)) return true;
	else if(this.has_pushed(Tetris.KEY_RIGHT)) return true;
	else if(this.has_pushed(Tetris.KEY_UP)) return true;
	else return false;
}

Tetris.prototype.timer_push_block = function()
{
	// Si on appui pas sur la touche pour descendre, et qu'on a le droit de "push" la piece
	if(!this.has_pushed(Tetris.KEY_DOWN) && this.can_auto_push)
	{
		// Si la piece va toucher le sol ...
		if(this.will_hit_ground())
		{
			var ref = this;
			this.can_auto_push = false; 

			// On lance un timeout pour qu'on ai encore la possibilité de déplacer la pièce
			setTimeout(function()
			{
				ref.move_block(DIRECTION_DOWN);

				ref.can_auto_push = true;
			},750)
		}
		else
		{
	 		this.move_block(DIRECTION_DOWN);
		}
	}
}

Tetris.prototype.move_block = function(direction)
{
	if(this.current_block == null)
	{
		return false;
	}
	else if(!this.can_move(direction))
	{
		return false;
	}

	if(direction == DIRECTION_DOWN)
	{
		if(this.will_hit_ground()) 
		{
			var save_pos_Y = this.position_Y_current_block;
			var lines;
			var total_to_wait;
			var ref = this;

			ref.place_current_block();
			setTimeout(function()
			{
				lines = ref.erase_lines(save_pos_Y);
				ref.end_turn();

				if(lines == 0) total_to_wait = Tetris.TIME_INTERVAL_TURN;
				else total_to_wait = Tetris.TIME_ANIMATE_LINES + Tetris.TIME_ANIMATE_PUSH_CASES + Tetris.TIME_INTERVAL_TURN;

				setTimeout(function()
				{
					ref.begin_turn();
				},total_to_wait)

			},Tetris.TIME_BOUNCE_BLOCK);

			return false;
		}
		else
		{
			this.position_Y_current_block++;
		}
	}
	else if(direction == DIRECTION_RIGHT)
		this.position_X_current_block++;
	else
		this.position_X_current_block--;

	this.draw_current_block();


}


Tetris.prototype.get_time_interval = function()
{
	var max = 20000;
	var pts = this.points;

	var t = ( max - pts ) * 0.03;

	if(t < 75) t = 75;

	// return t;	
	return 400;
}


Tetris.prototype.will_hit_ground = function()
{
	var y, x, size = this.current_block.get_size();
	var y_down;

	for(y = 0 ; y < size ; y++)
	{
		for(x = 0 ; x < size ; x++)
		{
			if(this.current_block.get_val(y,x) == 1)
			{
				pos_Y = this.position_Y_current_block+y+1;
				pos_X = this.position_X_current_block+x;

				if(pos_Y > (Tetris.NB_CASE_Y-1))
				{
					return true;
				}
				else if(this.grid[pos_Y][pos_X] != 0)
				{
					return true;
				}
			}
		}
	}

	return false;
}

Tetris.prototype.erase_lines = function(start_Y)
{
	var ref = this;
	var x, y;
	var is_line;
	var tab_lines = [];
	var tetris_dom = this.get_tetris_dom();

	for(y = start_Y ; y < Tetris.NB_CASE_Y ; y++)
	{
		is_line = true;
		for(x = 0 ; x < Tetris.NB_CASE_X && is_line && tab_lines.length <= 4 ; x++)
			if(this.grid[y][x] == 0) is_line = false;

		if(is_line) tab_lines.push(y);
	}

	var i, line_number = tab_lines.length;
	var elem_up;
	for(i = 0 ; i < line_number ; i++)
	{
		this.add_line();

		// Supprime la ligne
		for(x = 0 ; x < Tetris.NB_CASE_X; x++) this.grid[tab_lines[i]][x] = 0;

		// Animation des cases
		tetris_dom.find('.block_case[y='+tab_lines[i]+']').addClass('animated');

		// Puis effacement des cases de la ligne
		setTimeout(function(num)
		{
			return function()
			{
				tetris_dom.find('.block_case[y='+num+']').remove();

				// On descend les cases au dessus de la ligne
				for(y = num ; y >= 0 ; y--)
				{
					for(x = 0 ; x < Tetris.NB_CASE_X; x++)
					{
						if(y == 0) // ligne tout en haut
							ref.grid[y][x] = 0;
						else
							ref.grid[y][x] = ref.grid[y-1][x];

						tetris_dom.find('.block_case[y='+y+'][x='+x+']')
						.attr('y',(y+1))
						.transition({'top':'+='+Tetris.CASE_SIZE}, (Tetris.TIME_ANIMATE_PUSH_CASES/line_number),'linear');
						
					}
				}
			}
		}(tab_lines[i]),Tetris.TIME_ANIMATE_LINES)
	}

	if(line_number == 1) this.add_points(40);
	if(line_number == 2) this.add_points(100);
	if(line_number == 3) this.add_points(300);
	else if(line_number == 4) this.add_points(1200);

	return line_number;
}


Tetris.prototype.is_game_over = function()
{
	var pos_X = this.position_X_current_block;
	var pos_Y = this.position_Y_current_block;
	var y, x, size = this.current_block.get_size();

	for(y = 0 ; y < size ; y++)
	{
		for(x = 0 ; x < size ; x++)
		{
			if(this.current_block.get_val(y,x) == 1)
			{
				if(this.grid[pos_Y+y][pos_X+x] != 0)
				{
					return true;
				}
			}
		}
	}
	return false;
}


Tetris.prototype.can_rotate = function(direction_rotate, direction_move)
{
	if(this.current_block == null) return false;

	var pos_X, pos_Y;

	pos_X = this.position_X_current_block;
	pos_Y = this.position_Y_current_block;

	if(this.can_move(direction_move))
	{
		if(direction_move == DIRECTION_RIGHT)
		{
			pos_X++;
		}
		else if(direction_move == DIRECTION_LEFT)
		{
			pos_X--;
		}
	}


	var block_rotated = this.current_block.get_rotation(direction_rotate);

	var y, x, size = block_rotated.get_size();

	for(y = 0 ; y < size ; y++)
	{
		for(x = 0 ; x < size ; x++)
		{
			if(block_rotated.get_val(y,x) == 1)
			{
				if(pos_X+x < 0)
				{
					return false;
				}  
				else if(pos_X+x > (Tetris.NB_CASE_X-1))
				{
					return false;
				}
				else if(pos_Y+y > (Tetris.NB_CASE_Y-1))
				{
					return false;
				}
				else if(this.grid[pos_Y+y][pos_X+x] != 0)
				{
					return false;
				}
			}
		}
	}

	return true;
}

Tetris.prototype.can_move = function(direction)
{
	if(this.current_block == null) return false;

	var pos_X = this.position_X_current_block;
	var pos_Y = this.position_Y_current_block;

	if(direction == DIRECTION_LEFT)
		pos_X--;
	else if(direction == DIRECTION_RIGHT)
		pos_X++;

	var y, x, size = this.current_block.get_size();
	for(y = 0 ; y < size ; y++)
	{
		for(x = 0 ; x < size ; x++)
		{
			if(this.current_block.get_val(y,x) == 1)
			{
				if(pos_X+x < 0)
				{
					return false;
				}  
				else if(pos_X+x > (Tetris.NB_CASE_X-1))
				{
					return false;
				}
				else if(this.grid[pos_Y+y][pos_X+x] != 0)
				{
					return false;
				}
			}
		}
	}

	return true;
}




Tetris.prototype.place_current_block = function() 
{ 
	var y, x, size = this.current_block.get_size();
	var pos_X, pos_Y;

	for(y = 0 ; y < size ; y++)
	{
		for(x = 0 ; x < size ; x++)
		{
			if(this.current_block.get_val(y,x) == 1)
			{
				pos_X = this.position_X_current_block+x;
				pos_Y = this.position_Y_current_block+y;

				this.grid[pos_Y][pos_X] = this.current_block.get_num();
				this.draw_grid_case(pos_Y,pos_X);
			}
		}
	}

	this.erase_current_block();
}

Tetris.prototype.get_tetris_dom = function() { return $('#'+this.id_elem_dom); }

Tetris.prototype.erase_current_block = function()
{
	this.get_tetris_dom().find('.block').remove();
}

Tetris.prototype.draw_current_block = function(force_html)
{
	if(typeof force_html == 'undefined') force_html = false;

	var tetris = this.get_tetris_dom();
	var tetris_area = tetris.find('.tetris_area');
	var block = tetris_area.find('.block');


	if(block.length == 0)
	{
		tetris_area.append( this.current_block.get_HTML_structure() );
		block = tetris_area.find('.block');
	}

	if(force_html)
	{
		block.html( this.current_block.get_HTML_structure(false) );
	}

	block.css({
			top: Tetris.CASE_SIZE * this.position_Y_current_block,
			left:Tetris.CASE_SIZE * this.position_X_current_block
		})
}


Tetris.prototype.draw_grid_case = function(y,x)
{
	var tetris_dom = this.get_tetris_dom();
	tetris_dom.find('.tetris_area').append(this.current_block.get_HTML_case_structure(y,x));

	// Un petit effet "bounce"
	var elem = tetris_dom.find('.tetris_area .block_case:last');
	elem.transition({top:'+=2px'},Tetris.TIME_BOUNCE_BLOCK);

	setTimeout(function(elem)
	{
		return function()
		{
			elem.transition({top:'-=2px'},Tetris.TIME_BOUNCE_BLOCK);
		}
	}(elem),Tetris.TIME_BOUNCE_BLOCK)
}

Tetris.prototype.draw_next_block = function()
{
	this.get_tetris_dom().find('.tetris_next_block').html( this.next_block.get_HTML_structure() );
}

Tetris.prototype.draw_tetris_structure = function(id_elem_dom)
{
	var tetris_dom = $('#'+id_elem_dom);

	tetris_dom
		.addClass('tetris_base')
		.html('<div class="tetris_area"></div>'+
				'<div class="tetris_next_block"></div>'+
				'<div class="tetris_stats">'+
					'<h3>Lignes</h3><div class="stats_nb stats_lines">0</div>'+
					'<h3>Points</h3><div class="stats_nb stats_points">0</div>'+
					'<h3>Temps</h3><div class="stats_nb stats_duration">00:00</div>'+
					'<h3>IA</h3><div class="stats_nb"><div id="ia_status" class="switcher"><span class="on bg_status"></span><span class="current on">ON</span><span class="off">OFF</span></div></div>'+
					'<h3>Speed</h3><div class="stats_nb"><div id="fastMode" class="switcher"><span class="off bg_status"></span><span class="on">ON</span><span class="off current">OFF</span></div></div>'+
				'</div>'+
				'<div class="clear"></div>');

	var tetris_area = tetris_dom.find('.tetris_area');

	$(document).on('click', '#fastMode',  Tetris.toggleFastMode);

	tetris_area
		.css({
			width  : Tetris.CASE_SIZE * Tetris.NB_CASE_X,
			height : Tetris.CASE_SIZE * Tetris.NB_CASE_Y
		})

}


Tetris.prototype.add_line = function()
{
	this.lines++;
	this.print_lines();
}


Tetris.prototype.add_points = function(pts)
{
	this.points += pts;
	this.print_duration();
}


Tetris.prototype.print_lines = function()
{
	this.get_tetris_dom().find('.stats_lines').html(this.lines);
}

Tetris.prototype.print_points = function()
{
	this.get_tetris_dom().find('.stats_points').html(this.points);
}

Tetris.prototype.print_duration = function()
{
	this.get_tetris_dom().find('.stats_duration').html(Helper.time_to_human(this.duration));
}


Tetris.toggleFastMode = function()
{
	var source = $(this);

	if(fastMode)
	{
		source.find('.bg_status').removeClass('on').addClass('off');
		source.find('.on').removeClass('current');
		source.find('.off').addClass('current');
		Tetris.disableFastMode();
		fastMode = false;
	}
	else
	{
		source.find('.bg_status').removeClass('off').addClass('on');
		source.find('.off').removeClass('current');
		source.find('.on').addClass('current');
		Tetris.enableFastMode();
		fastMode = true;
	}
}

Tetris.enableFastMode = function()
{
	Tetris.TIME_INTERVAL_TURN = 0; 
	Tetris.TIME_ANIMATE_LINES = 0; 
	Tetris.TIME_ANIMATE_PUSH_CASES = 0; 
	Tetris.TIME_BOUNCE_BLOCK = 0;
	IA.secureDelay = 50;
}

Tetris.disableFastMode = function()
{
	Tetris.TIME_INTERVAL_TURN = 150; 
	Tetris.TIME_ANIMATE_LINES = 700; 
	Tetris.TIME_ANIMATE_PUSH_CASES = 300; 
	Tetris.TIME_BOUNCE_BLOCK = 70;
	IA.secureDelay = 170;
}

if(fastMode) 
	Tetris.enableFastMode(); 
else 
	Tetris.disableFastMode();