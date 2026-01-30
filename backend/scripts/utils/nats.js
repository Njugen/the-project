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
    console.log("A")
    const ready = await new Promise((resolve, reject) => {
        console.log("B")
        const subscription = nc.subscribe(subject, (message) => {
            console.log("C")
            if (!message) {
                reject('No listeners found')
                return
            }
            console.log("D")
            resolve("Subscribed successfully")
            console.log("E")
        })
        console.log("F")
        resolve("Failed to check subscription");
        console.log("G")
    })
}

const sendDataToNATS = async (subject, message, completed) => {
    const status = completed ? "COMPLETED" : "NOT COMPLETED"
    console.log("a")
    try {
        console.log("b")
        await checkTopic(subject);
        console.log("c")
    } catch (err) {
        console.log("d")
        console.error(err);
        return;
    }
    console.log("e")
    const payload = {
        user: "system",
        message: `${message} (${status})`,
    }
    console.log("f")
    nc.publish(subject, JSON.stringify(payload));
}

module.exports = {
    sendDataToNATS
};