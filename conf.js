module.exports = {
	mongoServerDetails:{
		host:'localhost',
		port:'27017',
		username:'moonphases_dba_user',
		password:'moonphases_dba_password',
		database:'moonPhases',
		collections:{phases:'moonPhases'}
	},
	getMongoServerDetails:function(){
		return 'mongodb://'+
			(this.mongoServerDetails.username?this.mongoServerDetails.username+':'+this.mongoServerDetails.password+'@':'')+
			this.mongoServerDetails.host+':'+
			this.mongoServerDetails.port+'/'+
			this.mongoServerDetails.database;
	},
	version:'0.1b'
}