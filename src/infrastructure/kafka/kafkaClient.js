const { Kafka } = require("kafkajs")

module.exports = new Kafka({
    clientId: "activity-service",
    brokers: [process.env.KAFKA_BROKER],
    retry: { retries: 10, initialRetryTime: 3000 }
})