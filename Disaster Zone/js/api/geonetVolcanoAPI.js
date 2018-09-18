/* Geonet Volcano API Disaster Zone - [2016 to ..] MOFFATARAP (300317288) */
/*=/ VARABLES \=*/
var geonetVolcano = "https://api.geonet.org.nz/volcano/val"; //saves geonet url as var 
var goenetVolcanoLocal = "./json/geoNetVolcanoVal.json"; //loads local JSON for testing only works if you open the INDEX not hosted on a local IP
var volTitleLength = 12; //sets array length
var volRadiusMulti = 10; //sets volcano alert radius to be multiplyed by this number original [5]
var volUIVar = "Volcano"; //sets volcano title for UI
var volAlertLevelText = "Alert Level "; //alert level var
/*SET TIME*/
var date = new Date(); //gets the date and time
/* SET TIME END */
var textContent = document.createElement('div'); //creates vairable that is a div
var debugEnabled = 1;
var volMakeIconsDebug = 0; //0 is off 1 is on
var showInactiveVol = 1;
var dateUTC = 0; //sets var for saving the date to a varable to prevent issues with the date on some browsers

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
    '<img id="eventIcon" src="./media/img/mapKeys/event/light/volcanoL.svg"> <h4 id="eventType2"></h4><h6 id="eventLocation2"></h6><h6 id="eventRating2"></h6><h6 id="eventTime2"></h6><div id="gradientL"></div>',
    //[3] LEVEL 3 MODERATE ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/moderate/volcanoM.svg"> <h4 id="eventType3"></h4><h6 id="eventLocation3"></h6><h6 id="eventRating3"></h6><h6 id="eventTime3"></h6><div id="gradientL"></div>',
    //[4] LEVEL 4 STRONG ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/strong/volcanoST.svg"> <h4 id="eventType4"></h4><h6 id="eventLocation4"></h6><h6 id="eventRating4"></h6><h6 id="eventTime4"></h6><div id="gradientL"></div>',
    //[5] LEVEL 5 SEVERE ALERT
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

//EVENT RAINING CLASS
var eventAlertClassArray = [
    "volcanoEvent Alert_00",  //[0]
    "volcanoEvent Alert_01",  //[1]
    "volcanoEvent Alert_02",  //[2]
    "volcanoEvent Alert_03",  //[3]
    "volcanoEvent Alert_04",  //[4]
    "volcanoEvent Alert_05",  //[5]
];

var eventAlertIdArray = [
    "volEventIndex_00",
    "volEventIndex_01",
    "volEventIndex_02",
    "volEventIndex_03",
    "volEventIndex_04",
    "volEventIndex_05",
    "volEventIndex_06",
    "volEventIndex_07",
    "volEventIndex_08",
    "volEventIndex_09",
    "volEventIndex_10",
    "volEventIndex_11",
]


/* 2.0# ==- CSS VARABLE ARRAYS [END]-== */

//#0 VOL JSON is called as a function in geolocationAPI
function volJSON() {
    console.log("#0 VOLJSON_Called");
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
                console.log("JSON DID NOT LOAD CORRECTLY");
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
       }
        /* DEBUGGING [END] */
       console.log("#7 volcanoMarkerCreateLoop"); //debug volcano marker create
       VolcanoSortLoop(); //runs function to sort volcanos to make icons
    });
}

/*#1 SORTS VOLCANOS FROM ACTIVE TO INACTIVE 0 to 5 */
function VolcanoSortLoop() {
    console.log("#8 VolSortLoop_CALLED");
    for (i = 0; i < volcanoLevelArray.length; i++) {
        /* Makes ICONS IF THE LEVEL ON SELECTED INDEX IS GREATER THAN 0 */
        if (volcanoLevelArray[i] > 0) {
            VolcanoMakeIcons();
        }

        /* MAKES ICONS IF THE LEVEL ON SELECTED INDEX IS 0 */
        if (volcanoLevelArray[i] === 0 && showInactiveVol === 1) {
            volcanoInactiveArray.push(volcanoLevelArray[i]);
            VolcanoMakeIcons();
        }
    }

    console.log("#9 VolSortLoop_ENDED" + "_VOLCANOS_LOADED_&_DISPLAYED");
    VolJumpToEvent(); //Allow clicking of UI
    console.log("#10 VolJumpToEvent_Called");
}
/*#2 THIS FUNCTION MAKES ICONS USING THE VOLCANOSORTLOOPS VARABLES */
var infowindow = [];

