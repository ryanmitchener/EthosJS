// Setup isMobile property
EthosJS.isMobile = (/Android|iPad|iPhone|iPod/i).test(navigator.userAgent);

// Misc execution
(function() {
    // Set if the browser is mobile or desktop browser
    if (EthosJS.isMobile) {
        document.body.classList.add("ethos-js--mobile");
    } else {
        document.body.classList.add("ethos-js--desktop");
    }

    // // Set the browser constant
    // var ieTest1 = /Trident\/.*rv:([0-9]{2,2})\.0/.exec(navigator.userAgent);
    // var ieTest2 = /MSIE\s([0-9]{1,2})\.0/.exec(navigator.userAgent);  
    // if ((ieTest1.length > 0 || ieTest2.length > 0) && 
    //         navigator.userAgent.indexOf("opera") === -1) {
    //     EthosJS.browser = {name: "IE", version: 1};
    // } else if () {

    // }
})();