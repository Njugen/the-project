const NATS = require('nats');

const nc = NATS.connect(
    {
        url: process.env.NATS_URL || 'nats://nats:4222'
    }
)

nc.subscribe("MAPPER_STATUS", (message) => {
    console.log("The broadcaster has processed and forwarded the message", message);
});

const checkTopic = async (subject) => {

    const ready = await new Promise((resolve, reject) => {
        const subscription = nc.subscribe(subject, (message) => {
            if (!message) {
                reject('No listeners found')
                return
            }
            resolve("Subscribed successfully")
        })

    })

    nc.unsubscribe(ready);
}

const sendDataToNATS = async (subject, message, completed) => {
    const status = completed ? "COMPLETED" : "NOT COMPLETED"

    try {
        await checkTopic(subject);
    } catch (err) {
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