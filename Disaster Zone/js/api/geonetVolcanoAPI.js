/* Geonet Volcano API Disaster Zone MDDN352 P3 12.7 - [2016] MOFFATARAP (300317288) */
/*=/ VARABLES \=*/
var geonetVolcano = "https://json.ey.nz/api.geonet.org.nz/volcano/val"; //saves geonet url as var 
var goenetVolcanoLocal = "./json/geoNetVolcanoVal.json"; //loads local JSON for testing only works if you open the INDEX not hosted on a local IP
var volTitleLength = 12; //sets array length
var volRadiusMulti = 10; //sets volcano alert radius to be multiplyed by this number original [5]
var volUIVar = "Volcano"; //sets volcano title for UI
var volAlertLevelText = "Alert Level "; //alert level var
var date = new Date(); //gets the date and time
var textContent = document.createElement('div'); //creates vairable that is a div

/*== ARRAYS ==*/

/* 1.1# VOLCANO VARABLE ARRAYS */
//volcano titles
var volcanoMarkerTitleArray = [
  , //[0]  || AUCKLAND VOLCANIC FIELD
  , //[1]  || KERMADEC ISLANDS
  , //[2]  || MAYOR ISLAND
  , //[3]  || NGAURUHOE
  , //[4]  || NORTHLAND
  , //[5]  || OKATAINA AKA MOUNT TARAWERA
  , //[6]  || ROTORUA
  , //[7]  || RUAPEHU
  , //[8]  || TAUPO
  , //[9]  || TONGARIRO
  , //[10] || TARANAKI/EGMONT	
  , //[11] || WHITE ISLAND
];

//volcano levels
var volcanoLevelArray = [
  , //[0]  || AUCKLAND VOLCANIC FIELD
  , //[1]  || KERMADEC ISLANDS
  , //[2]  || MAYOR ISLAND
  , //[3]  || NGAURUHOE
  , //[4]  || NORTHLAND
  , //[5]  || OKATAINA AKA MOUNT TARAWERA
  , //[6]  || ROTORUA
  , //[7]  || RUAPEHU
  , //[8]  || TAUPO
  , //[9]  || TONGARIRO
  , //[10] || TARANAKI/EGMONT	
  , //[11] || WHITE ISLAND
];
//volcano activity
var volcanoActivityArray = [
  , //[0]  || AUCKLAND VOLCANIC FIELD
  , //[1]  || KERMADEC ISLANDS
  , //[2]  || MAYOR ISLAND
  , //[3]  || NGAURUHOE
  , //[4]  || NORTHLAND
  , //[5]  || OKATAINA AKA MOUNT TARAWERA
  , //[6]  || ROTORUA
  , //[7]  || RUAPEHU
  , //[8]  || TAUPO
  , //[9]  || TONGARIRO
  , //[10] || TARANAKI/EGMONT	
  , //[11] || WHITE ISLAND
];

//volcano inactvity
var volcanoInactiveArray = [

];

//stores activtiy array
var volcanoHazardsArray = [
, //[0]  || AUCKLAND VOLCANIC FIELD
, //[1]  || KERMADEC ISLANDS
, //[2]  || MAYOR ISLAND
, //[3]  || NGAURUHOE
, //[4]  || NORTHLAND
, //[5]  || OKATAINA AKA MOUNT TARAWERA
, //[6]  || ROTORUA
, //[7]  || RUAPEHU
, //[8]  || TAUPO
, //[9]  || TONGARIRO
, //[10] || TARANAKI/EGMONT	
, //[11] || WHITE ISLAND

];

//stores lat lng of volcanos in array
var volcanonLatArray = [

];

var volcanonLngArray = [

];

//Text content array
var textContentArray = [
];

//text inner html array
var textInnerHtmlArray = [
    '<img id="eventIcon" src="./media/img/mapKeys/event/weak/volcanoW.svg"> <h4 id="eventType0"></h4><h6 id="eventLocation0"></h6><h6 id="eventRating0"></h6><h6 id="eventTime0"></h6><div id="gradientL"></div>', //[0]
    '<img id="eventIcon" src="./media/img/mapKeys/event/light/volcanoL.svg"> <h4 id="eventType1"></h4><h6 id="eventLocation1"></h6><h6 id="eventRating1"></h6><h6 id="eventTime1"></h6><div id="gradientL"></div>', //[1]
    '<img id="eventIcon" src="./media/img/mapKeys/event/moderate/volcanoM.svg"> <h4 id="eventType2"></h4><h6 id="eventLocation2"></h6><h6 id="eventRating2"></h6><h6 id="eventTime2"></h6><div id="gradientL"></div>', //[2]
    '<img id="eventIcon" src="./media/img/mapKeys/event/strong/volcanoST.svg"> <h4 id="eventType3"></h4><h6 id="eventLocation3"></h6><h6 id="eventRating3"></h6><h6 id="eventTime3"></h6><div id="gradientL"></div>', //[3]
    '<img id="eventIcon" src="./media/img/mapKeys/event/severe/volcanoS.svg"> <h4 id="eventType4"></h4><h6 id="eventLocation4"></h6><h6 id="eventRating4"></h6><h6 id="eventTime4"></h6><div id="gradientL"></div>', //[4]

]
/* 1.1# VOLCANO VARABLE ARRAY [END]*/

