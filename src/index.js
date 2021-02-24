const Guruji = require('./Guruji');
const technical = new Guruji({
    WEBHOOK_URL: '',
    ping: false
});

technical.guruji();