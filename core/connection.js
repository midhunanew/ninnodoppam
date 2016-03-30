var mongoose = require('mongoose'),
//    autoIncrement = require('mongoose-auto-increment'),
    config = require('config'),
    databaseConf = config.get('DATABASE');


module.exports = {
    connect: function () {
        if(process.env.NODE_ENV === 'production'){
            mongoose.connect('mongodb://' + databaseConf.User +':'+ databaseConf.Password + '@'+ databaseConf.Host + ':' + databaseConf.Port + '/' + databaseConf.Name);
            console.log('connecting to mongodb://' + databaseConf.User +':'+ databaseConf.Password + '@'+ databaseConf.Host + ':' + databaseConf.Port + '/' + databaseConf.Name);
        }
        else{
            mongoose.connect('mongodb://'+ databaseConf.Host + ':' + databaseConf.Port + '/' + databaseConf.Name);
            console.log('connecting to mongodb://' + databaseConf.Host + ':' + databaseConf.Port + '/' + databaseConf.Name);
        }

        var db = mongoose.connection;
        //autoIncrement.initialize(db);
        module.exports.connection = db;

        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function callback() {
            console.log('Mobile App db connection open');
        });
    }
};
