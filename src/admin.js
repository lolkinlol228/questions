import './styles.css';
import { supabase, ADMIN_REQUIRE_AUTH } from './supabaseClient.js';
import { LANGS, QUESTIONS, L, labelFor, getOptionSet, isLocalSegment } from './questions.js';

const adminApp = document.querySelector('#adminApp');
const RU = 'ru';
const ageOrder = ['under_16','16_17','18_24','25_34','35_44','45_54','55_plus'];
const moneyOrder = ['under_1000','1000_1500','1500_2000','2000_2500','2500_3000','3000_plus','not_ready_monthly','not_paid'];
const segmentOrder = ['local','family_parent','work_nearby','jaiu_student','other_student','other'];
const langOrder = ['ru','kg','en'];
const leadOrder = ['strong','warm','weak'];
const blank = '__blank__';

let allRows = [];
let filteredRows = [];
let filters = { lang: 'all', segment: 'all', age_range: 'all', gender: 'all', lead_level: 'all', contact: 'all', date_from: '', date_to: '' };
let builder = { row: 'age_range', col: 'affordable_price', onlyStrong: false, normalize: 'count' };
let sectionState = { deepSearch: '', deepGroup: 'all' };
let cohort = { dims: ['lang', 'age_range', 'segment', 'affordable_price'], metric: 'strong_pct', minSize: 1, sort: 'strong_pct_desc' };

const SPECIAL_DIMENSIONS = [
  { id: 'lang', type: 'radio', title: 'Язык анкеты' },
  { id: 'lead_level', type: 'radio', title: 'Сила лида' },
  { id: 'lead_score_bucket', type: 'radio', title: 'Lead score' },
  { id: 'contact_status', type: 'radio', title: 'Контакт оставлен' },
  { id: 'local_or_student', type: 'radio', title: 'Местные / студенты' },
  { id: 'price_ready_2000', type: 'radio', title: 'Готовность к цене 2000+ сом' },
  { id: 'prepay_status', type: 'radio', title: 'Готовность к предоплате' },
  { id: 'location_ok', type: 'radio', title: 'Локация удобна' }
];
const DIMENSIONS = [...SPECIAL_DIMENSIONS, ...QUESTIONS].filter((q, i, arr) => arr.findIndex(x => x.id === q.id) === i);

