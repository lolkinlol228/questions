export const LANGS = {
  ru: 'Русский',
  kg: 'Кыргызча',
  en: 'English'
};

export const UI = {
  ru: {
    title: 'Опрос о фитнес-клубе в городе Манас',
    subtitle: 'Локация проекта: ул. Курманбек, 24. Ориентиры: 14 школа и Jalal-Abad international university (JAIU). Анкета анонимная, контакт можно оставить только добровольно в конце.',
    chooseLang: 'Выберите язык', start: 'Начать опрос', next: 'Далее', back: 'Назад', submit: 'Отправить ответы',
    required: 'Ответьте на обязательные вопросы', saved: 'Черновик сохранён', submittedTitle: 'Спасибо, ваши ответы сохранены',
    submittedText: 'С этого устройства анкета уже была отправлена. Повторная отправка заблокирована, чтобы результаты не искажались.',
    restore: 'Мы восстановили незавершённые ответы. Можно продолжить с того места, где вы остановились.',
    clearDraft: 'Очистить черновик', progress: 'Шаг', optional: 'необязательно', selectMany: 'Можно выбрать несколько вариантов', other: 'Другое', yes: 'Да', no: 'Нет',
    timeNote: '3–5 минут', locationShort: 'Курманбек 24', anonymousShort: 'Анонимно', mobileNote: 'Удобно проходить с телефона: крупные варианты, автосохранение и короткие шаги.',
    answered: 'Отвечено', from: 'из', loadingError: 'Не удалось запустить анкету', reload: 'Обновить страницу'
  },
  kg: {
    title: 'Манас шаарындагы фитнес-клуб боюнча сурамжылоо',
    subtitle: 'Долбоордун жайгашкан жери: Курманбек көчөсү, 24. Багыт: 14-мектеп жана Jalal-Abad international university (JAIU). Сурамжылоо анонимдүү, байланышты акырында каалоо боюнча калтырсаңыз болот.',
    chooseLang: 'Тилди тандаңыз', start: 'Сурамжылоону баштоо', next: 'Кийинки', back: 'Артка', submit: 'Жоопторду жөнөтүү',
    required: 'Милдеттүү суроолорго жооп бериңиз', saved: 'Черновик сакталды', submittedTitle: 'Рахмат, жоопторуңуз сакталды',
    submittedText: 'Бул түзмөктөн анкета буга чейин жөнөтүлгөн. Натыйжалар бузулбашы үчүн кайра жөнөтүү бөгөттөлгөн.',
    restore: 'Бүтө элек жоопторуңуз калыбына келтирилди. Токтогон жериңизден уланта аласыз.',
    clearDraft: 'Черновикти тазалоо', progress: 'Кадам', optional: 'милдеттүү эмес', selectMany: 'Бир нече вариантты тандасаңыз болот', other: 'Башка', yes: 'Ооба', no: 'Жок',
    timeNote: '3–5 мүнөт', locationShort: 'Курманбек 24', anonymousShort: 'Анонимдүү', mobileNote: 'Телефондон өтүүгө ыңгайлуу: чоң варианттар, авто-сактоо жана кыска кадамдар.',
    answered: 'Жооп берилди', from: 'ичинен', loadingError: 'Анкетаны иштетүү мүмкүн болгон жок', reload: 'Баракты жаңыртуу'
  },
  en: {
    title: 'Survey about a fitness club in Manas city',
    subtitle: 'Project location: Kurmanbek Street 24. Landmarks: School No. 14 and Jalal-Abad international university (JAIU). The survey is anonymous; contact details are optional at the end.',
    chooseLang: 'Choose language', start: 'Start survey', next: 'Next', back: 'Back', submit: 'Submit answers',
    required: 'Please answer all required questions', saved: 'Draft saved', submittedTitle: 'Thank you, your answers have been saved',
    submittedText: 'This device has already submitted the survey. A second submission is blocked to keep the results clean.',
    restore: 'Your unfinished answers were restored. You can continue where you stopped.',
    clearDraft: 'Clear draft', progress: 'Step', optional: 'optional', selectMany: 'You can select multiple options', other: 'Other', yes: 'Yes', no: 'No',
    timeNote: '3–5 minutes', locationShort: 'Kurmanbek 24', anonymousShort: 'Anonymous', mobileNote: 'Built for phones: large choices, autosave and short steps.',
    answered: 'Answered', from: 'of', loadingError: 'Could not start the survey', reload: 'Reload page'
  }
};

const t = (ru, kg, en) => ({ ru, kg, en });
const opt = (value, ru, kg, en) => ({ value, label: t(ru, kg, en) });

