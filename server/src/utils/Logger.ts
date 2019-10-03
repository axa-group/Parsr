/**
 * Copyright 2019 AXA Group Operations S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as pino from 'pino';

/**
 * Pino wrapper to be able to use commander options easily
 */
/* tslint:disable-next-line:class-name */
class logger {
	public static init(isPrettyLogs: boolean = false): void {
		const options: any = {
			name: 'parsr',
			level: 'info',
		};

		if (isPrettyLogs) {
			options.prettyPrint = {
				colorize: true,
				ignore: 'pid,hostname',
				translateTime: "yyyy-mm-dd'T'HH:MM:ss",
			};
		}

		this.pinoLogger = pino(options);
	}

	public static getPinoLogger(): pino.Logger {
		this.checkInit();
		return this.pinoLogger;
	}

	public static trace(msg: string, ...args: any[]) {
		this.checkInit();
		this.pinoLogger.trace(msg, ...args);
	}

	public static debug(msg: string, ...args: any[]) {
		this.checkInit();
		this.pinoLogger.debug(msg, ...args);
	}

	public static info(msg: string, ...args: any[]) {
		this.checkInit();
		this.pinoLogger.info(msg, ...args);
	}

	public static warn(msg: string, ...args: any[]) {
		this.checkInit();
		this.pinoLogger.warn(msg, ...args);
	}

	public static error(msg: string, ...args: any[]) {
		this.checkInit();
		this.pinoLogger.error(msg, ...args);
	}

	public static fatal(msg: string, ...args: any[]) {
		this.checkInit();
		this.pinoLogger.fatal(msg, ...args);
	}

	public static set level(level) {
		this.checkInit();
		this.pinoLogger.level = level;
	}

	public static get level() {
		this.checkInit();
		return this.pinoLogger.level;
	}

	private static pinoLogger: pino.Logger;

	private static checkInit() {
		if (!this.pinoLogger) {
			this.init(true);
		}
	}
}

export default logger;
