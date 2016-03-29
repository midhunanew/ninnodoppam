var mongoose = require('mongoose'),
//    autoIncrement = require('mongoose-auto-increment'),
    config = require('config'),
    databaseConf = config.get('DATABASE');


module.exports = {
    connect: function () {
        mongoose.connect('mongodb://' + databaseConf.User +':'+ databaseConf.Password + '@'+ databaseConf.Host + ':' + databaseConf.Port + '/' + databaseConf.Name);
        var db = mongoose.connection;
        //autoIncrement.initialize(db);
        module.exports.connection = db;
        // console.log('connecting to mongodb://' + databaseConf.User +':'+ databaseConf.Password + '@'+ databaseConf.Host + ':' + databaseConf.Port + '/' + databaseConf.Name);
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function callback() {
            console.log('Mobile App db connection open');
        });
    }
};
