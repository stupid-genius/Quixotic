/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-arrow-callback */
const chai = require('chai');
const path = require('path');
const { PassThrough } = require('stream');
const { transports } = require('winston');
const Logger = require('../../dist/server/logger');

/* eslint-disable-next-line no-unused-vars */
const should = chai.should();
const { Stream } = transports;

const localLogger = new Logger(path.basename(__filename));

function attachToLogger() {
	const logpipe = new PassThrough({
		objectMode: true
	});

	function dataReady() {
		return new Promise((resolve, reject) => {
			if (logpipe.readable) {
				resolve();
				return;
			}
			logpipe.on('readable', () => {
				resolve();
			});
			logpipe.on('error', (msg) => {
				localLogger.error(`Error in logpipe: ${msg}`);
				reject();
			});
		});
	}

	const newTransport = new Stream({
		eol: '\n',
		format: null,
		stream: logpipe
	});
	Logger.addTransport('tee', newTransport);

	return {
		// this will wait until a log is written
		pop: async () => {
			await dataReady();
			return logpipe.read();
		},
		detach: () => Logger.removeTransport('tee')
	};
}

describe('Logger Unit Tests', async function () {
	beforeEach(function () {
		this.UUT = new Logger(path.basename(__filename));
	});

	it('Should be properly constructed', function () {
		this.UUT.constructor.name.should.equal('DerivedLogger');
		this.UUT.should.have.property('getLogLevel');
		this.UUT.should.have.property('setLogLevel');
		this.UUT.getLogLevel().should.equal('debug');
		const defaultTransport = this.UUT.transports;
		defaultTransport.should.have.length(2);
	});

	it('Can dynamically add a transport', async function () {
		const defaultTransport = this.UUT.transports;
		defaultTransport.should.have.length(2);
		(defaultTransport[0] instanceof transports.File).should.be.true;

		const newTransport = new Stream({
			stream: new PassThrough(),
			level: 'silly'
		});
		Logger.addTransport('test', newTransport);

		const updatedTransports = this.UUT.transports;
		updatedTransports.should.have.length(3);
		updatedTransports[2].should.equal(newTransport);

		Logger.removeTransport('test');

		const originalTransports = this.UUT.transports;
		originalTransports.should.have.length(2);
		(originalTransports[0] instanceof transports.File).should.be.true;
	});

	it('Can dynamically change log level', async function () {
		this.UUT.getLogLevel().should.equal('debug');
		this.UUT.setLogLevel('info');
		this.UUT.getLogLevel().should.equal('info');
	});

	it('Should be able to test the logging output', async function () {
		const logs = attachToLogger();

		const expectedLvl = 'info';
		const expectedMsg = 'This is an info log message';
		const expectedLvl2 = 'error';
		const expectedMsg2 = 'This is an error log message';

		this.UUT.log(expectedLvl, expectedMsg);
		this.UUT.log(expectedLvl2, expectedMsg2);

		let log;
		log = await logs.pop();
		log.message.should.equal(expectedMsg);
		log.level.should.equal(expectedLvl);

		log = await logs.pop();
		log.message.should.equal(expectedMsg2);
		log.level.should.equal(expectedLvl2);

		logs.detach();
	});

	it('Shows metadata when present', async function () {
		const logs = attachToLogger();
		this.UUT.info('This logged with filename metadata');
		const log = await logs.pop();
		log.should.have.property('fileName');
		log.fileName.should.equal(path.basename(__filename));
		logs.detach();
	});
});
