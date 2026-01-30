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
    isBusy = true;
    try {

        if (isProduction) {
            await fetch(process.env.MOCKAPIURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            nc.publish('MAPPER_STATUS', JSON.stringify({ user: 'broadcaster', message: 'Message forwarded' }))
        } else {
            const data = JSON.stringify(message);
            console.log(`${data.message}`)
        }
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

