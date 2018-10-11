/* Geonet Earthquake API Disaster Zone MDDN352 P3 13.1 - [2016] MOFFATARAP (300317288) */
/*=/ VARABLES \=*/
var geonetEarthQuake = "https://api.geonet.org.nz/quakes/services/felt.json"; //saves goenet url as var
var geonetEarthQuakeLocal = "./json/geoNetEarthquakeVal.json" //loads local JSON for testing only works if you open the INDEX not hosted on a local IP
var earthQEventLength = 10; //sets earthquake array max events
var earthQRadiusMulti = 4; //sets earthquake alert radius to be multiplyed by
var earthQRadiusDivide = 2; //sets earthquake alert radius division
var earthUIVar = "Earthquake"; //sets earthquake title for UI
var earthAlertLevelText = "Alert "; //alert level var
var earthTextContent = document.createElement('div'); //creates vairable that is a div
var earthQMag = ", Magnitude "; //var for displaying the magatuide of event
var twoDP = 10; //var for rounding to 2 decimal places
var earthQLightLoop = 0; //var for looping of light earthquakes
var earthQMagnitudeRound = 0;
var earthQDateFormat = 0;
var earthQuakeDateUTC = 0;

//https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse


/*== ARRAYS ==*/

/* 1# EARTHQUAKE VARABLE ARRAYS */
//Earthquake Intensity || Light,Weak,Moderate,Strong,Severe
var earthQIntensityArray = [
];

//Earthquake Magitude || holds magnatude of the quakes
var earthQMagnitudeArray = [
];

//Earthquake coordinates || LAT LNG
var earthQLatArray = [
];

var earthQLngArray = [
];

//Earthquake ID
var earthQIDNameArray = [
];

//Earthquake Depth 
var earthQDepthArray = [
];

//Earthquake Time
var earthQTimeArray = [
];

//Text content array
var earthQTextContentArray = [
];


//TEXT ARRAY
var earthQTextInnerHtmlArray = [
    //[0] LEVEL 0 NO ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/key/earthquake.svg"> <h4 id="eventType0"></h4><h6 id="eventLocation0"></h6><h6 id="eventRating0"></h6><h6 id="eventTime0"></h6><div id="gradientL"></div>',             //[0]
    //[1] LEVEL 1 WEAK ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/weak/earthquakeW.svg"> <h4 id="eventType1"></h4><h6 id="eventLocation1"></h6><h6 id="eventRating1"></h6><h6 id="eventTime1"></h6><div id="gradientL"></div>',     //[1]
    //[2] LEVEL 2 LIGHT ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/light/earthquakeL.svg"> <h4 id="eventType2"></h4><h6 id="eventLocation2"></h6><h6 id="eventRating2"></h6><h6 id="eventTime2"></h6><div id="gradientL"></div>',    //[2]
    //[3] LEVEL 3 MODERATE ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/moderate/earthquakeM.svg"> <h4 id="eventType3"></h4><h6 id="eventLocation3"></h6><h6 id="eventRating3"></h6><h6 id="eventTime3"></h6><div id="gradientL"></div>', //[3]
    //[4] LEVEL 4 STRONG ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/strong/earthquakeST.svg"> <h4 id="eventType4"></h4><h6 id="eventLocation4"></h6><h6 id="eventRating4"></h6><h6 id="eventTime4"></h6><div id="gradientL"></div>',  //[4]
    //[5] LEVEL 5 SEVERE ALERT
    '<img id="eventIcon" src="./media/img/mapKeys/event/severe/earthquakeS.svg"> <h4 id="eventType5"></h4><h6 id="eventLocation5"></h6><h6 id="eventRating5"></h6><h6 id="eventTime5"></h6><div id="gradientL"></div>',   //[4]
];

/* EARTH ALERT MARKET CREATE VAR */
var alertEarthQuakesArray = []; //holds current volcaons on alert
var alertEarthQIndex = 0; //sets alertvol array indext to zero for sorting
var earthQSelectedIcon = 0; //sets icon to be used for each event
var earthQSelectedCircle = 0; // sets the color of circle to be used and the radius
var earthQCount = 0;


//EARTHQUAKE TITLE CASE ARRAY 
var earthQTitleArray = {
};

/* NEW CSS */

//EVENT TYPE
var earthQEventTypeArray = [
    "eventType0", //[0]
    "eventType1", //[1]
    "eventType2", //[2]
    "eventType3", //[3]
    "eventType4", //[4]
    "eventType5", //[5]
];

