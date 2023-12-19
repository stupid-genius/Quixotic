const config = require('./config');
const {createLogger, format, transports, Transport} = require('winston');

const {align, colorize, combine, label, metadata, printf, timestamp} = format;

function Logger(fileName, customMetadata = {}){
	if (fileName === undefined) {
		throw new Error('Logger requires the file name of where it\'s being used.');
	}
	if(!(this instanceof Logger)){
		return new Logger(fileName);
	}

	if(Logger.instance === undefined){
		const types = {};
		const stdFormat = combine(
			// metadata(),
			// metadata({ fillWith: ['fileName'].concat(Object.keys(customMetadata)) }),
			metadata({ fillWith: Object.keys(customMetadata) }),
			timestamp({format: 'YY-M-D hh:mm:ss:SSS'}),
			// label({label: }),
			colorize(),
			align(),
			printf(info => `${info.timestamp} [${info.fileName}] ${info.level}: ${info.message}`)
		);
		Object.defineProperties(Logger, {
			addTransport: {
				value: (name, newTransport) => {
					if (newTransport instanceof Transport && types[name] === undefined) {
						Object.defineProperty(types, name, {
							configurable: true,
							enumerable: true,
							value: () => newTransport
						});
					}
					Logger.instance.add(types[name]());
				}
			},
			instance: {
				value: createLogger({
					level: config.logLevel,
					transports: [new transports.File({
						filename: config.logFile,
						format: stdFormat,
						maxsize: '5242880',
						zippedArchive: true
					}), new transports.Console({
						format: stdFormat
					})]
				})
			},
			removeTransport: {
				value: (transportToRemove) => {
					if (typeof transportToRemove === 'string') {
						Logger.instance.remove(types[transportToRemove]());
						delete types[transportToRemove];
					} else {
						Logger.instance.remove(transportToRemove);
						// TODO: find and delete when no name given
					}
				}
			},
			transportTypes: {
				get: () => types
			}
		});
	}

	const logger = Logger.instance.child({
		fileName,
		...customMetadata
	});
	Object.defineProperties(logger, {
		getLogLevel: {
			value: () => logger.level
		},
		setLogLevel: {
			value: (newLevel) => {
				logger.level = newLevel;
			}
		}
	});
	return logger;
}

module.exports = Logger;