function VolcanoMakeIcons() {
    if (volMakeIconsDebug === 1) {
        console.log("VolcanoMakeIcons_Started");
    }   
    
    /* #1.1 SETS ICON TO BE USED BASED ON ARRAY INDEX VALUE */
    selectedIcon = volcanoLevelArray[i]; //sets icon to be equal to i's index value on volcanolevelarray
    selectedCircle = volcanoLevelArray[i]; //sets circle radius to be equal to i's index value on volcanolevelarray
    
    /* #1.2  CREATE GOOGLE MAPS MARKER */
    volcanoMarkerArray[i] = new google.maps.Marker({
      map: mapObject,
      title: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i],
      position: { lat: volcanonLatArray[i], lng: volcanonLngArray[i] },
      icon: iconVolcanoArray[selectedIcon],
    });

    /* MAKE POP UP WINDOW */
    infowindow[i] = new google.maps.InfoWindow({
        content: volcanoMarkerTitleArray[i] + ' Alert Level ' + volcanoLevelArray[i] + "<br> " + volcanoActivityArray[i],
    });

    volcanoMarkerArray[i].addListener('click', function () {
       
            infowindow[i].open(mapObject, volcanoMarkerArray[i]);
       
    });

    //[DSIPLAY INFO WINDOWS] infowindow.open(mapObject, volcanoMarkerArray[i]);


    if (volMakeIconsDebug === 1) {
        console.log("Marker_Created");
    }

    /* #1.3 CREATE CIRCLE ALERT */
    volcanoAlertCircleMarkerArray[i] = new google.maps.Circle({
        map: mapObject,
        radius: alertCirlceRadiusArray[selectedCircle] * volRadiusMulti, // sets alert radius from array 
        fillColor: alertCircleColorArray[selectedCircle], //sets color of fill from array
        strokeColor: alertCircleColorArray[selectedCircle], //sets stroke color from array
        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
    });

    /* #1.4 MARKER BINDING */
    if (volMakeIconsDebug === 1) {
        console.log("Circle_Created");
        console.log("Marker_Binded");
    }
    bindCircle();

    /* #2.0 CREATE UI  [NEED TO WORK ON SORTING INTO PROPER ORDER]*/
    textContentArray[i] = document.createElement('div'); //creates a div
    //ADD CLASSES
    $(textContentArray[i]).addClass(eventAlertClassArray[selectedIcon]); //sets div classes depending on alert level
    //ADD ID's
    $(textContentArray[i]).attr("id", eventAlertIdArray[i]); //ads id selector based on array
    textContentArray[i].innerHTML = textInnerHtmlArray[selectedIcon]; //uses the value from volcano level
    $(".eventsList").prepend(textContentArray[i])
   
    if (volMakeIconsDebug === 1) {
        console.log(textContentArray[selectedIcon]);
        console.log(textInnerHtmlArray[selectedIcon]);   //uses the value from volcano level
    }   
    
    /* #2.1 SET CONTENT UI */
    //SET EVENT TITLE
    document.getElementById(eventTypeArray[selectedIcon]).textContent = volUIVar;
    //SET EVENT LOCATION
    document.getElementById(eventLocationArray[selectedIcon]).textContent = volcanoMarkerTitleArray[i];
    //SET EVENT HAZARDS
    document.getElementById(eventRatingArray[selectedIcon]).textContent = volAlertLevelText + volcanoLevelArray[i] + " " + volcanoActivityArray[i];
    //SET LAST CHECKED EVENT
    dateUTC = date.toUTCString(); //runs function then turns into var to enable use in all browsers
    //dateUTC = dateUTC.slice(0, -4); //TRIMS OFF THE GMT
    document.getElementById(eventTimeArray[selectedIcon]).textContent = dateUTC;

    

    if (volMakeIconsDebug === 1) {
        console.log("VolcanoMakeIcons_ENDED");
    }   
    return; //finish function and return to previous task
}

