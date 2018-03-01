const   MongoClient = require('mongodb').MongoClient,
		conf = require('../conf.js');
let dbHoisted = false;

class Controller
{
	static async getDB()
	{
		if(!dbHoisted)
		{
			let client = await MongoClient.connect(conf.getMongoServerDetails());
			this.db = await client.db(conf.mongoServerDetails.database);
			dbHoisted = true;
		}
		return this.db;
	}

}

module.exports = Controller;