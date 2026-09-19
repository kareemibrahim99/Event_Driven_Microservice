const kafka = require("./kafkaClient")

async function startConsumer(ingestActivity){
    const consumer = kafka.consumer({ groupId: "activity-processors" })
    await consumer.connect()
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true  })

    await consumer.run({
        eachMessage: async ({ topic, partition, message})=>{
            try{
                const event = JSON.parse(message.value.toString())
                await ingestActivity.execute(event)
                console.log("Processed:", event.userId, event.action)
            } catch(err){
                console.error("Error to process message:", err.message)
            }
        }
    })
}

module.exports = { startConsumer}