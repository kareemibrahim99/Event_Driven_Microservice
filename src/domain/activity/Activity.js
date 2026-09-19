class Activity{
    constructor({userId, action , metadata = {}, timestamp = new Date()}) {
        if (!userId || !action) {
            throw new Error('userId and action are required');
        }
        this.userId = userId
        this.action = action
        this.metadata = metadata
        this.timestamp = new Date(timestamp)
    }
}
module.exports = Activity