export const OPTION_SETS = {
  segment: [
    opt('local', 'Местный житель', 'Жергиликтүү тургун', 'Local resident'),
    opt('family_parent', 'Семья / родитель', 'Үй-бүлө / ата-эне', 'Family / parent'),
    opt('work_nearby', 'Работаю рядом', 'Жакын жерде иштейм', 'I work nearby'),
    opt('jaiu_student', 'Студент JAIU', 'ЖАЭУ студенти', 'JAIU student'),
    opt('other_student', 'Студент другого учебного заведения', 'Башка окуу жайдын студенти', 'Student of another institution'),
    opt('other', 'Другое', 'Башка', 'Other')
  ],
  age_range: [
    opt('under_16', 'До 16', '16 жашка чейин', 'Under 16'),
    opt('16_17', '16–17', '16–17', '16–17'),
    opt('18_24', '18–24', '18–24', '18–24'),
    opt('25_34', '25–34', '25–34', '25–34'),
    opt('35_44', '35–44', '35–44', '35–44'),
    opt('45_54', '45–54', '45–54', '45–54'),
    opt('55_plus', '55+', '55+', '55+')
  ],
  gender: [
    opt('female', 'Женский', 'Аял', 'Female'),
    opt('male', 'Мужской', 'Эркек', 'Male'),
    opt('prefer_not', 'Предпочитаю не отвечать', 'Жооп бергим келбейт', 'Prefer not to answer')
  ],
  family_status: [
    opt('no_children', 'Без детей / не актуально', 'Баласыз / тиешеси жок', 'No children / not relevant'),
    opt('has_children', 'Есть дети', 'Балдарым бар', 'Have children'),
    opt('parent_needs_child_corner', 'Нужен детский уголок', 'Балдар бурчу керек', 'Need a children’s corner'),
    opt('family_membership', 'Интересен семейный абонемент', 'Үй-бүлөлүк абонемент кызыктуу', 'Interested in a family membership')
  ],
  understands_location: [
    opt('yes_clear', 'Да, понимаю где это', 'Ооба, кайда экенин түшүнөм', 'Yes, I know where it is'),
    opt('roughly', 'Примерно понимаю', 'Болжол менен түшүнөм', 'I roughly understand'),
    opt('no_need_map', 'Нет, нужна карта/объяснение', 'Жок, карта/түшүндүрмө керек', 'No, I need a map/explanation')
  ],
  daytime_location: [
    opt('near_site', 'Рядом с Курманбек 24 / 14 школой / JAIU', 'Курманбек 24 / 14-мектеп / ЖАЭУ жанында', 'Near Kurmanbek 24 / School No.14 / JAIU'),
    opt('other_manas', 'В другом районе города Манас', 'Манас шаарынын башка бөлүгүндө', 'Another area of Manas city'),
    opt('near_village', 'В пригороде или селе рядом', 'Шаар четинде же жакын айылда', 'Suburb or nearby village'),
    opt('outside_city', 'За пределами города', 'Шаардан тышкары', 'Outside the city'),
    opt('varies', 'По-разному', 'Ар кандай', 'Varies')
  ],
  travel_time: [
    opt('0_5', 'До 5 минут', '5 мүнөткө чейин', 'Up to 5 minutes'),
    opt('6_10', '6–10 минут', '6–10 мүнөт', '6–10 minutes'),
    opt('11_15', '11–15 минут', '11–15 мүнөт', '11–15 minutes'),
    opt('16_25', '16–25 минут', '16–25 мүнөт', '16–25 minutes'),
    opt('25_plus', 'Более 25 минут', '25 мүнөттөн көп', 'More than 25 minutes'),
    opt('not_ready', 'Не готов(а) специально ездить', 'Атайын барууга даяр эмесмин', 'Not ready to travel specifically')
  ],
  current_activity: [
    opt('none', 'Не занимаюсь', 'Машыкпайм', 'I do not exercise'),
    opt('home', 'Дома', 'Үйдө', 'At home'),
    opt('outdoor', 'На улице', 'Сыртта', 'Outdoors'),
    opt('gym', 'В фитнес-клубе', 'Фитнес-клубда', 'At a fitness club'),
    opt('team', 'В секции/команде', 'Секцияда/командада', 'In a sport section/team'),
    opt('other', 'Другое', 'Башка', 'Other')
  ],
  attended_gym_3m: [
    opt('regularly', 'Да, регулярно', 'Ооба, үзгүлтүксүз', 'Yes, regularly'),
    opt('sometimes', 'Да, иногда', 'Ооба, кээде', 'Yes, sometimes'),
    opt('before_not_now', 'Нет, но раньше ходил(а)', 'Жок, бирок мурда баргам', 'No, but I used to'),
    opt('never', 'Нет, никогда', 'Жок, эч качан', 'No, never')
  ],
  weekly_visits: [
    opt('1', '1 раз', '1 жолу', 'Once'),
    opt('2', '2 раза', '2 жолу', 'Twice'),
    opt('3', '3 раза', '3 жолу', '3 times'),
    opt('4_plus', '4 и более', '4 жана андан көп', '4 or more'),
    opt('irregular', 'Нерегулярно', 'Туруксуз', 'Irregularly'),
    opt('cannot', 'Скорее всего, не смог(ла) бы', 'Кыязы бара албайм', 'Most likely could not')
  ],
  monthly_price: [
    opt('under_1000', 'До 1000 сом', '1000 сомго чейин', 'Under 1000 KGS'),
    opt('1000_1500', '1000–1500 сом', '1000–1500 сом', '1000–1500 KGS'),
    opt('1500_2000', '1500–2000 сом', '1500–2000 сом', '1500–2000 KGS'),
    opt('2000_2500', '2000–2500 сом', '2000–2500 сом', '2000–2500 KGS'),
    opt('2500_3000', '2500–3000 сом', '2500–3000 сом', '2500–3000 KGS'),
    opt('3000_plus', 'Более 3000 сом', '3000 сомдон жогору', 'More than 3000 KGS'),
    opt('not_ready_monthly', 'Не готов(а) платить ежемесячно', 'Ай сайын төлөөгө даяр эмесмин', 'Not ready to pay monthly'),
    opt('not_paid', 'Не платил(а)', 'Төлөгөн эмесмин', 'Did not pay')
  ],
  refusal_price: [
    opt('1500', '1500 сом', '1500 сом', '1500 KGS'),
    opt('2000', '2000 сом', '2000 сом', '2000 KGS'),
    opt('2500', '2500 сом', '2500 сом', '2500 KGS'),
    opt('3000', '3000 сом', '3000 сом', '3000 KGS'),
    opt('3500_plus', '3500 сом и выше', '3500 сом жана жогору', '3500 KGS and above'),
    opt('hard_to_say', 'Затрудняюсь ответить', 'Айта албайм', 'Hard to say')
  ],
  goals: [
    opt('health', 'Здоровье', 'Ден соолук', 'Health'),
    opt('weight_loss', 'Похудение', 'Арыктоо', 'Weight loss'),
    opt('muscle', 'Набор мышц', 'Булчуң өстүрүү', 'Muscle gain'),
    opt('shape', 'Поддержание формы', 'Форманы сактоо', 'Staying in shape'),
    opt('stress', 'Снятие стресса', 'Стресстен арылуу', 'Stress relief'),
    opt('back_rehab', 'Спина / реабилитация', 'Арка / реабилитация', 'Back / rehabilitation'),
    opt('motivation', 'Общение / мотивация', 'Баарлашуу / мотивация', 'Social / motivation'),
    opt('event', 'Подготовка к событию', 'Иш-чарага даярдануу', 'Preparing for an event')
  ],
  barriers: [
    opt('price', 'Высокая цена', 'Баасы жогору', 'High price'),
    opt('far', 'Далеко', 'Алыс', 'Too far'),
    opt('time', 'Нет времени', 'Убакыт жок', 'No time'),
    opt('schedule', 'Неудобное расписание', 'Ыңгайсыз график', 'Inconvenient schedule'),
    opt('no_women_zone', 'Нет женской зоны', 'Аялдар зонасы жок', 'No women’s area'),
    opt('privacy', 'Недостаточная приватность', 'Купуялуулук жетишсиз', 'Not enough privacy'),
    opt('trust', 'Нет доверия к залам', 'Залдарга ишеним жок', 'Do not trust gyms'),
    opt('childcare', 'Не с кем оставить ребёнка', 'Баланы калтыра турган адам жок', 'No one to leave a child with'),
    opt('beginner', 'Не знаю, с чего начать', 'Кайдан баштоону билбейм', 'Do not know how to start'),
    opt('language', 'Языковой барьер', 'Тил тоскоолдугу', 'Language barrier')
  ],
  interest: [
    opt('very', 'Очень интересно', 'Абдан кызыктуу', 'Very interested'),
    opt('rather', 'Скорее интересно', 'Кызыктуу', 'Rather interested'),
    opt('neutral', 'Нейтрально', 'Нейтралдуу', 'Neutral'),
    opt('rather_not', 'Скорее неинтересно', 'Анча кызык эмес', 'Rather not interested'),
    opt('no', 'Неинтересно', 'Кызыктуу эмес', 'Not interested')
  ],
  probability: [
    opt('definitely', 'Точно приду', 'Так барам', 'Definitely will come'),
    opt('likely', 'Скорее приду', 'Барам окшойм', 'Likely will come'),
    opt('maybe', 'Возможно', 'Мүмкүн', 'Maybe'),
    opt('unlikely', 'Скорее не приду', 'Барбайм окшойм', 'Unlikely'),
    opt('no', 'Точно не приду', 'Definitely will not come')
  ],
  location_convenience: [
    opt('very_convenient', 'Очень удобно', 'Абдан ыңгайлуу', 'Very convenient'),
    opt('convenient', 'Скорее удобно', 'Ыңгайлуу', 'Rather convenient'),
    opt('neutral', 'Нейтрально', 'Нейтралдуу', 'Neutral'),
    opt('inconvenient', 'Скорее неудобно', 'Анча ыңгайлуу эмес', 'Rather inconvenient'),
    opt('very_inconvenient', 'Неудобно', 'Ыңгайлуу эмес', 'Inconvenient'),
    opt('need_transport', 'Зависит от транспорта/парковки', 'Транспорт/унаа токтотуучу жайга жараша', 'Depends on transport/parking')
  ],
  preferred_time: [
    opt('06_09', '06:00–09:00', '06:00–09:00', '06:00–09:00'),
    opt('09_12', '09:00–12:00', '09:00–12:00', '09:00–12:00'),
    opt('12_16', '12:00–16:00', '12:00–16:00', '12:00–16:00'),
    opt('16_19', '16:00–19:00', '16:00–19:00', '16:00–19:00'),
    opt('19_22', '19:00–22:00', '19:00–22:00', '19:00–22:00'),
    opt('weekends', 'Только выходные', 'Дем алыш күндөрү гана', 'Weekends only')
  ],
  services: [
    opt('gym', 'Тренажёрный зал', 'Тренажёр залы', 'Gym'),
    opt('cardio', 'Кардио-зона', 'Кардио-зона', 'Cardio area'),
    opt('group', 'Групповые занятия', 'Топтук сабактар', 'Group classes'),
    opt('personal_trainer', 'Персональный тренер', 'Жеке машыктыруучу', 'Personal trainer'),
    opt('women_training', 'Женские тренировки', 'Аялдар машыгуулары', 'Women’s training'),
    opt('child_corner', 'Детский уголок', 'Балдар бурчу', 'Children’s corner'),
    opt('fitness_bar', 'Фитнес-бар', 'Фитнес-бар', 'Fitness bar'),
    opt('beginner_program', 'Программы для начинающих', 'Жаңы баштагандарга программа', 'Beginner programs'),
    opt('yoga_stretch', 'Йога / растяжка', 'Йога / чоюлуу', 'Yoga / stretching')
  ],
  pay_more_for: [
    opt('women_zone', 'Отдельная женская зона', 'Өзүнчө аялдар зонасы', 'Separate women’s area'),
    opt('female_staff', 'Женский персонал', 'Аял кызматкерлер', 'Female staff'),
    opt('hot_water', 'Горячая вода и душевые', 'Ысык суу жана душ', 'Hot water and showers'),
    opt('new_equipment', 'Новые тренажёры', 'Жаңы тренажёрлор', 'New equipment'),
    opt('group_classes', 'Групповые занятия', 'Топтук сабактар', 'Group classes'),
    opt('personal_trainer', 'Персональный тренер', 'Жеке машыктыруучу', 'Personal trainer'),
    opt('child_corner', 'Детский уголок', 'Балдар бурчу', 'Children’s corner'),
    opt('english', 'Английский язык', 'Англис тили', 'English language'),
    opt('nothing', 'Не готов(а) платить больше', 'Көбүрөөк төлөөгө даяр эмесмин', 'Not ready to pay more')
  ],
  payment_format: [
    opt('single_visit', 'Разовое посещение', 'Бир жолку баруу', 'Single visit'),
    opt('8_visits', 'Абонемент на 8 посещений', '8 жолу барууга абонемент', '8-visit package'),
    opt('monthly', 'Месячный абонемент', 'Айлык абонемент', 'Monthly membership'),
    opt('quarterly', 'Квартальный абонемент', 'Чейректик абонемент', 'Quarterly membership'),
    opt('family', 'Семейный абонемент', 'Үй-бүлөлүк абонемент', 'Family membership'),
    opt('student', 'Студенческий тариф', 'Студенттик тариф', 'Student tariff'),
    opt('corporate', 'Корпоративный тариф', 'Корпоративдик тариф', 'Corporate tariff')
  ],
  pre_opening_action: [
    opt('contact', 'Оставить контакт', 'Байланыш калтырам', 'Leave contact'),
    opt('trial', 'Записаться на бесплатный пробный день', 'Акысыз сыноо күнүнө жазылам', 'Register for a free trial day'),
    opt('buy1', 'Купить первый месяц со скидкой', 'Биринчи айды арзандатуу менен алам', 'Buy first month with discount'),
    opt('buy3', 'Купить 3 месяца со скидкой', '3 айды арзандатуу менен алам', 'Buy 3 months with discount'),
    opt('watch', 'Пока только наблюдать', 'Азырынча байкап турам', 'Just watching for now'),
    opt('not_interested', 'Не интересно', 'Кызыктуу эмес', 'Not interested')
  ],
  info_language: [
    opt('ru', 'Русский', 'Орусча', 'Russian'),
    opt('kg', 'Кыргызча', 'Кыргызча', 'Kyrgyz'),
    opt('en', 'English', 'English', 'English'),
    opt('hi_ur', 'Hindi / Urdu', 'Hindi / Urdu', 'Hindi / Urdu'),
    opt('not_important', 'Не важно', 'Маанилүү эмес', 'Not important')
  ],
  attend_with: [
    opt('alone', 'Один/одна', 'Жалгыз', 'Alone'),
    opt('one_friend', 'С 1 другом', '1 дос менен', 'With one friend'),
    opt('group', 'С группой друзей', 'Достор тобу менен', 'With a group of friends'),
    opt('depends_price', 'Зависит от цены', 'Баасына жараша', 'Depends on price'),
    opt('not_plan', 'Не планирую ходить', 'Барууну пландабайм', 'Do not plan to attend')
  ],
  mixed_comfort: [
    opt('comfortable', 'Комфортно', 'Ыңгайлуу', 'Comfortable'),
    opt('rather_comfortable', 'Скорее комфортно', 'Көбүнчө ыңгайлуу', 'Rather comfortable'),
    opt('neutral', 'Нейтрально', 'Нейтралдуу', 'Neutral'),
    opt('depends_rules', 'Зависит от правил и расписания', 'Эрежелерге жана графикке жараша', 'Depends on rules and schedule'),
    opt('uncomfortable', 'Некомфортно', 'Ыңгайсыз', 'Uncomfortable')
  ],
  local_rules: [
    opt('clear_rules', 'Чёткие правила поведения', 'Так жүрүм-турум эрежелери', 'Clear rules of behavior'),
    opt('admin_control', 'Контроль администратора', 'Администратордун көзөмөлү', 'Administrator control'),
    opt('separate_zones', 'Раздельные зоны', 'Өзүнчө зоналар', 'Separate areas'),
    opt('women_hours', 'Отдельные часы для женщин', 'Аялдар үчүн өзүнчө убакыт', 'Separate hours for women'),
    opt('female_staff', 'Женский персонал в женской зоне', 'Аялдар зонасында аял кызматкерлер', 'Female staff in women’s area'),
    opt('family_atmosphere', 'Семейная атмосфера', 'Үй-бүлөлүк атмосфера', 'Family atmosphere'),
    opt('cleanliness', 'Чистота и душевые', 'Тазалык жана душ', 'Cleanliness and showers'),
    opt('affordable_price', 'Доступная цена', 'Жеткиликтүү баа', 'Affordable price'),
    opt('not_problem', 'Для меня это не проблема', 'Мен үчүн бул көйгөй эмес', 'Not a problem for me')
  ],
  separate_hours: [
    opt('no', 'Нет, не нужно', 'Жок, кереги жок', 'No, not needed'),
    opt('women', 'Да, отдельные часы для женщин', 'Ооба, аялдар үчүн өзүнчө убакыт', 'Yes, separate women’s hours'),
    opt('students', 'Да, отдельные часы для студентов', 'Ооба, студенттер үчүн өзүнчө убакыт', 'Yes, separate student hours'),
    opt('family', 'Да, отдельные семейные часы', 'Ооба, үй-бүлөлөр үчүн өзүнчө убакыт', 'Yes, separate family hours'),
    opt('hard_to_say', 'Затрудняюсь ответить', 'Айта албайм', 'Hard to say')
  ],
  yes_no: [
    opt('yes', 'Да', 'Ооба', 'Yes'),
    opt('no', 'Нет', 'Жок', 'No')
  ]
};

