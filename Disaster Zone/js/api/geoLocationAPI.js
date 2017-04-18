/* Geolocation API Disaster Zone MDDN352 P3 [2016] MOFFATARAP (300317288) */

/*=/ VARABLES \=*/
var mapUserMarker; //var for marker
var mapObject; //var for the google map
var userLatLng; //latLng of user
var accuracyDraw; //circle for measuring accuracy
var geocoder; //geocode to address
var mapLoad = 0; //sets mapLoad to [0]
var geoRefresh = 1; //sets geoRefresh function
var latitude; //lat for warning system, based off userLatLng var
var longitude; //lng for warning system, based off userLatLng var
var fourDPR = 10000;  //sets rounding var
var alertCircleStrokeWeight = 2; //sets stroke weight for alert circle
var showInactiveVol = 0; //show or hide inactive volcanos 0 to hide inactive volcano 1 to show

/* 1# = DISASTER WARNING LOCATION ARRAYS =*/
//location warning LAT 
var disasterLocLatArray = [
    -41.2905, //[0] - LAT || WELLINGTON FIRE TE PAPA 
    -42.9458, //[1] - LAT || ARTHURS PASS FLOOD
    -38.4178, //[2] - LAT || TASMAN SEA HURRICANE
    -36.5501, //[3] - LAT || AUCKLAND TORNADO
];

//location warning LNG 
var disasterLocLngArray = [
    174.7817, //[0] - LNG || WELLINGTON FIRE TE PAPA 
    171.5653, //[1] - LNG || ARTHURS PASS FLOOD
    167.8144, //[2] - LNG || TASMAN SEA HURRICANE
    175.1203, //[3] - LNG || AUCKLAND TORNADO
];
/* 1# = DISASTER LOCATION ARRAYS [END] =*/

/* 1.1# VOLCANO WARNING LOCATION ARRAYS */
var volcanoWarningLatArray = [
    -36.9850, //[0]  - LAT || AUCKLAND VOLCANIC FIELD
    -29.2540, //[1]  - LAT || KERMADEC ISLANDS
    -37.2860, //[2]  - LAT || MAYOR ISLAND
    -39.1560, //[3]  - LAT || NGAURUHOE
    -35.3950, //[4]  - LAT || NORTHLAND
    -38.1190, //[5]  - LAT || OKATAINA AKA MOUNT TARAWERA
    -38.0930, //[6]  - LAT || ROTORUA
    -39.2810, //[7]  - LAT || RUAPEHU
    -38.7840, //[8]  - LAT || TAUPO
    -39.1333, //[9]  - LAT || TONGARIRO
    -39.2980, //[10] - LAT || TARANAKI/EGMONT	
    -37.5210, //[11] - LAT || WHITE ISLAND
];

var volcanoWarningLngArray = [
    174.7700, //[9]  - LNG || AUCKLAND VOLCANIC FIELD
    177.9167, //[8]  - LNG || KERMADEC ISLANDS
    176.2510, //[7]  - LNG || MAYOR ISLAND
    175.6320, //[6]  - LNG || NGAURUHOE
    173.6300, //[5]  - LNG || NORTHLAND
    176.5010, //[4]  - LNG || OKATAINA AKA MOUNT TARAWERA
    176.2810, //[3]  - LNG || ROTORUA
    175.5630, //[11] - LNG || RUAPEHU
    175.8960, //[2]  - LNG || TAUPO
    175.6417, //[1]  - LNG || TONGARIRO
    174.0610, //[0]  - LNG || TARANAKI/EGMONT
	177.1830, //[10] - LNG || WHITE ISLAND
];


/* 1.1# VOLCANO WARNING LOCATION ARRAYS [END]*/

/* 1.2# VOLCANO MARKER VAR ARRAY */
var volcanoMarkerArray = [
    , //[0]  || AUCKLAND VOLCANIC FIELD
    , //[1]  || KERMADEC ISLANDS
    , //[2]  || MAYOR ISLAND
    , //[3]  || NGAURUHOE
    , //[4]  || NORTHLAND
    , //[5]  || OKATAINA AKA MOUNT TARAWERA
    , //[6]  || ROTORUA
    , //[7]  || TAUPO
    , //[8]  || TONGARIRO
    , //[9]  || TARANAKI/EGMONT
    , //[10] || WHITE ISLAND
    , //[11] || RUAPEHU

];