//EVENT LOCATION
var earthQEventLocationArray = [
    "eventLocation0", //[0]
    "eventLocation1", //[1]
    "eventLocation2", //[2]
    "eventLocation3", //[3]
    "eventLocation4", //[4]
    "eventLocation5", //[5]
];


//EVENT RATING
var earthQEventRatingArray = [
    "eventRating0", //[0]
    "eventRating1", //[1]
    "eventRating2", //[2]
    "eventRating3", //[3]
    "eventRating4", //[4]
    "eventRating5", //[5]
];

//EVENT TIME
var eathQEventTimeArray = [
    "eventTime0", //[0]
    "eventTime1", //[1]
    "eventTime2", //[2]
    "eventTime3", //[3]
    "eventTime4", //[4]
    "eventTime5", //[5]
];

//EVENT RATING ID ARRAY
var earthQEventAlertIdArray = [
    "earthQEventIndex_00",
    "earthQEventIndex_01",
    "earthQEventIndex_02",
    "earthQEventIndex_03",
    "earthQEventIndex_04",
    "earthQEventIndex_05",
    "earthQEventIndex_06",
    "earthQEventIndex_07",
    "earthQEventIndex_08",
    "earthQEventIndex_09",
    "earthQEventIndex_10",
    "earthQEventIndex_11",
]

//EVENT TIME
var earthQEventTimeArray = [
    "eventTime0", //[0]
    "eventTime1", //[1]
    "eventTime2", //[2]
    "eventTime3", //[3]
    "eventTime4", //[4]
    "eventTime5", //[5]
];

//EVENT RAINING CLASS
var earthQEventAlertClassArray = [
    "earthQEvent Alert_00",  //[0]
    "earthQEvent Alert_01",  //[1]
    "earthQEvent Alert_02",  //[2]
    "earthQEvent Alert_03",  //[3]
    "earthQEvent Alert_04",  //[4]
    "earthQEvent Alert_05",  //[5]
];


/* 2.1# ==- CSS VARABLE ARRAYS [END]-== */

/* 2# EARTHQUAKE FUNCTION */
// earthJSON is called as a function in geolocationAPI under geoRefresh
function earthJSON() {
    $.getJSON(geonetEarthQuake, function (data) {
        $.each(data.features, function (i, eq) {
            //data id displayed in table row || this one is earthquake title
            if (i < earthQEventLength) {
                earthQIntensityArray[i] = eq.properties.intensity.toTitleCase();
                earthQMagnitudeArray[i] = eq.properties.magnitude;
                earthQLatArray[i] = eq.geometry.coordinates[1]; //access first element
                earthQLngArray[i] = eq.geometry.coordinates[0]; //access second element
                earthQDepthArray[i] = eq.properties.depth;
                earthQTimeArray[i] = eq.properties.origintime;
                earthQIDNameArray[i] = eq.id.toTitleCase();
                i++;
            }
            else {
                
            }

        });

        EarthQSortLoop(); //calls earthquake marker loop
        
    });

}
/* 2# EARTHQUAKE FUNCTION [END]*/


/* NEW EARTHQUAKE FUNCTION */

/* #1 SORTS EARTHQUAKES */
var earthQEventRaitingArray = [];
function EarthQSortLoop() {

    for (i = 0; i < earthQEventLength; i++) {

        //#1 Setting Up Varables
        earthQMagnitudeRound = Math.round(earthQMagnitudeArray[i] * twoDP) / twoDP; //rounds to two decimal palces
        earthQTitleArray[i] = earthQIntensityArray[i] + '.' + earthQIDNameArray[i];

        EarthQDateTime(); //run EarthQ time and date
        
        //#2 Change Intencitys from strings to numbers to allow for icon applying correctly
        if (earthQIntensityArray[i] === "Weak") {
            earthQEventRaitingArray.push(1);
            EarthQMakeIcons();
        }

        if (earthQIntensityArray[i] === "Light") {
            earthQEventRaitingArray.push(2);
            EarthQMakeIcons();
        }

        if (earthQIntensityArray[i] === "Moderate") {
            earthQEventRaitingArray.push(3);
            EarthQMakeIcons();
        }

        if (earthQIntensityArray[i] === "Strong") {
            earthQEventRaitingArray.push(4);
            EarthQMakeIcons();
        }

        if (earthQIntensityArray[i] === "Severe") {
            earthQEventRaitingArray.push(5);
            EarthQMakeIcons();
        }
    }

    EarthQJumpToEvent();
}

