const Activity = require('../domain/activity/Activity')

class IngestActivity{
    constructor(repository){
        this.repository = repository
    }

    async execute(rawEvent){
        const activity = new Activity (rawEvent)
        await this.repository.save(activity)
    }
}
module.exports = IngestActivity