// JavaScript Document

function objetoAjax(){
        var xmlhttp=false;
        try {
               xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
               try {
                  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
               } catch (E) {
                       xmlhttp = false;
               }
        }
 
        if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
               xmlhttp = new XMLHttpRequest();

        }

        return xmlhttp;

}


function actualizaEstado(consulta,bitanume,status){	
		//alert(consulta+"?ciucodi="+id+"&ciudcodih="+valor);
        ajax=objetoAjax();
        ajax.open("GET", consulta+"?bitanume="+bitanume+"&bitaesta="+status);
        ajax.onreadystatechange=function() {
               if (ajax.readyState==4) {
					var show = document.getElementById('show_'+bitanume);	
					var edit = document.getElementById('edit_'+bitanume);	
					edit.style.display= "none";				   
					show.innerHTML = ajax.responseText;
					show.style.display = "block"
					return true; 
			   }

        }

        ajax.send(null)

}

function update_registatus(consulta,reginume,status){		
		//alert(consulta+"?ciucodi="+id+"&ciudcodih="+valor);
        ajax=objetoAjax();
        ajax.open("GET", consulta+"?reginume="+reginume+"&registration="+status);
        ajax.onreadystatechange=function() {
               if (ajax.readyState==4) {
					var show = document.getElementById('show1_'+reginume);	
					var edit = document.getElementById('edit1_'+reginume);	
					edit.style.display= "none";				   
					show.innerHTML = ajax.responseText;
					show.style.display = "block"
					return true; 
			   }

        }

        ajax.send(null)

}

function update_check(consulta,reginume,status){		
		//alert(consulta+"?ciucodi="+id+"&ciudcodih="+valor);
        ajax=objetoAjax();
        ajax.open("GET", consulta+"?reginume="+reginume+"&estado="+status);
        ajax.onreadystatechange=function() {
               if (ajax.readyState==4) {
					//var show = document.getElementById('check_'+reginume);	
					//var edit = document.getElementById('edit1_'+reginume);	
					//edit.style.display= "none";				   
					show.innerHTML = ajax.responseText;
					//show.style.display = "block"
					return true; 
			   }

        }

        ajax.send(null)

}

function update_checkPago(consultaPago,pagonume,statusPago){		
//		alert(consulta+"?ciucodi="+id+"&ciudcodih="+valor);
		//alert(clubnume);
        ajax=objetoAjax();
        ajax.open("GET", consultaPago+"?pagonume="+pagonume+"&estadoPago="+statusPago);
        ajax.onreadystatechange=function() {
               if (ajax.readyState==4) {
					//var show = document.getElementById('check_'+reginume);	
					//var edit = document.getElementById('edit1_'+reginume);	
					//edit.style.display= "none";	
					//document.getElementById("resultado"+pagonume).innerHTML="CL"+clubnume;
					show.innerHTML = ajax.responseText;
					//show.style.display = "block"
					return true; 
			   }

        }

        ajax.send(null)

}


function update_checkLic(consultaLic,solinume,statusLic){		
//		alert(consulta+"?ciucodi="+id+"&ciudcodih="+valor);
		//alert(clubnume);
        ajax=objetoAjax();
        ajax.open("GET", consultaLic+"?solinume="+solinume+"&estadoLic="+statusLic);
        ajax.onreadystatechange=function() {
               if (ajax.readyState==4) {
					//var show = document.getElementById('check_'+reginume);	
					//var edit = document.getElementById('edit1_'+reginume);	
					//edit.style.display= "none";	
					//document.getElementById("resultado"+pagonume).innerHTML="CL"+clubnume;
					show.innerHTML = ajax.responseText;
					//show.style.display = "block"
					return true; 
			   }

        }

        ajax.send(null)

}