/* #2 Earthquake Time Formatting */
function EarthQDateTime() {
    var earthQTimeFormat = earthQTimeArray[i]; //for formatting earthquake event time based off json
    var dateFromat = /(\d{2})\.(\d{2})\.(\d{4})/; //wanted date format
    earthQDateFormat = new Date(earthQTimeFormat.replace(dateFromat, '$3-$2-$1'));
    return;
}

/* #2 Earthquake Time Formatting [END]*/
var earthQInfowindow = [];
var earthQAddressCode = '';

/* #3 MAKES Earthquake ICONS */
function EarthQMakeIcons() {
    /*# 1.0 REVERSE GEODECODES */
    
    /* # 1.1 SETS ICON DEPENDING ON LEVEL ON ARRAY INDEX */
    earthQSelectedIcon = earthQEventRaitingArray[i];
    earthQSelectedCircle = earthQEventRaitingArray[i];
    

    /* #1.2 CREATE GOOGLE MAPS MARKER */
    earthquakeMarkerArray[i] = new google.maps.Marker({
        map: mapObject,
        title: earthQTitleArray[i],
        position: { lat: earthQLatArray[i], lng: earthQLngArray[i] },
        icon: iconEarthQArray[earthQSelectedIcon],
    });

    /* MAKE INFO WINDOWS   */

    earthQInfowindow[i] = new google.maps.InfoWindow({
        content: earthQIDNameArray[i] + '</br> ' + earthAlertLevelText + earthQIntensityArray[i] + earthQMag + earthQMagnitudeRound + "<br> " + earthQuakeDateUTC,
    });

    earthquakeMarkerArray[i].addListener('click', function () {
        earthQInfowindow[i].open(mapObject, earthquakeMarkerArray[i]); //alows marker to have listner for info window click
    });

    /* #1.3 CREATE ALERT CIRCLE */
    earthQAlertCircleMarkerArray[i] = new google.maps.Circle({
        map: mapObject,
        radius: alertCirlceRadiusArray[earthQSelectedCircle] * earthQRadiusMulti, // sets alert radius from array 
        fillColor: alertCircleColorArray[earthQSelectedCircle], //sets color of fill from array
        strokeColor: alertCircleColorArray[earthQSelectedCircle], //sets stroke color from array
        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
    });

    bindCircleEq();

    /* 2.1# DISPLAY IN UI */
    //idFunction();
    earthQTextContentArray[i] = document.createElement('div');
    $(earthQTextContentArray[i]).addClass(earthQEventAlertClassArray[earthQSelectedIcon]); //sets div classes depending on alert level
    //ADD ID's
    $(earthQTextContentArray[i]).attr("id", earthQEventAlertIdArray[i]); //ads id selector based on array
    earthQTextContentArray[i].innerHTML = earthQTextInnerHtmlArray[earthQSelectedIcon]; //uses the value from earthquake level

    $(".eventsList").prepend(earthQTextContentArray[i]);


    /* 2.1# SET CONTENT UI */
    //SET EVENT TITLE
    document.getElementById(earthQEventTypeArray[earthQSelectedIcon]).textContent = earthUIVar;
    //SET EVENT LOCATION
    document.getElementById(earthQEventLocationArray[earthQSelectedIcon]).textContent = earthQIDNameArray[i];
    //SET EVENT HAZARDS
    document.getElementById(earthQEventRatingArray[earthQSelectedIcon]).textContent = earthAlertLevelText + earthQIntensityArray[i] + earthQMag + earthQMagnitudeRound;
    //SET LAST CHECKED EVENT
    earthQuakeDateUTC = earthQDateFormat.toUTCString();
    document.getElementById(earthQEventTimeArray[earthQSelectedIcon]).textContent = earthQuakeDateUTC;
    return;
}



/*3# THIS FUNCTION BINDS A CIRCLE TO DISPLAY RADIUS TO GOOGLE MAP MARKERS */
function bindCircleEq() {
    earthQAlertCircleMarkerArray[i].bindTo('center', earthquakeMarkerArray[i], 'position'); //binds circle to location of marker
    markerAnimaton();
    return; //finish function and return to previous task
}


/* 3.2# MARKER ANIMATION*/
function markerAnimaton() {
    earthquakeMarkerArray[i].setAnimation(google.maps.Animation.DROP);
    return; //finish function and return to previous task
}

var geoReverse = 0;
var reverseGeocodeAddressArray = [];

