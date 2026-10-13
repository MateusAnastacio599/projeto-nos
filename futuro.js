/* O livro só abre depois da confirmação. O modo de teste não altera o pedido real. */
(() => {
 const debug = new URLSearchParams(location.search).get('debug') === '1';
 const acceptedAt = debug
  ? sessionStorage.getItem('projetoNos_debugProposalAcceptedAt')
  : localStorage.getItem('projetoNos_proposalAcceptedAt');
 const hasAccepted = acceptedAt && Number.isFinite(Date.parse(acceptedAt));
 const backHref = debug ? 'index.html?debug=1#update' : 'index.html#update';
 document.querySelectorAll('a[href="index.html#update"]').forEach(a => a.href = backHref);
 if (!hasAccepted) { document.getElementById('futureLocked').hidden = false; return; }
 document.getElementById('futureContent').hidden = false;
 document.querySelectorAll('[data-art]').forEach(el => { el.innerHTML = nosIcon(el.dataset.art); });
 document.getElementById('futurePixel').innerHTML = nosPixelScene();
 const date = new Intl.DateTimeFormat('pt-BR', { dateStyle:'long', timeZone:'America/Sao_Paulo' }).format(new Date(acceptedAt));
 document.getElementById('proposalDate').textContent = `12 de outubro de 2026. A gente ficou noivo.`;
})();
