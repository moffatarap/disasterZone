/* Geonet Volcano API Disaster Zone MDDN352 P3 12.7 - [2016] MOFFATARAP (300317288) */
/*=/ VARABLES \=*/
var geonetVolcano = "https://api.geonet.org.nz/volcano/val"; //saves geonet url as var 
var goenetVolcanoLocal = "./json/geoNetVolcanoVal.json"; //loads local JSON for testing only works if you open the INDEX not hosted on a local IP
var volTitleLength = 12; //sets array length
var volRadiusMulti = 10; //sets volcano alert radius to be multiplyed by this number original [5]
var volUIVar = "Volcano"; //sets volcano title for UI
var volAlertLevelText = "Alert Level "; //alert level var
var date = new Date(); //gets the date and time
var textContent = document.createElement('div'); //creates vairable that is a div
var debugEnabled = 1;
var showInactiveVol = 0;

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
    //[0] LEVEL 0 NO ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/key/volcano.svg"> <h4 id="eventType0"></h4><h6 id="eventLocation0"></h6><h6 id="eventRating0"></h6><h6 id="eventTime0"></h6><div id="gradientL"></div>',
    //[1] LEVEL 1 WEAK ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/weak/volcanoW.svg"> <h4 id="eventType1"></h4><h6 id="eventLocation1"></h6><h6 id="eventRating1"></h6><h6 id="eventTime1"></h6><div id="gradientL"></div>',
    //[2] LEVEL 2 LIGHT ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/light/volcanoL.svg"> <h4 id="eventType2></h4><h6 id="eventLocation2"></h6><h6 id="eventRating2"></h6><h6 id="eventTime2"></h6><div id="gradientL"></div>',
    //[3] LEVEL 3 MODERATE ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/moderate/volcanoM.svg"> <h4 id="eventType3"></h4><h6 id="eventLocation3"></h6><h6 id="eventRating3"></h6><h6 id="eventTime3"></h6><div id="gradientL"></div>',
    //[2] LEVEL 4 STRONG ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/strong/volcanoST.svg"> <h4 id="eventType4"></h4><h6 id="eventLocation4"></h6><h6 id="eventRating4"></h6><h6 id="eventTime4"></h6><div id="gradientL"></div>',
    //[2] LEVEL 5 SEVERE ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/severe/volcanoS.svg"> <h4 id="eventType5"></h4><h6 id="eventLocation5"></h6><h6 id="eventRating5"></h6><h6 id="eventTime5"></h6><div id="gradientL"></div>',
    

]

/* VOL ALERT MARKET CREATE VAR */
var alertVolcanosArray = []; //holds current volcaons on alert
var alertVolIndex = 0; //sets alertvol array indext to zero for sorting
var selectedIcon = 0; //sets icon to be used for each event
var selectedCircle = 0; // sets the color of circle to be used and the radius
var volCount = 0;

/* 1.1# VOLCANO VARABLE ARRAY [END]*/

/* 2.0# ==- CSS VARABLE ARRAYS -== */

//EVENT TYPE
var eventTypeArray = [
    "eventType0", //[0]
    "eventType1", //[1]
    "eventType2", //[2]
    "eventType3", //[3]
    "eventType4", //[4]
    "eventType5", //[5]
];

//EVENT LOCATION
var eventLocationArray = [
    "eventLocation0", //[0]
    "eventLocation1", //[1]
    "eventLocation2", //[2]
    "eventLocation3", //[3]
    "eventLocation4", //[4]
    "eventLocation5", //[5]
];

//EVENT RATING
var eventRatingArray = [
    "eventRating0", //[0]
    "eventRating1", //[1]
    "eventRating2", //[2]
    "eventRating3", //[3]
    "eventRating4", //[4]
    "eventRating5", //[5]
];