export const SECTIONS = [
  { id: 'profile', title: t('1. Кто отвечает', '1. Ким жооп берип жатат', '1. Respondent profile') },
  { id: 'location', title: t('2. Локация и доступность', '2. Жайгашкан жери жана жетүү', '2. Location and access') },
  { id: 'behavior', title: t('3. Текущее поведение', '3. Азыркы жүрүм-турум', '3. Current behavior') },
  { id: 'needs', title: t('4. Барьеры и потребности', '4. Тоскоолдуктар жана муктаждыктар', '4. Barriers and needs') },
  { id: 'concept', title: t('5. Концепция клуба', '5. Клуб концепциясы', '5. Club concept') },
  { id: 'price', title: t('6. Цена и покупка', '6. Баа жана сатып алуу', '6. Price and purchase') },
  { id: 'segment_specific', title: t('7. Уточняющие вопросы', '7. Тактоочу суроолор', '7. Additional questions') },
  { id: 'contact', title: t('8. Контакт и комментарий', '8. Байланыш жана пикир', '8. Contact and comment') }
];

export const QUESTIONS = [
  { id: 'segment', section: 'profile', type: 'radio', required: true, options: 'segment', title: t('Кто вы?', 'Сиз кимсиз?', 'Which group do you belong to?') },
  { id: 'age_range', section: 'profile', type: 'radio', required: true, options: 'age_range', title: t('Ваш возраст?', 'Жашыңыз канча?', 'What is your age?') },
  { id: 'gender', section: 'profile', type: 'radio', required: true, options: 'gender', title: t('Ваш пол?', 'Жынысыңыз?', 'What is your gender?') },
  { id: 'family_status', section: 'profile', type: 'checkbox', required: false, options: 'family_status', title: t('Что важно знать про семью/детей?', 'Үй-бүлө/балдар боюнча эмне маанилүү?', 'What is important about family/children?') },

  { id: 'understands_location', section: 'location', type: 'radio', required: true, options: 'understands_location', title: t('Понимаете ли вы, где находится предполагаемая локация: ул. Курманбек, 24, ориентир — 14 школа и JAIU?', 'Болжолдуу жайгашкан жерди түшүнөсүзбү: Курманбек көчөсү, 24, багыт — 14-мектеп жана ЖАЭУ?', 'Do you understand the proposed location: Kurmanbek Street 24, near School No.14 and JAIU?') },
  { id: 'daytime_location', section: 'location', type: 'radio', required: true, options: 'daytime_location', title: t('Где вы чаще всего находитесь в течение дня?', 'Күндүз көбүнчө кайсы жерде болосуз?', 'Where do you usually spend most of your day?') },
  { id: 'travel_time', section: 'location', type: 'radio', required: true, options: 'travel_time', title: t('Сколько времени вам было бы удобно добираться до клуба?', 'Клубга жетүүгө канча убакыт ыңгайлуу болот?', 'What travel time to the club would be convenient for you?') },
  { id: 'location_convenience', section: 'location', type: 'radio', required: true, options: 'location_convenience', title: t('Насколько удобна для вас эта локация?', 'Бул жайгашкан жер сиз үчүн канчалык ыңгайлуу?', 'How convenient is this location for you?') },

  { id: 'current_activity', section: 'behavior', type: 'radio', required: true, options: 'current_activity', title: t('Как вы сейчас занимаетесь спортом или физической активностью?', 'Азыр спорт же физикалык активдүүлүк менен кантип алектенесиз?', 'How do you currently do sports or physical activity?') },
  { id: 'attended_gym_3m', section: 'behavior', type: 'radio', required: true, options: 'attended_gym_3m', title: t('Ходили ли вы в фитнес-клуб за последние 3 месяца?', 'Акыркы 3 айда фитнес-клубга бардыңызбы?', 'Have you attended a fitness club in the last 3 months?') },
  { id: 'weekly_visits', section: 'behavior', type: 'radio', required: true, options: 'weekly_visits', title: t('Сколько раз в неделю вы реально могли бы посещать фитнес-клуб?', 'Фитнес-клубга жумасына канча жолу реалдуу бара алмаксыз?', 'How many times per week could you realistically attend a fitness club?') },
  { id: 'current_monthly_price', section: 'behavior', type: 'radio', required: false, options: 'monthly_price', title: t('Сколько вы сейчас платите или раньше платили за месяц фитнеса?', 'Фитнес үчүн айына канча төлөйсүз же мурда төлөгөнсүз?', 'How much do you currently pay or used to pay per month for fitness?') },

  { id: 'goals', section: 'needs', type: 'checkbox', required: true, options: 'goals', title: t('Какая главная цель занятий для вас?', 'Машыгуунун негизги максаты эмне?', 'What is your main goal for training?') },
  { id: 'barriers', section: 'needs', type: 'checkbox', required: true, options: 'barriers', title: t('Что мешает вам регулярно ходить в фитнес-клуб?', 'Фитнес-клубга үзгүлтүксүз барууга эмне тоскоол болот?', 'What prevents you from attending a fitness club regularly?') },
  { id: 'importance_location', section: 'needs', type: 'scale', required: true, title: t('Насколько важна близость клуба к дому, учёбе или работе?', 'Клубдун үйгө, окууга же жумушка жакындыгы канчалык маанилүү?', 'How important is the club being close to home, study or work?') },
  { id: 'importance_cleanliness', section: 'needs', type: 'scale', required: true, title: t('Насколько важны чистота, душевые и горячая вода?', 'Тазалык, душ жана ысык суу канчалык маанилүү?', 'How important are cleanliness, showers and hot water?') },
  { id: 'importance_equipment', section: 'needs', type: 'scale', required: true, title: t('Насколько важны новые и исправные тренажёры?', 'Жаңы жана ишенимдүү тренажёрлор канчалык маанилүү?', 'How important are new and well-maintained machines?') },
  { id: 'importance_safety', section: 'needs', type: 'scale', required: true, title: t('Насколько важны порядок, безопасность и контроль администратора?', 'Тартип, коопсуздук жана администратордун көзөмөлү канчалык маанилүү?', 'How important are order, safety and administrator control?') },
  { id: 'importance_separate_zones', section: 'needs', type: 'scale', required: true, title: t('Насколько важны отдельные мужская и женская зоны?', 'Эркектер жана аялдар үчүн өзүнчө зоналар канчалык маанилүү?', 'How important are separate male and female areas?') },
  { id: 'importance_privacy', section: 'needs', type: 'scale', required: true, title: t('Насколько важна приватность женской зоны?', 'Аялдар зонасынын купуялуулугу канчалык маанилүү?', 'How important is privacy in the women’s area?') },
  { id: 'importance_female_staff', section: 'needs', type: 'scale', required: true, title: t('Насколько важен женский персонал в женской зоне?', 'Аялдар зонасында аял кызматкерлердин болушу канчалык маанилүү?', 'How important is female staff in the women’s area?') },

  { id: 'concept_interest', section: 'concept', type: 'radio', required: true, options: 'interest', title: t('Если в городе Манас откроется фитнес-клуб с отдельными мужской и женской зонами, насколько вам это интересно?', 'Эгер Манас шаарында эркектер жана аялдар үчүн өзүнчө зоналары бар фитнес-клуб ачылса, сизге канчалык кызыктуу?', 'If a fitness club with separate male and female areas opens in Manas city, how interested would you be?') },
  { id: 'first_month_probability', section: 'concept', type: 'radio', required: true, options: 'probability', title: t('Насколько вероятно, что вы посетите такой клуб в первый месяц после открытия?', 'Клуб ачылгандан кийинки биринчи айда барууңуз канчалык ыктымал?', 'How likely are you to visit during the first month after opening?') },
  { id: 'preferred_time', section: 'concept', type: 'radio', required: true, options: 'preferred_time', title: t('В какое время вам удобнее заниматься?', 'Кайсы убакта машыгуу ыңгайлуу?', 'What time is most convenient for you to train?') },
  { id: 'wanted_services', section: 'concept', type: 'checkbox', required: true, options: 'services', title: t('Какие услуги вы хотели бы видеть в клубе?', 'Клубда кандай кызматтарды көргүңүз келет?', 'Which services would you like to have in the club?') },

  { id: 'affordable_price', section: 'price', type: 'radio', required: true, options: 'monthly_price', title: t('Какая цена месячного абонемента кажется вам доступной?', 'Айлык абонементтин кайсы баасы сиз үчүн жеткиликтүү?', 'What monthly membership price seems affordable to you?') },
  { id: 'refusal_price', section: 'price', type: 'radio', required: true, options: 'refusal_price', title: t('При какой цене за месяц вы бы уже отказались от покупки?', 'Айына кайсы баада сатып алуудан баш тартмаксыз?', 'At what monthly price would you refuse to buy?') },
  { id: 'pay_more_for', section: 'price', type: 'checkbox', required: true, options: 'pay_more_for', title: t('За что вы готовы платить больше?', 'Кайсы нерселер үчүн көбүрөөк төлөөгө даярсыз?', 'What would you be willing to pay more for?') },
  { id: 'payment_format', section: 'price', type: 'radio', required: true, options: 'payment_format', title: t('Какой формат оплаты вам удобнее?', 'Төлөмдүн кайсы форматы ыңгайлуу?', 'Which payment format is most convenient for you?') },
  { id: 'pre_opening_action', section: 'price', type: 'radio', required: true, options: 'pre_opening_action', title: t('Если клуб предложит скидку до открытия, что вы готовы сделать?', 'Клуб ачылганга чейин арзандатуу сунушталса, эмне кылууга даярсыз?', 'If the club offers a pre-opening discount, what would you be ready to do?') },

  { id: 'student_institution', section: 'segment_specific', type: 'text', required: true, showIf: a => a.segment === 'other_student', title: t('Укажите название вашего учебного заведения', 'Окуу жайыңыздын атын жазыңыз', 'Please write the name of your educational institution') },
  { id: 'jaiu_info_language', section: 'segment_specific', type: 'radio', required: true, options: 'info_language', showIf: a => a.segment === 'jaiu_student', title: t('На каком языке вам удобнее получать информацию о клубе?', 'Клуб жөнүндө маалыматты кайсы тилде алган ыңгайлуу?', 'Which language is most convenient for club information?') },
  { id: 'jaiu_english_staff_importance', section: 'segment_specific', type: 'scale', required: true, showIf: a => a.segment === 'jaiu_student', title: t('Насколько важен англоговорящий администратор или тренер?', 'Англисче сүйлөгөн администратор же машыктыруучу канчалык маанилүү?', 'How important is an English-speaking administrator or trainer?') },
  { id: 'jaiu_student_price', section: 'segment_specific', type: 'radio', required: true, options: 'monthly_price', showIf: a => a.segment === 'jaiu_student', title: t('Сколько вы готовы платить за студенческий месячный абонемент?', 'Студенттик айлык абонемент үчүн канча төлөөгө даярсыз?', 'How much are you ready to pay for a student monthly membership?') },
  { id: 'jaiu_attend_with', section: 'segment_specific', type: 'radio', required: true, options: 'attend_with', showIf: a => a.segment === 'jaiu_student', title: t('Вы бы ходили один/одна или с друзьями?', 'Жалгыз барасызбы же досторуңуз мененби?', 'Would you attend alone or with friends?') },
  { id: 'other_student_tariff', section: 'segment_specific', type: 'radio', required: true, options: 'monthly_price', showIf: a => a.segment === 'other_student', title: t('Какой студенческий тариф был бы для вас реальным?', 'Кайсы студенттик тариф сиз үчүн реалдуу?', 'What student tariff would be realistic for you?') },
  { id: 'local_mixed_audience_comfort', section: 'segment_specific', type: 'radio', required: true, options: 'mixed_comfort', showIf: a => ['local','family_parent','work_nearby','other'].includes(a.segment), title: t('Повлияет ли на ваше решение то, что клубом могут пользоваться иностранные студенты, в том числе студенты из Индии?', 'Клубду чет өлкөлүк студенттер, анын ичинде Индиядан келген студенттер колдонсо, бул чечимиңизге таасир этеби?', 'Would it affect your decision if foreign students, including students from India, also use the club?') },
  { id: 'local_rules_needed', section: 'segment_specific', type: 'checkbox', required: true, options: 'local_rules', showIf: a => ['local','family_parent','work_nearby','other'].includes(a.segment), title: t('Что сделало бы клуб комфортным для вас и вашей семьи?', 'Клуб сиз жана үй-бүлөңүз үчүн ыңгайлуу болушу үчүн эмне маанилүү?', 'What would make the club comfortable for you and your family?') },
  { id: 'local_separate_hours', section: 'segment_specific', type: 'radio', required: true, options: 'separate_hours', showIf: a => ['local','family_parent','work_nearby','other'].includes(a.segment), title: t('Нужны ли отдельные часы или расписание для разных групп?', 'Ар кандай топтор үчүн өзүнчө убакыт же график керекпи?', 'Are separate hours or schedules needed for different groups?') },

  { id: 'comment', section: 'contact', type: 'textarea', required: false, title: t('Что для вас самое важное в таком фитнес-клубе?', 'Мындай фитнес-клубда сиз үчүн эң маанилүүсү эмне?', 'What is most important to you in this fitness club?') },
  { id: 'wants_contact', section: 'contact', type: 'radio', required: true, options: 'yes_no', title: t('Хотите оставить контакт для пробного дня или скидки?', 'Сыноо күнү же арзандатуу үчүн байланыш калтыргыңыз келеби?', 'Would you like to leave contact details for a trial day or discount?') },
  { id: 'contact', section: 'contact', type: 'text', required: false, showIf: a => a.wants_contact === 'yes', title: t('Ваш WhatsApp/Telegram или номер телефона', 'WhatsApp/Telegram же телефон номериңиз', 'Your WhatsApp/Telegram or phone number') }
];

export function L(value, lang = 'ru') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.ru || Object.values(value)[0] || '';
}

export function getOptionSet(name) {
  return OPTION_SETS[name] || [];
}

export function labelFor(questionId, value, lang = 'ru') {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.map(v => labelFor(questionId, v, lang)).join(', ');
  if (questionId === 'lang') return LANGS[value] || value;
  const q = QUESTIONS.find(item => item.id === questionId);
  if (!q || !q.options) return String(value);
  const found = getOptionSet(q.options).find(o => o.value === value);
  return found ? L(found.label, lang) : String(value);
}

export function visibleQuestions(answers) {
  return QUESTIONS.filter(q => !q.showIf || q.showIf(answers || {}));
}

export function visibleSections(answers) {
  const visible = visibleQuestions(answers);
  return SECTIONS.filter(section => visible.some(q => q.section === section.id));
}

export function questionsForSection(sectionId, answers) {
  return visibleQuestions(answers).filter(q => q.section === sectionId);
}

export function isLocalSegment(segment) {
  return ['local', 'family_parent', 'work_nearby', 'other'].includes(segment);
}
