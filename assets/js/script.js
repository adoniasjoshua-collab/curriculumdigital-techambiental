// Basic interaction for the resume site
(function(){
  // If running in Node (e.g., accidental `node assets/js/script.js`), exit gracefully.
  if (typeof window === "undefined" || typeof document === "undefined") {
    // Informative message for developers running the file directly
    // (this script is intended to run in the browser environment).
    // Avoid throwing errors when executed with Node.
    try { console.log("Skipping browser-only script: run this in a browser (open index.html)."); } catch(e){}
    return;
  }

  document.addEventListener("DOMContentLoaded", function(){
  // Update year in footer
    const yearEl = document.getElementById("year");
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile nav toggle
    const navToggle = document.getElementById("nav-toggle");
    const mainNav = document.getElementById("main-nav");
    if(navToggle && mainNav){
      navToggle.addEventListener("click", function(){
        mainNav.classList.toggle("open");
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!expanded));
      });
    }

    // Close mobile nav when a link is clicked
    document.querySelectorAll("#main-nav a").forEach(a => a.addEventListener("click", ()=>{
      if(mainNav) mainNav.classList.remove("open");
    }));

    // Download PDF placeholder
    const downloadBtn = document.getElementById("download-pdf");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function (e) {
        e.preventDefault();
        generatePDFClassic();
      });
    }

    // Function to generate PDF (improved): Step 1 capture, Step 2 paginate, Step 3 save
    async function generatePDF() {
    // Validate libraries
      if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
        alert("Bibliotecas de exportação PDF não carregadas. Tente recarregar a página.");
        window.print();
        return;
      }

      const jsPDF = window.jspdf.jsPDF;

      // Prepare element to capture
      const resumeElement = document.querySelector("#main-content");
      if (!resumeElement) {
        alert("Erro: Não foi possível encontrar o conteúdo para exportar.");
        return;
      }

      // Hide elements that should not be captured (if any)
      const screenHeader = document.querySelector(".resume-header-print");
      if (screenHeader) screenHeader.style.display = "none";

      try {
      // Ensure fonts loaded and allow rendering to settle
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        await new Promise(r => setTimeout(r, 500));

        // Step 1 capture: render at target pixel width for 300dpi A4 (2480 x 3508 px)
        const desiredPxWidth = 2480; // A4 @300dpi width
        const elementRect = resumeElement.getBoundingClientRect();
        const scale = desiredPxWidth / Math.max(1, Math.round(elementRect.width));

        const canvas = await html2canvas(resumeElement, {
          scale: scale,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollY: -window.scrollY
        });

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Step 2 paginate: split canvas into A4 slices (3508 px height)
        const pagePixelHeight = 3508; // A4 @300dpi height
        const totalPages = Math.ceil(canvasHeight / pagePixelHeight);

        // Create PDF in points (pt) to match 1in=72pt margins
        const pdf = new jsPDF("portrait", "pt", "a4");
        const pageWidthPt = pdf.internal.pageSize.getWidth();
        const pageHeightPt = pdf.internal.pageSize.getHeight();
        const marginPt = 72; // 1 inch
        const contentWidthPt = pageWidthPt - marginPt * 2;

        for (let page = 0; page < totalPages; page++) {
        // Create a page-sized canvas and draw the slice
          const sliceHeight = Math.min(pagePixelHeight, canvasHeight - page * pagePixelHeight);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvasWidth;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, page * pagePixelHeight, canvasWidth, sliceHeight, 0, 0, canvasWidth, sliceHeight);

          // Convert to image and add to PDF
          const imgData = pageCanvas.toDataURL("image/jpeg", 1.0);
          const imgWidthPt = contentWidthPt;
          const imgHeightPt = (sliceHeight * (imgWidthPt / canvasWidth));

          if (page > 0) pdf.addPage();
          // Step 2.5 add header (name/title) at top of each page
          pdf.setFillColor(255,255,255);
          pdf.rect(0,0,pageWidthPt,pageHeightPt,"F");
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          pdf.setTextColor(38,70,83);
          pdf.text("Adonias Pereira da Silva", marginPt, marginPt - 20);
          pdf.setFontSize(10);
          pdf.setTextColor(107,112,92);
          pdf.text("Desenvolvedor Full Stack — Sustentabilidade e Automação", marginPt, marginPt - 6);

          pdf.addImage(imgData, "JPEG", marginPt, marginPt, imgWidthPt, imgHeightPt);

          // Footer with page number and date
          const currentDate = new Date().toLocaleDateString("pt-BR");
          const footerText = `Currículo — ${currentDate}  •  Página ${page + 1} de ${totalPages}`;
          pdf.setFontSize(9);
          pdf.setTextColor(107,112,92);
          pdf.text(footerText, pageWidthPt - marginPt, pageHeightPt - 36, { align: "right" });
        }

        // Step 3 save
        pdf.save("Curriculo_Adonias_PROD10X.pdf");
      } catch (err) {
        console.error("Erro ao gerar PDF:", err);
        alert("Erro ao gerar PDF. Usando fallback de impressão.");
        window.print();
      } finally {
      // Restore header visibility
        if (screenHeader) screenHeader.style.display = "";
      }
    }

    \n\n    // Classic generator kept for stability\n    async function generatePDFClassic(){\n      if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {\n        alert('Bibliotecas de PDF n�o carregadas. Tente recarregar a p�gina.');\n        window.print();\n        return;\n      }\n      const jsPDF = window.jspdf.jsPDF;\n      const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'portrait' });\n      const el = document.querySelector('#main-content');\n      if (!el) { alert('Conte�do n�o encontrado.'); return; }\n      try {\n        if (document.fonts && document.fonts.ready) await document.fonts.ready;\n        const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });\n        const imgData = canvas.toDataURL('image/png');\n        const pdfW = pdf.internal.pageSize.getWidth();\n        const pdfH = pdf.internal.pageSize.getHeight();\n        const imgW = pdfW;\n        const imgH = (canvas.height * imgW) / canvas.width;\n        let heightLeft = imgH;\n        let position = 0;\n        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);\n        heightLeft -= pdfH;\n        while (heightLeft > 0) {\n          position = heightLeft - imgH;\n          pdf.addPage();\n          pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);\n          heightLeft -= pdfH;\n        }\n        pdf.save('Curriculo_Adonias_PROD10X.pdf');\n      } catch (e) {\n        console.error('Erro ao gerar PDF:', e);\n        alert('Erro ao gerar PDF. Usando fallback de impress�o.');\n        window.print();\n      }\n    }\n// Sticky header shadow toggle on scroll
    const header = document.querySelector(".site-header");
    if(header){
      window.addEventListener("scroll", function(){
        if(window.scrollY > 10) header.classList.add("scrolled"); else header.classList.remove("scrolled");
      });
    }

  // TODO: Add accessible animations and reveal-on-scroll effects
  });

