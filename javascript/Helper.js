Helper = {};

Helper.rand = function(min, max) 
{
	return Math.floor(Math.random() * (max - min + 1) + min);
}

Helper.time_to_human = function(sec)
{
	var tcMins = Math.floor(sec/60);
	var tcSecs = Math.floor(sec - (tcMins * 60));
	
  if (tcMins < 10) { tcMins = '0' + tcMins; }
	if (tcSecs < 10) { tcSecs = '0' + tcSecs; }
	return tcMins + ':' + tcSecs;
}

Helper.sum_array = function(tab)
{
	var size = tab.length;
	var total = 0;
	var i;

	for(i = 0 ; i < size ; i++) total += tab[i];

	return total;
}

Helper.max_array = function(tab)
{
	var size = tab.length;
	if(size == 0) return false;
	var max = tab[0];
	var i;

	for(i = 1 ; i < size ; i++) if(tab[i] > max) max = tab[i];

	return max;
}

Helper.clone_array = function(tab)
{
	var res = [];

	var y,x;
	for(y = 0 ; y < Tetris.NB_CASE_Y ; y++)
	{
		res[y] = [];
		for(x = 0 ; x < Tetris.NB_CASE_X ; x++)
		res[y][x] = tab[y][x];
	}

	return res;
}
