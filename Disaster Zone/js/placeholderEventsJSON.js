/* Placeholder Event JSON Disaster Zone MDDN352 P3 13.6 - [2016] MOFFATARAP (300317288) */
/*=/ VARABLES \=*/
var phEvents = "./json/placeHolderEvents.json"; //var local file of json
var phEventLength = 4; //var sets length of events json
var phAlertLevelText = "Alert "; //alert var
var phContent = document.createElement('div'); //creates vairable that is a div
var phHurrincaneAlertMulti = 10; //sets var for alert radius of hurricane
var phTornadoAlertMulti = 40; //sets var alert radius tornado
/*== ARRAYS ==*/
//Name of event
var phPublicIdArray = [
];

//Time of event
var phOriginTimeArray = [

];
//Depth of event
var phDepthArray = [

];
//intensity of event
var phIntensityArray = [

];
//lat lng location of event
var phLatArray = [

];

var phLngArray = [

];

//location name
var phLocationName = [

];

//marker array
var phMarkerArray = [

];

//Text content array
var phTextContentArray = [
];

var phTextInnerHtmlArray = [
    '<img id="eventIcon" src="./media/img/mapKeys/event/light/fireL.png"> <h4 id="phEventType0"></h4><h6 id="phEventLocation0"></h6><h6 id="phEventRating0"></h6><h6 id="phEventTime0"></h6><div id="gradientL"></div>', //[0]
    '<img id="eventIcon" src="./media/img/mapKeys/event/moderate/floodM.png"> <h4 id="phEventType1"></h4><h6 id="phEventLocation1"></h6><h6 id="phEventRating1"></h6><h6 id="phEventTime1"></h6><div id="gradientL"></div>', //[1]
    '<img id="eventIcon" src="./media/img/mapKeys/event/strong/hurricaneST.png"> <h4 id="phEventType2"></h4><h6 id="phEventLocation2"></h6><h6 id="phEventRating2"></h6><h6 id="phEventTime2"></h6><div id="gradientL"></div>', //[2]
    '<img id="eventIcon" src="./media/img/mapKeys/event/weak/tornadoW.png"> <h4 id="phEventType3"></h4><h6 id="phEventLocation3"></h6><h6 id="phEventRating3"></h6><h6 id="phEventTime3"></h6><div id="gradientL"></div>', //[3]
];

/* 1.1# ==- CSS VARABLE ARRAYS -== */

//EVENT TYPE
var phEventTypeArray = [
    "phEventType0", //[0]
    "phEventType1", //[1]
    "phEventType2", //[2]
    "phEventType3", //[3]
    "phEventType4", //[4]
];

//EVENT LOCATION
var phEventLocationArray = [
    "phEventLocation0", //[0]
    "phEventLocation1", //[1]
    "phEventLocation2", //[2]
    "phEventLocation3", //[3]
    "phEventLocation4", //[4]
];

//EVENT RATING
var phEventRatingArray = [
    "phEventRating0", //[0]
    "phEventRating1", //[1]
    "phEventRating2", //[2]
    "phEventRating3", //[3]
    "phEventRating4", //[4]
];

//EVENT TIME
var phEventTimeArray = [
    "phEventTime0", //[0]
    "phEventTime1", //[1]
    "phEventTime2", //[2]
    "phEventTime3", //[3]
    "phEventTime4", //[4]
];

/* 2.1# ==- CSS VARABLE ARRAYS [END]-== */
/* 1# TEMP FUNCTION 
window.onload = function () {
    phJSON();
};*/

/* 1# TEMP FUNCTION [END]*/

/* 2# PLACEHOLDER FUNCTION */
function phJSON() {
    $.getJSON(phEvents, function (data) {
        $.each(data.properties, function (i, ph) {
            //data id displayed in table row || this one is volcano title
            if (i < phEventLength) {
                phPublicIdArray[i] = ph.publicid;
                //phOriginTimeArray[i] = ph.origintime;
                phDepthArray[i] = ph.depth; //access first element
                phIntensityArray[i] = ph.intensity; //access second element
                phLatArray[i] = ph.coordinates[1]; //access second element
                phLngArray[i] = ph.coordinates[0]; //access first element
                phLocationName[i] = ph.location; //location name
                i++;
            }
            else {
                //doNothing
            }

        });

        /* DEBUGGING 
        console.log("#1");
        console.log(phPublicIdArray);
        console.log("#2");
        //console.log(phOriginTimeArray);
        console.log("#3");
        console.log(phDepthArray);
        console.log("#4");
        console.log(phIntensityArray);
        console.log("#5");
        console.log(phLatArray);
        console.log("#6");
        console.log(phLngArray);
        console.log("#7");
        console.log(phLocationName);*/

        phMarkerCreateLoop(); //calls placeholder marker loop
    });

}
/* 2#  PLACEHOLDER FUNCTION [END]*/
/* 3.2# MARKER ANIMATION*/


