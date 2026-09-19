class QueryActivities{
    constructor(repository){
        this.repository = repository
    }
    async execute({userId, action, from, to, page = 1, limit = 10} = {}){
        const filter ={}
        if(userId) filter.userId = userId
        if(action) filter.action = action
        if(from || to){
            filter.timestamp = {}
            if(from) filter.timestamp.$gte = new Date(from)
            if(to) filter.timestamp.$lte = new Date(to)
        }
    return this.repository.find(filter, Number(page) || 1, Math.min(Number(limit)|| 10, 100))
    }
}
module.exports = QueryActivities