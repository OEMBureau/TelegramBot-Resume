// 
// Simple CV/Resume/Ad bot acts like agent of a developer, show RnD services 
// process RnD requests
//
// Live Demo of the Telegram-bot available here https://t.me/ResumeFullStackBot
//
// The bot simply shows to a visitor services of a developer, and can receive files and messages
// from the visitor forward them to the developer and forward answers to the visitor 
//
// [!] The purpose of the code is just to demonstrate my codding style.

// [Commercial part :) ]
//    Need a really cool bot? make request on RnD to req@OEMbureau.com
//    Also find my Telegram-bots in my shop plusClientBot.com

// Yes, I prefer 'async' pattern



( async () => {
  const Telegraf  = require('/usr/local/lib/node_modules/telegraf')
  const Router    = require('/usr/local/lib/node_modules/telegraf/router')
  const Extra     = require('/usr/local/lib/node_modules/telegraf/extra')
  const session   = require('/usr/local/lib/node_modules/telegraf/session')
  const Markup    = require('/usr/local/lib/node_modules/telegraf/markup')
  
  const SESSION_TTL = process.env.SESSION_TTL | null

  //////////////////////////////////////////////////////////////////////
  //
  // Contains all texts, button labels, bot phrases for different cases etc.
  // in real project should be placed in separated file and tied with some DB
  //                    
  //////////////////////////////////////////////////////////////////////
  const dictionary = {
    // Buttons of main menu
     buttonServices : `🏷 RnD services`,
     buttonResume   : `📂 Resume`,
     buttonContact  : `✉️ Contact me`,
    // Inline buttons
     buttonFullResume: `🌏 Open full text`,
     buttonBack:`⏪ Back`, 
     buttonEnD_Specification: `Specification`,
     buttonFirmware:          `Firmware `,
     buttonBackend:           `Back-End `,
     buttonFrontend:          `Front-End `,
     buttonElectronics:       `Electronics `,
     buttonBots:              `Telegram bots `,
     buttonContactMessage:    `📝 Send Message`,
     buttonContactFile:       `📎 Send File, photo, etc.`,
     buttonContactCancel:     `❌ Cancel`,
    // Phrases
     phraseSendMessage: `Ok, send me a message I'll forward it to the developer`,
     phraseServices: `Feel free to request these RnD services (select to see more info):`,
     phraseUnknownCommand: `🤢 Unknown command, sorry 🤷‍`,
     phraseContact: `Would you like to send me a message or a file?`,
     phraseOK:`👌`,
     phraseSelectedSendMessage:`Ok, just send me a message, and I'll forward it to the Developer.`, 
     phraseSelectedSendFile:`Ok, just send me a file (or photo), and I'll forward it to the Developer.`, 
     phraseMessageWasSent: `👌 your message was just sent to the Developer.`,
     phraseInternalError:  `🤢ooops something gone wrong try again later, sorry 🤷‍`,
     phraseToSendMEssageUseContactMe: `Use "✉️ Contact me" button to send messages👇`, 

    // Texts
     hello: `Hi, I'm experienced Full-Stack developer. Here you can find my resume and RnD services I offer.`,
     resume: `Developer with 18+ years of experience (in RnD industry since 2001). I have a patent application in IoT field (US20140359042A1). I’m grown-up from electronics design and prototype field, as a result I have deep knowledge of different hardware platforms from electronics level to abstract programming models. I got robust experience from architecture design to implementation and testing of different services and systems, and their commercial launch and support. I’ve developed services from deeply tied with IoT (growcentral.net) from scratch (architecture, hardware, firmware, backend and frontend); to services with full automatic clients support from sells to billing (plusClientBot.com). You can observe part of my recent projects (those are not limited by NDA) on my site OEMbureau.com`,
     specification: `It is usual case client has no technical specification of a product, only informal description of its features. On the other hand RnD teams require specification with detailed description of the product in technical terms. I offer my assistance to 'translate' your product description into technical specification, road map and calculate budget of all project (time, resources). It worth to invest into professional specification design to avoid extra spends and  finish in time.`,
     electronics: `I offer full spectre of services to implement device from idea to real working device: Schematic, PCB, and BOM (bill of material)  design; assempble prototype and test it with oscilloscope.  I do not design enclosure, but can find appropriate on stock (like mouser, digikey, etc). I develop analog, power and digital electronics. In my portfolio are designed devices with DDR3, WiFi, FPGA, LVDS components and gigabit ethernets. I use modern approaches and special CADs to simulate impedances for high-speed and RF circuits, temperature modes, etc.`,
     firmware: `Firmware Design for ARM (e.g. AM335x family), Cortex (Stellaris, Tiva), MSP Family, RF (CC3200, etc.). On low level I use FreeRTOS, on high level U-BOOT, Linux, and QT if required. `,
     frontend: `My stack for front-end is: Angular, Socket.Io, RxJS, Observables, Services, Redux, Material Design or Bootstrap, SocketIo, CSS, HTML5 . I offer complex solutions from login page to multi accounts  web applications with real time dashboards and responsive design.`,
     bots:   `I'm expert in Telegram bots creation. I've developed commercial eco-system for B2B bot deployment (see it on plusClientBot.com). I offer my service to design very complex and useful Telegram bots.`,
     backend: `Architectural level:Microservices , Containerisation and isolation, User verification via email, SMS, chat-bots, Digital Ocean,Docker. Stack: Linux (Ubuntu 14),SSH, Docker (swarm), CertBot, NGINX, NodeJS (async, lambda, middlewares), MongoDB, Redis, Tarantul, Telegraf (Telegram Bot framework), Express`,
     
    // URLs 
     urlResume: `https://docs.google.com/document/d/1__TfqE2_chgkRdxYoSJzX01uSZY8OmK1z0Ru9lYgRFI`
  }
//   
  //////////////////////////////////////////////////////////////////////
  //
  //   Different commands bot use during processing of user interactions, 
  //   also some of the commands are saved in sessions (one per a user)
  //                  
  //////////////////////////////////////////////////////////////////////
  const commands = {
    service_rnd_spec        : 'service_rnd_spec',
    service_rnd_firmware    : 'service_rnd_firmware',
    service_rnd_backend     : 'service_rnd_backend',
    service_rnd_frontend    : 'service_rnd_frontend',
    service_rnd_electronics : 'service_rnd_electronics',
    service_rnd_bots        : 'service_rnd_bots',

    contact_type            : 'contact_type',
    contact_message         : 'contact_message',
    contact_file            : 'contact_file',

    back                    : 'back'

  }
  //////////////////////////////////////////////////////////////////////
  //
  //                      Keyboards
  //                     
  //////////////////////////////////////////////////////////////////////
  const menu            = Markup.keyboard([[dictionary.buttonServices], [dictionary.buttonResume], [dictionary.buttonContact]]).resize().extra()
  const menuCancel      = Markup.keyboard([[dictionary.buttonContactCancel]]).resize().extra()
  const menuContact     = Markup.keyboard([[dictionary.buttonContactMessage], [dictionary.buttonContactFile], [dictionary.buttonContactCancel]]).resize().extra()
  const inlineServices  = Markup
        .inlineKeyboard(
            [
                [Markup.callbackButton(dictionary.buttonBots,                commands.service_rnd_bots)],
                [Markup.callbackButton(dictionary.buttonEnD_Specification,   commands.service_rnd_spec)],
                [Markup.callbackButton(dictionary.buttonElectronics,         commands.service_rnd_electronics)],
                [Markup.callbackButton(dictionary.buttonFirmware,            commands.service_rnd_firmware)],
                [Markup.callbackButton(dictionary.buttonBackend,             commands.service_rnd_backend)],
                [Markup.callbackButton(dictionary.buttonFrontend,            commands.service_rnd_frontend)],
            ]
            
        )
  .extra()
  const inlineResume = Extra.HTML().markup((m) => m.inlineKeyboard([[Markup.urlButton(dictionary.buttonFullResume, dictionary.urlResume)],]))
  const inlineBack   = Markup.inlineKeyboard([[Markup.callbackButton(dictionary.buttonBack,   commands.back)],]).extra()

  //////////////////////////////////////////////////////////////////////
  //
  //                  callback_query Route [BEGIN] 
  //                     Proccess inline menu
  //////////////////////////////////////////////////////////////////////
  const callbackQueryRoute = new Router(({ callbackQuery }) => {
    if (!callbackQuery.data) {
      return
    }
    const command = callbackQuery.data
    return {
      route: command,
      state: {
        
      }
    }
  })
  //
  callbackQueryRoute.on(commands.service_rnd_spec, (ctx) => {
    const {editMessageText = null} = ctx
    ctx.session.command = commands.service_rnd_spec
    return editMessageText(dictionary.specification,inlineBack).catch(() => undefined)
  })

  callbackQueryRoute.on(commands.service_rnd_frontend, (ctx) => {
    const {editMessageText = null} = ctx
    ctx.session.command = commands.service_rnd_frontend
    return editMessageText(dictionary.frontend,inlineBack).catch(() => undefined)
  })

  callbackQueryRoute.on(commands.service_rnd_firmware, (ctx) => {
    const {editMessageText = null} = ctx
    ctx.session.command = commands.service_rnd_firmware
    return editMessageText(dictionary.firmware,inlineBack).catch(() => undefined)
  })

  callbackQueryRoute.on(commands.service_rnd_electronics, (ctx) => {
    const {editMessageText = null} = ctx
    ctx.session.command = commands.service_rnd_electronics
    return editMessageText(dictionary.electronics,inlineBack).catch(() => undefined)
  })

  callbackQueryRoute.on(commands.service_rnd_backend, (ctx) => {
    const {editMessageText = null} = ctx
    ctx.session.command = commands.service_rnd_backend
    return editMessageText(dictionary.backend,inlineBack).catch(() => undefined)
  })

  callbackQueryRoute.on(commands.service_rnd_bots, (ctx) => {
    const {editMessageText = null} = ctx
    ctx.session.command = commands.service_rnd_bots
    return editMessageText(dictionary.bots,inlineBack).catch(() => undefined)
  })
    
  
  callbackQueryRoute.on(commands.back, (ctx) => {
    const {editMessageText = null, reply = null } = ctx
    switch (ctx.session.command){
      case commands.service_rnd_backend: 
      case commands.service_rnd_electronics:
      case commands.service_rnd_firmware:
      case commands.service_rnd_frontend:
      case commands.service_rnd_spec:
      case commands.service_rnd_bots:
        ctx.session.command = null
        if (editMessageText) return editMessageText(dictionary.phraseServices, inlineServices)
      break

      default:

    }
    if (reply) return reply(dictionary.phraseUnknownCommand, menu)
    return null
  })
 
  callbackQueryRoute.otherwise((ctx) => ctx.reply(dictionary.phraseUnknownCommand, menu))
  
  
  //////////////////////////////////////////////////////////////////////
  //
  //                  Bot[BEGIN] 
  //
  //////////////////////////////////////////////////////////////////////
  const bot = new Telegraf(process.env.BOT_TOKEN)
  bot.use(session({ ttl: SESSION_TTL }))

  bot.start( async (ctx) => {
    const {reply = null} = ctx
    ctx.session.command = null
    if (reply) return await reply(dictionary.hello,menu) 
    
    return null
  })

  bot.on('callback_query', callbackQueryRoute)

  // process message sent to the developer via 'Contact Me' button
  bot.on('message', async(ctx, next) =>{
    let {message, updateSubTypes, replyWithChatAction, forwardMessage, replyWithMarkdown, reply} = ctx
    let filter = ['document', 'photo', 'text']
    
    // Check is it reply of the bot owner and reply to some user's message should be forwarded
    //console.log(message)

    if ( message.reply_to_message != undefined
        && message.reply_to_message.forward_from != undefined
        && message.reply_to_message.forward_from.id != undefined
        && process.env.BOT_OWNER_TELEGRAM_ID && process.env.BOT_OWNER_TELEGRAM_ID != undefined && (message.from.id === parseInt(process.env.BOT_OWNER_TELEGRAM_ID, 10))){

          await bot.telegram.sendMessage(message.reply_to_message.forward_from.id, `${message.text}`).catch(console.error)
          return null
        }

    // Process another users 
    if (updateSubTypes && updateSubTypes != undefined && ctx.session && ctx.session.command && ctx.session.command != commands.contact_type && (ctx.session.command == commands.contact_message || ctx.session.command == commands.contact_file)){
       
      if (updateSubTypes == 'text' && message.text == dictionary.buttonContactCancel) return next()

        const found = updateSubTypes.some(r=> filter.indexOf(r) >= 0)
        // just inform user with typing spin I do something
        await replyWithChatAction('typing').catch(console.error)

        if (process.env.BOT_OWNER_TELEGRAM_ID && process.env.BOT_OWNER_TELEGRAM_ID != undefined && forwardMessage && found){
            // forward data to the owner of the bot
            await forwardMessage(process.env.BOT_OWNER_TELEGRAM_ID,message.chat.id, message.message_id).catch(console.error)
            // clear command
            ctx.session.command = null
            // inform user message was sent and display main keyboard
            await replyWithMarkdown(dictionary.phraseMessageWasSent, menu).catch(() => undefined)
            
            
        }else{
            await reply(dictionary.phraseInternalError, menu).catch(() => undefined)
        }

        return next()
    }else{
      
      if (updateSubTypes == 'text' && message.text && message.text != undefined) {
        let foundInDictionart = false 
        Object.values(dictionary).forEach(value => { if (message.text === value) foundInDictionart = true});
        if (!foundInDictionart) reply(dictionary.phraseToSendMEssageUseContactMe, menu).catch(() => undefined)
      }
      return next()
    }
    
   

    
  })

  // Processing of commands
  bot.hears(dictionary.buttonResume,   ({reply}) => reply(dictionary.resume, inlineResume))
  bot.hears(dictionary.buttonServices, ({reply}) => reply(dictionary.phraseServices, inlineServices))
  bot.hears(dictionary.buttonContact,  (ctx) => {
    const {reply = null } = ctx
    ctx.session.command = commands.contact_type
    if (reply) reply(dictionary.phraseContact, menuContact).catch(() => undefined)
    
  })
  bot.hears(dictionary.buttonContactCancel,  (ctx) => {
  
    const {reply = null } = ctx
    ctx.session.command = null
    if (reply) reply(dictionary.phraseOK, menu).catch(() => undefined)
    
  })
  bot.hears(dictionary.buttonContactMessage,  (ctx) => {
    const {reply = null } = ctx
    ctx.session.command = commands.contact_message
    if (reply) reply(dictionary.phraseSelectedSendMessage, menuCancel).catch(() => undefined)
    
  })
  bot.hears(dictionary.buttonContactFile,  (ctx) => {
    const {reply = null } = ctx
    ctx.session.command = commands.contact_file
    if (reply) reply(dictionary.phraseSelectedSendFile, menuCancel).catch(() => undefined)
    
  })
  
  bot.startPolling()


})().catch( err  => {
  //////////////////////////////////////////////////////////////////////
  //
  //                  Global Failure
  //
  //////////////////////////////////////////////////////////////////////  
  console.error(`Error:`, err)
  process.exit(-1)

})
