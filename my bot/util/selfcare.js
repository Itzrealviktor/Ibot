function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  function selfcare (bot) {
    bot._client.on('entity_status', (packet) =>{
      let Id = packet.entityId;
      let status = packet.entityStatus;
      if(Id == bot.EntityId){
          if (status != 28){
              bot.chat(`/minecraft:op @s[type=player]`);
          }
      }
  });
  bot._client.on('game_state_change', (packet) =>{
    if (packet.reason === 3){
        let gamemode = packet.gameMode;
        if(gamemode !== 1){
            bot.chat(`/minecraft:gamemode creative`);
        }
    }
});
  bot.on('systemchat', async (message) => {
  if (message.includes("Too many blocks in the specified area (maximum")) {
    bot.chat("/gamerule commandModificationBlockLimit 32768")
    await delay(2)
    bot.core.refill()
    
  }
  if (message.includes("Must be an opped player in creative mode")) {
    bot.chat("/minecraft:op @s[type=player]")
    await delay(2)
    bot.chat(`/minecraft:gamemode creative`);
    await delay(2)
  }

if (message.includes("Vanis disabled")) {
  bot.chat("/v")
  await delay(2)
  bot.chat(`/v`);
  await delay(2)
}
  if (message.includes(`Vanish for`)) {
    this.bot.core.run(`/vanish ${this.bot.username} enable`)
    await delay(2)
  }
    //bot.chat(`/prefix [prefix !help]`) // <- not implemented //wdym // prefix selfcare = not done //ok
  })
  }
  module.exports = { selfcare };