//EVENT TIME
var eventTimeArray = [
    "eventTime0", //[0]
    "eventTime1", //[1]
    "eventTime2", //[2]
    "eventTime3", //[3]
    "eventTime4", //[4]
    "eventTime5", //[5]
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

        /* DEBUGGING */
       if (debugEnabled === 1) {
           console.log('#1 Vol Title');
           console.log(volcanoMarkerTitleArray); //display value of title array
           console.log('#2 Vol Alert Level');
           console.log(volcanoLevelArray); //display value of level array
           console.log('#3 Vol Activity');
           console.log(volcanoActivityArray); //display value of activity array
           console.log('#4 Vol Hazards');
           console.log(volcanoHazardsArray); //display value of hazard array
           console.log('#5 Vol Lat');
           console.log(volcanonLatArray); //displays value of Lat Array VOL
           console.log('#6 Vol Lng');
           console.log(volcanonLngArray); //displays value of Lng Array VOL
           //[DEBUG DISPLAY]document.getElementById("errorCantFind").innerHTML = volcanoLevelArray[11];
       }
        /* DEBUGGING [END] */
       volcanoMarkerCreateLoop(); //calls vol marker loop
       console.log("3.1 volcanoMarkerCreate"); //debug volcano marker create
    });

}


/* 4.1# ==-- VOLCANO MARKER LOOP --== */
function volcanoMarkerCreateLoop() {
    console.log('vol_markerCreate_CALLED');
    for (i = 0; i < volcanoMarkerArray.length; i++) {

        //VOL AlERT = 0 NO ACTIVITY 
        if (volcanoLevelArray[i] === 0) {
            volcanoInactiveArray.push(volcanoMarkerTitleArray[i]);

            if (showInactiveVol === 1) {
                VolInactiveShow();
            }

        }

        //VOL ALERT LARGER THAN 0 ACTIVITY
        if (volcanoLevelArray[i] > 0) {
            if (i === 1) {
                console.log('VOLCANO ALERT ACTIVE')
            }

            VolAlertMarkerCreate();
            console.log('VolAlertMarkerCreate_METHOD ACTIVE');
        }
    }

};

/* 4.1 # ==-- VOLCANO MARKER LOOP [END] --== */

function VolAlertMarkerCreate() {

    /*= SETS ALERT LEVEL TO NEW ARRAY FOR SORTING OF ICONS =*/
    alertVolcanosArray[alertVolIndex] =+ volcanoLevelArray[i]; //adds volcanoLevelArray to alertVolcanos
    console.log(alertVolcanosArray);
    console.log('ALERT INDEX_' + alertVolIndex);
    console.log(selectedIcon + "_SELECTED ICON");
    console.log("VOL CREATE CALLED");

     //increments count if a alert has been triggered
    //console.log('ALERT INDEX_' + alertVolIndex);                    

    /**== SELECTS CORRECT ICON TO BE USED DEPENDING ON SEVERITY LEVEL
    THE ALERT LEVEL NEEDS TO BE SET TO PLUS ONE OF THE ICON INDEX DUE TO ICON STARTING AT 0 
    AND ALERT STARTING AT 1 ==**/

    if (alertVolcanosArray[volCount] === 0 && showInactiveVol === 1) {
        selectedIcon = 0; //SELECTS STANDARD ICON FROM geoLocationAPI
        selectedCircle = 0; //SELECTS STANDARD CIRCLE FROM geoLocationAPI
        CreateVolIcons();
    }

    if (alertVolcanosArray[volCount] === 1) {
        selectedIcon = 1; //SELECTS WEAK ICON FROM geoLocationAPI
        selectedCircle = 1; //SELECTS WEAK CIRCLE FROM geoLocationAPI
        CreateVolIcons();
        alertVolIndex++;
        console.log("EVENT_1_WEAK_" + selectedIcon);
    }

    else if (alertVolcanosArray[volCount] === 2) {
        selectedIcon = 2; //SELECTS LIGHT ICON FROM geoLocationAPI
        selectedCircle = 2;
        CreateVolIcons();
        alertVolIndex++;
        console.log("EVENT_2_LIGHT_" + selectedIcon);
    }

    else if (alertVolcanosArray[volCount] === 3) {
        selectedIcon = 3; //SELECTS MODERATE ICON FROM geoLocationAPI
        selectedCircle = 3;
        CreateVolIcons();
        alertVolIndex++;
        console.log("EVENT_3_MODERATE_" + selectedIcon);
    }

    else if (alertVolcanosArray[volCount] === 4) {
        selectedIcon = 4; //SELECTS STRONG ICON FROM geoLocationAPI
        selectedCircle = 4;
        CreateVolIcons();
        alertVolIndex++;
        console.log("EVENT_4_STRONG_" + selectedIcon);
    }

    else if (alertVolcanosArray[volCount] === 5) {
        selectedIcon = 5; //SELECTS SEVERE ICON FROM geoLocationAPI
        selectedCircle = 5;
        CreateVolIcons();
        alertVolIndex++;
        console.log("EVENT_5_SEVERE_" + selectedIcon);
    }

    volCount++;
};






