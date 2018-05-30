/**
Tomado de Johann Felipe González Ávila
Github:  lakfel
*/
function crearEsfera (pisos, r)
{
	var vertices = [];
	var paso = 2*Math.PI/pisos;
	var paso2 = 1 / pisos;
	var coords = [];
	var textCords = [];
	var normalData = [];

	for(var i = 0; i   <  pisos/2  ; i++)
	{
	for (var j = 0 ; j  < pisos ; j++)
		{

			normalData.push(r*Math.sin(i*paso) * Math.cos(j*paso));
			normalData.push(r*Math.cos(i*paso));
			normalData.push(r*Math.sin(i*paso) * Math.sin(j*paso));

			normalData.push(r*Math.sin(i*paso) * Math.cos((j+1)*paso));
			normalData.push(r*Math.cos(i*paso));
			normalData.push(r*Math.sin(i*paso) * Math.sin((j+1)*paso));

			normalData.push(r*Math.sin((i+1)*paso) * Math.cos((j+1)*paso));
			normalData.push(r*Math.cos((i+1)*paso));
			normalData.push(r*Math.sin((i+1)*paso) * Math.sin((j+1)*paso));

			normalData.push(r*Math.sin((i+1)*paso) * Math.cos((j)*paso));
			normalData.push(r*Math.cos((i+1)*paso));
			normalData.push(r*Math.sin((i+1)*paso) * Math.sin((j)*paso));


			vertices.push(r*Math.sin(i*paso) * Math.cos(j*paso));
			vertices.push(r*Math.cos(i*paso));
			vertices.push(r*Math.sin(i*paso) * Math.sin(j*paso));

			vertices.push(r*Math.sin(i*paso) * Math.cos((j+1)*paso));
			vertices.push(r*Math.cos(i*paso));
			vertices.push(r*Math.sin(i*paso) * Math.sin((j+1)*paso));

			vertices.push(r*Math.sin((i+1)*paso) * Math.cos((j+1)*paso));
			vertices.push(r*Math.cos((i+1)*paso));
			vertices.push(r*Math.sin((i+1)*paso) * Math.sin((j+1)*paso));

			vertices.push(r*Math.sin((i+1)*paso) * Math.cos((j)*paso));
			vertices.push(r*Math.cos((i+1)*paso));
			vertices.push(r*Math.sin((i+1)*paso) * Math.sin((j)*paso));

			coords.push(i*pisos*4 + j*4);
			coords.push(i*pisos*4 + j*4 + 3);
			coords.push(i*pisos*4 + j*4 + 1);

			coords.push(i*pisos*4 + j*4 + 1);
			coords.push(i*pisos*4 + j*4 + 3);
			coords.push(i*pisos*4 + j*4 + 2);


			textCords.push(j*paso /(Math.PI*2)) ;
			textCords.push(i*paso /Math.PI) ;

			textCords.push((j+1)*paso /(Math.PI*2)) ;
			textCords.push(i*paso /Math.PI) ;

			textCords.push((j+1)*paso /(Math.PI*2)) ;
			textCords.push((i+1)*paso /Math.PI) ;

			textCords.push(j*paso /(Math.PI*2)) ;
			textCords.push((i+1)*paso /Math.PI) ;

		}
	}
	var ret = {normalData: normalData, vertices : vertices, coords : coords, textCords : textCords};
	return ret;
};
