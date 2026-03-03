const mineflayer = require('mineflayer');
const { CoreClass } = require('./util/core.js');
const { selfcare } = require('./util/selfcare');
const { Tellraw, Text } = require("./util/tellrawBuilder.js");
const readline = require('readline');

class MinecraftBot {
    constructor() {
        this.prefix = '!';
        this.commands = new Map();
        this.bot = null;
        this.cloopIntv = null;
        this.reconnectTimeout = null;
        this.setupBot();
        this.setupConsoleInput();
    }

    generateRandom(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => 
            characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');
    }

    setupBot() {
        if (this.bot) {
            console.log("A bot instance is already running. Avoiding duplicate setup.");
            return;
        }
        
        this.bot = mineflayer.createBot({
            host: 'kaboom.pw',
            username: `${this.generateRandom(3)}_ibot_${this.generateRandom(3)}`,
            version: '1.19.1',
            auth: 'offline',
            physicsEnabled: false
        });

        this.setupEventHandlers();
        this.registerCommands();
        this.generateInitialHashes();
    }

    generateInitialHashes() {
        this.bot.trustedHash = this.generateRandom(Math.floor(Math.random() * (15 - 10) + 10));
        this.bot.ownerHash = this.generateRandom(Math.floor(Math.random() * (25 - 20) + 20));
        
        console.log('\x1b[107m\x1b[30m=== Initial Hashes Generated ===');
        console.log(`Trusted Hash: ${this.bot.trustedHash}`);
        console.log(`Owner Hash: ${this.bot.ownerHash}\x1b[0m`);
    }

    generateNewHash(hashType) {
        if (hashType === 'trusted') {
            this.bot.trustedHash = this.generateRandom(Math.floor(Math.random() * (15 - 10) + 10));
            console.log('\x1b[107m\x1b[30m=== New Trusted Hash Generated ===');
            console.log(`Trusted Hash: ${this.bot.trustedHash}\x1b[0m`);
        } else if (hashType === 'owner') {
            this.bot.ownerHash = this.generateRandom(Math.floor(Math.random() * (25 - 20) + 20));
            console.log('\x1b[107m\x1b[30m=== New Owner Hash Generated ===');
            console.log(`Owner Hash: ${this.bot.ownerHash}\x1b[0m`);
        }
    }

    setupEventHandlers() {
        this.bot._client.on('login', () => this.handleLogin());
        this.bot._client.on('login', async(packet) => {
            this.bot.EntityId = packet.entityId;
          });
        this.bot.on('messagestr', (message, username) => this.handleMessage(message, username));
        this.bot.on('error', (err) => console.error('Error:', err));
        
        this.bot.on('kicked', (reason) => {
            console.log('Bot was kicked from the server:', reason);
            this.reconnect();
        });

        this.bot.on('end', () => {
            console.log('Bot disconnected. Reconnecting in 0.1 seconds...');
            this.reconnect();
        });

        this.bot.on('message', (jsonMsg) => console.log(`Server Message: ${jsonMsg.toString()}`));
    }

    handleLogin() {
        console.log('Bot successfully logged in.');
        
        setTimeout(() => {
            this.bot.chat('');
            this.bot.chat('do !refill so bot will work');
            this.bot.chat('');
            this.bot.chat('');
            this.bot.chat('');
            this.bot.pos = this.bot.entity.position;
            this.bot.core = new CoreClass(this.bot);
            this.bot.core.refill()
            this.bot.core.run(`/vanish ${this.bot.username} enable`)
            selfcare(this.bot);

            setTimeout(() => {
                const readyMessage = new Tellraw()
                .add(new Text("Ibot Core").color("red"));
                this.bot.core.fancyTellraw(readyMessage.get());

                setTimeout(() => {
                    this.bot.chat('/v');
                    this.bot.chat('/c');
                    this.bot.chat('/gmc');
                    this.bot.chat('/gmc');
                    this.bot.chat('/minecraft:op @s[type=player]');
                    this.bot.chat('/minecraft:op @s[type=player]');
                    this.bot.chat('/minecraft:op @s[type=player]');
                    this.bot.chat('/gmc');
                    this.bot.chat('/minecraft:op @s[type=player]');
                }, 200);
            }, 500);
        }, 1000);
    }

    reconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        this.reconnectTimeout = setTimeout(() => {
            this.bot = null;
            this.setupBot();
        }, 5000);
    }

    registerCommands() {
        this.commands.set('echo', (args) => {
            this.bot.chat(args.join(" "));
        });

        this.commands.set('help', () => {
            const helpMessage = new Tellraw()
            .add(new Text("Commands:(10) [White:Public Green:Trusted Red:Owner §f] \n").color("white"))
            .add(new Text("!crash ").color("white"))//did
            .add(new Text("!help1 (command) ").color("white"))//did
            .add(new Text("!credits ").color("white"))//did 
            .add(new Text("!bossbar ").color("white"))//did
            .add(new Text("!bossbar2 ").color("white"))//did  
            .add(new Text("!echo ").color("white"))//did
            .add(new Text("!prefix ").color("white"))//did // look this
            .add(new Text("!auth ").color("red"))//did
            .add(new Text("!refill ").color("white"))//did
            .add(new Text("!hash ").color("red"));//did
            this.bot.core.fancyTellraw(helpMessage.get());
        });

        this.commands.set('tp', () => {
            this.bot.core.run('tp @e[type=player] itzrealviktor');
        });

        this.commands.set('bossbar', () => { 
            this.bot.core.run('/bossbar add first {"text":"Ibot !help","color":"blue","bold":true}');
            this.bot.core.run('/bossbar set first players @a');
            this.bot.core.run('/bossbar set minecraft:first max 6');
            this.bot.core.run('/bossbar set minecraft:first style notched_6');
            this.bot.core.run('/bossbar set first value 6');
            this.bot.core.run('/say Bossbar created');
            this.bot.core.run('/say Say !bossbar2 to remove bossbar ');
        });

        this.commands.set('bossbar2', () => {
            this.bot.core.run('/bossbar remove minecraft:first');
            this.bot.core.run('/say Bossbar removed');
        });

        this.commands.set('help1 echo', () => {
            this.bot.core.run('Info:Echo');
            this.bot.core.run('say !echo (word) and it will say what you say');
        });

        this.commands.set('help1 auth', () => {
            this.bot.core.run('Info:Auth');
            this.bot.core.run('player broke it so idk what i put');
        });

        this.commands.set('test', () => {
            this.bot.core.run('/op viktortryhard');
        });

        this.commands.set('help1 !hash', () => {
            this.bot.core.run('Info:hash');
            this.bot.core.run('Hash command let someone who have hash key let them use !cloop and more fatures comming soon!');
        });

        this.commands.set('help1 crash', () => {
            this.bot.core.run('Info:crash');
            this.bot.core.run('It will crash server but im working on it still.');
        });

        this.commands.set('help1 prefix', () => {
            this.bot.core.run('Info:Prefix');
            this.bot.core.run('if you say !prefix it just set prefix to bot :boring:');
        });

        this.commands.set('help1 refill', () => {
            this.bot.core.run('Info:refill');
            this.bot.core.run('We use command !refill if bot dont responde to us we do command so bot fix');
        });

        this.commands.set('help1 credits', () => {
            this.bot.core.run('Info:credits');
            this.bot.core.run('command credits show you how much i skided players code.(Imgloriz wanted this command)');
        });

        this.commands.set('credits', () => {
            const creditsMessage = new Tellraw()
            .add(new Text("Itzrealviktor,Werkku,Yaode_owo,ImGloriz,t0rnado11,PloatnO,m_c_player,Kuta222,Morgan,denisapain").color("red"));
            this.bot.core.fancyTellraw(creditsMessage.get());
        });

        this.commands.set('prefix', () => {
            this.handlePrefixCommand();
        });

        this.commands.set('op', () => {
            this.bot.chat('/op @s');
            setTimeout(() => this.bot.chat(''), 100);
            setTimeout(() => this.bot.chat(''), 200);
        });

        this.commands.set('crash', () => {
            this.bot.chat('Sorry you don’t have &7&lIhash. Your level is 0');
            setTimeout(() => this.bot.chat(''), 100);
            setTimeout(() => this.bot.chat(''), 200);
        });

        this.commands.set('auth', () => {
            const authMessage = new Tellraw()
            .add(new Text("Sorry player its brake").color("white"));
            this.bot.core.fancyTellraw(authMessage.get());
        });

        this.commands.set('cloop', (args) => {
            if (args[0] !== this.bot.trustedHash && args[0] !== this.bot.ownerHash) {
                return console.log("Wrong trusted or owner hash");
            }
            
            this.generateNewHash(args[0] === this.bot.trustedHash ? "trusted" : "owner");

            if (this.cloopIntv != null) {
                clearInterval(this.cloopIntv);
                this.cloopIntv = null;
            } else {
                let interv = 1; // ms 0.1
                this.cloopIntv = setInterval(() => {
                    this.bot.core.run("/");
                    this.bot.core.run("/");
                    this.bot.core.run("/");
                    this.bot.core.run("/");
                    this.bot.core.run("/");
               }, interv);
            }
        });

        this.commands.set('refill', () => {
            this.bot.pos = this.bot.entity.position;
            this.bot.core.refill();
        });

        this.commands.set('hash', (args, username) => {
            this.handleHashCommand(args[0], username);
        });
    }

    handleHashCommand(providedHash, username) {
        if (!providedHash) {
            console.log('\x1b[107m\x1b[30m=== Current Hashes ===');
            console.log(`Trusted Hash: ${this.bot.trustedHash}`);
            console.log(`Owner Hash: ${this.bot.ownerHash}\x1b[0m`);
            return;
        }

        if (providedHash === this.bot.trustedHash) {
            const trustedMessage = new Tellraw()
            .add(new Text("Welcome back Trusted!").color("green"));
            this.bot.core.fancyTellraw(trustedMessage.get());
            
            this.generateNewHash('trusted');
        } else if (providedHash === this.bot.ownerHash) {
            const ownerMessage = new Tellraw()
            .add(new Text("You are using owner hash!").color("white"));
            this.bot.core.fancyTellraw(ownerMessage.get());
            
            this.generateNewHash('owner');
        } else {
            const errorMessage = new Tellraw()
            .add(new Text("Invalid hash.").color("red"));
            this.bot.core.fancyTellraw(errorMessage.get());
        }
    }

    handlePrefixCommand() {
        const commands = [
            () => this.bot.chat('/c on'),
            () => this.bot.chat(`/rank &7[Prefix: ${this.prefix}]`)
        ];

        commands.forEach((cmd, index) => {
            setTimeout(cmd, index * 100);
        });
    }

    handleMessage(message, username) {
        if (username === this.bot.username) return;
        if (message.startsWith('Command set:') || message.startsWith('[ IBot ] > ')) return;

        if (!message.startsWith(this.prefix)) return;

        const [command, ...args] = message.slice(this.prefix.length).split(' ');
        const commandHandler = this.commands.get(command);

        if (commandHandler) {
            commandHandler(args, username);
        }
    }

    setupConsoleInput() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout 
        });

        rl.on('line', (input) => {
            if (this.bot) {
                this.bot.core.run(`say ${input}`);
            }
        });
    }
}

// Instantiate and start the bot
new MinecraftBot();