//STORES ACTIVE VOLCANOS || from lv 1 to 5
var volActiveArray = [
];

/* 1.2# VOLCANO MARKER VAR ARRAY [END] */

/* 1.3# EARTHQUAKE MARKER ARRAY */
var earthquakeMarkerArray = [
];
/* 1.3# EARTHQUAKE MARKER ARRAY [END] */

/* 1.4# EARTHQUAKE SEVERITY ARRAY */
var earthquakeSeverityArray = [
    1.0,//[0] || WEAK LOW
    3.0,//[1] || WEAK HIGH
    3.1,//[2] || LIGHT LOW
    3.9,//[3] || LIGHT HIGH
    4.0,//[4] || MODERATE LOW
    4.9,//[5] || MODERATE HIGH
    5.0,//[6] || STRONG LOW
    5.9,//[7] || STRONG HIGH
    6.0,//[8] || SEVERE +
];
/* 1.4# EARTHQUAKE SEVERITY ARRAY [END] */

/* 2# == DISASTER OFFSET ARRAY ==*/
//sets offset depending on severity of the disaster, this offset will alert users with in the defined range to a disaster
var disasterOffsetArray = [
    0.0379, //[0] - LAT || 1 SEVERE
    0.0300, //[1] - LNG || 1 SEVERE
    0.0279, //[2] - LAT || 2 Strong
    0.0200, //[3] - LNG || 2 Strong
    0.0179, //[4] - LAT || 3 Moderate
    0.0100, //[5] - LNG || 3 Moderate
    0.0089, //[6] - LAT || 4 Light
    0.0050, //[7] - LNG || 4 Light
    0.0044, //[8] - LAT || 5 Weak
    0.0025, //[9] - LNG || 5 Weak
];

/* 2# == DISASTER OFFSET ARRAY [END] ==*/

/* 3# === DISASTER MARKER ARRAY === */
var disasterMarkerAY = [
    ,//[0] - EARTHQUAKE
    ,//[1] - FIRE
    ,//[2] - FLOOD
    ,//[3] - HURRICANE
    ,//[4] - TORNADO
    ,//[5] - FIRE TE ARO
];
/* 3# === DISASTER MARKER ARRAY [END] === */

/* 4# ==== DISASTER ICON ARRAY ==== */
var iconArray = [
    // 4.0 EARTHQUAKE, Flood , Hurricane, Tornado , Fire , Volcano
    //Severe Strong Moderate Light Weak
    './media/img/mapKeys/event/severe/earthquakeS.png',    //[0] SEVERE 
    './media/img/mapKeys/event/strong/earthquakeST.png',   //[1] STRONG
    './media/img/mapKeys/event/moderate/earthquakeM.png',  //[2] MODERATE
    './media/img/mapKeys/event/light/earthquakeL.png',     //[3] LIGHT
    './media/img/mapKeys/event/weak/earthquakeW.png',      //[4]  WEAK
    // 4.1 = FLOOD flood =
    './media/img/mapKeys/event/severe/floodS.png',         //[5] SEVERE 
    './media/img/mapKeys/event/strong/floodST.png',        //[6] STRONG
    './media/img/mapKeys/event/moderate/floodM.png',       //[7] MODERATE
    './media/img/mapKeys/event/light/floodL.png',          //[8] LIGHT
    './media/img/mapKeys/event/weak/floodW.png',           //[9]  WEAK
    // 4.2 == HURRICANE ==
    './media/img/mapKeys/event/severe/hurricaneS.png',    //[10] SEVERE 
    './media/img/mapKeys/event/strong/hurricaneST.png',   //[11] STRONG
    './media/img/mapKeys/event/moderate/hurricaneM.png',  //[12] MODERATE
    './media/img/mapKeys/event/light/hurricaneL.png',     //[13] LIGHT
    './media/img/mapKeys/event/weak/hurricaneW.png',      //[14]  WEAK
    // 4.3 === TORNADO ===
    './media/img/mapKeys/event/severe/tornadoS.png',      //[15] SEVERE 
    './media/img/mapKeys/event/strong/tornadoST.png',     //[16] STRONG
    './media/img/mapKeys/event/moderate/tornadoM.png',    //[17] MODERATE
    './media/img/mapKeys/event/light/tornadoL.png',       //[18] LIGHT
    './media/img/mapKeys/event/weak/tornadoW.png',        //[19]  WEAK
    // 4.4 ==== FIRE ====
    './media/img/mapKeys/event/severe/fireS.png',         //[20] SEVERE 
    './media/img/mapKeys/event/strong/fireST.png',        //[21] STRONG
    './media/img/mapKeys/event/moderate/fireM.png',       //[22] MODERATE
    './media/img/mapKeys/event/light/fireL.png',          //[23] LIGHT
    './media/img/mapKeys/event/weak/fireW.png',           //[24]  WEAK
    // 4.5 ===== VOLCANO =====
    './media/img/mapKeys/event/severe/volcanoS.png',      //[25] SEVERE 
    './media/img/mapKeys/event/strong/volcanoST.png',     //[26] STRONG
    './media/img/mapKeys/event/moderate/volcanoM.png',    //[27] MODERATE
    './media/img/mapKeys/event/light/volcanoL.png',       //[28] LIGHT
    './media/img/mapKeys/event/weak/volcanoW.png',        //[29] WEAK
];
var iconVolcanoArray = [
    // 4.5 ===== VOLCANO =====
    './media/img/mapKeys/event/severe/volcanoS.png',      //[0] SEVERE 
    './media/img/mapKeys/event/strong/volcanoST.png',     //[1] STRONG
    './media/img/mapKeys/event/moderate/volcanoM.png',    //[2] MODERATE
    './media/img/mapKeys/event/light/volcanoL.png',       //[3] LIGHT
    './media/img/mapKeys/event/weak/volcanoW.png',        //[4] WEAK
];
/* 4# ==== DISASTER ICON ARRAY [END] ==== */

