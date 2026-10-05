import { NextResponse } from "next/server";
import { appUrl } from "@/lib/http";
import { LOCALES, popupCopy } from "@/lib/i18n";

export async function GET() {
  const origin = appUrl();
  const pops = Object.fromEntries(LOCALES.map((locale) => [locale, popupCopy(locale)]));
  const js = `(() => {
  var s = document.currentScript;
  var code = s && s.getAttribute("data-code");
  if (!code) return;
  var lang = (navigator.language || "en").slice(0,2);
  var pops = ${JSON.stringify(pops)};
  function esc(v){
    return String(v == null ? "" : v)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  fetch(${JSON.stringify(origin)} + "/api/track/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: code, locale: navigator.language })
  }).then(function(r){ return r.json(); }).then(function(data){
    if (!data || !data.landerUrl) return;
    if (!data.country) {
      fetch("https://ipwho.is/").then(function(r){ return r.json(); }).then(function(geo){
        if (!geo || !geo.success || !geo.country_code) return;
        fetch(${JSON.stringify(origin)} + "/api/geo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clickId: data.clickId, country: geo.country_code, ip: geo.ip })
        }).catch(function(){});
      }).catch(function(){});
    }
    try { history.pushState({dm:1}, "", location.href); } catch(e) {}
    window.addEventListener("popstate", function(){
      fetch(${JSON.stringify(origin)} + "/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "back_button", clickId: data.clickId }),
        keepalive: true
      }).catch(function(){});
      location.replace(data.landerUrl);
    });
    var pop = Object.assign({}, pops[lang] || pops.en, data.popup || {});
    var widget = Object.assign({ exitPopup: true, timedPopup: false, timedPopupSec: 15 }, data.widget || {});
    var shown = false;
    function popup(){
      if (shown) return;
      shown = true;
      fetch(${JSON.stringify(origin)} + "/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "exit_shown", clickId: data.clickId }),
        keepalive: true
      }).catch(function(){});
      var wrap = document.createElement("div");
      wrap.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:16px;font-family:'IBM Plex Sans',Segoe UI,sans-serif";
      wrap.innerHTML = '<div style="max-width:420px;width:100%;background:#181818;color:#ece8e1;padding:22px;border:1px solid #2b2b2b"><h3 style="margin:0 0 10px;font-size:22px;font-weight:600">' +
        esc(pop.title) + '</h3><p style="margin:0;color:#8f8a82;line-height:1.5">' + esc(pop.text) +
        '</p><button id="dm-go" style="margin-top:16px;width:100%;padding:11px;border:0;background:#ff5a1f;color:#140800;font-weight:700;cursor:pointer">' +
        esc(pop.cta) + '</button><button id="dm-x" style="margin-top:8px;width:100%;background:none;border:0;color:#8f8a82;cursor:pointer">' +
        esc(pop.close) + '</button></div>';
      document.body.appendChild(wrap);
      wrap.querySelector("#dm-go").onclick = function(){
        fetch(${JSON.stringify(origin)} + "/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "exit_clicked", clickId: data.clickId }),
          keepalive: true
        }).catch(function(){});
        location.href = data.landerUrl;
      };
      wrap.querySelector("#dm-x").onclick = function(){
        fetch(${JSON.stringify(origin)} + "/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "exit_closed", clickId: data.clickId }),
          keepalive: true
        }).catch(function(){});
        wrap.remove();
      };
    }
    if (widget.exitPopup) {
      document.addEventListener("mouseout", function(e){
        if (e.clientY <= 8) popup();
      });
    }
    if (widget.timedPopup) {
      var sec = Number(widget.timedPopupSec);
      if (!isFinite(sec) || sec < 1) sec = 15;
      setTimeout(popup, Math.min(3600, sec) * 1000);
    }
  }).catch(function(){});
})();`;

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
