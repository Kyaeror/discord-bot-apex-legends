const { Client, GatewayIntentBits } = require(`discord.js`)
require('dotenv').config()
const express = require(`express`)
const app = express()

app.get(`/`, (req,res)=>{
    res.sendStatus(200)
})


var initialCommand = `~`
const helpMenu = `
normal -- shows current/next map and time remaining for normal game modes. 
ranked -- shows current/next map and time remaining for ranked.
changeCommand -- changes initial symbol for commands.
`

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    ]
})

client.on(`ready`, ()=> {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on(`messageCreate`, async (message) => {
    if (message.content.startsWith(initialCommand)){
        //change the initial symbol for commands
        if(message.content.endsWith(`changeCommand`)){
            message.reply(`What would you like to change the initial command to?`)
                .then(() =>{
                    const filter = (msg) => msg.author.id === message.author.id
                    const collector = message.channel.createMessageCollector(filter, {
                        max: 1,
                        time: 60000
                    })
                    
                    collector.on(`collect`, (message)=>{
                        initialCommand = message.content
                        message.reply(`Initial command successfully changed!`)
                        collector.stop()
                    })

                    collector.on(`end`, (collected, reason)=>{
                        if(reason ===`time`){
                            message.reply(`Command change timed out.`)
                        }
                    })
                })
        }
        //normal apex times
        if(message.content.endsWith(`normal`)){
            fetch(`https://api.mozambiquehe.re/maprotation?auth=${process.env.API_KEY}&version=2`)
            .then(res => res.json())
            .then(data=>{
                const currentMap = data.battle_royale.current.map
                const currentRemainingTimer = data.battle_royale.current.remainingTimer
                const nextMap = data.battle_royale.next.map
                message.reply(`The current normal map is ${currentMap} for ${currentRemainingTimer}.\nThe next map is ${nextMap}`)
            })
        }
        //ranked apex times
        if(message.content.endsWith(`ranked`)){
            fetch(`https://api.mozambiquehe.re/maprotation?auth=${process.env.API_KEY}&version=2`)
            .then(res => res.json())
            .then(data=>{
                const rankedMap = data.ranked.current.map
                const rankedRemainingTimer = data.ranked.current.remainingTimer
                const nextRankedMap = data.ranked.next.map
                message.reply(`The current ranked map is ${rankedMap} for ${rankedRemainingTimer}. \nThe next map is ${nextRankedMap}`)
            })
        }
        //list commands
        if(message.content.endsWith(`help`)){
            message.reply(helpMenu)
        }


        if(message.content.endsWith(`notifyNormal`)){
            
        }
        //add notify when map change
            //get user.id
            //fetch data timer
            //compare to current time probably with date util
            //set timer when reach timer then message.reply to user.id




            if(message.content.endsWith(`weather`)){
                message.reply(`What city were you looking for?`)
                    .then(()=> {
                        const filter = (msg) => msg.author.id === message.author.id
                        const collector = message.channel.createMessageCollector(filter, {
                            max: 1,
                            time: 60000
                        })
                        collector.on(`collect`, (message)=>{
                            
                                fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${message.content}&limit=1&appid=${process.env.WEATHER_API_KEY}`)
                                    .then(res => res.json())
                                    .then((data)=>{
                                        const lat = data[0].lat
                                        const lon = data[0].lon
                                        message.reply(`You want to know the weather for ${data[0].name} in ${data[0].country} correct? type only yes or no`)
                                            .then(()=>{
                                                const filter = (msg) => msg.author.id === message.author.id
                                                const collector = message.channel.createMessageCollector(filter, {
                                                    max: 1,
                                                    time: 60000
                                                })
                    
                                                collector.on(`collect`, (message)=>{
                                                    if(message.content == `yes`){
                                                        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=imperial`)
                                                            .then(res=> res.json())
                                                            .then((data)=> {
                                                                message.reply(`It's expected to be ${data.main.temp} fahrenheit, ${data.weather[0].description}, ${data.main.humidity}% humidity, ${data.wind.speed}MPH wind speeds.`)
                                                            })
                                                        collector.stop()
                                                    }else{
                                                        message.reply(`Sorry then please run the command again and type the correct city`)
                                                        collector.stop()
                                                    }
                                                })

                                                collector.on(`end`, (collected, reason)=>{
                                                     if(reason ===`time`){
                                                        message.reply(`Command change timed out.`)
                                                    }
                                                 })
                                            })
                                    })
                
                            
                            collector.stop()
                        })

                        collector.on(`end`, (collected, reason)=>{
                            if(reason ===`time`){
                                message.reply(`Command change timed out.`)
                            }
                        })
                    })
            }
    }
})

client.login(process.env.DISCORD_TOKEN)
app.listen(process.env.PORT || 3001, ()=>{
    console.log(`Listening on PORT:${process.env.PORT}`)
})