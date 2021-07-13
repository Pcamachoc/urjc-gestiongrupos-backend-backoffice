## Log.js+color

    Log.js+color is fork of Log.js.

## Installation

    $ npm install log-color

## Example

See to [Log.js](https://github.com/visionmedia/log.js/).
Can be using similar.

Code snipet:

    var Log = require('log')
      , log = new Log('info');

    log.info('SEND MAIL: send message to the hoge@example.com');


### Color setting

Color setting:

    var Log = require('log-color')
      , log = new Log({ level: 'debug', color: true });

    log.warning('SEND MAIL: do not send message to the hoge@example.com');


## Log level

Log level:

    log.alert('alert');
    log.critical('critical');
    log.error('error');
    log.warning('warning');
    log.notice('notice');
    log.info('info');
    log.debug('debug'); 

## License 

(The MIT License) 

Copyright (c) 2013 Keiji Matuzaki futoase@gmail.com
