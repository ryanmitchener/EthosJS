(function() {
    EthosJS.Browser = {};

    // Setup isMobile property
    EthosJS.Browser.isMobile = (/Android|iPad|iPhone|iPod/i).test(navigator.userAgent);



    /**
     * Misc Execution
     * ------------------------------------------------------------------------
     */

    // Set if the browser is mobile or desktop browser
    if (EthosJS.Browser.isMobile) {
        document.body.classList.add("ethos-js--mobile");
    } else {
        document.body.classList.add("ethos-js--desktop");
    }
})();