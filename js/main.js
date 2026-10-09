(function(){document.documentElement.setAttribute('data-theme',sGet('sb_theme','dark'));paintTheme();render();if(!P&&!sGet('sb_skip',false))startOB(true);
  loadSheet().then(ok=>{if(ok)render()})})();
