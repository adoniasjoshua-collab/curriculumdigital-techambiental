// Adonias PROD10X - JSON-driven rendering (UTF-8, no BOM)
(function () {
  const qs = (sel) => document.querySelector(sel);

  function parseJsonTolerant(text) {
    if (typeof text !== 'string') return null;
    // Remove BOM
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    // Remove trailing commas in objects/arrays
    text = text.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(text);
  }

  async function fetchJson(path) {
    try {
      const url = path + (path.includes('?') ? '&' : '?') + 'v=' + Date.now();
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      // Decode manually to handle incorrect encodings and fix minor issues
      const buf = await res.arrayBuffer();
      const decUtf8 = new TextDecoder('utf-8', { fatal: false });
      let text = decUtf8.decode(buf);
      try {
        return parseJsonTolerant(text);
      } catch (_) {
        try {
          // Fallback: try Windows-1252 decoding
          const dec1252 = new TextDecoder('windows-1252', { fatal: false });
          text = dec1252.decode(buf);
          return parseJsonTolerant(text);
        } catch (e2) {
          throw e2;
        }
      }
    } catch (err) {
      console.error(`Erro ao carregar ${path}:`, err);
      return null;
    }
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    const append = (c) => {
      if (c == null) return;
      if (Array.isArray(c)) c.forEach(append);
      else if (c instanceof Node) node.appendChild(c);
      else node.appendChild(document.createTextNode(String(c)));
    };
    append(children);
    return node;
  }

  function normalizeExperience(data) {
    if (!data) return [];
    // Accept either: { experiencia: [...] } or a top-level array [...]
    const list = Array.isArray(data) ? data : (Array.isArray(data.experiencia) ? data.experiencia : []);
    return list;
  }

  function renderExperience(data) {
    const mount = qs('#experiencia-list');
    if (!mount) return;
    const list = normalizeExperience(data);
    if (!Array.isArray(list) || !list.length) {
      mount.innerHTML = '';
      return;
    }
    mount.innerHTML = '';
    const firstOf = (obj, keys, fallback = '') => {
      for (const k of keys) {
        if (obj && obj[k] != null && obj[k] !== '') return obj[k];
      }
      return fallback;
    };
    const formatYM = (s) => {
      if (!s || typeof s !== 'string') return '';
      // Try YYYY-MM or YYYY-MM-DD -> keep YYYY-MM
      const m = /^([0-9]{4})[-/ ]?([0-9]{2})?/.exec(s);
      if (m) {
        const y = m[1];
        const mo = m[2];
        return mo ? `${y}-${mo}` : y;
      }
      return s;
    };
    list.forEach((job) => {
      const empresa = firstOf(job, ['empresa', 'company', 'empresa_nome']);
      const cargo = firstOf(job, ['cargo', 'funcao', 'titulo', 'posição', 'posicao']);
      const local = firstOf(job, ['local', 'localidade', 'cidade']);
      const inicio = firstOf(job, ['inicio', 'início', 'start']);
      const fim = firstOf(job, ['fim', 'término', 'termino', 'end']) || 'Atual';

      const header = el('header', {}, [
        el('span', { class: 'empresa' }, empresa || ''),
        cargo ? el('span', { class: 'cargo' }, `— ${cargo}`) : null,
        (inicio || fim) ? el('span', { class: 'periodo' }, `${formatYM(inicio)} – ${formatYM(fim)}`.trim()) : null,
        local ? el('span', { class: 'local' }, `• ${local}`) : null,
      ]);

      const desc = job.descricao || job.itens || job.atividades;
      const bullets = Array.isArray(desc)
        ? el('ul', {}, desc.map((d) => el('li', {}, d)))
        : (typeof desc === 'string' && desc.trim() ? el('p', {}, desc) : null);

      const tech = firstOf(job, ['tecnologias', 'stack']);
      const stack = Array.isArray(tech) && tech.length
        ? el('div', { class: 'stack' }, [
            el('strong', {}, 'Stack: '),
            ...tech.map((t) => el('span', { class: 'tag' }, t)),
          ])
        : null;

      const card = el('article', { class: 'item' }, [header, bullets, stack]);
      mount.appendChild(card);
    });
  }

  function normalizeQualifications(data) {
    if (!data) return [];
    const list = Array.isArray(data) ? data : (Array.isArray(data.qualificacoes) ? data.qualificacoes : []);
    return list
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return item.text || item.nome || item.titulo || item.label || '';
        }
        return '';
      })
      .filter(Boolean);
  }

  function renderQualifications(data) {
    const mount = qs('#qualificacoes-list');
    if (!mount) return;
    const list = normalizeQualifications(data);
    mount.innerHTML = '';
    list.forEach((q) => {
      mount.appendChild(el('li', { class: 'tag' }, q));
    });
  }

  function normalizeEducation(data) {
    if (!data) return [];
    return Array.isArray(data) ? data : (Array.isArray(data.formacao) ? data.formacao : []);
  }

  function renderEducation(data) {
    const mount = qs('#formacao-list');
    if (!mount) return;
    const list = normalizeEducation(data);
    if (!Array.isArray(list) || !list.length) {
      mount.innerHTML = '';
      return;
    }
    mount.innerHTML = '';
    list.forEach((f) => {
      const periodo = (f.inicio || f.fim)
        ? `${f.inicio || ''}${(f.inicio && f.fim) ? ' – ' : ''}${f.fim || (f.inicio ? 'Atual' : '')}`
        : '';
      const header = el('header', {}, [
        el('span', { class: 'empresa' }, f.instituicao || ''),
        f.curso ? el('span', { class: 'cargo' }, `— ${f.curso}`) : null,
        periodo ? el('span', { class: 'periodo' }, periodo) : null,
      ]);

      let details = null;
      if (Array.isArray(f.detalhes)) {
        details = el('ul', {}, f.detalhes.map((d) => el('li', {}, d)));
      } else if (typeof f.detalhes === 'string' && f.detalhes.trim()) {
        details = el('p', {}, f.detalhes);
      }

      mount.appendChild(el('article', { class: 'item' }, [header, details]));
    });
  }

  function renderLanguages(data) {
    const mount = qs('#idiomas-list');
    if (!mount || !data || !Array.isArray(data.idiomas)) return;
    mount.innerHTML = '';
    data.idiomas.forEach((i) => {
      mount.appendChild(el('li', { class: 'tag' }, `${i.idioma} — ${i.nivel}`));
    });
  }

  async function init() {
    const [exp, qua, edu, idi] = await Promise.all([
      fetchJson('assets/data/experiencia.json'),
      fetchJson('assets/data/qualificacoes.json'),
      fetchJson('assets/data/formacao.json'),
      fetchJson('assets/data/idiomas.json'),
    ]);
    renderExperience(exp);
    renderQualifications(qua);
    renderEducation(edu);
    renderLanguages(idi);

    const btn = qs('#btn-imprimir');
    if (btn) btn.addEventListener('click', () => window.print());
  }

  window.addEventListener('DOMContentLoaded', init);
})();
