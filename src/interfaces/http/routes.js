const express = require("express")
const { publishActivity } = require("../../infrastructure/kafka/producer")
module.exports = function buildRouter(queryActivities){
    const router = express.Router()

    router.post("/activities", async (req, res) =>{
        const { userId, action, metadata} = req.body
    if(!userId || !action){
        return res.status(400).json({ error: "userId and action are required"})
    }
    await publishActivity({ userId, action, metadata, timestamp: new Date() })
    res.status(202).json({message: "Event Accepted"})
})
router.get('/activities' , async (req, res) => {
    const result = await queryActivities.execute(req.query)
    res.status(200).json(result)
})

router.get('/health', (req, res) => {
    res.status(200).json({ status: "ok"})
   
})
 return router
}