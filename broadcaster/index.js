const http = require('http');
const NATS = require('nats');

let nc = NATS.connect(
    {
        url: process.env.NATS_URL || 'nats://nats:4222'
    }
)


nc.publish = (...args) => { return false }
nc.subscribe = (...args) => { return false }
nc.unsubscribe = (...args) => { return false }
let isBusy = false;

const forwardToExternalService = async (message) => {
    /*
        message {
            user: string,
            message: string
        }
    */

    console.log("Broadcaster B");
    console.log("Forwarding to external service:", message);

    isBusy = true;
    try {
        await fetch(process.env.MOCKAPIURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        nc.publish('MAPPER_STATUS', JSON.stringify({ user: 'broadcaster', message: 'Message forwarded' }))
    } catch (error) {
        console.error("Error forwarding to external service:", error);
    }
    isBusy = false;
}

nc.subscribe('MAPPER_DATA', { queue: 'mapper.workers' }, async (message) => {
    if (isBusy) return;
    console.log("Broadcaster A");
    const data = JSON.parse(message);
    await forwardToExternalService(data);
});

