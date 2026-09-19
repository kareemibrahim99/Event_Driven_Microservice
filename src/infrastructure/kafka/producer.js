const kafka = require ('./kafkaClient')

const producer = kafka.producer();
let connected = false

async function publishActivity(event){
    if(!connected){
        await producer.connect()
        connected = true
    }
    await producer.send({
        topic: process.env.KAFKA_TOPIC,
        messages: [{ key: event.userId, value: JSON.stringify(event)}]
    })
}
module.exports = { publishActivity}
