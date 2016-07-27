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
})();