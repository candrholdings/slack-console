# slack-console
Slack integration for browser console

## Background
Integrate Slack into console.log/info/error/warn. So all console log to the browser will be redirected to a specific channel/group on Slack.

## Usage
Include `src/slackconsole.js` into your site or app.

```
SlackConsole.set('token', 'xoxb-...-...');
SlackConsole.set('channel', '#bugme');
SlackConsole.hijack();

console.info('This is "info"');
console.log('This is "log"');
console.warn('This is "warn"');
console.error('This is "error"');
```
