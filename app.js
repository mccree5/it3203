/* ============ Nav Toggle (mobile) ============ */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
});

/* ============ Quiz Logic (moved from inline) ============ */
(function () {
  const form = document.getElementById('quiz-form');
  if (!form) return; // only run on quiz page

  const resultsCard = document.getElementById('results');
  const overallEl = document.getElementById('overall');
  const scoreBadge = document.getElementById('score-badge');
  const perList = document.getElementById('per-question-list');

  const normalize = s => (s || '').toString().trim().toLowerCase();
  const stripAngles = str => str.replace(/</g,'').replace(/&lt;/g,'').replace(/>/g,'').replace(/&gt;/g,'');

  const setFS = (fs, ok) => { if(fs){ fs.classList.remove('is-correct','is-incorrect'); fs.classList.add(ok?'is-correct':'is-incorrect'); } };
  const clearLabels = inputs => inputs.forEach(i => { const l=i.closest('label'); if(l) l.classList.remove('correct','incorrect','answer'); });

  function checkQ1(){
    const input = document.getElementById('q1'), fs = input.closest('fieldset');
    const ok = normalize(stripAngles(input.value)) === 'main';
    setFS(fs, ok);
    const fb = document.getElementById('q1-feedback');
    fb.textContent = ok ? 'Correct' : 'Incorrect — Correct answer: <main>';
    fb.className = 'q-feedback ' + (ok ? 'correct' : 'incorrect');
    return ok ? 1 : 0;
  }
  function getChecked(name){ return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(i=>i.value); }
  function checkSingle(name, correct, fbId, correctText){
    const group = Array.from(document.querySelectorAll(`input[name="${name}"]`));
    const pick = getChecked(name)[0] || null, ok = pick === correct;
    setFS(group[0]?.closest('fieldset'), ok);
    clearLabels(group);
    group.forEach(inp => {
      const lab = inp.closest('label'); if(!lab) return;
      if (inp.checked) lab.classList.add(ok ? 'correct' : 'incorrect');
      if (!ok && inp.value === correct) lab.classList.add('answer');
    });
    const fb = document.getElementById(fbId);
    fb.textContent = ok ? 'Correct' : `Incorrect — Correct answer: ${correctText}`;
    fb.className = 'q-feedback ' + (ok ? 'correct' : 'incorrect');
    return ok ? 1 : 0;
  }
  function checkMulti(name, correctSet, fbId){
    const group = Array.from(document.querySelectorAll(`input[name="${name}"]`));
    const picks = new Set(getChecked(name)), expected = new Set(correctSet);
    let ok = picks.size === expected.size; if(ok){ for(const v of expected){ if(!picks.has(v)){ ok=false; break; } } }
    setFS(group[0]?.closest('fieldset'), ok);
    clearLabels(group);
    group.forEach(inp => {
      const lab = inp.closest('label'); if(!lab) return;
      const should = expected.has(inp.value);
      if (inp.checked) lab.classList.add(should ? 'correct' : 'incorrect');
      else if (!ok && should) lab.classList.add('answer');
    });
    const fb = document.getElementById(fbId);
    fb.textContent = ok ? 'Correct' : `Incorrect — Correct answers: ${Array.from(expected).join(', ')}`;
    fb.className = 'q-feedback ' + (ok ? 'correct' : 'incorrect');
    return ok ? 1 : 0;
  }
  const tierFor = t => ({0:'Keep practicing',1:'Try again',2:'Not quite',3:'You passed',4:'Good job',5:'Excellent!' }[t]);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const total = checkQ1()
      + checkSingle('q2','b','q2-feedback','Two-dimensional layouts')
      + checkSingle('q3','c','q3-feedback','<article>')
      + checkSingle('q4','b','q4-feedback','alt')
      + checkMulti('q5',['justify-content','align-items','flex-direction'],'q5-feedback');

    resultsCard.hidden = false;
    scoreBadge.textContent = `Score: ${total}/5`;
    overallEl.textContent = `Result: ${tierFor(total)}`;

    const msgs = [
      {ok: total>=0, msg:'Element for main page content is <main>.'},
      {ok: total>=0, msg:'Grid is for two-dimensional layouts (rows + columns).'},
      {ok: total>=0, msg:'<article> is semantic; <div>/<span> are generic.'},
      {ok: total>=0, msg:'Use alt for meaningful image text alternatives.'},
      {ok: total>=0, msg:'Flexbox commonly uses justify-content, align-items, flex-direction.'},
    ];
    if (perList){ perList.innerHTML=''; msgs.forEach((m,i)=>{ const li=document.createElement('li'); li.textContent=`Q${i+1}: ${m.msg}`; perList.appendChild(li); }); }
    resultsCard.scrollIntoView({behavior:'smooth', block:'start'});
  });

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn){
    resetBtn.addEventListener('click', () => {
      form.reset();
      document.querySelectorAll('.q-feedback').forEach(el=>{ el.textContent=''; el.className='q-feedback'; });
      document.querySelectorAll('.quiz-form fieldset').forEach(fs=>fs.classList.remove('is-correct','is-incorrect'));
      document.querySelectorAll('label.choice').forEach(l=>l.classList.remove('correct','incorrect','answer'));
      resultsCard.hidden = true; overallEl.textContent=''; scoreBadge.textContent='Score: 0/5';
    });
  }
})();