/* 4.1# ==== DISASTER ICON STANDARD ARRAY ==== */
var disasterIconStandardArray = [
    './media/img/mapKeys/key/earthquake.png', //[0] EARTHQUAKE
    './media/img/mapKeys/key/fire.png',       //[1] FIRE
    './media/img/mapKeys/key/flood.png',      //[2] FLOOD
    './media/img/mapKeys/key/hurricane.png',  //[3] HURRICANE
    './media/img/mapKeys/key/tornado.png',    //[4] TORNADO
    './media/img/mapKeys/key/volcano.png',    //[5] VOLCANO
    './media/img/mapKeys/key/user2.png',       //[6] USER
];

/* 4.1# ==== DISASTER ICON STANDARD ARRAY [END] ==== */

/* #5.0 ===== CIRCLE ARRAY =====*/
//stores circles in array
var alertCircleMarkerArray = [
    ,//[0] - EARTHQUAKE
    ,//[1] - FIRE
    ,//[2] - FLOOD
    ,//[3] - HURRICANE
    ,//[4] - TORNADO
    ,//[5] - FIRE TE ARO
];

//for volcanos
var volcanoAlertCircleMarkerArray = [
    , //[0]  || AUCKLAND VOLCANIC FIELD
    , //[1]  || KERMADEC ISLANDS
    , //[2]  || MAYOR ISLAND
    , //[3]  || NGAURUHOE
    , //[4]  || NORTHLAND
    , //[5]  || OKATAINA AKA MOUNT TARAWERA
    , //[6]  || ROTORUA
    , //[7]  || TAUPO
    , //[8]  || TONGARIRO
    , //[9]  || TARANAKI/EGMONT
    , //[10] || WHITE ISLAND
    , //[11] || RUAPEHU
];

//for earthquakes
var earthQAlertCircleMarkerArray = [

];
//for placeeholder
var phEventsAlertCircleMarkerArray = [

];

/* 5# ===== ALERT CIRCLE ARRAY [END] =====*/
//sets radius for each disaster type meters to km 1km = 1000 meters
var alertCirlceRadiusArray = [
    50000,//[0] SEVERE   || 50km
    40000,//[1] STRONG   || 40km
    20000,//[2] MODERATE || 20km
    5000,//[3] LIGHT     || 5km
    1500,//[4] WEAK      || 1.5km
];

/* 5# ===== ALERT CIRCLE ARRAY END =====*/