/* 2.0# ==- CSS VARABLE ARRAYS -== */

//EVENT TYPE
var eventTypeArray = [
    "eventType0", //[0]
    "eventType1", //[1]
    "eventType2", //[2]
    "eventType3", //[3]
    "eventType4", //[4]
];

//EVENT LOCATION
var eventLocationArray = [
    "eventLocation0", //[0]
    "eventLocation1", //[1]
    "eventLocation2", //[2]
    "eventLocation3", //[3]
    "eventLocation4", //[4]
];

//EVENT RATING
var eventRatingArray = [
    "eventRating0", //[0]
    "eventRating1", //[1]
    "eventRating2", //[2]
    "eventRating3", //[3]
    "eventRating4", //[4]
];

//EVENT TIME
var eventTimeArray = [
    "eventTime0", //[0]
    "eventTime1", //[1]
    "eventTime2", //[2]
    "eventTime3", //[3]
    "eventTime4", //[4]
];

/* 2.0# ==- CSS VARABLE ARRAYS [END]-== */

// VOL JSON is called as a function in geolocationAPI
function volJSON() {
    $.getJSON(geonetVolcano, function (data) {
       $.each(data.features, function (i, vol) {
            //data id displayed in table row || this one is volcano title
            if (i < volTitleLength) {
                volcanoMarkerTitleArray[i] = vol.properties.volcanoTitle;
                volcanoLevelArray[i] = vol.properties.level;
                volcanoActivityArray[i] = vol.properties.activity;
                volcanoHazardsArray[i] = vol.properties.hazards;
                volcanonLatArray[i] = vol.geometry.coordinates[1]; //access first element
                volcanonLngArray[i] = vol.geometry.coordinates[0]; //access second element
                i++;
            }
            else {
                //doNothing
            }

        });

        /* DEBUGGING 
        console.log('#1');
        console.log(volcanoMarkerTitleArray); //display value of title array
        console.log('#2');
        console.log(volcanoLevelArray.toString()); //display value of level array
        console.log('#3');
        console.log(volcanoActivityArray); //display value of activity array
        console.log('#4');
        console.log(volcanoHazardsArray); //display value of hazard array
        console.log(volcanonLatArray.toString()); //displays value of Lat Array VOL
        console.log(volcanonLngArray.toString()); //displays value of Lng Array VOL
        */
        //[DEBUG DISPLAY]document.getElementById("errorCantFind").innerHTML = volcanoLevelArray[11];
       
        /* DEBUGGING [END] */
       volcanoMarkerCreateLoop(); //calls vol marker loop
       console.log("3.1 volcanoMarkerCreate"); //debug volcano marker create
    });

}

/* 2.0# PUSH ACTIVE VOLCANO DATA TO ARRAY */
function pushToArray() {
    //Add active volcano to array
    volActiveArray.push('Alert Level ' + volcanoLevelArray[i] + ' ' + volcanoMarkerTitleArray[i]);
    
    /*DEBUG Log Active Volcano
    console.log(volcanoMarkerTitleArray[i]);
    console.log(volActiveArray);  */
}
/* 2.0# PUSH ACTIVE VOLCANO DATA TO ARRAY [END] */

/* 2.1# BIND CIRCLE TO MIDDLE MARKER */
function bindCircle() {
    volcanoAlertCircleMarkerArray[i].bindTo('center', volcanoMarkerArray[i], 'position'); //binds circle to location of marker
}

/* 2.1# BIND CIRCLE TO MIDDLE MARKER [END]*/

