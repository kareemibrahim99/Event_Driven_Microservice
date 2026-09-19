require ("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")

const MongoActivityRepository = require(("./infrastructure/mongo/MongoActivityRepository"))
const IngestActivity =require("./application/IngestActivity")
const QueryActivities = require("./application/QueryActivities")
const { startConsumer } = require("./infrastructure/kafka/consumer")
const buildRouter = require("./interfaces/http/routes")

async function main(){
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    const repository = new MongoActivityRepository()
    const ingestActivity = new IngestActivity(repository)
    const queryActivities = new QueryActivities(repository)

    await startConsumer(ingestActivity)
    console.log("Kafka consumer is running")

    const app = express()
    app.use(express.json())
    app.use("/api", buildRouter(queryActivities))
    app.use((err, req, res, next) => {
        console.error(err)
        res.status(500).json({ error: "Server error" })
    })
    app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`))
}
    main().catch((err) => {
        console.error(err)
        process.exit(1)
    
})
