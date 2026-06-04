import './styles.css';
import { supabase, SURVEY_VERSION } from './supabaseClient.js';
import { LANGS, UI, QUESTIONS, SECTIONS, L, getOptionSet, visibleSections, questionsForSection, labelFor, isLocalSegment } from './questions.js';

const DRAFT_KEY = `fitness_survey_draft_v${SURVEY_VERSION}`;
const SUBMITTED_KEY = `fitness_survey_submitted_v${SURVEY_VERSION}`;
const DEVICE_KEY = `fitness_survey_device_id_v${SURVEY_VERSION}`;

let state = loadDraft() || { lang: 'ru', step: -1, answers: {}, restored: false };
const app = document.querySelector('#app');

function uid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = uid();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fingerprintHash() {
  const raw = [
    getDeviceId(),
    navigator.userAgent,
    navigator.language,
    (navigator.languages || []).join('|'),
    navigator.platform,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    navigator.hardwareConcurrency || '',
    SURVEY_VERSION
  ].join('::');
  return sha256(raw);
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    parsed.restored = true;
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
  state = { lang: state.lang || 'ru', step: -1, answers: {}, restored: false };
  render();
}

function text(key) {
  return UI[state.lang]?.[key] || UI.ru[key] || key;
}

function setAnswer(id, value) {
  state.answers[id] = value;
  saveDraft();
  renderStepOnly();
}

function getSections() {
  return visibleSections(state.answers);
}

function getCurrentSection() {
  const sections = getSections();
  return sections[state.step];
}

function render() {
  document.documentElement.lang = state.lang;
  if (localStorage.getItem(SUBMITTED_KEY) === 'true') {
    renderSubmitted();
    return;
  }
  if (state.step < 0) renderWelcome();
  else renderSurvey();
}

function renderSubmitted() {
  app.innerHTML = `
    <main class="page-shell single-card">
      <section class="card success-card">
        <div class="badge">OK</div>
        <h1>${text('submittedTitle')}</h1>
        <p>${text('submittedText')}</p>
      </section>
    </main>
  `;
}

function renderWelcome() {
  app.innerHTML = `
    <main class="page-shell landing">
      <section class="hero card">
        <div class="badge">Survey</div>
        <h1>${text('title')}</h1>
        <p>${text('subtitle')}</p>
        <div class="lang-grid" role="group" aria-label="${text('chooseLang')}">
          ${Object.entries(LANGS).map(([code, name]) => `
            <button class="lang-btn ${state.lang === code ? 'active' : ''}" data-lang="${code}">${name}</button>
          `).join('')}
        </div>
        ${state.restored ? `<div class="notice">${text('restore')}</div>` : ''}
        <div class="actions">
          <button class="primary" id="startBtn">${text('start')}</button>
          ${state.restored ? `<button class="ghost" id="clearDraftBtn">${text('clearDraft')}</button>` : ''}
        </div>
      </section>
    </main>
  `;
  app.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.lang = btn.dataset.lang;
      saveDraft();
      render();
    });
  });
  app.querySelector('#startBtn').addEventListener('click', () => {
    state.step = 0;
    state.restored = false;
    saveDraft();
    render();
  });
  const clear = app.querySelector('#clearDraftBtn');
  if (clear) clear.addEventListener('click', clearDraft);
}

function renderSurvey() {
  const section = getCurrentSection();
  if (!section) {
    state.step = Math.max(0, getSections().length - 1);
    saveDraft();
    render();
    return;
  }
  const sections = getSections();
  const questions = questionsForSection(section.id, state.answers);
  const percent = Math.round(((state.step + 1) / sections.length) * 100);
  app.innerHTML = `
    <main class="page-shell survey-layout">
      <aside class="sidebar card">
        <div class="mini-title">${text('progress')} ${state.step + 1}/${sections.length}</div>
        <div class="progress"><span style="width:${percent}%"></span></div>
        <ol class="steps">
          ${sections.map((s, i) => `<li class="${i === state.step ? 'active' : ''} ${i < state.step ? 'done' : ''}">${L(s.title, state.lang)}</li>`).join('')}
        </ol>
        <button class="ghost full" id="clearDraftBtn">${text('clearDraft')}</button>
      </aside>
      <section class="card form-card">
        <div class="form-head">
          <div class="badge">${state.step + 1}/${sections.length}</div>
          <h1>${L(section.title, state.lang)}</h1>
          <p>${text('saved')}</p>
        </div>
        <form id="surveyForm" novalidate>
          <div id="questionsMount">
            ${questions.map(q => renderQuestion(q)).join('')}
          </div>
          <div class="error" id="errorBox" hidden></div>
          <div class="actions split">
            <button type="button" class="ghost" id="backBtn">${text('back')}</button>
            <button type="submit" class="primary">${state.step === sections.length - 1 ? text('submit') : text('next')}</button>
          </div>
        </form>
      </section>
    </main>
  `;
  bindQuestionEvents(questions);
  app.querySelector('#backBtn').addEventListener('click', () => {
    if (state.step === 0) state.step = -1;
    else state.step -= 1;
    saveDraft();
    render();
  });
  app.querySelector('#clearDraftBtn').addEventListener('click', clearDraft);
  app.querySelector('#surveyForm').addEventListener('submit', onSubmitStep);
}

