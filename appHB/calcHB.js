
/*
	Global
*/


var Data = {H:[], B:[]};

$(function(){

	// Cargar materiales instalados
	//chargeMaterials();
	// Cambio de material
	$('#materialSelect').on('change', function() {
		// En caso de cambiar borrar Data
		Data = {H:[], B:[]};
		// Cargar nuevamente
	  	loadData(this.value);
	});
	// Calcular H
	$("#CalcH").click(function(){
		var x = $("#Bvalue").val();
		if(!Number.isNaN(Number(x)))
		{
			var xj = Data.B;
			var yj = Data.H;
			var k = xj.length - 2;
			
			y = interpolate(x, k, yj, xj).toFixed(3);
			alert("El valor de H es: "+ y);
		}
		else alert("El valor insertado no es un número");
		
		
		
	});
	// Calcular H
	$("#CalcB").click(function(){
		var x = $("#Hvalue").val();
		if(!Number.isNaN(Number(x)))
		{
			var xj = Data.H;
			var yj = Data.B;
			var k = xj.length - 2;
			
			y = interpolate(x, k, yj, xj).toFixed(3);
			alert("El valor de B es: "+y);
		}
		else alert("El valor insertado no es un número");
	});



});

/*
	Importacion y carga
*/

function addData(item, index)
{
	var row = item.split("	");
	Data.H.push(Number(row[0]));
	Data.B.push(Number(row[1]));
}

function chargeMaterials()
{
	counter = 0;
	$.ajax({
		  url: "Materiales",
		  success: function(data){
		     $(data).find("a:contains(.txt)").each(function(){
		     	// Agregar a la lista
		        var material = $(this).attr("href");
		        //materialsList.push(material);
				$('<option value="'+material+'">'+material+'</option>').appendTo("#materialSelect");
				// Colocar en dataLoad
				if(counter == 0) loadData(material);
				// Incrementar contador
				counter++;
		     });
		  }
	});
}

function loadData(material)
{	
		// Cargar en el div
		$("#dataLoaded").load("Materiales/"+material); 
		setTimeout(function(){
			// Cargar el raw data
			var buffer = $("#dataLoaded").html();
			// Separar por filas
			var rows = buffer.split("\n");
			// Procedimiento para generar dos arreglos
			rows.forEach(addData);
			// Debugger
			console.log(Data);
		},1000);
}



/*
	Metodos Numericos
*/

function nearValues(x, xi, k)
{
	// Se seleccionaran 4 valores para una interpolacion de grado 3 - dos arriba y dos abajo
	var nearestMin = 0;
	var farestMin = 0;
	var nearestMax = 0;
	var farestMax = 0;
	var indexes = [0,0,0,0];

	/*
		Nueva implementación
		22 Ago 2016
	*/

	for(var i = 0; i<=k; i++)
	{
		// Si se intentan con valores inferiores a la cota
		if(xi[0] > x)
		{
			if(xi.length >= 4)
			{
				// Hay suficientes valores
				indexes[0] = 0;
				indexes[1] = 1;
				indexes[2] = 2;
				indexes[3] = 3;
				alert("El valor que se brindará será extrapolado");
				break;
			}
		}
		// Si solo hay un valor inferior a la cota
		else if(xi[0] <= x && xi[1] >= x)
		{
			if(xi.length >= 4)
			{
				// Hay suficientes valores
				indexes[0] = 0;
				indexes[1] = 1;
				indexes[2] = 2;
				indexes[3] = 3;
				break;
			}
		}
		// Si solo hay un valor superior a la cota
		else if(xi[k] >= x && xi[k-1] <= x)
		{
			if(xi.length >= 4)
			{
				// Hay suficientes valores
				indexes[0] = k-3;
				indexes[1] = k-2;
				indexes[2] = k-1;
				indexes[3] = k;
				break;
			}
		}
		// Si no hay valores superiores a la cota
		else if(xi[k] <= x)
		{
			if(xi.length >= 4)
			{
				// Hay suficientes valores
				indexes[0] = k-3;
				indexes[1] = k-2;
				indexes[2] = k-1;
				indexes[3] = k;
				alert("El valor que se brindará será extrapolado");
				break;
			}
		}
		else
		{
			if(xi[i] > nearestMin && xi[i] < x)
			{
				// Hold the old nearest value
				farestMin = nearestMin;
				// New nearest value
				nearestMin = xi[i];
				// Update indexes
				indexes[0] = indexes[1]; // Old
				indexes[1] = i;
			}
			// Max values
			
			if(xi[i] > x)
			{
				indexes[3] = indexes[1] + 2; 
				indexes[2] = indexes[1] + 1;
			}
		}


	}
	// Comprobacion de repeticiones
	for(var i = 0; i < 4; i++)
	{
		for(var j = 0; j < 4; j++)
		{
			if(j != i)
			{
				if(xi[indexes[i]] == xi[indexes[j]]) xi[indexes[j]] = xi[indexes[j]] + 0.1; 
			}
		}
	}

	return indexes;

}


function interpolate(x, k, yi, xi)
{
	
	// Buffer de sumatoria
	varinterpolation = 0;
	// Indices
	indexes = nearValues(x, xi, k);
	// Calcular constantes
	diffinit = newtonConstants(indexes, xi, yi, x);
	console.log(diffinit);
	// Sumatoria
	for(var i = 0; i <= 4; i++)
	{
		var multiplicando = 1;
		for(var j = 0; j < i; j++)
		{
			// Calcular multiplicando
			multiplicando = multiplicando * (x - xi[indexes[j]]);

		}
		if(!isNaN(varinterpolation + diffinit[i]*multiplicando))
			varinterpolation = varinterpolation + diffinit[i]*multiplicando;
	}

	// Retornar valor

	return varinterpolation;

}

function newtonConstants(indexes, xi, yi, x)
{
	// Calcular las diferencias finitas
	diffinit = [[yi[indexes[0]],0,0,0],[yi[indexes[1]],0,0,0],[yi[indexes[2]],0,0,0],[yi[indexes[3]],0,0,0]];

	for(var k = 3; k >= 0; k--) // 2
	{
		for(var i = 0; i < k; i++)
		{
			// 2
			diffinit[i][4-k] = (diffinit[i+1][3-k]-diffinit[i][3-k])/(xi[indexes[i+(4-k)]]-xi[indexes[i]]);
		}
	}
	return diffinit[0];

}