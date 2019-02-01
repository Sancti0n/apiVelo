var Stations = {
    contractName : "Nantes",
    apiKeyJCDECAUX : "2e857fa202b1aa5ccc51813a96bf06fd4a7a08bb",
    tInterval : null,

    url : function() {
        return 'https://api.jcdecaux.com/vls/v1/stations?contract=' + 
        Stations.contractName + '&apiKey=' + Stations.apiKeyJCDECAUX;
    },

    getAllStations : function() {
        "use strict";
        ajaxGet(Stations.url(), function(reponse) {
            var totalStations = JSON.parse(reponse);
            totalStations.forEach(function(station) {
                var latitude = station.position.lat,
                    longitude = station.position.lng,
                    marker = L.marker([latitude, longitude]).addTo(mymap).bindPopup(station.name);
                
                marker.addTo(mymap);
                marker.afficheVille = Stations.contractName;
                marker.afficheNom = station.name;
                marker.afficheNumero = station.number;
                marker.afficheAdresse = station.address;
                marker.afficheStatus = station.status;
                marker.afficheNombrePlace = station.bike_stands;
                marker.afficheVeloDisponible = station.available_bikes;
                marker.affichePlaceVide = station.available_bike_stands;
                marker.afficheMajStation = Stations.msToHours(station.last_update);

                marker.on("click", function() {
                    Stations.afficheInfos(marker.afficheVille,
                                          marker.afficheNom,
                                          marker.afficheNumero,
                                          marker.afficheAdresse,
                                          marker.afficheStatus,
                                          marker.afficheNombrePlace,
                                          marker.afficheVeloDisponible,
                                          marker.affichePlaceVide,
                                          marker.afficheMajStation);
                });
            });
        });
    },

    msToHours : function(duree) {
        "use strict";
        var secondes = parseInt((duree / 1000) % 60),
            minutes = parseInt((duree / (1000 * 60)) % 60),
            heures = parseInt((duree / (1000 * 60 * 60)) % 24);

        heures = (heures < 10) ? "0" + heures : heures;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        secondes = (secondes < 10) ? "0" + secondes : secondes;
        return heures + " h " + minutes + " min " + secondes + " s";
    },

    afficheInfos : function(ville,
                            nom,
                            numero,
                            adresse,
                            status,
                            nombrePlace,
                            veloDisponible,
                            placeVide,
                            majStation) {
        "use strict";

        //On efface le canvas à chaque nouveau marker
        Signature.effacerCanvas();
        sessionStorage.clear();

        //Affichage du formulaire, on cache le canvas
        $('#signature').hide();
        $('#blocExpiration').hide();
        $('#blocAnnulation').hide();

        $('#formulaire').show();

        $(".minutes").text("20 min");
        $(".secondes").text("00 s");

        //On affiche la ville
        $('#ville').text('Stations de ' + ville);

        //Valeur de localStorage
        if (localStorage.userNom !== undefined && localStorage.userPrenom !== undefined) {
            $('#name').val(localStorage.userNom);
            $('#prenom').val(localStorage.userPrenom);
        }

        //Station, son numéro, son adresse, son statut
        $('#station').text(nom);
        $('#numero').text('Station n°' + numero);
        $('#adresse').text(adresse);
        if (status==="OPEN") {
            $('#status').text('Station ouverte').css('background-color', '#228B22');
            $('#infoStation').css({
                'border-color': '#228B22',
                'border-style': 'solid'
            });
        } 
        else {
            $('#status').text('Station fermée').css('background-color', '#FF6347');
            $('#infoStation').css({
                'border-color': '#FF6347',
                'border-style': 'solid'
            });
        }

        //Nombre de vélos maximum, vélo disponible, places vides
        $('#nbPlace').text('Nombre de place : ' + nombrePlace);
        $('#veloDispo').text('Vélo disponible : ' + veloDisponible);
        if (veloDisponible >= nombrePlace/2) {
            $('#infoVelo').css({
                'border-color': '#228B22',
                'border-style': 'solid'
            });
            $('.utilisateur').show();
        }
        if (veloDisponible < nombrePlace/2 && veloDisponible!==0) {
            $('#infoVelo').css({
                'border-color': '#FFA500',
                'border-style': 'solid'
            });
            $('.utilisateur').show();
        }
        else if (veloDisponible===0 || status==="CLOSED") {
            $('#infoVelo').css({
                'border-color': '#FF6347',
                'border-style': 'solid'
            });
            $('.utilisateur').hide();
        }
        $('#placeVide').text('Place vide : ' + placeVide);

        //Affichage de la dernière mise à jour
        $('#maj').text('Mis à jour il y a ' + majStation);

        //Initialisation du localStorage
        Stations.infoLocalStorage(nom);
    },

    //Affichage Canvas
    infoCanvas : function(nomStation) {
        "use strict";
        $('#blocReservation').hide();
        $('#validation').hide();

        if ($('#canvas').is(':hidden')) {
            $('#reset').hide();
        }

        $('#signature').show();
        $('#reset').show();
        $('#infoSignature').text("Vélo réservé à la station " + nomStation);
    },

    //On met une majuscule au prénom
    premiereLettreMajuscule : function(mot) {
        "use strict";
        return mot.charAt(0).toUpperCase() + mot.slice(1);
    },

    //Méthode sur le localStorage
    //localStorage ne fonctionne pas en local sur IE 11
    infoLocalStorage : function(nomStation) {
        "use strict";
        $('.reservation').click(function() {
            var inputName = $('#name').val(),
                inputPrenom = $('#prenom').val();

            //On définit les règles sur le nom et prénom
            var regex = /^[a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ\s-]{2,25}$/;
            
            if (regex.test(inputName) && 
                regex.test(inputPrenom) && 
                inputName!=="NOM INVALIDE" && 
                inputPrenom!=="NOM INVALIDE") {

                localStorage.setItem('userNom', inputName);
                localStorage.setItem('userPrenom', inputPrenom);

                var finalNom = localStorage.userNom.toUpperCase(),
                finalPrenom = Stations.premiereLettreMajuscule(localStorage.userPrenom);

                Stations.infoCanvas(nomStation);
                Stations.infoSessionStorage(nomStation, finalNom, finalPrenom);
                $('#infoId').text("par " + finalNom + " " + finalPrenom + ".");
            }
            else {
                $('#name').val("NOM INVALIDE");
                $('#prenom').val("PRÉNOM INVALIDE");
            }
        });
    },

    //Méthode sur sessionStorage
    infoSessionStorage : function(nomStation, idNom, idPrenom) {
        "use strict";
        sessionStorage.clear();

        sessionStorage.setItem('saveStation', nomStation);
        sessionStorage.setItem('saveName', idNom);
        sessionStorage.setItem('savePrenom', idPrenom);

        $('#validation').click(function() {
            $('#signature').hide();

            $('#blocReservation').show();
            $('.stationReservee').text("Réservation en cours à " + sessionStorage.saveStation);
            $('.identite').text("par "+ sessionStorage.saveName + " " + sessionStorage.savePrenom + ".");

            Stations.infoReservation();
        });

        $('.reservation').click(function() {
            Signature.effacerCanvas();
        });
    },

    infoReservation : function () {
        "use strict";
        var heureReservation = Date.parse(new Date()),
        finReservation = Date.parse(new Date(heureReservation + 20*60*1000));
        sessionStorage.setItem('fin', finReservation);
        clearInterval(Stations.tInterval);
        Stations.tInterval = setInterval(Stations.compteur, 1000);
    },

    annulerReservation : function () {
        "use strict";
        $('#blocReservation').hide();

        //réinitialisation premier affichage compteur
        $(".minutes").text("20 min");
        $(".secondes").text("00 s");

        Stations.clearSessionAndInterval();

        $('#blocAnnulation').show();
        $('#textAnnulation').text("Vous avez annulé votre réservation !");

        $('.reservation').click(function () {
            $('#blocAnnulation').hide();
        });
    },

    compteur : function() {
        "use strict";
        var temps = sessionStorage.fin - Date.parse(new Date());

        if (temps <= 0 || isNaN(temps)) {
            Stations.clearSessionAndInterval();

            $('#blocReservation').hide();
            $('#blocAnnulation').hide();

            $('#blocExpiration').show();
            $('#textExpiration').text("Votre réservation est terminée !");

            $('.reservation').click(function () {
                $('#blocExpiration').hide();
            });
        }
        else {
            var secondes = Math.floor((temps / 1000) % 60),
            minutes = Math.floor((temps / 1000 / 60) % 60);

            $(".minutes").text(minutes + " min");
            $(".secondes").text(("0" + secondes + " s").slice(-4));
            $('#blocExpiration').hide();
        }

        $('.annulation').click(function () {
            Stations.annulerReservation();
        });
    },

    //Vide sessionStorage et met à zéro tInterval
    clearSessionAndInterval : function () {
        "use strict";
        clearInterval(Stations.tInterval);
        sessionStorage.clear();
    }
};

Stations.getAllStations();