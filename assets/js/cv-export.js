// CV Export + small UX helpers (UTF-8 clean)
(function(){
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  document.addEventListener('DOMContentLoaded', function(){
    // Footer year
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // Mobile nav toggle (kept minimal)
    var navToggle = document.getElementById('nav-toggle');
    var mainNav = document.getElementById('main-nav');
    if (navToggle && mainNav){
      navToggle.addEventListener('click', function(){
        mainNav.classList.toggle('open');
        var expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
      });
      document.querySelectorAll('#main-nav a').forEach(function(a){
        a.addEventListener('click', function(){ mainNav.classList.remove('open'); });
      });
    }

    // Sticky header shadow
    var header = document.querySelector('.site-header');
    if (header){
      window.addEventListener('scroll', function(){
        if (window.scrollY > 10) header.classList.add('scrolled'); else header.classList.remove('scrolled');
      });
    }

    // Download CV (robust A4 export)
    var btn = document.getElementById('download-pdf');
    if (btn){
      btn.addEventListener('click', function(evt){
        evt.preventDefault();
        evt.stopImmediatePropagation(); // avoid other handlers, if any
        generatePDF(btn);
      }, true);
    }
  });

  async function generatePDF(buttonEl){
    var label = buttonEl ? buttonEl.textContent : '';
    var setBusy = function(b){ if(!buttonEl) return; buttonEl.disabled=!!b; buttonEl.textContent = b ? 'Gerando PDF…' : (label||'Baixar CV'); };

    try{
      if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF){
        alert('Bibliotecas de PDF não carregadas. Usando impressão do navegador.');
        return window.print();
      }
      setBusy(true);
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF('portrait','pt','a4');
      var el = document.querySelector('#main-content');
      if (!el){ setBusy(false); return alert('Conteúdo não encontrado.'); }

      // Wait fonts and small settle
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      await new Promise(function(r){ setTimeout(r,150); });

      // Temporarily hide Projects section for PDF
      var projects = document.querySelector('section.projects');
      var prevDisplay = projects ? projects.style.display : null;
      if (projects) projects.style.display = 'none';

      var canvas = await html2canvas(el, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' });
      var pageW = pdf.internal.pageSize.getWidth();
      var pageH = pdf.internal.pageSize.getHeight();
      var mm = 2.834645669; // 1mm in pt
      var mTop = 25*mm, mSide = 20*mm, mBottom = 20*mm;
      var headerH = 18; // pt space for header text

      var contentW = pageW - mSide*2;
      var imgW = contentW;
      var imgH = (canvas.height * imgW) / canvas.width;
      var imgData = canvas.toDataURL('image/png');

      var remaining = imgH;
      var position = 0; // negative offset for subsequent pages
      var pageIndex = 0;
      do {
        if (pageIndex>0) pdf.addPage();
        // Header
        pdf.setFont('helvetica','bold');
        pdf.setFontSize(11);
        pdf.setTextColor(38,70,83);
        pdf.text('Adonias Pereira da Silva — Resume', mSide, mTop - 6);
        // Content slice
        var y = mTop + headerH + position;
        pdf.addImage(imgData, 'PNG', mSide, y, imgW, imgH);
        // Footer page number
        pdf.setFontSize(9); pdf.setTextColor(90);
        pdf.text('Página ' + (pageIndex+1), pageW - mSide, pageH - 14, { align: 'right' });

        var pageContentH = pageH - mTop - mBottom - headerH;
        remaining -= pageContentH;
        position = remaining - imgH;
        pageIndex++;
      } while (remaining > 0);

      pdf.save('Adonias_Pereira_da_Silva_CV.pdf');
    } catch(err){
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF. Usando impressão do navegador.');
      window.print();
    } finally {
      // Restore hidden section
      try { if (projects) projects.style.display = prevDisplay || ''; } catch(e){}
      setBusy(false);
    }
  }
})();