/*3# THIS FUNCTION BINDS A CIRCLE TO DISPLAY RADIUS TO GOOGLE MAP MARKERS */
function bindCircle() {
    volcanoAlertCircleMarkerArray[i].bindTo('center', volcanoMarkerArray[i], 'position'); //binds circle to location of marker
    return; //finish function and return to previous task
}
/*3# BIND CIRCLE TO MIDDLE MARKER [END]*/
/* VolJumpToEvent VARABLES */
var centerSelector = 0; //sets the center to zoom on to eg volcano event
var volZoomSetting = 9; //sets zoom level for zooming in on event
var volStockZoomSetting = 6; //sets the zoom level on the map
var volEventCenter = 0; //sets the vol center
var clickEvent = 0; //sets var to test if map has been clicked on

/*4# JUMP TO MAP */
function VolJumpToEvent() {
    $("#volEventIndex_00").click(function () {
        centerSelector = 0;
        clickEvent = 1;
        console.log('EVENT_00');
        VolOnClick();
    });

    
    $("#volEventIndex_01").click(function () {
        centerSelector = 1;
        clickEvent = 1;
        console.log('EVENT_01');
        VolOnClick();
    });

    $("#volEventIndex_02").click(function () {
        centerSelector = 2;
        clickEvent = 1;
        console.log('EVENT_02');
        VolOnClick();
    });

    $("#volEventIndex_03").click(function () {
        centerSelector = 3;
        clickEvent = 1;
        console.log('EVENT_03');
        VolOnClick();
    });

    $("#volEventIndex_04").click(function () {
        centerSelector = 4;
        clickEvent = 1;
        console.log('EVENT_04');
        VolOnClick();
    });

    $("#volEventIndex_05").click(function () {
        centerSelector = 5;
        clickEvent = 1;
        console.log('EVENT_05');
        VolOnClick();
    });


    $("#volEventIndex_06").click(function () {
        centerSelector = 6;
        clickEvent = 1;
        console.log('EVENT_06');
        VolOnClick();
    });


    $("#volEventIndex_07").click(function () {
        centerSelector = 7;
        clickEvent = 1;
        console.log('EVENT_07');
        VolOnClick();
    });


    $("#volEventIndex_08").click(function () {
        centerSelector = 8;
        clickEvent = 1;
        console.log('EVENT_08');
        VolOnClick();
    });


    $("#volEventIndex_09").click(function () {
        centerSelector = 9;
        clickEvent = 1;
        console.log('EVENT_09');
        VolOnClick();
    });


    $("#volEventIndex_10").click(function () {
        centerSelector = 10;
        clickEvent = 1;
        console.log('EVENT_10');
        VolOnClick();
    });

    $("#volEventIndex_11").click(function () {
        centerSelector = 11;
        clickEvent = 1;
        console.log('EVENT_11');
        VolOnClick();
    });



    /* RESETS VIEW BACK TO USER  */
    $("#googleAPI").click(function () {
        if (clickEvent === 1) {
            mapObject.setCenter(userLatLng);
            mapObject.setZoom(volStockZoomSetting);
            console.log("MAP CENTER TRIGGERED");
            clickEvent = 0;
            closeAllInfoWindows();
        }

        else {
            console.log("MAP CENTER NOT ARMED");
        }
    });
}

function VolOnClick() {
    console.log(volcanonLatArray[centerSelector], volcanonLngArray[centerSelector]);
    volEventCenter = new google.maps.LatLng(volcanonLatArray[centerSelector], volcanonLngArray[centerSelector]);
    mapObject.setCenter(volEventCenter);
    mapObject.setZoom(volZoomSetting);
    console.log("SET CENTER");
    infowindow[centerSelector].open(mapObject, volcanoMarkerArray[centerSelector]);
    return;
}

function closeAllInfoWindows() {
    console.log("closeAllInfoWindows");
    infowindow[centerSelector].close();
    centerSelector = -1;
    return;
    
}