/*3.1# CREATE VOL ALERT MARKERS */


function CreateVolIcons() {
    /*=== TAKES CONTENT FROM JSON AND DISPLAYS IN UI  ===*/
    textContentArray[i] = document.createElement('div');
    $(textContentArray[i]).addClass("dummyEvent");
    textContentArray[i].innerHTML = textInnerHtmlArray[selectedIcon];

    $(".eventsList").prepend(textContentArray[i]);

    //// 1.0# SET CONTENT
    //SET EVENT TITLE
    document.getElementById(eventTypeArray[selectedIcon]).textContent = volUIVar;
    //SET EVENT LOCATION
    document.getElementById(eventLocationArray[selectedIcon]).textContent = volcanoMarkerTitleArray[i];
    //SET EVENT HAZARDS
    document.getElementById(eventRatingArray[selectedIcon]).textContent = volAlertLevelText + volcanoLevelArray[i] + " " + volcanoActivityArray[i];
    //SET LAST CHECKED EVENT
    document.getElementById(eventTimeArray[selectedIcon]).textContent = date.toUTCString();

    /*==== CREATE GOOGLE MAPS MARKER ====*/
    volcanoMarkerArray[i] = new google.maps.Marker({
        //create marker
        map: mapObject,
        title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
        position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
        icon: newIconVolcanoArray[selectedIcon],
    });

    pushToArray(); //pushes active volcanos to array

    /*===== CREATE GOOGLE MAPS CIRCLE ALERT  =====*/
    volcanoAlertCircleMarkerArray[i] = new google.maps.Circle({
        map: mapObject,
        radius: newAlertCirlceRadiusArray[selectedCircle] * volRadiusMulti, // sets alert radius from array 
        fillColor: newAlertCircleColorArray[selectedCircle], //sets color of fill from array
        strokeColor: newAlertCircleColorArray[selectedCircle], //sets stroke color from array
        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
    });

    bindCircle(); //binds circle to marker
};

/* 2.1# BIND CIRCLE TO MIDDLE MARKER */
function bindCircle() {
    volcanoAlertCircleMarkerArray[i].bindTo('center', volcanoMarkerArray[i], 'position'); //binds circle to location of marker
}
/* 2.1# BIND CIRCLE TO MIDDLE MARKER [END]*/

/* 2.0# PUSH ACTIVE VOLCANO DATA TO ARRAY FOR DISPLAY IN UI*/
function pushToArray() {
    //Add active volcano to array
    volActiveArray.push('Alert Level ' + volcanoLevelArray[i] + ' ' + volcanoMarkerTitleArray[i]);

    /*DEBUG Log Active Volcano
    console.log(volcanoMarkerTitleArray[i]);
    console.log(volActiveArray);  */
}
/* 2.0# PUSH ACTIVE VOLCANO DATA TO ARRAY [END] */

/* 3.2# INACTIVE VOLCANO SHOW */
/* VOL ALERT = 0 Display Normal Icon */
function VolInactiveShow() {
        volcanoMarkerArray[i] = new google.maps.Marker({
            //create marker
            map: mapObject,
            title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
            position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
            icon: disasterIconStandardArray[5],
        });

    /*=== TAKES CONTENT FROM JSON AND DISPLAYS IN UI  ===*/
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
};




