/* Custom JavaScrypt MDDN352 P3 [2016] MOFFATARAP (300317288) & SCHULTZSTEF (300308218)*/

$(document).ready(function () {
    /**** NAV HIDE AND SHOW PHONE ****/

    /* CLICK VARABLE [SET INITAL NUMBER TO 0]*/
    var clickHC = 0; //Hamburger contain

    /* CLICK BOOL */
    //checks to see if div drop down, has been clicked so its displayed
    //then allows the clearing of that div to hidden

    var clickHamburger = true; //NAV ICON CLICK

    //NAV MAIN HIDE AND SHOW 

    $("#nav .grid_2").click(function () {
    //show nav expand div
        $("#hamburgerContain").removeClass("hidden");
        //$("#hamburgerContain").slideDown(1000); //sets hight and animates

        clickHamburger = false; //sets true to false
        clickHC = clickHC + 1; //adds 1 to var

        //Hide nav expand
        if (clickHC == 2) {
            $("#hamburgerContain").addClass("hidden");
            //$("#hamburgerContain").slideUp(1000); //sets hight and animates
            
            clickHamburger = true; //sets click yes to true
            clickHC = 0; //resets value
        }  

    });   

            $(function () {
            var slideout = $('#eventsList-container');
            $("#nav-discloseSidebar").toggle(function () {
                slideout.animate({
                    right: '0px',
                    
                }, {
                    queue: false,
                    duration: 300
                });
            }, function () {      
                slideout.animate({
                    right: '-400px'
                    
                }, {
                    queue: false,
                    duration: 300
                });
            });
        });
    
    $("#dummyEvent").click(function() {
        $("#detailCard").css("display", "block");
        $("#detail-backgroundDim").css("display", "block");
        $("#dummyEvent").css("background-color", "rgba(0,0,0,0.5)");
    });
    
    $("#detailCard-close").click(function() {
        $("#detailCard").css("display", "none");
        $("#detail-backgroundDim").css("display", "none");
        $("#dummyEvent").css("background-color", "rgba(0,0,0,0)");
    });
    
    $("#nav-info").click(function() {
       $(".infoContainer").css("display", "block");
    });
    
    $("#infoClose").click(function(){
        $(".infoContainer").css("display", "none");
    });
    
    //INFO WINDOW INNARDS
    
    $("#who").click(function(){
        $("#infoWho").css("display", "block");
        $("#infoWhat").css("display", "none");
        $("#infoHow").css("display", "none");
        $("#who").addClass("infoSelected");
        $("#what").removeClass("infoSelected");
        $("#how").removeClass("infoSelected");
    });
    $("#what").click(function(){
        $("#infoWho").css("display", "none");
        $("#infoWhat").css("display", "block");
        $("#infoHow").css("display", "none");
        $("#who").removeClass("infoSelected");
        $("#what").addClass("infoSelected");
        $("#how").removeClass("infoSelected");
    });
    $("#how").click(function(){
        $("#infoWho").css("display", "none");
        $("#infoWhat").css("display", "none");
        $("#infoHow").css("display", "block");
        $("#who").removeClass("infoSelected");
        $("#what").removeClass("infoSelected");
        $("#how").addClass("infoSelected");
    });
    
    var volcanoes = volActiveArray;
    for (var v in volcanoes) {
        var newElement = document.createElement('div');
        newElement.id = cars[c]; newElement.className = "car";
        newElement.innerHTML = cars[c];
        document.body.appendChild(".eventsList");
    }

    //#0 NAV HOME

    $("#navHome").click(function () {
        //show nav expand div
        $("#hamburgerContain").removeClass("hidden");
        //$("#hamburgerContain").slideDown(1000); //sets hight and animates

        clickHamburger = false; //sets true to false
        clickHC = clickHC + 1; //adds 1 to var

        //Hide nav expand
        if (clickHC == 2) {
            $("#hamburgerContain").addClass("hidden");
            //$("#hamburgerContain").slideUp(1000); //sets hight and animates

            clickHamburger = true; //sets click yes to true
            clickHC = 0; //resets value
        }

    });

    //#1 NAV ABOUT

    $("#navAbout").click(function () {
        //show nav expand div
        $("#hamburgerContain").removeClass("hidden");
        //$("#hamburgerContain").slideDown(1000); //sets hight and animates

        clickHamburger = false; //sets true to false
        clickHC = clickHC + 1; //adds 1 to var

        //Hide nav expand
        if (clickHC == 2) {
            $("#hamburgerContain").addClass("hidden");
            //$("#hamburgerContain").slideUp(1000); //sets hight and animates

            clickHamburger = true; //sets click yes to true
            clickHC = 0; //resets value
        }

    });

    //#2 NAV DISASTER

    $("#navDisaster").click(function () {
        //show nav expand div
        $("#hamburgerContain").removeClass("hidden");
        //$("#hamburgerContain").slideDown(1000); //sets hight and animates

        clickHamburger = false; //sets true to false
        clickHC = clickHC + 1; //adds 1 to var

        //Hide nav expand
        if (clickHC == 2) {
            $("#hamburgerContain").addClass("hidden");
            //$("#hamburgerContain").slideUp(1000); //sets hight and animates

            clickHamburger = true; //sets click yes to true
            clickHC = 0; //resets value
        }

    });

    //#3 NAV SYSTEMS

    $("#navSystems").click(function () {
        //show nav expand div
        $("#hamburgerContain").removeClass("hidden");
        //$("#hamburgerContain").slideDown(1000); //sets hight and animates

        clickHamburger = false; //sets true to false
        clickHC = clickHC + 1; //adds 1 to var

        //Hide nav expand
        if (clickHC == 2) {
            $("#hamburgerContain").addClass("hidden");
            //$("#hamburgerContain").slideUp(1000); //sets hight and animates

            clickHamburger = true; //sets click yes to true
            clickHC = 0; //resets value
        }

    });

    //#4 NAV CONCEPT

    $("#navScope").click(function () {
        //show nav expand div
        $("#hamburgerContain").removeClass("hidden");
        //$("#hamburgerContain").slideDown(1000); //sets hight and animates

        clickHamburger = false; //sets true to false
        clickHC = clickHC + 1; //adds 1 to var

        //Hide nav expand
        if (clickHC == 2) {
            $("#hamburgerContain").addClass("hidden");
            //$("#hamburgerContain").slideUp(1000); //sets hight and animates

            clickHamburger = true; //sets click yes to true
            clickHC = 0; //resets value
        }

    });

});




