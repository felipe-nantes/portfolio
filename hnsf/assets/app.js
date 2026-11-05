(function () {
  "use strict";

  var albuns = Array.isArray(window.ALBUNS) ? window.ALBUNS : [];
  var raiz = document.getElementById("albuns");
  var nav = document.getElementById("indice");
  var contagem = document.getElementById("contagem");
  var dialog = document.getElementById("lightbox");
  var palco = document.getElementById("lb-palco");
  var lbCaption = document.getElementById("lb-caption");
  var lbCounter = document.getElementById("lb-counter");
  var aberto = { album: 0, item: 0 };
  var origemFoco = null;

  function rotulo(item, album, i) {
    if (item.legenda) return item.legenda;
    return (item.tipo === "video" ? "Vídeo " : "Foto ") + (i + 1) + " de " + album.titulo;
  }

  // ---- Monta índice e álbuns ----
  // Álbuns seguidos com o mesmo "periodo" formam uma seção; álbum sem período é uma seção sozinho.
  var total = 0;
  var fragNav = document.createDocumentFragment();
  var fragAlb = document.createDocumentFragment();
  var secaoAtual = null, chaveAtual = null, chipAtual = null;

  function plural(n) { return n + (n === 1 ? " item" : " itens"); }

  function cabecalho(tag, id, texto, n, classe) {
    var cab = document.createElement("header");
    cab.className = classe;
    var h = document.createElement(tag);
    h.id = id;
    h.textContent = texto;
    var qt = document.createElement("span");
    qt.className = "album__count";
    qt.textContent = plural(n);
    cab.appendChild(h);
    cab.appendChild(qt);
    return cab;
  }

  albuns.forEach(function (album, a) {
    total += album.itens.length;
    var chave = album.periodo || album.titulo;

    if (chave !== chaveAtual) {
      chaveAtual = chave;
      var idSec = album.periodo ? "p-" + album.id : album.id;
      secaoAtual = document.createElement("section");
      secaoAtual.className = "secao";
      secaoAtual.id = idSec;
      var nSec = albuns.filter(function (x) { return (x.periodo || x.titulo) === chave; })
        .reduce(function (s, x) { return s + x.itens.length; }, 0);
      secaoAtual.appendChild(cabecalho("h2", idSec + "-t", chave, nSec, "secao__head"));
      secaoAtual.setAttribute("aria-labelledby", idSec + "-t");
      fragAlb.appendChild(secaoAtual);

      chipAtual = document.createElement("a");
      chipAtual.href = "#" + idSec;
      chipAtual.className = "chip";
      chipAtual.innerHTML = "<span></span><small></small>";
      chipAtual.firstChild.textContent = chave;
      chipAtual.lastChild.textContent = nSec;
      fragNav.appendChild(chipAtual);
    }

    var sec = document.createElement("div");
    sec.className = "album";
    if (album.periodo) {
      sec.id = album.id;
      sec.appendChild(cabecalho("h3", album.id + "-t", album.titulo, album.itens.length, "album__head"));
    }
    secaoAtual.appendChild(sec);

    var ul = document.createElement("ul");
    ul.className = "gallery";
    album.itens.forEach(function (item, i) {
      var li = document.createElement("li");
      li.style.setProperty("--i", Math.min(i, 12));
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile" + (item.tipo === "video" ? " tile--video" : "");
      btn.setAttribute("aria-label", "Ampliar: " + rotulo(item, album, i));
      btn.addEventListener("click", function () { abrir(a, i, btn); });
      var img = document.createElement("img");
      img.src = item.thumb;
      img.alt = "";
      img.width = item.tw;
      img.height = item.th;
      img.decoding = "async";
      img.loading = a === 0 && i < 6 ? "eager" : "lazy";
      btn.appendChild(img);
      if (item.legenda) {
        var cap = document.createElement("span");
        cap.className = "tile__cap";
        cap.textContent = item.legenda;
        btn.appendChild(cap);
      }
      li.appendChild(btn);
      ul.appendChild(li);
    });
    sec.appendChild(ul);
  });

  nav.appendChild(fragNav);
  if (nav.children.length < 2) nav.parentNode.hidden = true;
  raiz.appendChild(fragAlb);
  if (total) {
    contagem.textContent = total + " registros · " + albuns.length + (albuns.length === 1 ? " álbum" : " álbuns");
  }

  // ---- Visualizador ----
  var temDialog = typeof dialog.showModal === "function";

  function pararVideo() {
    var v = palco.querySelector("video");
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
  }

  function mostrar(i) {
    var album = albuns[aberto.album];
    var n = album.itens.length;
    aberto.item = (i + n) % n;
    var item = album.itens[aberto.item];
    pararVideo();
    palco.textContent = "";
    var el;
    if (item.tipo === "video") {
      el = document.createElement("video");
      el.controls = true;
      el.playsInline = true;
      el.preload = "metadata";
      el.poster = item.capa;
      el.src = item.src;
    } else {
      el = document.createElement("img");
      el.src = item.src;
      el.alt = rotulo(item, album, aberto.item);
      el.draggable = false;
    }
    el.className = "lightbox__media";
    palco.appendChild(el);
    lbCaption.textContent = item.legenda || album.titulo;
    lbCounter.textContent = (aberto.item + 1) + " / " + n;
    [aberto.item + 1, aberto.item - 1].forEach(function (j) {
      var v = album.itens[(j + n) % n];
      if (v && v.tipo !== "video") { var p = new Image(); p.src = v.src; }
    });
  }

  function abrir(a, i, botao) {
    var item = albuns[a].itens[i];
    if (!temDialog) { window.open(item.src, "_blank", "noopener"); return; }
    aberto.album = a;
    origemFoco = botao;
    mostrar(i);
    dialog.showModal();
    document.body.classList.add("lb-open");
  }

  function fechar() { if (dialog.open) dialog.close(); }

  dialog.addEventListener("close", function () {
    pararVideo();
    palco.textContent = "";
    document.body.classList.remove("lb-open");
    if (origemFoco) origemFoco.focus();
  });

  document.getElementById("lb-close").addEventListener("click", fechar);
  document.getElementById("lb-prev").addEventListener("click", function () { mostrar(aberto.item - 1); });
  document.getElementById("lb-next").addEventListener("click", function () { mostrar(aberto.item + 1); });

  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); mostrar(aberto.item + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); mostrar(aberto.item - 1); }
  });

  dialog.addEventListener("click", function (e) {
    if (e.target === dialog || e.target === palco || e.target.classList.contains("lightbox__figure")) fechar();
  });

  // Deslizar para os lados troca a foto
  var x0 = null, y0 = null;
  palco.addEventListener("pointerdown", function (e) { x0 = e.clientX; y0 = e.clientY; });
  palco.addEventListener("pointerup", function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0, dy = e.clientY - y0;
    x0 = y0 = null;
    if (e.target.tagName === "VIDEO" && Math.abs(dx) < 80) return; // não atrapalhar os controles
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) mostrar(aberto.item + (dx < 0 ? 1 : -1));
  });
  palco.addEventListener("pointercancel", function () { x0 = y0 = null; });
})();
