let MongoClient = require('mongodb').MongoClient,
	conf = require('../conf.js'),
	data = require('../data/MoonPhases.json');

MongoClient.connect(conf.getMongoServerDetails()).then((client)=>{
	let collection = client.db(conf.mongoServerDetails.database).collection(conf.mongoServerDetails.collections.phases);
	console.log('Hoisted');
	for(let i in data.years)
	{
		console.log(`Adding data for year ${data.years[i].year}`);
		data.years[i]._id = data.years[i].year;
		collection.insertOne(data.years[i]);
	}
	client.close();
	return;
}).catch((error)=>{
	console.log(error);
	return;
});