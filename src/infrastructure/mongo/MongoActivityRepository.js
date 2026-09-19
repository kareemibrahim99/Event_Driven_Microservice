const ActivityRepository = require ('../../domain/activity/ActivityRepository')
const ActivityModel = require ('./ActivityModel')

class MongoRepository extends ActivityRepository{
    async save(activity){
        await ActivityModel.create(activity)
    }

    async find(filter, page, limit){
        const [data, total] = await Promise.all([
            ActivityModel.find(filter)
            .sort({timestamp: -1})
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
            ActivityModel.countDocuments(filter)
        ])
        return { data, page, limit, total, totalPages: Math.ceil(total / limit) }
    }
}

module.exports = MongoRepository