/* Normalize and correct Experience texts (runtime patch to avoid encoding issues)
document.addEventListener('DOMContentLoaded', function(){
  // SEO: ensure runtime title/description reflect optimized values
  document.title = 'Adonias Pereira da Silva — Técnico em Meio Ambiente e Segurança com Automação Digital';
  const ensureMeta = (name, content)=>{
    let m = document.querySelector(`meta[name="${name}"]`);
    if(!m){ m = document.createElement('meta'); m.setAttribute('name', name); document.head.appendChild(m); }
    m.setAttribute('content', content);
  };
  ensureMeta('description', 'Currículo profissional de Adonias Silva — especialista em Meio Ambiente, Segurança do Trabalho e Automação Digital no projeto S11D.');
  // Open Graph tags
  const ensureOG = (prop, content)=>{
    let m = document.querySelector(`meta[property="${prop}"]`);
    if(!m){ m = document.createElement('meta'); m.setAttribute('property', prop); document.head.appendChild(m); }
    m.setAttribute('content', content);
  };
  ensureOG('og:title', 'Currículo Adonias PROD10X');
  ensureOG('og:description', 'Dupla habilitação técnica + Full Stack com IA e Automação Digital.');
  ensureOG('og:type', 'website');
  ensureOG('og:image', 'assets/img/preview.png');
  ensureOG('og:url', 'https://adoniasprod10x.com');
  // Normalize SEO text with Unicode escapes to avoid encoding issues
  document.title = 'Adonias Pereira da Silva \u2014 T\u00e9cnico em Meio Ambiente e Seguran\u00e7a com Automa\u00e7\u00e3o Digital';
  ensureMeta('description', 'Curr\u00edculo profissional de Adonias Silva \u2014 especialista em Meio Ambiente, Seguran\u00e7a do Trabalho e Automa\u00e7\u00e3o Digital no projeto S11D.');
  ensureOG('og:title', 'Curr\u00edculo Adonias PROD10X');
  ensureOG('og:description', 'Dupla habilita\u00e7\u00e3o t\u00e9cnica + Full Stack com IA e Automa\u00e7\u00e3o Digital.');
  const jobs = document.querySelectorAll('#experiencia .job');
  if (!jobs || jobs.length === 0) return;

  // Helper to create LI with text
  const li = (t)=>{ const el=document.createElement('li'); el.textContent=t; return el; };

  // Pöyry entry (4th job card)
  if (jobs[3]) {
    const ul = jobs[3].querySelector('ul');
    if (ul) {
      ul.innerHTML = '';
      ul.append(
        li('Atuação durante a implantação do Projeto Níquel em Conceição do Araguaia.'),
        li('Monitoramento ambiental de contratadas e coordenação de indicadores, com foco em melhoria contínua.')
      );
    }
  }

  // CPC / Copa Cons entry (5th job card)
  if (jobs[4]) {
    const firstLi = jobs[4].querySelector('ul li');
    if (firstLi) {
      firstLi.textContent = 'Atuação durante a implantação do Projeto Níquel em Conceição do Araguaia (Copa Cons), garantindo conformidade com ISO 14001 e requisitos do cliente.';
    }
  }

  // PLAMONT (08/11/2021 – 05/07/2022) entry (6th job card) — update bullets
  if (jobs[5]) {
    const ul = jobs[5].querySelector('ul');
    if (ul) {
      ul.innerHTML = '';
      ul.append(
        li('Inspeções de campo e apoio a rotinas de monitoramento ambiental.'),
        li('Gestão interna de documentação e requisitos legais de meio ambiente.'),
        li('Consolidação de dados e digitalização de relatórios (Excel, Google Sheets).')
      );
    }
  }

  // Qualifications: turn (AppSheet) into links for the two demo apps
  try {
    const qualItem = Array.from(document.querySelectorAll('#qualificacoes li'))
      .find(li => /Desenvolvimento\s+de\s+Apps/i.test(li.textContent));
    if (qualItem) {
      const strongEl = qualItem.querySelector('strong');
      if (strongEl) {
        strongEl.innerHTML = 'Desenvolvimento de Apps (<a class="ext-link" href="https://www.appsheet.com/start/37011907-c333-42d8-81d3-6ed5e5bb8a50" target="_blank" rel="noopener noreferrer">AppSheet — Desvios</a>, <a class="ext-link" href="https://www.appsheet.com/start/42449764-ff9f-4dd6-9845-294aad8477b1" target="_blank" rel="noopener noreferrer">AppSheet — Maturidade 10X5S</a>) &amp; Automações Digitais (n8n)';
      }
    }
  } catch (e) { /* noop */ }

  // Reapply corrected Portuguese strings with Unicode escapes (avoid mojibake)
  try {
    if (jobs[3]) {
      const ul = jobs[3].querySelector('ul');
      if (ul) {
        ul.innerHTML = '';
        ul.append(
          li('Atua\u00e7\u00e3o durante a implanta\u00e7\u00e3o do Projeto N\u00edquel em Concei\u00e7\u00e3o do Araguaia.'),
          li('Monitoramento ambiental de contratadas e coordena\u00e7\u00e3o de indicadores, com foco em melhoria cont\u00ednua.')
        );
      }
    }
    if (jobs[4]) {
      const firstLi = jobs[4].querySelector('ul li');
      if (firstLi) firstLi.textContent = 'Atua\u00e7\u00e3o durante a implanta\u00e7\u00e3o do Projeto N\u00edquel em Concei\u00e7\u00e3o do Araguaia (Copa Cons), garantindo conformidade com ISO 14001 e requisitos do cliente.';
    }
    if (jobs[5]) {
      const ul = jobs[5].querySelector('ul');
      if (ul) {
        ul.innerHTML = '';
        ul.append(
          li('Inspe\u00e7\u00f5es de campo e apoio a rotinas de monitoramento ambiental.'),
          li('Gest\u00e3o interna de documenta\u00e7\u00e3o e requisitos legais de meio ambiente.'),
          li('Consolida\u00e7\u00e3o de dados e digitaliza\u00e7\u00e3o de relat\u00f3rios (Excel, Google Sheets).')
        );
      }
    }
  } catch(e){}

  // Highlight contract period and remove job title text for SARENS (7th) and ETI (8th)
  function highlightPeriod(jobIndex){
    const job = jobs[jobIndex];
    if(!job) return;
    const p = job.querySelector('p');
    if(!p) return;
    const txt = p.textContent || '';
    const m = txt.match(/(\d{2}\/\d{2}\/\d{4}|\d{4})\s*[\u2013\-]\s*(\d{2}\/\d{2}\/\d{4}|\d{4})/);
    const period = m ? `${m[1]} – ${m[2]}` : txt.replace(/^.*?\|\s*/, '').trim();
    p.innerHTML = `<span class="period-badge">Período: ${period}</span>`;
  }
  for (let i = 0; i < jobs.length; i++) { try { highlightPeriod(i); } catch(e){} }
  highlightPeriod(6); // SARENS
  highlightPeriod(7); // ETI
  // Re-run with corrected Unicode label to avoid encoding issues
  function highlightPeriodFixed(jobIndex){
    const job = jobs[jobIndex]; if(!job) return;
    const p = job.querySelector('p'); if(!p) return;
    const txt = p.textContent || '';
    const m = txt.match(/(\d{2}\/\d{2}\/\d{4}|\d{4})\s*[\u2013\-]\s*(\d{2}\/\d{2}\/\d{4}|\d{4})/);
    const period = m ? `${m[1]} \u2013 ${m[2]}` : txt.replace(/^.*?\|\s*/, '').trim();
    p.innerHTML = `<span class=\"period-badge\">Per\u00edodo: ${period}</span>`;
  }
  for (let i=0;i<jobs.length;i++) try{ highlightPeriodFixed(i);}catch(e){}
}); */

  // Minimal, safe enhancements (idempotent)
  document.addEventListener('DOMContentLoaded', function(){
    // Build QR code images for print header (uses external QR service)
    try {
      document.querySelectorAll('img.qr[data-url]').forEach(img => {
        const raw = img.getAttribute('data-url') || '';
        const abs = new URL(raw, window.location.href).toString();
        const api = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(abs);
        img.setAttribute('src', api);
      });
    } catch(e){}
    // Turn (AppSheet) reference into links in Qualifications
    try {
      const qualItem = Array.from(document.querySelectorAll('#qualificacoes li'))
        .find(li => /Desenvolvimento\s+de\s+Apps/i.test(li.textContent));
      if (qualItem) {
        const strongEl = qualItem.querySelector('strong');
        if (strongEl) {
          strongEl.innerHTML = 'Desenvolvimento de Apps (<a class="ext-link" href="https://www.appsheet.com/start/37011907-c333-42d8-81d3-6ed5e5bb8a50" target="_blank" rel="noopener noreferrer">AppSheet — Desvios</a>, <a class="ext-link" href="https://www.appsheet.com/start/42449764-ff9f-4dd6-9845-294aad8477b1" target="_blank" rel="noopener noreferrer">AppSheet — Maturidade 10X5S</a>) &amp; Automações Digitais (n8n)';
        }
      }
    } catch (e) { /* noop */ }

    // Append "Período" badge next to role/dates without removing role text
    const jobs = document.querySelectorAll('#experiencia .job');
    function appendPeriodBadge(p){
      if (!p || p.querySelector('.period-badge')) return;
      const txt = p.textContent || '';
      const m = txt.match(/(\d{2}\/\d{2}\/\d{4}|\d{4})\s*[\u2013\-]\s*(\d{2}\/\d{2}\/\d{4}|\d{4})/);
      const period = m ? `${m[1]} \u2013 ${m[2]}` : txt.replace(/^.*?\|\s*/, '').trim();
      if (!period) return;
      const left = (p.innerHTML.split('|')[0] || p.innerHTML).trim();
      p.innerHTML = `${left} <span class=\"period-badge\">Per\u00edodo: ${period}</span>`;
    }
    jobs.forEach(job => { const p = job.querySelector('p'); if (p) appendPeriodBadge(p); });
  });

})();



