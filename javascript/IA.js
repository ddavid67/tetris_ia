IA = function(tetris)
{
	this.tetris = tetris; // Référence vers le tetris
	this.current_turn = -1; // Numéro du tour courant
	this.on = true; // IA activé ou non

	// Démarre l'IA
	this.test_if_turn_started();

	// Active / desactive l'IA
	$(document).on('click', '#ia_status', {self:this},  this.IAOnOff);
}




// Verifie toutes les 100ms si on doit chercher la position d'une nouvelle pièce
IA.prototype.test_if_turn_started = function()
{
	var ref = this;
	var timer = setInterval(function()
	{
		if(ref.on && ref.tetris.current_block != null && ref.tetris.turns != ref.current_turn)
		{
			ref.current_turn = ref.tetris.turns;

			// if(ref.bests == null)
			// {
				ref.bests = ref.search_best_position(this.tetris.grid, this.tetris.current_block.num_block, 1);
				ref.move_to(ref.bests.best_X_lvl_1, ref.bests.best_rotation_lvl_1);
			// }
			// else
			// {
			// 	ref.move_to(ref.bests.best_X_lvl_2, ref.bests.best_rotation_lvl_2);
			// 	ref.bests = null;
			// }
		}
	},100)
}

// Cherche le meilleur position de la pièce courante
IA.prototype.search_best_position = function(grid, num_block, level)
{
	var y,x,rotation;
	var current_eval;
	var res_level_2;

	var best_X_lvl_1 = 0, best_rotation_lvl_1 = 0;
	var best_X_lvl_2 = 0, best_rotation_lvl_2 = 0;

	var new_grid;
	var grid_cloned;
	var best_eval = -9999999;

	for(rotation = 0 ; rotation < 4 ; rotation++)
	{
		for(x = -1 ; x < Tetris.NB_CASE_X ; x++)
		{
			for(y = 0 ; y < Tetris.NB_CASE_Y ; y++)
			{
				if(this.can_place_block(grid,num_block,x,y,rotation) && this.will_hit_ground(grid,num_block,x,y,rotation) && this.can_access(grid,num_block,x,y,rotation))
				{
					grid_cloned = Helper.clone_array(this.tetris.grid);
					new_grid = this.place_block_on_grid(grid_cloned,num_block,x,y,rotation);
					current_eval = this.eval_grid(new_grid, level);

					if(level == 1)
					{
						res_level_2 = this.search_best_position(new_grid, this.tetris.next_block.num_block, current_eval,2);
						current_eval += res_level_2.best_eval;
					}

					if( current_eval > best_eval)
					{
						best_eval = current_eval;

						if(level == 1)
						{
							best_X_lvl_1 = x;
							best_rotation_lvl_1 = rotation;	

							best_X_lvl_2 = res_level_2.best_X;
							best_rotation_lvl_2 = res_level_2.best_rotation;
						}
						else
						{
							best_X_lvl_2 = x;
							best_rotation_lvl_2 = rotation;
						}
					}
				}
			}

		}
	}

	if(level == 1)
	{
		return { 
			best_X_lvl_1         : best_X_lvl_1, 
			best_rotation_lvl_1  : best_rotation_lvl_1, 
			best_X_lvl_2         : best_X_lvl_2, 
			best_rotation_lvl_2  : best_rotation_lvl_2 
		};
	}
	else
	{
		return {
			best_eval     : best_eval, 
			best_X        : best_X_lvl_2, 
			best_rotation : best_rotation_lvl_2, 
		}
	}
}

// Evalue une grille
IA.prototype.eval_grid = function(grid, level)
{
	var y,y2,x,eval = 0;

	// nombre de lignes
	var is_line, nb_lines = 0;
	for(y = 0 ; y < Tetris.NB_CASE_Y ; y++)
	{
		is_line = true;
		for(x = 0 ; x < Tetris.NB_CASE_X && is_line && nb_lines <= 4 ; x++)
			if(grid[y][x] == 0) is_line = false;


		if(is_line) { nb_lines++; }
	}


	// plus haute tour
	var largest_tower = 0, counting;
	for(x = 0 ; x < Tetris.NB_CASE_X ; x++)
	{
		counting = 0;
		for(y = 0 ; y < Tetris.NB_CASE_Y ; y++)
		{
			if(grid[y][x] != 0) 
			{
				counting++;
				if(counting > largest_tower) largest_tower = counting;
			}
			else
			{
				counting = 0;
			} 
		}
	}


	eval -= largest_tower*10;

	// cout d'un trou dans l'évaluation
	if(nb_lines == 0) cost_trou = 200;
	else if(nb_lines == 1) cost_trou = 100;
	else if(nb_lines == 2) cost_trou = 50;
	else if(nb_lines == 3) cost_trou = 25;
	else if(nb_lines == 4) cost_trou = 0;

	// nombre de trous
	var nb_trous = 0;
	for(y = 1 ; y < Tetris.NB_CASE_Y ; y++)
	{
		for(x = 0 ; x < Tetris.NB_CASE_X ; x++)
		{
			if(grid[y-1][x] != 0 && grid[y][x] == 0) 
			{
				eval -= cost_trou;

				// verification des trous en dessous
				for(y2 = y ; y2 < Tetris.NB_CASE_Y ; y2++)
				{
					if(grid[y2][x] == 0) eval -= cost_trou;
					else break;
				}
			}

			// trou à gauche / droite ?
			if(grid[y][x] != 0  && x > 0 && x < (Tetris.NB_CASE_X-1))
			{
				if(grid[y][x-1] == 0)  eval -= 10*y;
				if(grid[y][x+1] == 0)  eval -= 10*y;
			}
		}
	}
	

	// le + de trou possible en haut
	// dès qu'on trouve un trou, -10*Y
	for(y = 0 ; y < Tetris.NB_CASE_Y ; y++)
	{
		for(x = 0 ; x < Tetris.NB_CASE_X ; x++)
		{
			if(grid[y][x] == 0) eval -= 20*y;
		}
	}

	return eval;
}