/* 6# ====== ALERT CIRCLE COLORS ARRAY ======*/
var alertCircleColorArray = [
    '#e52419',//[0] SEVERE 
    '#f68824',//[1] STRONG
    '#f2c92d',//[2] MODERATE
    '#31c95c',//[3] LIGHT
    '#4ecbf2',//[4]  WEAK

];

/* 6# ====== ALERT CIRCLE COLORS ARRAY [END] ======*/

/*=/ VARABLES END \=*/

var mapOptions = {
    //MAP OPTIONS
    zoom: 6, //sets zoom level
    draggable: true, //disable drag
    zoomControl: true, //disable or enable zoom
    zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    disableDoubleClickZoom: true, //disables zoom
    scrollwheel: false, //disables scroll wheel
    disableDefaultUI: true, //disables UI
    center: userLatLng, //center map

    /* STYLE SETTINGS */
    styles: [
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dbdbdb"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 29
            },
            {
                "weight": 0.2
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 18
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dedede"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "saturation": 36
            },
            {
                "color": "#333333"
            },
            {
                "lightness": 40
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f2f2f2"
            },
            {
                "lightness": 19
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#fefefe"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#fefefe"
            },
            {
                "lightness": 17
            },
            {
                "weight": 1.2
            }
        ]
    }
    ]
    /* STYLE SETTINGS */

};

/* 1# == ON LOAD SET STYLE MAP AND STARTING LOCATION ==*/
window.onload = function () {

    console.log('windowOnLoad'); //debug
    $("#floatingKey").css({ "margin-top": "60px" }); //set offset of key when disaster event shown
    $("#errorCantFind").css({ "visibility": "visible" });
    geoLocateUser();
    /* DISPLAYS ERROR CANT FIND */

   //on first loop create map
    if (mapLoad === 1) {
        /* = 1# GOOGLE MAP CREATE = */
        mapObject = new google.maps.Map(document.getElementById("googleAPI"), mapOptions);
        volJSON(); //Loads JSON Data volcanos geonet
        //earthJSON(); //Loads JSON data earthquakes goenet
        //phJSON(); disabled to just show earthquakes


    }


}

/* 1# = ON LOAD SET STYLE MAP AND STARTING LOCATION [END] =*/

/* 1.2# =-- CONVERT LatLng TO ADDRESS --= */
function writeAddressName(latLng) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        "location": latLng
    },
    function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            // console.log('geoLocationOK'); debug
            //formatted address from latLng
            //hides error message if postion found
            $("#errorCantFind").css({ "visibility": "hidden" });
            console.log('1 Geocoder Status OK')
            
            document.getElementById("mapAddress").innerHTML = results[0].formatted_address + "<br/>";
            //+= for debugging, to show all addresses = to just show one address at a time

        }

        else
            //if address cant be found show error code
            //shows error message if postion found
            $("#errorCantFind").css({ "visibility": "visible" });
        console.log('2 Geocoder Status Fail')
        document.getElementById("errorCantFind").innerHTML = "No address found" + "<br />";
    });

    //set marker creation on load of map
    if (mapLoad === 1) {
        //create map marker
        // console.log('mapMarkerSetPositonInital'); debug
        mapUserMarker = new google.maps.Marker({
            map: mapObject,
            position: userLatLng,
            icon: disasterIconStandardArray[6], //SIZE IS ISSUE
        })

    }
        //change marker position to new user LatLng
    else {
        //console.log('mapMarkerSetPositon'); debug
        mapUserMarker.setPosition(userLatLng); //mapUserMarker LatLng

    }

}
/* 1.2# =-- CONVERT LatLng TO ADDRESS --= */

/* 2# == GEO LOCATE USER == */
function geoLocateUser() {

    //add 1 to mapLoad varable
    mapLoad += 1;

    // If the browser supports the Geolocation API
    if (navigator.geolocation) {
        //console.log('geoLocateUser'); debug

        var positionOptions = {
            enableHighAccuracy: true, //accuracy 
            timeout: 10 * 2000 // 10 seconds

        };
        navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, positionOptions);

    }
    else {
        //shows error message if postion found
        $("#errorCantFind").css({ "visibility": "visible" });
        console.log('doesNotSupport'); //debug
        document.getElementById("errorCantFind").innerHTML = "<p>Your browser doesn't support location</p>";
    }

}
/* 2# == GEO LOCATE USER END ==*/

