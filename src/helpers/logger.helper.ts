import winston from 'winston';

let _logger: winston.Logger | undefined;

const dateFormat = () => {
  return new Date(Date.now()).toUTCString();
};

const createLogger = (): winston.Logger => {
  return winston.createLogger({
    level: 'info',
    format: winston.format.printf((info) => {
      const color = _getColorCode(info.level);
      return `${_cyan} ${dateFormat()} ${color}| ${info.level.toUpperCase()} | ${_reset}${
        info.message
      }`;
    }),
    transports: [new winston.transports.Console()],
  });
};

const _getColorCode = (level: string) => {
  switch (level) {
    case 'info':
      return _green;
    case 'warn':
      return _yellow;
    case 'error':
      return _red;
    case 'debug':
      return _cyan;
    default:
      return _reset;
  }
};

const _red = '\x1b[31m';
const _yellow = '\x1b[33m';
const _green = '\x1b[32m';
const _cyan = '\x1b[36m';
const _reset = '\x1b[0m';

const logger = (): winston.Logger => {
  if (!_logger) {
    _logger = createLogger();
  }

  return _logger;
};

export default logger();
