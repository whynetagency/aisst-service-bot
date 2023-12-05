const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('XXXXXXXX:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', { polling: true });
const mailer = new TelegramBot('XXXXXXXX:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
const adminChatID = 'XXXXXXXX';
let lastStep = '';
let formStep = '';
let contact = {name: '', phone: '', message: '', type: ''}

const availableCommands = [
    '\/start', '🏠Главное меню', '⬅️Назад', 'Транспорт', 'Другое авто', 'Легковые авто', 'Электро', 'Бензин', 'Подбор авто',
    'до 10 млн тг', 'до 20 млн тг', '> 20 млн.тг', 'Спец предложения', 'ZEEKR 001 - приятные эмоции включены.',
    'О компании', 'Service+', 'Ком.техника', 'Багги', 'Аксессуары', 'Запасные части', 'Русификация авто',
    'Прошивка ЭБУ', 'Чип тюнинг', 'Диагностика', 'Zeekr 001', 'Voyah Dreamer', 'Nio ES8', 'BYD Song EV', 'HiPhi Z',
    'Avatr 11', 'Lotus Eletre S+', 'GAC Trumchi M8', 'Haval H9', 'Toyota Camry Q', 'Changan UNI-K Flagship', 'Exeed LX',
    'Tank 300', 'Chery Tiggo 7 Plus', 'Li l9 Ma', 'Voyah Free', 'Geely Monjaro', '✔ ZEEKR 001 - приятные эмоции включены.', 'Оставить заявку', 'Подобрать другое авто'
]

// MAIN MENU
function onOpenMainMenu(type, chatID, phoneNumber) {
    formStep = '';
    contact.name = '';
    contact.phone = '';
    contact.type = '';

    const types = [
        {key: 'start', text: '<b>Добро пожаловать в чат-бот официального представительства AISST Service.</b>\n\nВыберите интересующую вас информацию ⤵️'},
        {key: 'contact', text: `<b>Спасибо! Мы перезвоним Вам по этому номеру: ${phoneNumber}</b>`},
        {key: 'home', text: '<b>Выберите интересующий Вас вопрос</b> ⤵️'},
        {key: 'notFound', text: '❗<b>Недоступная команда. Повторите ввод, либо выберите из предложенных вариантов</b> ⤵️'},
    ];

    bot.sendMessage(chatID, types.find(t => t.key === type).text, {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [
                ['Транспорт', 'Аксессуары'], ['Запасные части', 'Подбор авто'],
                ['Спец предложения', 'О компании'], ['Service+']
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
}
bot.onText(/\/start/, (msg) => onOpenMainMenu('start', msg.chat.id));
bot.onText(/🏠Главное меню/, (msg) => onOpenMainMenu('home', msg.chat.id));

bot.onText(/⬅️Назад/, (msg) => {
    formStep = '';
    contact.name = '';
    contact.phone = '';
    contact.type = '';
    if(
        lastStep === '' ||
        lastStep === 'Транспорт' ||
        lastStep === 'Аксессуары' ||
        lastStep === 'Запасные части' ||
        lastStep === 'Подбор авто' ||
        lastStep === 'Спец предложения' ||
        lastStep === 'О компании' ||
        lastStep === 'Service+'
    ) {
        onOpenMainMenu('home', msg.chat.id);
    } else if (lastStep === '✔ ZEEKR 001 - приятные эмоции включены.') {
        lastStep = 'Спец предложения';
        bot.sendMessage(msg.chat.id, '<i>Актуальную информацию о всех предложениях Вы можете получить на <b><a href="https://https://aisstservice.com/">нашем сайте</a></b></i><b>\n\nСпец предложения для Вас</b> ⤵️', {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [['✔ ZEEKR 001 - приятные эмоции включены.'], ['⬅️Назад', '🏠Главное меню']],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        });
    } else if (lastStep === 'Легковые авто' || lastStep === 'Ком.техника' || lastStep === 'Багги') {
        lastStep = 'Транспорт';
        onOpenTransport(msg.chat.id)
    } else if (lastStep === 'Электро' || lastStep === 'Бензин') {
        lastStep = 'Легковые авто';
        onOpenSmall(msg.chat.id)
    } else if (lastStep === 'до 10 млн тг' || lastStep === 'до 20 млн тг' || lastStep === '> 20 млн.тг') {
        lastStep = 'Подбор авто'
        bot.sendMessage(msg.chat.id, '<b>Выберите Ваш бюджет</b> ⤵️', {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [['до 10 млн тг', 'до 20 млн тг', '> 20 млн.тг'], ['⬅️Назад', '🏠Главное меню']],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        });
    } else if (lastStep === 'Русификация авто' || lastStep === 'Прошивка ЭБУ' || lastStep === 'Чип тюнинг' || lastStep === 'Диагностика') {
        lastStep = 'Service+';
        bot.sendMessage(msg.chat.id, '<b>Выберите услугу из списка ниже</b> ⤵️', {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [['Русификация авто', 'Прошивка ЭБУ'], ['Чип тюнинг', 'Диагностика'], ['⬅️Назад', '🏠Главное меню']],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        });
    } else {
        onOpenMainMenu('home', msg.chat.id);
    }
});

// CONTACT
bot.on('contact', (msg) => {
    mailer.sendMessage(adminChatID, `<b>НОВАЯ ЗАЯВКА С БОТА:</b>\n<b>Имя:</b> ${contact.name ? '(' + contact.name + ')' : ''} ${msg.contact.first_name} ${msg.contact.last_name}\n<b>Номер:</b> ${msg.contact.phone_number}\n<b>Раздел:</b> ${lastStep}`, {parse_mode: 'HTML'}).then(() => console.log('message sent'));
    onOpenMainMenu('contact', msg.chat.id, msg.contact.phone_number)
    contact.name = '';
    contact.phone = '';
    contact.type = '';
    formStep = '';
});

function onOpenTransport(chatID) {
    bot.sendMessage(chatID, '<b>Выберите подкатегорию</b> ⤵️', {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [['Легковые авто', 'Ком.техника', 'Багги'], ['⬅️Назад', '🏠Главное меню']],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
}
function onOpenOther(chatID) {
    if (lastStep === 'GAC Trumchi M8' || lastStep === 'Haval H9' || lastStep === 'Toyota Camry Q' || lastStep === 'Changan UNI-K Flagship' || lastStep === 'Exeed LX' || lastStep === 'Tank 300' || lastStep === 'Chery Tiggo 7 Plus' || lastStep === 'Li l9 Max' || lastStep === 'Voyah Free' || lastStep === 'Geely Monjaro') {
        onOpenPatrol(chatID)
    } else {
        onOpenElectric(chatID)
    }
}
function onOpenSmall(chatID) {
    lastStep = 'Легковые авто';
    bot.sendMessage(chatID, '<b>Выберите тип авто</b> ⤵️', {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [['Электро', 'Бензин'], ['⬅️Назад', '🏠Главное меню']],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
}
function onOpenElectric(chatID) {
    lastStep = 'Электро';
    bot.sendMessage(chatID, '<b>Выберите марку и модель из списка</b> ⤵️', {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [['Zeekr 001', 'Voyah Dreamer'],['Nio ES8', 'BYD Song EV'],['HiPhi Z', 'Avatr 11'], ['Lotus Eletre S+', 'Подобрать другое авто'], ['⬅️Назад', '🏠Главное меню']],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
}
function onOpenPatrol(chatID) {
    lastStep = 'Бензин';
    bot.sendMessage(chatID, '<b>Выберите марку и модель из списка</b> ⤵️', {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [['GAC Trumchi M8', 'Haval H9'],['Toyota Camry Q', 'Changan UNI-K Flagship'],['Exeed LX', 'Tank 300'], ['Chery Tiggo 7 Plus', 'Li l9 Max'], ['Voyah Free', 'Geely Monjaro'],['Подобрать другое авто'],['⬅️Назад', '🏠Главное меню']],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
}


bot.onText(/Транспорт/, (msg) => onOpenTransport(msg.chat.id));
bot.onText(/Другое авто/, (msg) => onOpenOther(msg.chat.id));
bot.onText(/Легковые авто/, (msg) => onOpenSmall(msg.chat.id));
bot.onText(/Электро/, (msg) => onOpenElectric(msg.chat.id));
bot.onText(/Бензин/, (msg) => onOpenPatrol(msg.chat.id));

bot.onText(/Подбор авто/, (msg) => {
    const chatId = msg.chat.id;
    lastStep = 'Подбор авто'
    bot.sendMessage(chatId, '<b>Выберите Ваш бюджет</b> ⤵️', {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [['до 10 млн тг', 'до 20 млн тг', '> 20 млн.тг'], ['⬅️Назад', '🏠Главное меню']],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
});
bot.onText(/до 10 млн тг/, (msg) => onHandleContact('до 10 млн тг', msg.chat.id));
bot.onText(/до 20 млн тг/, (msg) => onHandleContact('до 20 млн тг', msg.chat.id));
bot.onText(/> 20 млн.тг/, (msg) => onHandleContact('> 20 млн.тг', msg.chat.id));

bot.onText(/Спец предложения/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '<i>Актуальную информацию о всех предложениях Вы можете получить на <b><a href="https://https://aisstservice.com/">нашем сайте</a></b></i><b>\n\nСпец предложения для Вас</b> ⤵️', {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [['✔ ZEEKR 001 - приятные эмоции включены.'], ['⬅️Назад', '🏠Главное меню']],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
});
bot.onText(/✔ ZEEKR 001 - приятные эмоции включены./, (msg) => {
    lastStep = '✔ ZEEKR 001 - приятные эмоции включены.';
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
        'При покупке ZEEKR 001, эксклюзивные подарки включены:\n' +
        '✔️Электростанция 7 кВт;\n' +
        '✔️Шины саморемонтирующиеся (технология RunFlat);\n' +
        '✔️Ключи (механика, USB ,карты);\n' +
        '✔️Фирменные полики в салон.',{
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [['⬅️Назад', '🏠Главное меню']],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        });
});
bot.onText(/О компании/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        'Компания AISSTService - официальный партнер ведущих мировых производителей автомобилей, коммерческой техники, запасных частей и аксессуаров из Китая, Кореи и ОАЭ.\n' +
        '\nАдрес: \nг.Алматы, пр. Абылай хана, 60\n' +
        '\ne-mail: \ninfo@aisstservice.com\n' +
        '\nОтдел продаж: \n<b>+7-707-384-0560</b>\n' +
        '\nСайт: \nhttps://aisstservice.com/\n' +
        '\nFacebook: \nhttps://www.facebook.com/aisst.service\n' +
        '\nInstagram: \nhttps://instagram.com/aisst_service?igshid=MzRlODBiNWFlZA==\n',
        {parse_mode: 'HTML'}
    );
});
bot.onText(/Service+/, (msg) => {
    const chatId = msg.chat.id;
    lastStep = 'Service+';
    bot.sendMessage(chatId, '<b>Выберите услугу из списка ниже</b> ⤵️', {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [['Русификация авто', 'Прошивка ЭБУ'], ['Чип тюнинг', 'Диагностика'], ['⬅️Назад', '🏠Главное меню']],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
});

// UNSUPPORTED COMMAND
bot.on('message', (msg) => {
    if(formStep && msg.text !== '\/start' && msg.text !== '🏠Главное меню' && msg.text !== '⬅️Назад' && !msg.contact) {
        if(formStep === '1') {
            contact.name = msg.text;
            bot.sendMessage(msg.chat.id, '<b>Введите Ваш номер телефона \nили нажмите \'📱Отправить номер\' ⤵️</b>', {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: [[{ text: '📱Отправить номер', request_contact: true }, { text: '⬅️Назад' },{text: '🏠Главное меню'}]],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                }}).then(() => formStep = '2');
        } else {
            if(msg.text.length > 5 && msg.text.length < 15 && !isNaN(Number(msg.text.replace('+', '')))) {
                contact.phone = msg.text;
                mailer.sendMessage(adminChatID, `<b>НОВАЯ ЗАЯВКА С БОТА:</b>\n<b>Имя:</b> ${contact.name}\n<b>Номер:</b> ${contact.phone}\n<b>Раздел:</b> ${contact.type}`, {parse_mode: 'HTML'}).then(() => console.log('message sent'));
                onOpenMainMenu('contact', msg.chat.id, msg.text);
                contact.name = '';
                contact.phone = '';
                contact.type = '';
                formStep = '';
            } else {
                bot.sendMessage(msg.chat.id, "<b>❗ Неверный формат номера. Попробуйте еще раз или нажмите '📱Отправить номер' ⤵️</b>", {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [[{ text: '📱Отправить номер', request_contact: true }, { text: '⬅️Назад' },{text: '🏠Главное меню'}]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    }}).then(() => formStep = '2');
            }
        }
    } else {
        !availableCommands.includes(msg.text) && !msg.contact && onOpenMainMenu('notFound', msg.chat.id)
    }
});

// CONTACT FORM
function onHandleContact(menuItem, chatID) {
    lastStep = menuItem;
    formStep = '1';
    contact.type = menuItem;
    bot.sendMessage(chatID, '<b>Продолжая, Вы даете согласие на обработку персональных данных. \n\nВведите Ваше Ф.И.О ⤵️</b>', {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [[{ text: '⬅️Назад' },{text: '🏠Главное меню'}]],
            resize_keyboard: true,
            one_time_keyboard: false,
        }});
}

bot.onText(/Ком.техника/, (msg) => onHandleContact('Ком.техника', msg.chat.id));
bot.onText(/Багги/, (msg) => onHandleContact('Багги', msg.chat.id));
bot.onText(/Аксессуары/, (msg) => onHandleContact('Аксессуары', msg.chat.id));
bot.onText(/Запасные части/, (msg) => onHandleContact('Запасные части', msg.chat.id));
bot.onText(/Русификация авто/, (msg) => onHandleContact('Русификация авто', msg.chat.id));
bot.onText(/Прошивка ЭБУ/, (msg) => onHandleContact('Прошивка ЭБУ', msg.chat.id));
bot.onText(/Чип тюнинг/, (msg) => onHandleContact('Чип тюнинг', msg.chat.id));
bot.onText(/Диагностика/, (msg) => onHandleContact('Диагностика', msg.chat.id));
bot.onText(/Оставить заявку/, (msg) => onHandleContact('Оставить заявку', msg.chat.id));
bot.onText(/Подобрать другое авто/, (msg) => onHandleContact('Подобрать другое авто', msg.chat.id));


// CARS
function onSendCarInfo(car, chatID) {
    lastStep = car;
    const cars = [
        { name: 'Zeekr 001', description: '<b>Модель:</b> Zeekr 001 \n<b>Стоимость:</b> от 48 500$', image: 'https://aisst.whynet.agency/img/1.png'},
        { name: 'Voyah Dreamer', description: '<b>Модель:</b> Voyah Dreamer 1.5 Гибрид \n<b>Стоимость:</b> от 68 330$', image: 'https://aisst.whynet.agency/img/2.png'},
        { name: 'Nio ES8', description: '<b>Модель:</b> Nio ES8 \n<b>Стоимость:</b> от 67 200$', image: 'https://aisst.whynet.agency/img/3.png'},
        { name: 'BYD Song EV', description: '<b>Модель:</b> BYD Song EV \n<b>Стоимость:</b> от 28 900$', image: 'https://aisst.whynet.agency/img/4.png'},
        { name: 'HiPhi Z', description: '<b>Модель:</b> HiPhi Z \n<b>Стоимость:</b> от 82 100$', image: 'https://aisst.whynet.agency/img/5.png'},
        { name: 'Avatr 11', description: '<b>Модель:</b> Avatr 11 \n<b>Стоимость:</b> от 46 200$', image: 'https://aisst.whynet.agency/img/6.png'},
        { name: 'Lotus Eletre S+', description: '<b>Модель:</b> Lotus Eletre S+ \n<b>Стоимость:</b> от 109 600$', image: 'https://aisst.whynet.agency/img/7.png'},
        { name: 'GAC Trumchi M8', description: '<b>Модель:</b> GAC Trumchi M8  2.0T Автомат \n<b>Стоимость:</b> от 48 255$', image: 'https://aisst.whynet.agency/img/8.png'},
        { name: 'Haval H9', description: '<b>Модель:</b> Haval H9 2.0T Автомат \n<b>Стоимость:</b> от 52 880$', image: 'https://aisst.whynet.agency/img/9.png'},
        { name: 'Toyota Camry Q', description: '<b>Модель:</b> Toyota Camry Q 2.0 Автомат \n<b>Стоимость:</b> от 41 705$', image: 'https://aisst.whynet.agency/img/10.png'},
        { name: 'Changan UNI-K Flagship', description: '<b>Модель:</b> Changan UNI-K Flagship 2.0 Автомат \n<b>Стоимость:</b> от 34 260$', image: 'https://aisst.whynet.agency/img/11.png'},
        { name: 'Exeed LX', description: '<b>Модель:</b> Exeed LX 1.5Т Вариатор \n<b>Стоимость:</b> от 24 105$', image: 'https://aisst.whynet.agency/img/12.png'},
        { name: 'Tank 300', description: '<b>Модель:</b> Tank 300 2.0Т Автомат \n<b>Стоимость:</b> от 45 300$', image: 'https://aisst.whynet.agency/img/13.png'},
        { name: 'Chery Tiggo 7 Plus', description: '<b>Модель:</b> Chery Tiggo 7 Plus 1.6 Робот \n<b>Стоимость:</b> от 25 418$', image: 'https://aisst.whynet.agency/img/14.png'},
        { name: 'Li l9 Ma', description: '<b>Модель:</b> Li L9 Max 1.5Т Гибрид \n<b>Стоимость:</b> от 68 100$', image: 'https://aisst.whynet.agency/img/15.png'},
        { name: 'Voyah Free', description: '<b>Модель:</b> Voyah Free 1.5 Гибрид \n<b>Стоимость:</b> от 51 900$', image: 'https://aisst.whynet.agency/img/16.png'},
        { name: 'Geely Monjaro', description: '<b>Модель:</b> Geely Monjaro 2.0 Автомат \n<b>Стоимость:</b> от 35 812$', image: 'https://aisst.whynet.agency/img/17.png'},
    ];
    bot.sendPhoto(chatID, cars.find(c => c.name === car).image).then(resp => {
        bot.sendMessage(resp.chat.id, cars.find(c => c.name === car).description, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [[{ text: 'Оставить заявку'}, { text: 'Другое авто' }]],
                resize_keyboard: true,
                one_time_keyboard: false,
            }});
    });
}
bot.onText(/Zeekr 001/, (msg) => onSendCarInfo('Zeekr 001', msg.chat.id));
bot.onText(/Voyah Dreamer/, (msg) => onSendCarInfo('Voyah Dreamer', msg.chat.id));
bot.onText(/Nio ES8/, (msg) => onSendCarInfo('Nio ES8', msg.chat.id));
bot.onText(/BYD Song EV/, (msg) => onSendCarInfo('BYD Song EV', msg.chat.id));
bot.onText(/HiPhi Z/, (msg) => onSendCarInfo('HiPhi Z', msg.chat.id));
bot.onText(/Avatr 11/, (msg) => onSendCarInfo('Avatr 11', msg.chat.id));
bot.onText(/Lotus Eletre S+/, (msg) => onSendCarInfo('Lotus Eletre S+', msg.chat.id));
bot.onText(/GAC Trumchi M8/, (msg) => onSendCarInfo('GAC Trumchi M8', msg.chat.id));
bot.onText(/Haval H9/, (msg) => onSendCarInfo('Haval H9', msg.chat.id));
bot.onText(/Toyota Camry Q/, (msg) => onSendCarInfo('Toyota Camry Q', msg.chat.id));
bot.onText(/Changan UNI-K Flagship/, (msg) => onSendCarInfo('Changan UNI-K Flagship', msg.chat.id));
bot.onText(/Exeed LX/, (msg) => onSendCarInfo('Exeed LX', msg.chat.id));
bot.onText(/Tank 300/, (msg) => onSendCarInfo('Tank 300', msg.chat.id));
bot.onText(/Chery Tiggo 7 Plus/, (msg) => onSendCarInfo('Chery Tiggo 7 Plus', msg.chat.id));
bot.onText(/Li l9 Ma/, (msg) => onSendCarInfo('Li l9 Ma', msg.chat.id));
bot.onText(/Voyah Free/, (msg) => onSendCarInfo('Voyah Free', msg.chat.id));
bot.onText(/Geely Monjaro/, (msg) => onSendCarInfo('Geely Monjaro', msg.chat.id));
