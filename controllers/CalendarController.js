'use strict';
const   MongoClient = require('mongodb').MongoClient,
		conf = require('../conf.js'),
		Controller = require('./Controller'),
		monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
		
		// get the month's data
		while(await query.hasNext())
		{
			let result = await query.next();
			results.push(result.months[0]);
		}
		
		let response = {
			year:req.query.year,
			month:req.query.month,
			months:results
		};
		
		// get the previous moon
		let monthIndex = monthNames.indexOf(req.query.month);
		let previousMonth = monthNames[((monthIndex - 1) + 12) % 12];
		let previousMonthQuery = await collection.findOne(
			{year:(monthIndex == 0 ? ""+(parseInt(req.query.year) - 1) : req.query.year)},
			{projection:{"_id":0, year:0, "months":{$elemMatch:{month:previousMonth}}}}
		);
		response.previous = previousMonthQuery.months[0].phases.pop();
		
		let nextMonth = monthNames[(monthIndex + 1) % 12];
		let nextMonthQuery = await collection.findOne(
			{year:(monthIndex == 11 ? ""+(parseInt(req.query.year) + 1) : req.query.year)},
			{projection:{"_id":0, year:0, "months":{$elemMatch:{month:nextMonth}}}}
		);
		
		response.next = nextMonthQuery.months[0].phases.shift();
		
		// get the next moon
		
		res.json(response);
	}
}

module.exports = CalendarController;