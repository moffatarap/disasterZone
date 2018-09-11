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
    $.getJSON(goenetVolcanoLocal, function (data) {
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
        ///* PLAN */
        ////[1] Split JSON into array consisting of active and non active volcanos
        ////[2] Then create a loop to go through the arrays we just created and check to see what the severity level is
        ////[3] With this severity level make icon depneding on severity and using another loop to prevent double ups
        ////[4] add in a if statement to show the inactive volcanos
        ////[5] Show all on map and in ui
        ////[6] it works and its great


       console.log("3.1 volcanoMarkerCreateLoop"); //debug volcano marker create
        //volcanoMarkerCreateLoop(); //calls vol marker loop
       VolcanoSortLoop();
    });

}

var volcanoInactiveArray = [];
function VolcanoSortLoop() {

    for (i = 0; i < volcanoLevelArray.length; i++) {
        //SORTS VOLCANOS FROM VOLCANO LEVEL ARRAY THAT ARE GREATER THAN 0 to VOLCANOACTIVEARRAY
        if (volcanoLevelArray[i] > 0) {
            console.log("ACTIVE_VOLCANOS_ADDED");
            VolcanoMakeIcons();
        }

        //SORTS VOLCANOS FROM VOLCANO LEVEL ARRAY THAT ARE EQUAL TO 0 to VOLCANOINACTIVEARRAY
        if (volcanoLevelArray[i] === 0 && showInactiveVol === 1) {
            volcanoInactiveArray.push(volcanoLevelArray[i]);
            console.log("INACTIVE_VOLCANOS_ADDED");
            console.log(volcanoInactiveArray);
            VolcanoMakeIcons();
        }

    }
    console.log("VolcanoMakeIcons_Called");
    console.log("VolcanoSortLoop_ENDED");
}
/* THIS FUNCTION USES VOLSORTLOOPS [i] varable to do counting */
function VolcanoMakeIcons() {
     
    console.log("VolcanoMakeIcons_Started");
    /*#1 SETS ICON TO BE USED BASED ON ARRAY */
    selectedIcon = volcanoLevelArray[i];
    console.log("SelectedIcon_"+ selectedIcon);
    selectedCircle = volcanoLevelArray[i];
    console.log("SelectedCircle_" + selectedCircle);

    /* #2  CREATE GOOGLE MAPS MARKER */
    volcanoMarkerArray[i] = new google.maps.Marker({
    //create marker
    map: mapObject,
    title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
    position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
    icon: newIconVolcanoArray[selectedIcon],
    });
    

    
    
    console.log("VolcanoMakeIcons_ENDED");
}

///* 4.1# ==-- VOLCANO MARKER LOOP --== */
//function volcanoMarkerCreateLoop() {
    
//    console.log('vol_markerCreate_CALLED');
//    for (i = 0; i < volcanoMarkerArray.length; i++) {

//        //VOL AlERT = 0 NO ACTIVITY 
//        if (volcanoLevelArray[i] === 0) {
//            volcanoInactiveArray.push(volcanoMarkerTitleArray[i]);
//        }

//        //VOL ALERT LARGER THAN 0 ACTIVITY
//        if (volcanoLevelArray[i] > 0) {
//            if (i === 1) {
//                console.log('VOLCANO ALERT ACTIVE')
//            }
//            alertVolcanosArray[alertVolIndex] =+ volcanoLevelArray[i]; //adds volcanoLevelArray to alertVolcanos
//            //console.log(alertVolcanosArray);
//            alertVolIndex++;
//            //console.log(alertVolIndex);
//            console.log('VolAlertMarkerCreate_METHOD ACTIVE');
//        }
//    }

//    if (showInactiveVol === 1 && i === volcanoLevelArray.length) {
//        console.log("INACTIVE VOL FINISHED");
//        VolInactiveShow();
//    }

//    console.log("VOL LOOP FINISHED");
//    VolAlertMarkerCreate();

//};

///* 4.1 # ==-- VOLCANO MARKER LOOP [END] --== */
///* PLAN */
////[1] Split JSON into array consisting of active and non active volcanos
////[2] Then create a loop to go through the arrays we just created and check to see what the severity level is
////[3] With this severity level make icon depneding on severity and using another loop to prevent double ups
////[4] add in a if statement to show the inactive volcanos
////[5] Show all on map and in ui
////[6] it works and its great

