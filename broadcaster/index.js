const http = require('http');
const NATS = require('nats');

const nc = NATS.connect(
    {
        url: process.env.NATS_URL || 'nats://nats:4222'
    }
)

let isBusy = false;
const isProduction = process.env.DEPENV === 'production';
const forwardToExternalService = async (message) => {
    console.log("e")
    isBusy = true;
    console.log("f")
    try {
        console.log("g")
        if (isProduction) {
            console.log("h")
            await fetch(process.env.MOCKAPIURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            console.log("i")
            nc.publish('MAPPER_STATUS', JSON.stringify({ user: 'broadcaster', message: 'Message forwarded' }))
        } else {
            console.log("j")
            console.log(`\n`)
            console.log(`From ${message.user}:\n`)
            console.log(`${message.message}\n`)
            console.log(`\n`)
        }
    } catch (error) {
        console.log("k")
        console.error("Error forwarding to external service:", error);
    }
    isBusy = false;
}

nc.subscribe('MAPPER_DATA', { queue: 'mapper.workers' }, async (message) => {
    console.log("a")
    if (isBusy) return;
    console.log("b")
    const data = JSON.parse(message);
    console.log("c", data)
    await forwardToExternalService(data);
});