/* 3# === SUCCESS LOCATION OF USER === */
function geolocationSuccess(position) {
    userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    // Write the formatted address
    writeAddressName(userLatLng);
    center: userLatLng; //centers map position to that of user latLng

}

/* 3# === SUCCESS LOCATION OF USER [END] ===*/

/* 4# ====  GEO LOCATION ERROR ==== */
function geolocationError(positionError) {
    document.getElementById("errorCantFind").innerHTML = "Error: " + positionError.message + "<br />";
}
/* 4# ====  GEO LOCATION ERROR [END]==== */

/* 5# ===== RE DRAW MARKER ===== */
function reDraw() {
    /*DISPLAY WARNING IF USER IS NEAR DISASTER */

    /* DEBUG SECTION */
    //console.log('reDraw');writes to debug redraw
    //console.log(geoRefresh); checks value of geoRefresh

    /* DEBUG SECTION END */

    /* sets center of map [ENABLED]*/
    mapObject.setCenter(userLatLng)

}
/* 5# ===== RE DRAW MARKER [END] ===== */

/* 6# ====== REFRESH MARKER LOCATION ====== */
setInterval(function () {

    reDraw();
    /* 6.0# ====== GeoLocate User Every Second refresh ======*/
    //if geoRefresh var = 10, then run geolocation function and reset geoRefresh to 1

    /* 6.1# ======-- BREAK USER LATLNG INTO LAT AND LNG --====== */
    //SET VAR
    latitude = userLatLng.lat(); //sets latitude to userLatLng lat value
    longitude = userLatLng.lng(); //sets lon to userLatLng lat value

    //ROUND VAR
    latitude = Math.round(latitude * fourDPR) / fourDPR; //round lat to 4 decimal places
    longitude = Math.round(longitude * fourDPR) / fourDPR; //round lng to 4 decimal places

    /*BREAK USER LATLNG INTO LAT AND LNG [END] */

    /*DEBUG
    console.log(latitude);
    console.log(longitude);
    DEBUG END */

    if (geoRefresh === 2) {
        /* 6.3# ======--- GEOLOCATION ALERTS PLACEHOLDER---====== [ENABLED] */

        /* 1# WELLINGTON FIRE TE PAPA || LIGHT */
        if (latitude <= disasterLocLatArray[0] + disasterOffsetArray[4] && latitude >= disasterLocLatArray[0] - disasterOffsetArray[4] && longitude <= disasterLocLngArray[0] + disasterOffsetArray[5] && longitude >= disasterLocLngArray[0] - disasterOffsetArray[5]) {

            //1# - inZone
            $("#inZone").css({ "margin-top": "50px" }); //display alert
            $("#floatingKey").css({ "margin-top": "110px" }); //set offset of key when disaster event shown
           // console.log('ALERT: FIRE'); //debug
        }

            //1# - out ofZone
        else {
            $("#inZone").css({ "margin-top": "-50px" }); //hide alert
            $("#floatingKey").css({ "margin-top": "60px" }); //set offset of key when disaster event shown
            //console.log('ALERT: FIRE RESET'); //debug
        };

        /* 6.3# ======--- GEOLOCATION ALERTS [END] ---====== */
    };

    if (geoRefresh === 10) {
        geoLocateUser();
        //console.log('geoLocateUser');writes to debug geoLocateUser



        /* 6.3# ======- PUSH DATA TO FIREBASE -====== [REMOTE]*/

        firebaseAPI(); //firebase function call from firebaseAPI scrypt
        console.log("firebaseDataPush")
        /* 6.3# ======- PUSH DATA TO FIREBASE -====== [END]*/

        geoRefresh = 2; //reset value to 2

        
    }
        //if geoRefresh var = > 10 then add 1 to geoRefresh 
    else {

        //console.log('ALERT: None'); debug
        if (geoRefresh === 1) {
            earthJSON();
        }

        geoRefresh += 1;
        /* IF NO DISASTERS ALERTS SET ALL TO NONE */

    }

    //geoLocateUser();

}, 3300); //33000

/* 6# ====== REFRESH MARKER LOCATION [END] ====== */
