var log4js = require('log4js'),logger;

log4js.configure({
    "appenders": [
        {"type": "console"},
        {
            "category": "alpha",
            "type": "file",
            "filename": "logs/all_alpha.log",
            "maxLogSize": 500480,
            "backups": 10
        },
        {
            "category": "alpha",
            "type": "logLevelFilter",
            "level": "WARN",
            "maxLevel": "WARN",
            "appender": {
                "type": "file",
                "filename": "logs/log_warnings_alpha.log"
            }
        },
        {
            "category": "alpha",
            "type": "logLevelFilter",
            "level": "ERROR",
            "appender": {
                "type": "file",
                "filename": "logs/log_errors_alpha.log"
            }
        },
        {
            "category": "beta",
            "type": "file",
            "filename": "logs/all_beta.log",
            "maxLogSize": 500480,
            "backups": 10
        },
        {
            "category": "beta",
            "type": "logLevelFilter",
            "level": "WARN",
            "maxLevel": "WARN",
            "appender": {
                "type": "file",
                "filename": "logs/log_warnings_beta.log"
            }
        },
        {
            "category": "beta",
            "type": "logLevelFilter",
            "level": "ERROR",
            "appender": {
                "type": "file",
                "filename": "logs/log_errors_beta.log"
            }
        }
    ],
    "levels": {
        "alpha": "TRACE"
    }
});

logger = log4js.getLogger('alpha');
logger.setLevel('TRACE');

logger.info("server restarted");

exports.logger = function () {
    return logger;
};