/* 3.3# Reverse Geocoding */
function earthQAddress(earthQLatLng) { 

    geocoder = new google.maps.Geocoder();
    earthQLatLng = new google.maps.LatLng(earthQLatArray[i], earthQLngArray[i]); //takes current lat lng of event to be reverse geocoded
    geocoder.geocode({
        "location": earthQLatLng
    },
        function (results, status) {

            //IF GEODECODE IS SUCCESSFUL
            if (status === google.maps.GeocoderStatus.OK) {
            

                geoReverse = results[2].formatted_address; //PRINT OUT ADDRESS

                if (results[2] == null) {
                    geoReverse = results[1].formatted_address;
                }

                if (geoReverse[1] == null) {
                    geoTest = results[0].formatted_address;
                }
                reverseGeocodeAddressArray.push(geoReverse); //push addresses to array
                return;
            }


            //IF CANT FIND GEODECODE ADDRESS 
            else
           reverseGeocodeAddressArray.push(0); //save null to array
           
        });
    return;
}



/* EarthQJumpToEvent VARABLES */
var earthQCenterSelector = 0; //sets the center to zoom on to eg earthquake event
    var earthQZoomSetting = 9; //sets zoom level for zooming in on event
    var earthQStockZoomSetting = 6; //sets the zoom level on the map
    var earthQEventCenter = 0; //sets the earth center
    var earthQClickEvent = 0; //sets var to test if map has been clicked on

    /*4# JUMP TO MAP */
    function EarthQJumpToEvent() {
        $("#earthQEventIndex_00").click(function () {
            earthQCenterSelector = 0;
            earthQClickEvent = 1;
            EarthQOnClick();
        });


        $("#earthQEventIndex_01").click(function () {
            earthQCenterSelector = 1;
            earthQClickEvent = 1;
            EarthQOnClick();
        });

        $("#earthQEventIndex_02").click(function () {
            earthQCenterSelector = 2;
            earthQClickEvent = 1;
            EarthQOnClick();
        });

        $("#earthQEventIndex_03").click(function () {
            earthQCenterSelector = 3;
            earthQClickEvent = 1;
            EarthQOnClick();
        });

        $("#earthQEventIndex_04").click(function () {
            earthQCenterSelector = 4;
            earthQClickEvent = 1;
            EarthQOnClick();
        });

        $("#earthQEventIndex_05").click(function () {
            earthQCenterSelector = 5;
            earthQClickEvent = 1;
            EarthQOnClick();
        });


        $("#earthQEventIndex_06").click(function () {
            earthQCenterSelector = 6;
            earthQClickEvent = 1;
            EarthQOnClick();
        });


        $("#earthQEventIndex_07").click(function () {
            earthQCenterSelector = 7;
            earthQClickEvent = 1;
            EarthQOnClick();
        });


        $("#earthQEventIndex_08").click(function () {
            earthQCenterSelector = 8;
            earthQClickEvent = 1;
            EarthQOnClick();
        });


        $("#earthQEventIndex_09").click(function () {
            earthQCenterSelector = 9;
            earthQClickEvent = 1;
            EarthQOnClick();
        });


        $("#earthQEventIndex_10").click(function () {
            earthQCenterSelector = 10;
            earthQClickEvent = 1;
            EarthQOnClick();
        });

        $("#earthQEventIndex_11").click(function () {
            earthQCenterSelector = 11;
            earthQClickEvent = 1;
            EarthQOnClick();
        });



        /* RESETS VIEW BACK TO USER  */
        $("#googleAPI").click(function () {
            if (earthQClickEvent === 1) {
                mapObject.setCenter(userLatLng);
                mapObject.setZoom(volStockZoomSetting);
                earthQClickEvent = 0;
                EarthQCloseAllInfoWindows();
            }

            else {
                
            }
        });
    }

    function EarthQOnClick() {
        earthQEventCenter = new google.maps.LatLng(earthQLatArray[earthQCenterSelector], earthQLngArray[earthQCenterSelector]);
        mapObject.setCenter(earthQEventCenter);
        mapObject.setZoom(earthQZoomSetting);
        earthQInfowindow[earthQCenterSelector].open(mapObject, earthquakeMarkerArray[earthQCenterSelector]);
        return;
    }

    /* CLOSES OPEN INFO WINDOWS */
    function EarthQCloseAllInfoWindows() {
        earthQInfowindow[earthQCenterSelector].close();
        //earthQInfowindow.length.close();
        earthQCenterSelector = -1;
        return;

    }