/* 3.2# MARKER ANIMATION [END]*/
/* 3# === PLACEHOLDER MARKER LOOP FUNCTION === */
function phMarkerCreateLoop() {

    if (phIntensityArray[0] === "light") {
    phMarkerArray[0] = new google.maps.Marker({
        map: mapObject,
        title: "Light " + phPublicIdArray[0] + " " + phLocationName[0],
        position: { lat: phLatArray[0], lng: phLngArray[0] }, //PAEKAKARIKI
        icon: iconArray[23],
    });

    phMarkerArray[0].setAnimation(google.maps.Animation.DROP);
    
        // circle alert create
    phEventsAlertCircleMarkerArray[0] = new google.maps.Circle({
        map: mapObject,
        radius: alertCirlceRadiusArray[3], // sets alert radius from array 
        fillColor: alertCircleColorArray[3], //sets color of fill from array
        strokeColor: alertCircleColorArray[3], //sets stroke color from array
        strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
    });

    phEventsAlertCircleMarkerArray[0].bindTo('center', phMarkerArray[0], 'position'); //binds circle to location of marker

        /* 1# DISPLAY IN UI */
        //idFunction();
    phTextContentArray[0] = document.createElement('div');
    $(phTextContentArray[0]).addClass("dummyEvent");
    phTextContentArray[0].innerHTML = phTextInnerHtmlArray[0];

    $(".eventsList").prepend(phTextContentArray[0]);
        //earthQIDNameArray[i];

        // 1.0# SET CONTENT
        //SET EVENT TITLE
    document.getElementById(phEventTypeArray[0]).textContent = phPublicIdArray[0];
        //SET EVENT LOCATION
    document.getElementById(phEventLocationArray[0]).textContent = phLocationName[0];
        //SET EVENT HAZARDS
    document.getElementById(phEventRatingArray[0]).textContent = earthAlertLevelText + phIntensityArray[0];
        //SET LAST CHECKED EVENT
    document.getElementById(phEventTimeArray[0]).textContent = date.toUTCString();
        /* 1# DISPLAY IN UI [END] */
    }

    if (phIntensityArray[1] === "moderate") {
        phMarkerArray[1] = new google.maps.Marker({
            map: mapObject,
            title: "Moderate " + phPublicIdArray[1] + " " + phLocationName[1],
            position: { lat: phLatArray[1], lng: phLngArray[1] }, //PAEKAKARIKI
            icon: iconArray[7],
        });

        phMarkerArray[1].setAnimation(google.maps.Animation.DROP);

        // circle alert create
        phEventsAlertCircleMarkerArray[1] = new google.maps.Circle({
            map: mapObject,
            radius: alertCirlceRadiusArray[2], // sets alert radius from array 
            fillColor: alertCircleColorArray[2], //sets color of fill from array
            strokeColor: alertCircleColorArray[2], //sets stroke color from array
            strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
        });

        phEventsAlertCircleMarkerArray[1].bindTo('center', phMarkerArray[1], 'position'); //binds circle to location of marker

        /* 2# DISPLAY IN UI */
        //idFunction();
        phTextContentArray[1] = document.createElement('div');
        $(phTextContentArray[1]).addClass("dummyEvent");
        phTextContentArray[1].innerHTML = phTextInnerHtmlArray[1];

        $(".eventsList").prepend(phTextContentArray[1]);
        //earthQIDNameArray[i];

        // 2.0# SET CONTENT
        //SET EVENT TITLE
        document.getElementById(phEventTypeArray[1]).textContent = phPublicIdArray[1];
        //SET EVENT LOCATION
        document.getElementById(phEventLocationArray[1]).textContent = phLocationName[1];
        //SET EVENT HAZARDS
        document.getElementById(phEventRatingArray[1]).textContent = earthAlertLevelText + phIntensityArray[1];
        //SET LAST CHECKED EVENT
        document.getElementById(phEventTimeArray[1]).textContent = date.toUTCString();
        /* 2# DISPLAY IN UI [END] */
    }

    if (phIntensityArray[2] === "strong") {
        phMarkerArray[2] = new google.maps.Marker({
            map: mapObject,
            title: "Strong " + phPublicIdArray[2] + " " + phLocationName[2],
            position: { lat: phLatArray[2], lng: phLngArray[2] },
            icon: iconArray[11],
        });

        phMarkerArray[2].setAnimation(google.maps.Animation.DROP);

        // circle alert create
        phEventsAlertCircleMarkerArray[2] = new google.maps.Circle({
            map: mapObject,
            radius: alertCirlceRadiusArray[1] * phHurrincaneAlertMulti, // sets alert radius from array 
            fillColor: alertCircleColorArray[1], //sets color of fill from array
            strokeColor: alertCircleColorArray[1], //sets stroke color from array
            strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
        });

        phEventsAlertCircleMarkerArray[2].bindTo('center', phMarkerArray[2], 'position'); //binds circle to location of marker


        /* 3# DISPLAY IN UI */
        //idFunction();
        phTextContentArray[2] = document.createElement('div');
        $(phTextContentArray[2]).addClass("dummyEvent");
        phTextContentArray[2].innerHTML = phTextInnerHtmlArray[2];

        $(".eventsList").prepend(phTextContentArray[2]);
        //earthQIDNameArray[i];

        // 3.0# SET CONTENT
        //SET EVENT TITLE
        document.getElementById(phEventTypeArray[2]).textContent = phPublicIdArray[2];
        //SET EVENT LOCATION
        document.getElementById(phEventLocationArray[2]).textContent = phLocationName[2];
        //SET EVENT HAZARDS
        document.getElementById(phEventRatingArray[2]).textContent = earthAlertLevelText + phIntensityArray[2];
        //SET LAST CHECKED EVENT
        document.getElementById(phEventTimeArray[2]).textContent = date.toUTCString();
        /* 3# DISPLAY IN UI [END] */
    }


    if (phIntensityArray[3] === "weak") {
        phMarkerArray[3] = new google.maps.Marker({
            map: mapObject,
            title: "Weak " + phPublicIdArray[3] + " " + phLocationName[3],
            position: { lat: phLatArray[3], lng: phLngArray[3] },
            icon: iconArray[19],
        });

        phMarkerArray[3].setAnimation(google.maps.Animation.DROP);

        // circle alert create
        phEventsAlertCircleMarkerArray[3] = new google.maps.Circle({
            map: mapObject,
            radius: alertCirlceRadiusArray[4] * phTornadoAlertMulti, // sets alert radius from array 
            fillColor: alertCircleColorArray[4], //sets color of fill from array
            strokeColor: alertCircleColorArray[4], //sets stroke color from array
            strokeWeight: alertCircleStrokeWeight, //sets stroke weight from var
        });

        phEventsAlertCircleMarkerArray[3].bindTo('center', phMarkerArray[3], 'position'); //binds circle to location of marker

        /* 4# DISPLAY IN UI */
        //idFunction();
        phTextContentArray[3] = document.createElement('div');
        $(phTextContentArray[3]).addClass("dummyEvent");
        phTextContentArray[3].innerHTML = phTextInnerHtmlArray[3];

        $(".eventsList").prepend(phTextContentArray[3]);
        //earthQIDNameArray[i];

        // 4.0# SET CONTENT
        //SET EVENT TITLE
        document.getElementById(phEventTypeArray[3]).textContent = phPublicIdArray[3];
        //SET EVENT LOCATION
        document.getElementById(phEventLocationArray[3]).textContent = phLocationName[3];
        //SET EVENT HAZARDS
        document.getElementById(phEventRatingArray[3]).textContent = earthAlertLevelText + phIntensityArray[3];
        //SET LAST CHECKED EVENT
        document.getElementById(phEventTimeArray[3]).textContent = date.toUTCString();
        /* 4# DISPLAY IN UI [END] */
    }
       
}

/* 3# === PLACEHOLDER MARKER LOOP FUNCTION [END] === */

