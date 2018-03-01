'use strict';
const   MongoClient = require('mongodb').MongoClient,
		conf = require('../conf.js'),
		Controller = require('./Controller');

class CalendarController extends Controller
{
	static async getMoonPhasesCollection()
	{
		let db = await CalendarController.getDB();
		return db.collection('moonPhases');
	}
	
	static async getLunarData(req, res, next)
	{
		let collection = await CalendarController.getMoonPhasesCollection(),
			query = await collection.find(
				{"year":req.query.year},
				{projection:{"_id":0, year:0, "months":{$elemMatch:{month:req.query.month}}}}
			),
			results = [];
		
		
		while(await query.hasNext())
		{
			let result = await query.next();
			results.push(result.months[0]);
		}
		res.json({
			year:req.query.year,
			month:req.query.month,
			results:results
		});
	}
}

module.exports = CalendarController;