/* 2.3# ==-- VOLCANO MARKER LOOP --== */
function volcanoMarkerCreateLoop() {
        for (i = 0; i < volcanoMarkerArray.length; i++) {
            //Loop until i = the length of MarkerArray
            //console.log('markerCreate)

            //VOL AlERT = 0 
            if (volcanoLevelArray[i] === 0) {
                volcanoInactiveArray.push(volcanoMarkerTitleArray[i]);
               // console.log(volcanoInactiveArray);

            }
            if (volcanoLevelArray[i] > 0) {
                //IF volcano alert level is larger than 0 make markers
               
                //VOL ALERT = 1
                if (volcanoLevelArray[i] === 1) {
                    volcanoMarkerArray[i] = new google.maps.Marker({
                        //create marker
                        map: mapObject,
                        title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
                        position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
                        icon: iconArray[29],
                    });

                    pushToArray(); //pushes active volcanos to array

                    // circle alert create
                    volcanoAlertCircleMarkerArray[i] = new google.maps.Circle({
                        map: mapObject,
                        radius: alertCirlceRadiusArray[4] * volRadiusMulti, // sets alert radius from array 
                        fillColor: alertCircleColorArray[4], //sets color of fill from array
                        strokeColor: alertCircleColorArray[4], //sets stroke color from array
                        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
                    });

                    bindCircle(); //binds circle to marker

                    

                    /* 1# DISPLAY IN UI */
                    //idFunction();
                    textContentArray[i] = document.createElement('div');
                    $(textContentArray[i]).addClass("dummyEvent");
                    textContentArray[i].innerHTML = textInnerHtmlArray[0];

                    $(".eventsList").prepend(textContentArray[i]);

                    // 1.0# SET CONTENT
                    //SET EVENT TITLE
                    document.getElementById(eventTypeArray[0]).textContent = volUIVar;
                    //SET EVENT LOCATION
                    document.getElementById(eventLocationArray[0]).textContent = volcanoMarkerTitleArray[i];
                    //SET EVENT HAZARDS
                    document.getElementById(eventRatingArray[0]).textContent = volAlertLevelText + volcanoLevelArray[i] + " " + volcanoActivityArray[i];
                    //SET LAST CHECKED EVENT
                    document.getElementById(eventTimeArray[0]).textContent = date.toUTCString();
                   /* DISPLAY IN UI [END] */
                    
                }
                    
                //VOL ALERT = 2
                if (volcanoLevelArray[i] === 2) {
                    volcanoMarkerArray[i] = new google.maps.Marker({
                        //create marker
                        map: mapObject,
                        title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
                        position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
                        icon: iconArray[28],
                    });

                    pushToArray(); //pushes active volcanos to array

                    // circle alert create
                    volcanoAlertCircleMarkerArray[i] = new google.maps.Circle({
                        map: mapObject,
                        radius: alertCirlceRadiusArray[3] * volRadiusMulti, // sets alert radius from array 
                        fillColor: alertCircleColorArray[3], //sets color of fill from array
                        strokeColor: alertCircleColorArray[3], //sets stroke color from array
                        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
                    });

                    bindCircle(); //binds circle to marker

                    /* 2# DISPLAY IN UI */
                    //idFunction();
                    textContentArray[i] = document.createElement('div');
                    $(textContentArray[i]).addClass("dummyEvent");
                    textContentArray[i].innerHTML = textInnerHtmlArray[1];

                    $(".eventsList").prepend(textContentArray[i]);

                    // 2.0# SET CONTENT
                    //SET EVENT TITLE
                    document.getElementById(eventTypeArray[1]).textContent = volUIVar;
                    //SET EVENT LOCATION
                    document.getElementById(eventLocationArray[1]).textContent = volcanoMarkerTitleArray[i];
                    //SET EVENT HAZARDS
                    document.getElementById(eventRatingArray[1]).textContent = volAlertLevelText + volcanoLevelArray[i] + " " + volcanoActivityArray[i];
                    //SET LAST CHECKED EVENT
                    document.getElementById(eventTimeArray[1]).textContent = date.toUTCString();
                    /* 2# DISPLAY IN UI [END] */
                }


                //VOL ALERT = 3
                if (volcanoLevelArray[i] === 3) {
                    volcanoMarkerArray[i] = new google.maps.Marker({
                        //create marker
                        map: mapObject,
                        title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
                        position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
                        icon: iconArray[27],
                    });

                    pushToArray(); //pushes active volcanos to array

                    // circle alert create
                    volcanoAlertCircleMarkerArray[i] = new google.maps.Circle({
                        map: mapObject,
                        radius: alertCirlceRadiusArray[2] * volRadiusMulti, // sets alert radius from array 
                        fillColor: alertCircleColorArray[2], //sets color of fill from array
                        strokeColor: alertCircleColorArray[2], //sets stroke color from array
                        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
                    });

                    bindCircle(); //binds circle to marker

                    /* 3# DISPLAY IN UI */
                    //idFunction();
                    textContentArray[i] = document.createElement('div');
                    $(textContentArray[i]).addClass("dummyEvent");
                    textContentArray[i].innerHTML = textInnerHtmlArray[2];

                    $(".eventsList").prepend(textContentArray[i]);

                    // 2.0# SET CONTENT
                    //SET EVENT TITLE
                    document.getElementById(eventTypeArray[2]).textContent = volUIVar;
                    //SET EVENT LOCATION
                    document.getElementById(eventLocationArray[2]).textContent = volcanoMarkerTitleArray[i];
                    //SET EVENT HAZARDS
                    document.getElementById(eventRatingArray[2]).textContent = volAlertLevelText + volcanoLevelArray[i] + " " + volcanoActivityArray[i];
                    //SET LAST CHECKED EVENT
                    document.getElementById(eventTimeArray[2]).textContent = date.toUTCString();
                    /* 3# DISPLAY IN UI [END] */
                }

                //VOL ALERT = 4
                if (volcanoLevelArray[i] === 4) {
                    volcanoMarkerArray[i] = new google.maps.Marker({
                        //create marker
                        map: mapObject,
                        title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
                        position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
                        icon: iconArray[26],
                    });

                    pushToArray(); //pushes active volcanos to array

                    // circle alert create
                    volcanoAlertCircleMarkerArray[i] = new google.maps.Circle({
                        map: mapObject,
                        radius: alertCirlceRadiusArray[1] * volRadiusMulti, // sets alert radius from array 
                        fillColor: alertCircleColorArray[1], //sets color of fill from array
                        strokeColor: alertCircleColorArray[1], //sets stroke color from array
                        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
                    });

                    bindCircle(); //binds circle to marker

                    /* 4# DISPLAY IN UI */
                    //idFunction();
                    textContentArray[i] = document.createElement('div');
                    $(textContentArray[i]).addClass("dummyEvent");
                    textContentArray[i].innerHTML = textInnerHtmlArray[3];

                    $(".eventsList").prepend(textContentArray[i]);

                    // 4.0# SET CONTENT
                    //SET EVENT TITLE
                    document.getElementById(eventTypeArray[3]).textContent = volUIVar;
                    //SET EVENT LOCATION
                    document.getElementById(eventLocationArray[3]).textContent = volcanoMarkerTitleArray[i];
                    //SET EVENT HAZARDS
                    document.getElementById(eventRatingArray[3]).textContent = volAlertLevelText + volcanoLevelArray[i] + " " + volcanoActivityArray[i];
                    //SET LAST CHECKED EVENT
                    document.getElementById(eventTimeArray[3]).textContent = date.toUTCString();
                    /* 4# DISPLAY IN UI [END] */
                }

                //VOL ALERT = 5
                if (volcanoLevelArray[i] === 5) {
                    volcanoMarkerArray[i] = new google.maps.Marker({
                        //create marker
                        map: mapObject,
                        title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
                        position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
                        icon: iconArray[25],
                    });

                    pushToArray(); //pushes active volcanos to array

                    // circle alert create
                    volcanoAlertCircleMarkerArray[i] = new google.maps.Circle({
                        map: mapObject,
                        radius: alertCirlceRadiusArray[0] * volRadiusMulti, // sets alert radius from array 
                        fillColor: alertCircleColorArray[0], //sets color of fill from array
                        strokeColor: alertCircleColorArray[0], //sets stroke color from array
                        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
                    });

                    bindCircle(); //binds circle to marker

                    /* 5# DISPLAY IN UI */
                    //idFunction();
                    textContentArray[i] = document.createElement('div');
                    $(textContentArray[i]).addClass("dummyEvent");
                    textContentArray[i].innerHTML = textInnerHtmlArray[4];

                    $(".eventsList").prepend(textContentArray[i]);

                    // 5.0# SET CONTENT
                    //SET EVENT TITLE
                    document.getElementById(eventTypeArray[4]).textContent = volUIVar;
                    //SET EVENT LOCATION
                    document.getElementById(eventLocationArray[4]).textContent = volcanoMarkerTitleArray[i];
                    //SET EVENT HAZARDS
                    document.getElementById(eventRatingArray[4]).textContent = volAlertLevelText + volcanoLevelArray[i] + " " + volcanoActivityArray[i];
                    //SET LAST CHECKED EVENT
                    document.getElementById(eventTimeArray[4]).textContent = date.toUTCString();
                    /* 5# DISPLAY IN UI [END] */
                }

           }

            /* VOL ALERT = 0 Display Normal Icon BROKEN ATM 28/03/2017*/
            //if show inactive vol = 0 then show inactive volcanos
            if (showInactiveVol === 1){
                volcanoMarkerArray[i] = new google.maps.Marker({
                    //create marker
                    map: mapObject,
                    title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
                    position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
                    icon: disasterIconStandardArray[5],
                }); 
                
                /*DEBUG Log Active Volcano 
                console.log(volcanoMarkerTitleArray[i]); */
            }
                        
        }

    };

/* 2.3 # ==-- VOLCANO MARKER LOOP [END] --== */


