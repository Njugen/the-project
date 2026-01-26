const NATS = require('nats');
const { unsubscribe } = require('node:diagnostics_channel');

let NATSCounter = 0;
const hasNATSConnection = true;
let nc = NATS.connect(
    {
        url: process.env.NATS_URL || 'nats://nats:4222'
    }
)
nc.on('error', (err) => {
    console.error("NATS connection error:", err);
    hasNATSConnection = false;
});
const NATSCheck = setInterval(() => {
    if (!hasNATSConnection || NATSCounter > 6) {
        nc.publish = (...args) => { return false }
        nc.subscribe = (...args) => { return false }
        nc.unsubscribe = (...args) => { return false }
        clearInterval(NATSCheck);
    }

    NATSCounter++;
}, 1000);
console.log("NATS URL:", process.env.NATS_URL || 'nats://nats:4222');
nc.subscribe("MAPPER_STATUS", (message) => {
    console.log("The broadcaster has processed and forwarded the message", message);
});

const checkTopic = async (subject) => {

    const ready = await new Promise((resolve, reject) => {
        console.log("BACKEND NAT E")
        if (!nc.subscribe()) reject('NATS not connected')
        const subscription = nc.subscribe(subject, (message) => {
            console.log("BACKEND NAT F")
            if (!message) {
                console.log("BACKEND NAT G")
                reject('No listeners found')
                return
            }
            console.log("BACKEND NAT H")
            resolve("Subscribed successfully")
        })

        console.log("BACKEND NAT I")
        //nc.publish(subject, JSON.stringify({ user: 'system', message: 'ping' }))
    })
    console.log("BACKEND NAT J")
    nc.unsubscribe(ready);
}

const sendDataToNATS = async (subject, message, completed) => {
    console.log("BACKEND NAT A")
    const status = completed ? "COMPLETED" : "NOT COMPLETED"

    try {
        console.log("BACKEND NAT B")
        await checkTopic(subject);
        console.log("BACKEND NAT C")
    } catch (err) {
        console.log("BACKEND NAT D")
        console.error(err);
        return;
    }

    const payload = {
        user: "system",
        message: `${message} (${status})`,
    }
    nc.publish(subject, JSON.stringify(payload));
}

module.exports = {
    sendDataToNATS
};