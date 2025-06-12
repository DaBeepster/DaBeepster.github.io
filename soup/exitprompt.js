window.addEventListener('beforeunload', function (event) {
    // Modern browsers require you to set the returnValue property of the event
    event.preventDefault();
    event.returnValue = ''; // Custom messages are generally ignored by modern browsers
});