//function VolAlertMarkerCreate() {
    
//    /*= SETS ALERT LEVEL TO NEW ARRAY FOR SORTING OF ICONS =*/
    
//    console.log(alertVolcanosArray);
    
//     //increments count if a alert has been triggered
//    //console.log('ALERT INDEX_' + alertVolIndex);                    

//    /**== SELECTS CORRECT ICON TO BE USED DEPENDING ON SEVERITY LEVEL
//    THE ALERT LEVEL NEEDS TO BE SET TO PLUS ONE OF THE ICON INDEX DUE TO ICON STARTING AT 0 
//    AND ALERT STARTING AT 1 ==**/

//    for (i = 0; i < alertVolcanosArray.length; i++) {

//        console.log('ALERT INDEX_' + alertVolIndex);
//        console.log("VOL CREATE CALLED");
//        console.log(selectedIcon);
//        console.log(alertVolcanosArray);
//        console.log(i + "_i");
        
        
//        selectedIcon = 1; //SELECTS WEAK ICON FROM geoLocationAPI
//        selectedCircle = 1; //SELECTS WEAK CIRCLE FROM geoLocationAPI
//        console.log("EVENT_" + selectedIcon + "_WEAK_" + selectedIcon + "_ICON");
//        CreateVolIcons();        
    

//    volCount++;
//    }
    


//    //if (alertVolcanosArray[volCount] === 0 && showInactiveVol === 1) {
//    //    selectedIcon = 0; //SELECTS STANDARD ICON FROM geoLocationAPI
//    //    selectedCircle = 0; //SELECTS STANDARD CIRCLE FROM geoLocationAPI
//    //} 
//    console.log(volCount + "_VOLCOUNT");
//};

///*3.1# CREATE VOL ALERT MARKERS */


//function CreateVolIcons() {
//    alertVolIndex++;
    
//    console.log("VOL CREATE ENDED");

//    /*=== TAKES CONTENT FROM JSON AND DISPLAYS IN UI  ===*/
//    textContentArray[i] = document.createElement('div');
//    $(textContentArray[i]).addClass("dummyEvent");
//    textContentArray[i].innerHTML = textInnerHtmlArray[i];
//    console.log(textContentArray[i]);
//    console.log(textInnerHtmlArray[i]);
    
//    console.log(selectedIcon);

//    $(".eventsList").prepend(textContentArray[i]);

//    //// 1.0# SET CONTENT
//    //SET EVENT TITLE
//    console.log(eventTypeArray[selectedIcon].toString());
//    document.getElementById(eventTypeArray[selectedIcon]).textContent = volUIVar;
//    console.log(eventTypeArray.toString());
//    //SET EVENT LOCATION
//    document.getElementById(eventLocationArray[selectedIcon]).textContent = volcanoMarkerTitleArray[i];
//    //SET EVENT HAZARDS
//    document.getElementById(eventRatingArray[selectedIcon]).textContent = volAlertLevelText + volcanoLevelArray[i] + " " + volcanoActivityArray[i];
//    //SET LAST CHECKED EVENT
//    document.getElementById(eventTimeArray[selectedIcon]).textContent = date.toUTCString();
//    console.log(selectedIcon + "_SELECTED ICON");

//    /*==== CREATE GOOGLE MAPS MARKER ====*/
//    volcanoMarkerArray[i] = new google.maps.Marker({
//        //create marker
//        map: mapObject,
//        title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
//        position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
//        icon: newIconVolcanoArray[selectedIcon],
//    });

//    pushToArray(); //pushes active volcanos to array

//    /*===== CREATE GOOGLE MAPS CIRCLE ALERT  =====*/
//    volcanoAlertCircleMarkerArray[i] = new google.maps.Circle({
//        map: mapObject,
//        radius: newAlertCirlceRadiusArray[selectedCircle] * volRadiusMulti, // sets alert radius from array 
//        fillColor: newAlertCircleColorArray[selectedCircle], //sets color of fill from array
//        strokeColor: newAlertCircleColorArray[selectedCircle], //sets stroke color from array
//        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
//    });

//    bindCircle(); //binds circle to marker
//};

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




