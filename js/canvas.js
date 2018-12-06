var canvas = $('#canvas')[0];
var context = canvas.getContext('2d');

var Signature = {
	dessin : false,
	//Initialisation du Canvas
	initCanvas : function() {
		//définition du trait, sa couleur et sa taille
		context.strokeStyle = "black";
		context.lineWidth = 3;

		Signature.mouseEvent();
		Signature.touchEvent();
		Signature.effacerCanvas();
		Signature.dessiner();
	},

	//Mouvements de la souris
	mouseEvent : function() {
		//Click enfoncé
		$('#canvas').on('mousedown', function(e) {
			Signature.dessin = true;
			//initialisation du chemin
			context.beginPath();
			//Déplacement d'un point vers les coordonnées offesetX et offsetY
			context.moveTo(e.offsetX, e.offsetY);
		});

		//Déplacement de la souris
		$('#canvas').on('mousemove', function(e) {
			if(Signature.dessin===true) {
				Signature.dessiner(e.offsetX, e.offsetY);
				$('#validation').show();
			}
		});

		//Click relâché
		$('#canvas').on('mouseup', function() {
			Signature.dessin = false;
		});
	},

	//Mouvement sur mobile
	touchEvent: function () {
    //Commencement du touché
    	$("#canvas").on("touchstart", function (e) {
      		var touchX = e.touches[0].pageX - e.touches[0].target.offsetLeft,
      			touchY = e.touches[0].pageY - e.touches[0].target.offsetTop;

      		Signature.dessin = true;
      		context.beginPath();
      		context.moveTo(touchX, touchY);
   			// Empêche le scrolling de l'écran
   			e.preventDefault();
    	});

    	//Déplacement du touché
    	$("#canvas").on("touchmove", function (e) {
    		//touches[0].pageX réagit au toucher du doigt
    		//touches[0].target.offsetLeft ignore tout transformation comme les rotations
      		var touchX = e.touches[0].pageX - e.touches[0].target.offsetLeft,
      			touchY = e.touches[0].pageY - e.touches[0].target.offsetTop;

      		if (Signature.dessin === true) {
        		Signature.dessiner(touchX, touchY);
        		$('#validation').show();
      		}
      	
      		// Empêche le scrolling de l'écran
      		e.preventDefault();
    	});

    	//Fin du touché
    	$("#canvas").on("touchend", function () {
      		Signature.dessin = false;
    	});
  	},

	//Effacement du canvas de deux manières différentes
	effacerCanvas : function () {
		context.clearRect(0, 0, canvas.width, canvas.height);
		$('#reset').click(function() {
			context.clearRect(0, 0, canvas.width, canvas.height);
			$('#validation').hide();
		});
	},

	//Définition du fait de dessiner
	dessiner : function (x,y) {
		//lineTo crée la ligne, stroke la rend visible
		context.lineTo(x,y);
		context.stroke();
	}
};

Signature.initCanvas();