function pct(n, total) { return total ? `${Math.round((n / total) * 100)}%` : '0%'; }
function n(v) { return Number(v || 0); }
function byDateDesc(a,b) { return new Date(b.created_at) - new Date(a.created_at); }
function escapeHtml(str) { return String(str ?? '').replace(/[&<>'"]/g, s => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[s])); }
function csvCell(value) { if (Array.isArray(value)) value = value.join('|'); return `"${String(value ?? '').replace(/"/g, '""')}"`; }
function dim(id) { return DIMENSIONS.find(d => d.id === id) || { id, title: id, type: 'radio' }; }
function q(id) { return QUESTIONS.find(item => item.id === id); }
function dimTitle(id) { const d = dim(id); return typeof d.title === 'string' ? d.title : L(d.title, RU); }
function isCheckbox(id) { return dim(id).type === 'checkbox'; }
function isScale(id) { return dim(id).type === 'scale'; }
function isText(id) { return ['text','textarea'].includes(dim(id).type); }

function rawValue(row, id) {
  switch (id) {
    case 'lead_score_bucket': {
      const s = n(row.lead_score);
      if (s >= 80) return '80_100';
      if (s >= 60) return '60_79';
      if (s >= 40) return '40_59';
      if (s >= 20) return '20_39';
      return '0_19';
    }
    case 'contact_status': return row.contact ? 'with_contact' : 'no_contact';
    case 'local_or_student': return isLocalSegment(row.segment) ? 'local_base' : (row.segment === 'jaiu_student' || row.segment === 'other_student' ? 'student_base' : 'other');
    case 'price_ready_2000': return ['2000_2500','2500_3000','3000_plus'].includes(row.affordable_price) ? 'ready_2000_plus' : (row.affordable_price ? 'below_2000_or_no' : blank);
    case 'prepay_status': return ['buy1','buy3'].includes(row.pre_opening_action) ? 'prepay' : (['leave_contact','trial_day'].includes(row.pre_opening_action) ? 'soft_action' : 'no_action');
    case 'location_ok': return ['very_convenient','convenient'].includes(row.location_convenience) ? 'location_ok' : (row.location_convenience ? 'location_not_ok' : blank);
    default: return row[id];
  }
}

function valueLabel(id, value) {
  if (value === blank || value === null || value === undefined || value === '') return 'Не отвечено / не показывалось';
  if (id === 'lead_level') return ({ strong: 'Сильный', warm: 'Тёплый', weak: 'Слабый' })[value] || String(value);
  if (id === 'lead_score_bucket') return ({ '80_100':'80–100', '60_79':'60–79', '40_59':'40–59', '20_39':'20–39', '0_19':'0–19' })[value] || String(value);
  if (id === 'contact_status') return ({ with_contact:'Оставил контакт', no_contact:'Без контакта' })[value] || String(value);
  if (id === 'local_or_student') return ({ local_base:'Местная база', student_base:'Студенты', other:'Другое' })[value] || String(value);
  if (id === 'price_ready_2000') return ({ ready_2000_plus:'Готов к 2000+ сом', below_2000_or_no:'Ниже 2000 / не готов' })[value] || String(value);
  if (id === 'prepay_status') return ({ prepay:'Готов к предоплате', soft_action:'Контакт / пробный день', no_action:'Наблюдает / не интересно' })[value] || String(value);
  if (id === 'location_ok') return ({ location_ok:'Локация удобна', location_not_ok:'Локация спорная' })[value] || String(value);
  return labelFor(id, value, RU);
}

function questionOptions(id) {
  if (id === 'lang') return langOrder;
  if (id === 'lead_level') return leadOrder;
  if (id === 'lead_score_bucket') return ['80_100','60_79','40_59','20_39','0_19'];
  if (id === 'contact_status') return ['with_contact','no_contact'];
  if (id === 'local_or_student') return ['local_base','student_base','other'];
  if (id === 'price_ready_2000') return ['ready_2000_plus','below_2000_or_no'];
  if (id === 'prepay_status') return ['prepay','soft_action','no_action'];
  if (id === 'location_ok') return ['location_ok','location_not_ok'];
  if (isScale(id)) return [5,4,3,2,1];
  const found = q(id);
  if (found?.options) return getOptionSet(found.options).map(o => o.value);
  return [];
}

function orderedValues(id, rows, limit = 40) {
  const base = questionOptions(id);
  const seen = new Set();
  const add = v => { if (v !== undefined && v !== null && v !== '') seen.add(String(v)); };
  rows.forEach(r => {
    const val = rawValue(r, id);
    if (Array.isArray(val)) val.forEach(add);
    else add(val);
  });
  if (rows.some(r => {
    const val = rawValue(r, id);
    return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
  })) seen.add(blank);
  let result = [];
  if (base.length) {
    const baseStrings = base.map(String);
    result = baseStrings.filter(v => seen.has(v));
    [...seen].forEach(v => { if (!baseStrings.includes(v)) result.push(v); });
  } else {
    result = [...seen].sort((a,b) => countFor(rows, id, b) - countFor(rows, id, a));
  }
  if (id === 'age_range') result.sort((a,b) => ageOrder.indexOf(a) - ageOrder.indexOf(b));
  if (id === 'affordable_price' || id === 'current_monthly_price' || id === 'jaiu_student_price' || id === 'other_student_tariff') result.sort((a,b) => moneyOrder.indexOf(a) - moneyOrder.indexOf(b));
  if (id === 'segment') result.sort((a,b) => segmentOrder.indexOf(a) - segmentOrder.indexOf(b));
  if (id === 'lang') result.sort((a,b) => langOrder.indexOf(a) - langOrder.indexOf(b));
  return result.slice(0, limit);
}

function matches(row, id, value) {
  const val = rawValue(row, id);
  if (value === blank) return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
  if (Array.isArray(val)) return val.map(String).includes(String(value));
  return String(val) === String(value);
}
function countFor(rows, id, value) { return rows.filter(r => matches(r, id, value)).length; }
function countBy(rows, id, limit = 40) { return orderedValues(id, rows, limit).map(v => ({ value: v, count: countFor(rows, id, v) })); }
function avg(arr) { return arr.length ? arr.reduce((s, v) => s + Number(v), 0) / arr.length : null; }

async function ensureAuth() {
  if (!ADMIN_REQUIRE_AUTH) return true;
  const { data } = await supabase.auth.getSession();
  if (data?.session) return true;
  renderLogin();
  return false;
}
function renderLogin(error = '') {
  adminApp.innerHTML = `<main class="page-shell single-card"><section class="card login-card"><div class="badge">Admin</div><h1>Вход в админ-панель</h1><p>Анкета для людей работает без регистрации. Вход нужен только для просмотра ответов, потому что там могут быть контакты.</p><form id="loginForm" class="login-form"><label>Email администратора<input type="email" name="email" required></label><label>Пароль<input type="password" name="password" required></label>${error ? `<div class="error">${escapeHtml(error)}</div>` : ''}<button class="primary" type="submit">Войти</button></form></section></main>`;
  adminApp.querySelector('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
    if (error) renderLogin(error.message);
    else init();
  });
}
async function fetchAllRows() {
  const rows = [];
  let from = 0;
  const size = 1000;
  while (true) {
    const { data, error } = await supabase.from('survey_responses').select('*').order('created_at', { ascending: false }).range(from, from + size - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < size) break;
    from += size;
  }
  return rows;
}
async function init() {
  const ok = await ensureAuth();
  if (!ok) return;
  adminApp.innerHTML = `<main class="admin-shell"><section class="card"><h1>Загрузка статистики...</h1></section></main>`;
  try {
    allRows = await fetchAllRows();
    filteredRows = [...allRows];
    renderAdmin();
  } catch (e) {
    adminApp.innerHTML = `<main class="page-shell single-card"><section class="card"><h1>Не удалось загрузить ответы</h1><p>Проверьте Supabase URL, anon key, SQL-политики и доступ администратора.</p><div class="error">${escapeHtml(e.message)}</div></section></main>`;
  }
}

function applyFilters() {
  filteredRows = allRows.filter(r => {
    if (filters.lang !== 'all' && r.lang !== filters.lang) return false;
    if (filters.segment !== 'all' && r.segment !== filters.segment) return false;
    if (filters.age_range !== 'all' && r.age_range !== filters.age_range) return false;
    if (filters.gender !== 'all' && r.gender !== filters.gender) return false;
    if (filters.lead_level !== 'all' && r.lead_level !== filters.lead_level) return false;
    if (filters.contact === 'with' && !r.contact) return false;
    if (filters.contact === 'without' && r.contact) return false;
    if (filters.date_from && new Date(r.created_at) < new Date(filters.date_from + 'T00:00:00')) return false;
    if (filters.date_to && new Date(r.created_at) > new Date(filters.date_to + 'T23:59:59')) return false;
    return true;
  });
}

function renderAdmin() {
  applyFilters();
  adminApp.innerHTML = `<main class="admin-shell">
    <header class="admin-header card">
      <div><div class="badge">Analytics v4</div><h1>Расширенная мульти-аналитика опроса фитнес-клуба</h1><p>Статистика не ограничена готовыми блоками: есть анализ по каждому вопросу, разбивка по языкам/возрастам/сегментам и конструктор связей «любой вопрос × любой вопрос».</p></div>
      <div class="header-actions"><a class="ghost link-btn" href="/index.html" target="_blank">Открыть анкету</a><button class="ghost" id="exportCsvBtn">CSV ответов</button><button class="ghost" id="exportJsonBtn">JSON аналитики</button>${ADMIN_REQUIRE_AUTH ? `<button class="ghost" id="logoutBtn">Выйти</button>` : ''}</div>
    </header>
    ${renderFilters()}
    ${renderKpis()}
    ${renderDecisionPanel()}
    ${renderInsightPanel()}
    ${renderPresetAnalytics()}
    ${renderBuilder()}
    ${renderCohortBuilder()}
    ${renderPerQuestionDeepStats()}
    ${renderStrongLeads()}
  </main>`;
  bindAdminEvents();
}

function renderFilters() {
  return `<section class="card filters-card"><h2>Фильтры всей админки</h2><div class="filter-grid">
    ${renderSelect('lang','Язык',[['all','Все языки'], ...Object.entries(LANGS)])}
    ${renderSelect('segment','Сегмент',[['all','Все сегменты'], ...getOptionSet('segment').map(o => [o.value, L(o.label, RU)])])}
    ${renderSelect('age_range','Возраст',[['all','Все возрасты'], ...getOptionSet('age_range').map(o => [o.value, L(o.label, RU)])])}
    ${renderSelect('gender','Пол',[['all','Все'], ...getOptionSet('gender').map(o => [o.value, L(o.label, RU)])])}
    ${renderSelect('lead_level','Сила лида',[['all','Все'], ['strong','Сильные'], ['warm','Тёплые'], ['weak','Слабые']])}
    ${renderSelect('contact','Контакт',[['all','Все'], ['with','С контактом'], ['without','Без контакта']])}
    <label>С даты<input type="date" data-filter="date_from" value="${escapeHtml(filters.date_from)}"></label>
    <label>По дату<input type="date" data-filter="date_to" value="${escapeHtml(filters.date_to)}"></label>
  </div></section>`;
}
function renderSelect(id, label, options) { return `<label>${label}<select data-filter="${id}">${options.map(([v,l]) => `<option value="${v}" ${filters[id] === v ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}</select></label>`; }

function renderKpis() {
  const rows = filteredRows, total = rows.length;
  const strong = rows.filter(r => r.lead_level === 'strong').length;
  const warm = rows.filter(r => r.lead_level === 'warm').length;
  const contacts = rows.filter(r => r.contact).length;
  const prepay = rows.filter(r => ['buy1','buy3'].includes(r.pre_opening_action)).length;
  const local = rows.filter(r => isLocalSegment(r.segment)).length;
  const women = rows.filter(r => r.gender === 'female').length;
  const womenStrong = rows.filter(r => r.gender === 'female' && r.lead_level === 'strong').length;
  const localStrong = rows.filter(r => isLocalSegment(r.segment) && r.lead_level === 'strong').length;
  const avgScore = total ? Math.round(rows.reduce((s,r) => s + n(r.lead_score), 0) / total) : 0;
  const price2000 = rows.filter(r => ['2000_2500','2500_3000','3000_plus'].includes(r.affordable_price)).length;
  const locOk = rows.filter(r => ['very_convenient','convenient'].includes(r.location_convenience)).length;
  const jaiuStrong = rows.filter(r => r.segment === 'jaiu_student' && r.lead_level === 'strong').length;
  return `<section class="kpi-grid">
    ${kpi('Всего ответов', total, 'После фильтров')}
    ${kpi('Сильные лиды', `${strong} / ${pct(strong,total)}`, 'Не просто интерес, а связка: частота + цена + локация + действие')}
    ${kpi('Тёплые лиды', `${warm} / ${pct(warm,total)}`, 'Можно догревать пробным днём')}
    ${kpi('Контакты', `${contacts} / ${pct(contacts,total)}`, 'Waitlist и обзвон')}
    ${kpi('Готовы к предоплате', `${prepay} / ${pct(prepay,total)}`, 'Купить 1 или 3 месяца')}
    ${kpi('Местная база', `${local} / ${pct(local,total)}`, 'Местные, семьи, работающие рядом')}
    ${kpi('Сильные местные', localStrong, 'Главное для инвестора')}
    ${kpi('Женщины', `${women} / ${pct(women,total)}`, 'Ядро женской зоны')}
    ${kpi('Сильные женщины', womenStrong, 'Проверка приватной зоны')}
    ${kpi('Цена 2000+ сом', `${price2000} / ${pct(price2000,total)}`, 'Потенциал нормального среднего чека')}
    ${kpi('Локация удобна', `${locOk} / ${pct(locOk,total)}`, 'Курманбек 24 / 14 школа / JAIU')}
    ${kpi('Сильные JAIU', jaiuStrong, 'Дополнительный сегмент, не основа')}
    ${kpi('Средний score', avgScore, '0–100')}
  </section>`;
}
function kpi(title, value, note) { return `<article class="card kpi"><span>${escapeHtml(title)}</span><strong>${value}</strong><small>${escapeHtml(note)}</small></article>`; }

function renderDecisionPanel() {
  const localResponses = allRows.filter(r => isLocalSegment(r.segment));
  const localWomen = allRows.filter(r => isLocalSegment(r.segment) && r.gender === 'female');
  const jaiu = allRows.filter(r => r.segment === 'jaiu_student');
  const otherStudents = allRows.filter(r => r.segment === 'other_student');
  const workers = allRows.filter(r => r.segment === 'work_nearby');
  const localContacts = localResponses.filter(r => r.contact);
  const prepay = allRows.filter(r => ['buy1','buy3'].includes(r.pre_opening_action));
  const localPrepay = prepay.filter(r => isLocalSegment(r.segment));
  const targets = [
    ['Местные ответы', localResponses.length, 300], ['Женщины среди местных', localWomen.length, 150], ['Студенты JAIU', jaiu.length, 100], ['Студенты других учебных заведений', otherStudents.length, 50], ['Работающие рядом', workers.length, 50], ['Местные заявки / контакты', localContacts.length, 100], ['Предоплаты всего', prepay.length, 30], ['Предоплаты от местных', localPrepay.length, 25]
  ];
  return `<section class="card"><h2>Проверка готовности к инвестиционному решению</h2><p class="muted">Считается по всей базе. Эти квоты нужны, чтобы не обмануться только интересом студентов или красивыми процентами.</p><div class="quota-grid">${targets.map(([name,value,target]) => progressItem(name, value, target)).join('')}</div></section>`;
}
function progressItem(name, value, target) { const p = Math.min(100, Math.round((value / target) * 100)); return `<div class="quota"><div><strong>${escapeHtml(name)}</strong><span>${value}/${target}</span></div><div class="progress"><span style="width:${p}%"></span></div></div>`; }

function renderInsightPanel() {
  const rows = filteredRows;
  const strong = rows.filter(r => r.lead_level === 'strong');
  const insights = [];
  if (!rows.length) insights.push('Пока нет ответов по выбранным фильтрам.');
  else {
    insights.push(`Сильных лидов: <b>${strong.length}</b>. Из них местная база: <b>${strong.filter(r => isLocalSegment(r.segment)).length}</b>, JAIU: <b>${strong.filter(r => r.segment === 'jaiu_student').length}</b>.`);
    insights.push(`Самый частый возраст среди сильных лидов: <b>${valueLabel('age_range', topValue(strong, 'age_range').value)}</b>.`);
    insights.push(`Самая частая доступная цена среди сильных лидов: <b>${valueLabel('affordable_price', topValue(strong, 'affordable_price').value)}</b>.`);
    insights.push(`Самая частая услуга среди женщин: <b>${valueLabel('wanted_services', topValueArray(rows.filter(r => r.gender === 'female'), 'wanted_services').value)}</b>.`);
    insights.push(`Главный барьер у местной базы: <b>${valueLabel('barriers', topValueArray(rows.filter(r => isLocalSegment(r.segment)), 'barriers').value)}</b>.`);
    insights.push(`Самое удобное время среди сильных лидов: <b>${valueLabel('preferred_time', topValue(strong, 'preferred_time').value)}</b>.`);
  }
  return `<section class="card"><h2>Автоматические выводы</h2><div class="insight-box">${insights.map(x => `<p>${x}</p>`).join('')}</div></section>`;
}
function topValue(rows, id) { const items = countBy(rows, id, 50).sort((a,b) => b.count - a.count); return items[0] || { value: '—', count: 0 }; }
function topValueArray(rows, id) { return topValue(rows, id); }

function renderPresetAnalytics() {
  const presets = [
    ['Возраст × доступная цена', 'age_range', 'affordable_price'],
    ['Возраст × готовность к действию', 'age_range', 'pre_opening_action'],
    ['Возраст × язык анкеты', 'age_range', 'lang'],
    ['Язык × сегмент', 'lang', 'segment'],
    ['Сегмент × доступная цена', 'segment', 'affordable_price'],
    ['Сегмент × удобное время', 'segment', 'preferred_time'],
    ['Сегмент × услуги', 'segment', 'wanted_services'],
    ['Сегмент × барьеры', 'segment', 'barriers'],
    ['Пол × важность приватности', 'gender', 'importance_privacy'],
    ['Пол × готов платить больше за женскую зону/персонал', 'gender', 'pay_more_for'],
    ['Локация × вероятность прийти в первый месяц', 'location_convenience', 'first_month_probability'],
    ['Язык анкеты × предпочитаемый язык информации JAIU', 'lang', 'jaiu_info_language'],
    ['Сила лида × цена', 'lead_level', 'affordable_price'],
    ['Готовность к 2000+ × действие до открытия', 'price_ready_2000', 'pre_opening_action']
  ];
  return `<section class="analytics-grid">${presets.map(([title,row,col]) => renderMatrixCard(title, makeMatrix(filteredRows, row, col), row, col, true)).join('')}</section>`;
}

function renderBuilder() {
  const opts = DIMENSIONS.map(d => `<option value="${d.id}">${escapeHtml(dimTitle(d.id))}</option>`).join('');
  const rows = builder.onlyStrong ? filteredRows.filter(r => r.lead_level === 'strong') : filteredRows;
  const matrix = makeMatrix(rows, builder.row, builder.col);
  return `<section class="card builder-card"><h2>Конструктор статистики: любой вопрос × любой вопрос</h2><p class="muted">Здесь можно построить связь без ограничений: возраст × цена, язык × барьеры, сегмент × услуги, приватность × предоплата и так далее.</p>
    <div class="builder-controls">
      <label>Строки<select id="builderRow">${opts}</select></label>
      <label>Столбцы<select id="builderCol">${opts}</select></label>
      <label>Режим<select id="builderNormalize"><option value="count">Количество</option><option value="row_pct">% внутри строки</option></select></label>
      <label class="checkline"><input id="builderStrong" type="checkbox" ${builder.onlyStrong ? 'checked' : ''}> Только сильные лиды</label>
    </div>
    ${renderMatrixTable(matrix, builder.row, builder.col, builder.normalize)}
  </section>`;
}

function renderCohortBuilder() {
  const opts = DIMENSIONS.map(d => `<option value="${d.id}" ${cohort.dims.includes(d.id) ? 'selected' : ''}>${escapeHtml(dimTitle(d.id))}</option>`).join('');
  const rows = filteredRows;
  const cohorts = makeCohorts(rows, cohort.dims, cohort.minSize);
  const sorted = sortCohorts(cohorts, cohort.sort).slice(0, 250);
  const previewTitle = cohort.dims.map(dimTitle).join(' → ');
  return `<section class="card cohort-builder"><h2>Мульти-конструктор: сразу много параметров</h2>
    <p class="muted">Здесь можно комбинировать не 2 вопроса, а несколько сразу: например <b>язык → возраст → сегмент → цена → услуги</b>. Таблица покажет, какие аудитории реально сильные, сколько готовы платить, что хотят и что им мешает.</p>
    <div class="builder-controls wide-controls">
      <label>Параметры для комбинации<select id="cohortDims" multiple size="9">${opts}</select><small>Можно выбрать 2–6 параметров. На Windows: Ctrl + клик; на Mac: Cmd + клик.</small></label>
      <label>Главная метрика<select id="cohortMetric">
        <option value="strong_pct">% сильных лидов</option>
        <option value="contact_pct">% контактов</option>
        <option value="prepay_pct">% предоплаты</option>
        <option value="avg_score">Средний lead score</option>
        <option value="count">Количество людей</option>
        <option value="price2000_pct">% готовы к 2000+ сом</option>
        <option value="location_ok_pct">% кому удобна локация</option>
      </select></label>
      <label>Мин. размер группы<input id="cohortMinSize" type="number" min="1" max="100" value="${cohort.minSize}"></label>
      <label>Сортировка<select id="cohortSort">
        <option value="strong_pct_desc">Сначала сильные аудитории</option>
        <option value="count_desc">Сначала массовые аудитории</option>
        <option value="contact_pct_desc">Сначала контакты</option>
        <option value="prepay_pct_desc">Сначала предоплата</option>
        <option value="avg_score_desc">Сначала высокий score</option>
        <option value="price2000_pct_desc">Сначала готовые платить 2000+</option>
        <option value="location_ok_pct_desc">Сначала удобная локация</option>
      </select></label>
    </div>
    <div class="cohort-summary">
      <article><span>Комбинация</span><b>${escapeHtml(previewTitle || 'не выбрано')}</b></article>
      <article><span>Групп найдено</span><b>${cohorts.length}</b></article>
      <article><span>Показано</span><b>${sorted.length}</b></article>
      <article><span>Ответов в фильтре</span><b>${rows.length}</b></article>
    </div>
    ${renderCohortTable(sorted, cohort.metric)}
  </section>`;
}

function makeCohorts(rows, dims, minSize = 1) {
  const cleanDims = [...new Set(dims)].filter(Boolean).slice(0, 6);
  if (!cleanDims.length) return [];
  const map = new Map();
  rows.forEach(row => {
    const valueLists = cleanDims.map(id => {
      const v = rawValue(row, id);
      if (Array.isArray(v)) return v.length ? v.map(String) : [blank];
      return [String((v ?? blank) || blank)];
    });
    const combos = cartesian(valueLists).slice(0, 200);
    combos.forEach(values => {
      const key = values.join('||');
      if (!map.has(key)) map.set(key, { dims: cleanDims, values, rows: [] });
      map.get(key).rows.push(row);
    });
  });
  return [...map.values()].filter(c => c.rows.length >= Number(minSize || 1)).map(c => {
    const total = c.rows.length;
    const strong = c.rows.filter(r => r.lead_level === 'strong').length;
    const warm = c.rows.filter(r => r.lead_level === 'warm').length;
    const contacts = c.rows.filter(r => r.contact).length;
    const prepay = c.rows.filter(r => ['buy1','buy3'].includes(r.pre_opening_action)).length;
    const price2000 = c.rows.filter(r => ['2000_2500','2500_3000','3000_plus'].includes(r.affordable_price)).length;
    const locationOk = c.rows.filter(r => ['very_convenient','convenient'].includes(r.location_convenience)).length;
    const avgScore = total ? c.rows.reduce((s,r) => s + n(r.lead_score), 0) / total : 0;
    return {
      ...c,
      total,
      strong,
      warm,
      contacts,
      prepay,
      price2000,
      locationOk,
      avgScore,
      strong_pct: total ? strong / total * 100 : 0,
      contact_pct: total ? contacts / total * 100 : 0,
      prepay_pct: total ? prepay / total * 100 : 0,
      price2000_pct: total ? price2000 / total * 100 : 0,
      location_ok_pct: total ? locationOk / total * 100 : 0,
      topService: topNonBlankValue(c.rows, 'wanted_services'),
      topBarrier: topNonBlankValue(c.rows, 'barriers'),
      topTime: topNonBlankValue(c.rows, 'preferred_time')
    };
  });
}
function cartesian(arrays) { return arrays.reduce((acc, arr) => acc.flatMap(a => arr.map(v => [...a, v])), [[]]); }
function topNonBlankValue(rows, id) {
  const counts = countBy(rows, id, 25).filter(x => x.value !== blank);
  counts.sort((a,b) => b.count - a.count);
  return counts[0] || null;
}
function cohortMetricValue(c, metric) {
  if (metric === 'count') return c.total;
  if (metric === 'avg_score') return c.avgScore;
  return c[metric] || 0;
}
function sortCohorts(cohorts, sortKey) {
  const metric = sortKey.replace('_desc','');
  return [...cohorts].sort((a,b) => cohortMetricValue(b, metric) - cohortMetricValue(a, metric) || b.total - a.total);
}
function renderCohortTable(cohorts, metric) {
  if (!cohorts.length) return `<div class="empty-state">Нет групп по выбранным параметрам и фильтрам.</div>`;
  const metricTitle = ({ strong_pct:'% сильных', contact_pct:'% контактов', prepay_pct:'% предоплаты', avg_score:'средний score', count:'людей', price2000_pct:'% 2000+', location_ok_pct:'% удобна локация' })[metric] || metric;
  return `<div class="table-wrap"><table class="matrix-table cohort-table"><thead><tr>
    ${cohorts[0].dims.map(id => `<th>${escapeHtml(dimTitle(id))}</th>`).join('')}
    <th>Людей</th><th>${escapeHtml(metricTitle)}</th><th>Score</th><th>Сильные</th><th>Контакты</th><th>Предоплата</th><th>2000+</th><th>Локация ок</th><th>Топ услуга</th><th>Топ барьер</th><th>Топ время</th>
  </tr></thead><tbody>${cohorts.map(c => {
    const main = cohortMetricValue(c, metric);
    const bar = metric === 'count' ? Math.min(100, Math.round((c.total / Math.max(1, cohorts[0].total)) * 100)) : Math.round(Math.min(100, main));
    const metricText = metric === 'count' ? c.total : (metric === 'avg_score' ? c.avgScore.toFixed(1) : `${Math.round(main)}%`);
    return `<tr>
      ${c.values.map((v, i) => `<td>${escapeHtml(valueLabel(c.dims[i], v))}</td>`).join('')}
      <td><b>${c.total}</b></td>
      <td><span class="cell-num">${metricText}</span><span class="mini-bar big"><i style="width:${bar}%"></i></span></td>
      <td>${c.avgScore.toFixed(1)}</td>
      <td>${c.strong} / ${Math.round(c.strong_pct)}%</td>
      <td>${c.contacts} / ${Math.round(c.contact_pct)}%</td>
      <td>${c.prepay} / ${Math.round(c.prepay_pct)}%</td>
      <td>${c.price2000} / ${Math.round(c.price2000_pct)}%</td>
      <td>${c.locationOk} / ${Math.round(c.location_ok_pct)}%</td>
      <td>${c.topService ? `${escapeHtml(valueLabel('wanted_services', c.topService.value))} <small>${c.topService.count}</small>` : '—'}</td>
      <td>${c.topBarrier ? `${escapeHtml(valueLabel('barriers', c.topBarrier.value))} <small>${c.topBarrier.count}</small>` : '—'}</td>
      <td>${c.topTime ? `${escapeHtml(valueLabel('preferred_time', c.topTime.value))} <small>${c.topTime.count}</small>` : '—'}</td>
    </tr>`;
  }).join('')}</tbody></table></div>`;
}

function makeMatrix(rows, rowId, colId, maxRows = 35, maxCols = 16) {
  const rowValues = orderedValues(rowId, rows, maxRows);
  const colValues = orderedValues(colId, rows, maxCols);
  return { rowId, colId, columns: colValues, rows: rowValues.map(rv => {
    const subset = rows.filter(r => matches(r, rowId, rv));
    const cells = {};
    colValues.forEach(cv => { cells[cv] = subset.filter(r => matches(r, colId, cv)).length; });
    return { row: rv, total: subset.length, cells };
  }) };
}
function renderMatrixCard(title, matrix, rowId, colId, compact = false) {
  return `<section class="card table-card ${compact ? 'compact-card' : ''}"><h2>${escapeHtml(title)}</h2>${renderMatrixTable(matrix, rowId, colId, 'count')}</section>`;
}
function renderMatrixTable(matrix, rowId, colId, normalize = 'count') {
  const rows = matrix.rows || [];
  const columns = matrix.columns || [];
  return `<div class="table-wrap"><table class="matrix-table"><thead><tr><th>${escapeHtml(dimTitle(rowId))}</th><th>Всего</th>${columns.map(c => `<th>${escapeHtml(valueLabel(colId, c))}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr><th>${escapeHtml(valueLabel(rowId, r.row))}</th><td>${r.total}</td>${columns.map(c => {
    const count = r.cells[c] || 0;
    const percent = r.total ? Math.round(count / r.total * 100) : 0;
    const text = normalize === 'row_pct' ? `${percent}%` : count;
    return `<td><span class="cell-num">${text}</span><span class="mini-bar"><i style="width:${percent}%"></i></span></td>`;
  }).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function renderPerQuestionDeepStats() {
  const query = sectionState.deepSearch.trim().toLowerCase();
  const group = sectionState.deepGroup;
  let items = QUESTIONS;
  if (query) items = items.filter(q => `${q.id} ${L(q.title, RU)}`.toLowerCase().includes(query));
  if (group !== 'all') items = items.filter(q => q.section === group);
  return `<section class="card per-question"><h2>Подробная статистика по каждому вопросу</h2><p class="muted">Каждый вопрос раскрывается отдельно: общий результат, RU/KG/EN, возраст, сегмент, пол, сила лида и связь с ценой/действием.</p>
    <div class="builder-controls"><label>Поиск вопроса<input id="deepSearch" type="search" value="${escapeHtml(sectionState.deepSearch)}" placeholder="например: цена, возраст, приватность"></label><label>Раздел<select id="deepGroup"><option value="all">Все разделы</option>${[...new Set(QUESTIONS.map(q => q.section))].map(s => `<option value="${s}" ${sectionState.deepGroup === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div>
    <div class="deep-list">${items.map(renderQuestionDeepStat).join('')}</div>
  </section>`;
}
function renderQuestionDeepStat(question) {
  const id = question.id;
  if (isText(id)) return renderTextDeep(question);
  if (isScale(id)) return renderScaleDeep(question);
  return renderChoiceDeep(question);
}
function renderChoiceDeep(question) {
  const id = question.id;
  const title = L(question.title, RU);
  const distribution = countBy(filteredRows, id, 60).sort((a,b) => b.count - a.count);
  const answered = filteredRows.filter(r => !matches(r, id, blank)).length;
  const top = distribution.find(x => x.value !== blank) || { value: blank, count: 0 };
  return `<details class="deep-question"><summary><b>${escapeHtml(title)}</b><span>${question.id}</span><em>ответили: ${answered}/${filteredRows.length}; топ: ${escapeHtml(valueLabel(id, top.value))} (${top.count})</em></summary>
    <div class="deep-grid">
      ${renderDistribution(id, distribution)}
      ${renderMiniMatrix('По языкам', id, 'lang')}
      ${renderMiniMatrix('По возрасту', id, 'age_range')}
      ${renderMiniMatrix('По сегментам', id, 'segment')}
      ${renderMiniMatrix('По полу', id, 'gender')}
      ${renderMiniMatrix('По силе лида', id, 'lead_level')}
      ${id !== 'affordable_price' ? renderMiniMatrix('Связь с ценой', id, 'affordable_price') : ''}
      ${id !== 'pre_opening_action' ? renderMiniMatrix('Связь с действием до открытия', id, 'pre_opening_action') : ''}
    </div>
  </details>`;
}
function renderScaleDeep(question) {
  const id = question.id;
  const values = filteredRows.map(r => Number(rawValue(r, id))).filter(Boolean);
  const average = avg(values);
  return `<details class="deep-question"><summary><b>${escapeHtml(L(question.title, RU))}</b><span>${question.id}</span><em>среднее: ${average === null ? '—' : average.toFixed(2)}; ответили: ${values.length}/${filteredRows.length}</em></summary>
    <div class="deep-grid">
      ${renderScaleAverages(id, 'lang', 'Средняя оценка по языкам')}
      ${renderScaleAverages(id, 'age_range', 'Средняя оценка по возрасту')}
      ${renderScaleAverages(id, 'segment', 'Средняя оценка по сегментам')}
      ${renderScaleAverages(id, 'gender', 'Средняя оценка по полу')}
      ${renderDistribution(id, countBy(filteredRows, id, 5))}
      ${renderMiniMatrix('Оценка × действие до открытия', id, 'pre_opening_action')}
    </div>
  </details>`;
}
function renderTextDeep(question) {
  const id = question.id;
  const answered = filteredRows.filter(r => rawValue(r, id)).length;
  const samples = filteredRows.filter(r => rawValue(r, id)).slice(0, 25);
  const words = wordFrequency(filteredRows.map(r => rawValue(r, id)).filter(Boolean).join(' ')).slice(0, 25);
  return `<details class="deep-question"><summary><b>${escapeHtml(L(question.title, RU))}</b><span>${question.id}</span><em>заполнено: ${answered}/${filteredRows.length}</em></summary><div class="deep-grid"><article><h4>Частые слова</h4><div class="tag-list">${words.map(([w,c]) => `<span>${escapeHtml(w)} <b>${c}</b></span>`).join('') || '<p class="muted">Пока нет текста.</p>'}</div></article><article class="wide-mini"><h4>Примеры ответов</h4>${samples.map(r => `<blockquote><b>${LANGS[r.lang] || r.lang}</b> · ${escapeHtml(valueLabel('segment', r.segment))} · ${escapeHtml(rawValue(r, id))}</blockquote>`).join('') || '<p class="muted">Пока нет текстовых ответов.</p>'}</article></div></details>`;
}
function wordFrequency(text) {
  const stop = new Set('и в на с для что как это или если да нет the and to of a in is you your what would же менен үчүн бул жана же да жок'.split(' '));
  const words = String(text).toLowerCase().match(/[a-zа-яёңүөқғҳӯӣ]+/gi) || [];
  const map = new Map();
  words.filter(w => w.length > 2 && !stop.has(w)).forEach(w => map.set(w, (map.get(w) || 0) + 1));
  return [...map.entries()].sort((a,b) => b[1] - a[1]);
}
function renderDistribution(id, items) {
  const total = filteredRows.length;
  return `<article><h4>Общее распределение</h4><table class="stat-table"><thead><tr><th>Ответ</th><th>Кол-во</th><th>%</th></tr></thead><tbody>${items.map(x => `<tr><th>${escapeHtml(valueLabel(id, x.value))}</th><td>${x.count}</td><td>${pct(x.count, total)}</td></tr>`).join('')}</tbody></table></article>`;
}
function renderMiniMatrix(title, rowId, colId) {
  return `<article><h4>${escapeHtml(title)}</h4>${renderMatrixTable(makeMatrix(filteredRows, rowId, colId, 25, 10), rowId, colId, 'row_pct')}</article>`;
}
function renderScaleAverages(scaleId, groupId, title) {
  const groups = orderedValues(groupId, filteredRows, 25);
  return `<article><h4>${escapeHtml(title)}</h4><table class="stat-table"><thead><tr><th>${escapeHtml(dimTitle(groupId))}</th><th>Ответов</th><th>Среднее</th></tr></thead><tbody>${groups.map(g => {
    const subset = filteredRows.filter(r => matches(r, groupId, g)).map(r => Number(rawValue(r, scaleId))).filter(Boolean);
    const a = avg(subset);
    return `<tr><th>${escapeHtml(valueLabel(groupId, g))}</th><td>${subset.length}</td><td>${a === null ? '—' : a.toFixed(2)}</td></tr>`;
  }).join('')}</tbody></table></article>`;
}

function renderStrongLeads() {
  const rows = filteredRows.filter(r => r.lead_level === 'strong' || r.contact).sort(byDateDesc).slice(0, 250);
  return `<section class="card"><h2>Сильные лиды и контакты</h2><div class="table-wrap"><table class="matrix-table leads-table"><thead><tr><th>Дата</th><th>Лид</th><th>Язык</th><th>Сегмент</th><th>Возраст</th><th>Пол</th><th>Локация</th><th>Цена</th><th>Действие</th><th>Контакт</th><th>Комментарий</th></tr></thead><tbody>${rows.map(r => `<tr><td>${new Date(r.created_at).toLocaleString('ru-RU')}</td><td><b>${r.lead_score}</b> / ${escapeHtml(valueLabel('lead_level', r.lead_level))}</td><td>${LANGS[r.lang] || r.lang}</td><td>${escapeHtml(valueLabel('segment', r.segment))}</td><td>${escapeHtml(valueLabel('age_range', r.age_range))}</td><td>${escapeHtml(valueLabel('gender', r.gender))}</td><td>${escapeHtml(valueLabel('location_convenience', r.location_convenience))}</td><td>${escapeHtml(valueLabel('affordable_price', r.affordable_price))}</td><td>${escapeHtml(valueLabel('pre_opening_action', r.pre_opening_action))}</td><td>${escapeHtml(r.contact || '—')}</td><td>${escapeHtml(r.comment || '')}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function bindAdminEvents() {
  adminApp.querySelectorAll('[data-filter]').forEach(el => el.addEventListener('change', () => { filters[el.dataset.filter] = el.value; renderAdmin(); }));
  const rowSel = adminApp.querySelector('#builderRow'); if (rowSel) { rowSel.value = builder.row; rowSel.addEventListener('change', () => { builder.row = rowSel.value; renderAdmin(); }); }
  const colSel = adminApp.querySelector('#builderCol'); if (colSel) { colSel.value = builder.col; colSel.addEventListener('change', () => { builder.col = colSel.value; renderAdmin(); }); }
  const normSel = adminApp.querySelector('#builderNormalize'); if (normSel) { normSel.value = builder.normalize; normSel.addEventListener('change', () => { builder.normalize = normSel.value; renderAdmin(); }); }
  const strongBox = adminApp.querySelector('#builderStrong'); if (strongBox) strongBox.addEventListener('change', () => { builder.onlyStrong = strongBox.checked; renderAdmin(); });
  const cohortDims = adminApp.querySelector('#cohortDims'); if (cohortDims) cohortDims.addEventListener('change', () => { cohort.dims = [...cohortDims.selectedOptions].map(o => o.value).slice(0, 6); renderAdmin(); });
  const cohortMetric = adminApp.querySelector('#cohortMetric'); if (cohortMetric) { cohortMetric.value = cohort.metric; cohortMetric.addEventListener('change', () => { cohort.metric = cohortMetric.value; renderAdmin(); }); }
  const cohortMinSize = adminApp.querySelector('#cohortMinSize'); if (cohortMinSize) cohortMinSize.addEventListener('change', () => { cohort.minSize = Math.max(1, Number(cohortMinSize.value || 1)); renderAdmin(); });
  const cohortSort = adminApp.querySelector('#cohortSort'); if (cohortSort) { cohortSort.value = cohort.sort; cohortSort.addEventListener('change', () => { cohort.sort = cohortSort.value; renderAdmin(); }); }
  const deepSearch = adminApp.querySelector('#deepSearch'); if (deepSearch) deepSearch.addEventListener('input', debounce(() => { sectionState.deepSearch = deepSearch.value; renderAdmin(); }, 350));
  const deepGroup = adminApp.querySelector('#deepGroup'); if (deepGroup) { deepGroup.value = sectionState.deepGroup; deepGroup.addEventListener('change', () => { sectionState.deepGroup = deepGroup.value; renderAdmin(); }); }
  adminApp.querySelector('#exportCsvBtn')?.addEventListener('click', exportCsv);
  adminApp.querySelector('#exportJsonBtn')?.addEventListener('click', exportAnalyticsJson);
  adminApp.querySelector('#logoutBtn')?.addEventListener('click', async () => { await supabase.auth.signOut(); renderLogin(); });
}
function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

function exportCsv() {
  const cols = ['created_at','lang','segment','age_range','gender','family_status','understands_location','daytime_location','travel_time','location_convenience','current_activity','attended_gym_3m','weekly_visits','current_monthly_price','goals','barriers','importance_location','importance_cleanliness','importance_equipment','importance_safety','importance_separate_zones','importance_privacy','importance_female_staff','concept_interest','first_month_probability','preferred_time','wanted_services','affordable_price','refusal_price','pay_more_for','payment_format','pre_opening_action','student_institution','jaiu_info_language','jaiu_english_staff_importance','jaiu_student_price','jaiu_attend_with','other_student_tariff','local_mixed_audience_comfort','local_rules_needed','local_separate_hours','wants_contact','contact','comment','lead_level','lead_score'];
  const header = cols.join(',');
  const lines = filteredRows.map(row => cols.map(c => csvCell(row[c])).join(','));
  downloadFile(`fitness-survey-responses-${new Date().toISOString().slice(0,10)}.csv`, header + '\n' + lines.join('\n'), 'text/csv;charset=utf-8');
}
function exportAnalyticsJson() {
  const analytics = {
    generated_at: new Date().toISOString(),
    filters,
    total_filtered: filteredRows.length,
    kpis: {
      total: filteredRows.length,
      strong: filteredRows.filter(r => r.lead_level === 'strong').length,
      contacts: filteredRows.filter(r => r.contact).length,
      prepay: filteredRows.filter(r => ['buy1','buy3'].includes(r.pre_opening_action)).length
    },
    per_question: QUESTIONS.map(q => ({ id: q.id, title: L(q.title, RU), type: q.type, distribution: countBy(filteredRows, q.id, 100) })),
    preset_matrices: {
      age_by_price: makeMatrix(filteredRows, 'age_range', 'affordable_price'),
      segment_by_services: makeMatrix(filteredRows, 'segment', 'wanted_services'),
      language_by_segment: makeMatrix(filteredRows, 'lang', 'segment'),
      lead_by_price: makeMatrix(filteredRows, 'lead_level', 'affordable_price')
    },
    multi_cohorts: makeCohorts(filteredRows, cohort.dims, cohort.minSize).slice(0, 500)
  };
  downloadFile(`fitness-survey-analytics-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(analytics, null, 2), 'application/json;charset=utf-8');
}
function downloadFile(filename, content, type) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

init();
