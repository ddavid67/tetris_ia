Blocks = function(num_block,pos) 
{
	this.position = pos; // Position du bloc
	this.num_block = num_block; // Numéro du bloc
	this.current_block = Blocks.list_blocks['block_'+num_block]['struct_'+pos]; // Instance du block
}

Blocks.prototype.rotate_to = function(direction)
{
	if(direction == DIRECTION_RIGHT)
		this.position = (this.position + 1) % 4;
	else
		this.position = (this.position - 1) % 4;

	this.current_block = Blocks.list_blocks['block_'+this.num_block]['struct_'+this.position];
}

Blocks.prototype.get_rotation = function(direction)
{
	var pos;
	if(direction == DIRECTION_RIGHT)
		pos = (this.position + 1) % 4;
	else
		pos = (this.position - 1) % 4;

	return new Blocks(this.num_block,pos);
}


Blocks.prototype.get_HTML_structure = function(glob)
{
	if(typeof glob == 'undefined') glob = true;

	var size =  this.get_size();
	var y, x;

	var struct = '';

	if(glob) struct += '<div class="block" style="width:'+(size*Tetris.CASE_SIZE)+'px;height:'+(size*Tetris.CASE_SIZE)+'px;">';

	for(y = 0 ; y < size ; y++)
	{
		for(x = 0 ; x < size ; x++)
		{
			if(this.current_block[y][x] != 0)
			struct += this.get_HTML_case_structure(y,x);
		}
	}

	if(glob) struct += '</div>';

	return struct;
}

Blocks.prototype.get_HTML_case_structure = function(y,x)
{
	return  '<div x="'+x+'"" y="'+y+'" class="block_case block_'+this.num_block+'" style="width:'+(Tetris.CASE_SIZE)+'px;height:'+(Tetris.CASE_SIZE)+'px;top:'+(y*Tetris.CASE_SIZE)+'px;left:'+(x*Tetris.CASE_SIZE)+'px;"></div>'
}


Blocks.prototype.get_size = function()
{
	return this.current_block.length;
}

Blocks.prototype.get_val = function(y,x)
{
	return this.current_block[y][x];
}

Blocks.prototype.get_num = function()
{
	return this.num_block;
}

Blocks.get_random_block = function()
{
	var n = Helper.rand(1,7);
	return new Blocks(n,1);
} 


Blocks.list_blocks = 
{
	block_1: 
	{
		struct_0:
		[
			[0,1,0,0],
			[0,1,0,0],
			[0,1,0,0],
			[0,1,0,0]
		],
		struct_1:
		[
			[0,0,0,0],
			[1,1,1,1],
			[0,0,0,0],
			[0,0,0,0]
		],
		struct_2:
		[
			[0,1,0,0],
			[0,1,0,0],
			[0,1,0,0],
			[0,1,0,0]
		],
		struct_3:
		[
			[0,0,0,0],
			[1,1,1,1],
			[0,0,0,0],
			[0,0,0,0]
		]
	},





	block_2:
	{
		struct_0:
		[
			[1,1],
			[1,1]
		],
		struct_1:
		[
			[1,1],
			[1,1]
		],
		struct_2:
		[
			[1,1],
			[1,1]
		],
		struct_3:
		[
			[1,1],
			[1,1]
		]
	},





	block_3:
	{
		struct_0:
		[
			[0,0,0],
			[1,1,0],
			[0,1,1]
		],
		struct_1:
		[
			[0,0,1],
			[0,1,1],
			[0,1,0]
		],
		struct_2:
		[
			[0,0,0],
			[1,1,0],
			[0,1,1]
		],
		struct_3:
		[
			[0,0,1],
			[0,1,1],
			[0,1,0]
		]
	},






	block_4:
	{
		struct_0:
		[
			[0,0,0],
			[0,1,1],
			[1,1,0]
		],
		struct_1:
		[
			[0,1,0],
			[0,1,1],
			[0,0,1]
		],
		struct_2:
		[
			[0,0,0],
			[0,1,1],
			[1,1,0]
		],
		struct_3:
		[
			[0,1,0],
			[0,1,1],
			[0,0,1]
		]
	},





	block_5:
	{
		struct_0:
		[
			[0,1,0],
			[1,1,1],
			[0,0,0]
		],
		struct_1:
		[
			[0,1,0],
			[0,1,1],
			[0,1,0]
		],
		struct_2:
		[
			[0,0,0],
			[1,1,1],
			[0,1,0]
		],
		struct_3:
		[
			[0,1,0],
			[1,1,0],
			[0,1,0]
		]
	},






	block_6:
	{
		struct_0:
		[
			[0,1,1],
			[0,1,0],
			[0,1,0]
		],
		struct_1:
		[
			[0,0,0],
			[1,1,1],
			[0,0,1]
		],
		struct_2:
		[
			[0,1,0],
			[0,1,0],
			[1,1,0],
		],
		struct_3:
		[
			[1,0,0],
			[1,1,1],
			[0,0,0]
		]
	},








	block_7:
	{
		struct_0:
		[
			[1,1,0],
			[0,1,0],
			[0,1,0]
		],
		struct_1:
		[
			[0,0,1],
			[1,1,1],
			[0,0,0]
		],
		struct_2:
		[
			[0,1,0],
			[0,1,0],
			[0,1,1],
		],
		struct_3:
		[
			[0,0,0],
			[1,1,1],
			[1,0,0]
		]
	}
}