IA.prototype.move_to = function(best_X, best_rotation)
{

	var ref = this;
	var num_block = this.tetris.current_block.num_block;
	var current_rotation = this.tetris.current_block.position;
	var current_X = this.tetris.position_X_current_block;

	//calcul du nombre de rotations a faire
	var nb_rotation = 0;

	if(num_block == 1 || num_block == 3 || num_block == 4) 
	{
		if( (current_rotation-best_rotation)%2 != 0) nb_rotation = 1;
	}
	else
	{
		while(current_rotation != best_rotation)
		{
			current_rotation = (current_rotation + 1) % 4;
			nb_rotation++;
		}
	}


	var move_right;

	if(best_X > current_X)
		move_right = true;
	else
		move_right = false;
	
	var nb_move = 0;
	while(current_X != best_X)
	{
		if(move_right)
			current_X++;
		else	
			current_X--;

		nb_move++;
	}


	// on commence par rotationner la piece si necessaire
	if(nb_rotation != 0)
	IA.push_key_times(Tetris.KEY_UP, nb_rotation);

	setTimeout(function()
	{
		// puis seulement après on peut la déplacer dans la bonne colonne si necessaire

		if(nb_move != 0)
		IA.push_key_times( (move_right ? Tetris.KEY_RIGHT : Tetris.KEY_LEFT), nb_move);

		setTimeout(function()
		{
			IA.press_key(Tetris.KEY_DOWN);
		},IA.secureDelay*nb_move+IA.secureDelay)

	},IA.secureDelay*nb_rotation+IA.secureDelay)
	

}

IA.prototype.can_access = function(grid,num_block,pos_X,pos_Y,rotation)
{
	var block = new Blocks(num_block, rotation);

	var y, x, size = block.get_size();
	
	for(y = 0 ; y < pos_Y ; y++)
	{
		if(this.will_hit_ground(grid,num_block,pos_X,y,rotation)) break;
	}

	if(y == pos_Y) return true;
	else return false;

}

// Verifie qu'on peut poser un block sur qqchose
IA.prototype.will_hit_ground = function(grid,num_block,pos_X,pos_Y,rotation)
{
	var block = new Blocks(num_block, rotation);

	var y, x, size = block.get_size();

	for(y = 0 ; y < size ; y++)
	{
		for(x = 0 ; x < size ; x++)
		{
			if(block.get_val(y,x) == 1)
			{
				if(pos_Y+y+1 > (Tetris.NB_CASE_Y-1))
				{
					return true;
				}
				else if(grid[pos_Y+y+1][pos_X+x] != 0)
				{
					return true;
				}
			}
		}
	}

	return false;

}

// Verifie qu'on peut placer la piece dans la grille
IA.prototype.can_place_block = function(grid,num_block,pos_X,pos_Y,rotation)
{
	var block = new Blocks(num_block, rotation);

	var y, x, size = block.get_size();

	for(y = 0 ; y < size ; y++)
	{
		for(x = 0 ; x < size ; x++)
		{
			if(block.get_val(y,x) == 1)
			{
				if(pos_X+x < 0)
				{
					return false;
				}  
				else if(pos_X+x > (Tetris.NB_CASE_X-1))
				{
					return false;
				}
				else if(pos_Y+y < 0)
				{
					return false;
				}  
				else if(pos_Y+y > (Tetris.NB_CASE_Y-1))
				{
					return false;
				}
				else if(grid[pos_Y+y][pos_X+x] != 0)
				{
					return false;
				}

			}
		}
	}


	return true;
}

// Place une piece dans une grille
IA.prototype.place_block_on_grid = function(new_grid,num_block,pos_X,pos_Y,rotation) 
{ 
	// console.log(pos_Y+'/'+pos_X+'/'+rotation)
	var block = new Blocks(num_block, rotation);
	
	var y, x, size = block.get_size();

	for(y = 0 ; y < size ; y++)
	{
		for(x = 0 ; x < size ; x++)
		{
			if(block.get_val(y,x) == 1)
			{
				new_grid[pos_Y+y][pos_X+x] = block.get_num();
			}
		}
	}

	return new_grid;
}

IA.prototype.IAOnOff = function(e)
{
	var self = e.data.self;
	var source = $(this);

	if(self.on)
	{
		source.find('.bg_status').removeClass('on').addClass('off');
		source.find('.on').removeClass('current');
		source.find('.off').addClass('current');
		self.on = false;
	}
	else
	{
		source.find('.bg_status').removeClass('off').addClass('on');
		source.find('.off').removeClass('current');
		source.find('.on').addClass('current');
		self.on = true;
	}
}


IA.push_key_times = function(k, times)
{
	var nb = 0;
	var it = setInterval(function()
	{
		IA.press_key(k);
		IA.unpress_key(k);
		nb++;

		if(times == nb) clearInterval(it);
	},IA.secureDelay);
}

IA.press_key = function(k)
{
	var e = jQuery.Event("keydown");
	e.which = k;
	e.keyCode = k;
	$(document).trigger(e);
}

IA.unpress_key = function(k)
{
	var e = jQuery.Event("keyup");
	e.which = k;
	e.keyCode = k;
	$(document).trigger(e);
}