function renderStepOnly() {
  // Full render keeps conditional questions and progress correct.
  render();
}

function renderQuestion(q) {
  const value = state.answers[q.id];
  const required = q.required ? '<span class="req">*</span>' : `<span class="optional">${text('optional')}</span>`;
  const hint = q.type === 'checkbox' ? `<div class="hint">${text('selectMany')}</div>` : '';
  let body = '';
  if (q.type === 'radio') {
    body = `<div class="option-grid">${getOptionSet(q.options).map(o => `
      <label class="option ${value === o.value ? 'checked' : ''}">
        <input type="radio" name="${q.id}" value="${o.value}" ${value === o.value ? 'checked' : ''}>
        <span>${L(o.label, state.lang)}</span>
      </label>`).join('')}</div>`;
  } else if (q.type === 'checkbox') {
    const arr = Array.isArray(value) ? value : [];
    body = `<div class="option-grid">${getOptionSet(q.options).map(o => `
      <label class="option ${arr.includes(o.value) ? 'checked' : ''}">
        <input type="checkbox" name="${q.id}" value="${o.value}" ${arr.includes(o.value) ? 'checked' : ''}>
        <span>${L(o.label, state.lang)}</span>
      </label>`).join('')}</div>`;
  } else if (q.type === 'scale') {
    body = `<div class="scale-row">${[1,2,3,4,5].map(n => `
      <label class="scale ${Number(value) === n ? 'checked' : ''}">
        <input type="radio" name="${q.id}" value="${n}" ${Number(value) === n ? 'checked' : ''}>
        <span>${n}</span>
      </label>`).join('')}</div><div class="scale-labels"><span>1</span><span>5</span></div>`;
  } else if (q.type === 'textarea') {
    body = `<textarea name="${q.id}" rows="4" placeholder="...">${value || ''}</textarea>`;
  } else {
    body = `<input type="text" name="${q.id}" value="${escapeHtml(value || '')}" placeholder="...">`;
  }
  return `
    <fieldset class="question" data-question="${q.id}">
      <legend>${L(q.title, state.lang)} ${required}</legend>
      ${hint}
      ${body}
    </fieldset>
  `;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, s => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[s]));
}

function bindQuestionEvents(questions) {
  questions.forEach(q => {
    const nodes = app.querySelectorAll(`[name="${q.id}"]`);
    nodes.forEach(node => {
      const eventName = ['text','textarea'].includes(q.type) ? 'input' : 'change';
      node.addEventListener(eventName, () => {
        if (q.type === 'checkbox') {
          const checked = [...app.querySelectorAll(`[name="${q.id}"]:checked`)].map(el => el.value);
          state.answers[q.id] = checked;
        } else if (q.type === 'scale') {
          state.answers[q.id] = Number(app.querySelector(`[name="${q.id}"]:checked`)?.value || 0);
        } else if (q.type === 'radio') {
          state.answers[q.id] = app.querySelector(`[name="${q.id}"]:checked`)?.value || '';
        } else {
          state.answers[q.id] = node.value.trim();
        }
        saveDraft();
        if (q.id === 'segment' || q.id === 'wants_contact') render();
        else refreshCheckedStyles(q.id);
      });
    });
  });
}

function refreshCheckedStyles(name) {
  app.querySelectorAll(`[data-question="${name}"] .option, [data-question="${name}"] .scale`).forEach(label => {
    const input = label.querySelector('input');
    label.classList.toggle('checked', !!input?.checked);
  });
}

function validateCurrentStep() {
  const section = getCurrentSection();
  const questions = questionsForSection(section.id, state.answers);
  const missing = [];
  questions.forEach(q => {
    if (!q.required) return;
    const v = state.answers[q.id];
    if (q.type === 'checkbox') {
      if (!Array.isArray(v) || v.length === 0) missing.push(q.id);
    } else if (q.type === 'scale') {
      if (!Number(v)) missing.push(q.id);
    } else if (v === undefined || v === null || String(v).trim() === '') {
      missing.push(q.id);
    }
  });
  return missing;
}

async function onSubmitStep(event) {
  event.preventDefault();
  const missing = validateCurrentStep();
  const errorBox = app.querySelector('#errorBox');
  if (missing.length) {
    errorBox.hidden = false;
    errorBox.textContent = text('required');
    missing.forEach(id => app.querySelector(`[data-question="${id}"]`)?.classList.add('missing'));
    return;
  }
  const sections = getSections();
  if (state.step < sections.length - 1) {
    state.step += 1;
    saveDraft();
    render();
    return;
  }
  await submitAll();
}

