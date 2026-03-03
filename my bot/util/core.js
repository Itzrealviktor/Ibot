const Vec3 = require("vec3").Vec3;
const { MessageBuilder } = require("prismarine-chat")("1.19.4");

const { Tellraw, Text } = require("./tellrawBuilder.js");

class CoreClass {
  constructor(client) {
    this.client = client;
    this.commandBlocks = [];
    this.used = 0;
    this.corepos = { x: 0, y: 0, z: 0 };
    this.totalCommandsRun = 0;
    this.startTime = Date.now();
    this.transaction_id = [];
    this.coreSize = require("../config.json").core;
    this.initialize();0
  }

  refill() {
    const config = require("../config.json");
    const pos = this.client.entity?.position; // Ensure entity exists before accessing position
    this.commandBlocks = [];

    // Check if the bot's position is defined
    if (!pos || (pos.x === 0 && pos.y === 0 && pos.z === 0)) {
      setTimeout(() => this.refill(), 650);
      return;
    }

    const core = {
      x: Math.floor(pos.x - (this.coreSize.width - 1) / 2),
      y: Math.floor(config.core.y - (this.coreSize.height - 1) / 2),
      z: Math.floor(pos.z - (this.coreSize.depth - 1) / 2),
      x2: Math.floor(pos.x + (this.coreSize.width - 1) / 2),
      y2: Math.floor(config.core.y + (this.coreSize.height - 1) / 2),
      z2: Math.floor(pos.z + (this.coreSize.depth - 1) / 2),
    };

    this.corepos = { x: core.x, y: core.y, z: core.z };
    this.client.chat(
      `/fill ${core.x} ${core.y} ${core.z} ${core.x2} ${core.y2} ${core.z2} minecraft:repeating_command_block{CustomName:'{"text":"Ibot core","color":"blue"}'} replace`
    );

    for (let x = core.x; x <= core.x2; x++) {
      for (let y = core.y; y <= core.y2; y++) {
        for (let z = core.z; z <= core.z2; z++) {
          this.commandBlocks.push(new Vec3(x, y, z));
        }
      }
    }

    setTimeout(
      () =>
        this.run(
          `/minecraft:tp ${this.client.uuid} ${this.corepos.x} ${this.corepos.y} ${this.corepos.z}`
        ),
      85
    );
  }

  initialize() {
    this.refill(); // Start the refill process
  }

  run(cmd, amount = 1) {
    const iterations = Math.min(amount, this.commandBlocks.length);
    if (iterations > 10000) return this.tellraw("Invalid Amount of jobs");
    const jobs = Math.ceil(iterations / 10); // Number of jobs to run concurrently
    const commandsPerJob = Math.ceil(iterations / jobs);

    for (let job = 0; job < jobs; job++) {
      const start = job * commandsPerJob;
      const end = Math.min(start + commandsPerJob, iterations);
      for (let i = start; i < end; i++) {
        try {
          this.client._client.write("update_command_block", {
            command: cmd,
            location: this.commandBlocks[this.used],
            mode: 1,
            flags: 4,
          });
        } catch (err) {
          console.log(`ERROR: ${err}`);
          return;
        }
        this.used = (this.used + 1) % this.commandBlocks.length;
      }
    }
    this.totalCommandsRun += iterations;
  }

  // Tellraw stuff
  tellraw(text, selector = "@a") {
    this.run(`minecraft:tellraw ${selector} ${JSON.stringify(text)}`);
  };

  fancyTellraw = (text, selector) => {
    const prefix = new Tellraw()
    .add(new Text("Ibot").setColor("red"))
    .add(new Text(" › ").setColor("blue"))
    .get(false)

    if (typeof text === "object") {
      let prf = [...prefix];

      if (Array.isArray(text)) {
        text.forEach((t) => {
          prf.push(t);
        });
      } else prf.push(text);
      return this.tellraw(prf, selector);
    }
    this.tellraw(text, selector);
  };
}

module.exports = { CoreClass };