function pricePoints(value) {
  if (['2000_2500','2500_3000','3000_plus'].includes(value)) return 20;
  if (value === '1500_2000') return 12;
  if (value === '1000_1500') return 5;
  return 0;
}

function calculateLeadScore(a) {
  let score = 0;
  if (['very_convenient','convenient'].includes(a.location_convenience) || ['0_5','6_10','11_15'].includes(a.travel_time)) score += 20;
  if (['2','3','4_plus'].includes(a.weekly_visits)) score += 18;
  score += pricePoints(a.affordable_price);
  if (['definitely','likely'].includes(a.first_month_probability)) score += 18;
  if (['contact','trial'].includes(a.pre_opening_action)) score += 10;
  if (['buy1','buy3'].includes(a.pre_opening_action)) score += 20;
  if (a.wants_contact === 'yes' && a.contact) score += 10;
  if (a.concept_interest === 'very') score += 4;
  if (Array.isArray(a.barriers) && a.barriers.includes('far')) score -= 8;
  if (a.affordable_price === 'not_ready_monthly') score -= 15;
  return Math.max(0, Math.min(100, score));
}

function leadLevel(score) {
  if (score >= 70) return 'strong';
  if (score >= 45) return 'warm';
  return 'weak';
}

function normalizeArrays(a) {
  const copy = { ...a };
  QUESTIONS.filter(q => q.type === 'checkbox').forEach(q => {
    if (!Array.isArray(copy[q.id])) copy[q.id] = [];
  });
  return copy;
}

function payloadFromAnswers() {
  const a = normalizeArrays(state.answers);
  const score = calculateLeadScore(a);
  return {
    lang: state.lang,
    fingerprint_hash: null,
    survey_version: SURVEY_VERSION,
    segment: a.segment,
    age_range: a.age_range,
    gender: a.gender,
    family_status: a.family_status || [],
    understands_location: a.understands_location,
    daytime_location: a.daytime_location,
    travel_time: a.travel_time,
    location_convenience: a.location_convenience,
    current_activity: a.current_activity,
    attended_gym_3m: a.attended_gym_3m,
    weekly_visits: a.weekly_visits,
    current_monthly_price: a.current_monthly_price || null,
    goals: a.goals || [],
    barriers: a.barriers || [],
    importance_location: a.importance_location || null,
    importance_cleanliness: a.importance_cleanliness || null,
    importance_equipment: a.importance_equipment || null,
    importance_safety: a.importance_safety || null,
    importance_separate_zones: a.importance_separate_zones || null,
    importance_privacy: a.importance_privacy || null,
    importance_female_staff: a.importance_female_staff || null,
    concept_interest: a.concept_interest,
    first_month_probability: a.first_month_probability,
    preferred_time: a.preferred_time,
    wanted_services: a.wanted_services || [],
    affordable_price: a.affordable_price,
    refusal_price: a.refusal_price,
    pay_more_for: a.pay_more_for || [],
    payment_format: a.payment_format,
    pre_opening_action: a.pre_opening_action,
    student_institution: a.student_institution || null,
    jaiu_info_language: a.jaiu_info_language || null,
    jaiu_english_staff_importance: a.jaiu_english_staff_importance || null,
    jaiu_student_price: a.jaiu_student_price || null,
    jaiu_attend_with: a.jaiu_attend_with || null,
    other_student_tariff: a.other_student_tariff || null,
    local_mixed_audience_comfort: a.local_mixed_audience_comfort || null,
    local_rules_needed: a.local_rules_needed || [],
    local_separate_hours: a.local_separate_hours || null,
    comment: a.comment || null,
    wants_contact: a.wants_contact === 'yes',
    contact: a.wants_contact === 'yes' ? (a.contact || null) : null,
    lead_score: score,
    lead_level: leadLevel(score),
    answers: a
  };
}

async function submitAll() {
  const button = app.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = '...';
  const payload = payloadFromAnswers();
  payload.fingerprint_hash = await fingerprintHash();
  const { error } = await supabase.from('survey_responses').insert(payload);
  if (error) {
    const errorBox = app.querySelector('#errorBox');
    errorBox.hidden = false;
    if (String(error.message || '').toLowerCase().includes('duplicate') || error.code === '23505') {
      localStorage.setItem(SUBMITTED_KEY, 'true');
      localStorage.removeItem(DRAFT_KEY);
      renderSubmitted();
      return;
    }
    errorBox.textContent = `Ошибка отправки: ${error.message}`;
    button.disabled = false;
    button.textContent = text('submit');
    return;
  }
  localStorage.setItem(SUBMITTED_KEY, 'true');
  localStorage.removeItem(DRAFT_KEY);
  renderSubmitted();
}

window.addEventListener('beforeunload', saveDraft);
render();
