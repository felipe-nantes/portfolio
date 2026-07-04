/* ============================================================
   FELIPE NANTES · PORTFÓLIO — interações
   Vanilla JS. Sem dependências.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. Cursor glow (efeito interativo) ---------- */
  var glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    var gx = 0, gy = 0, cx = 0, cy = 0;
    document.addEventListener("mousemove", function (e) { gx = e.clientX; gy = e.clientY; });
    (function loop() {
      cx += (gx - cx) * 0.14;
      cy += (gy - cy) * 0.14;
      glow.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 2. Menu mobile ---------- */
  var burger = document.querySelector(".burger");
  var links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      links.classList.toggle("open");
      var open = links.classList.contains("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("open");
        links.classList.remove("open");
      });
    });
  }

  /* ---------- 3. Scroll reveal (efeito interativo) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 4. Barras de skill animam ao aparecer ---------- */
  var bars = document.querySelectorAll(".bar i");
  if (bars.length && "IntersectionObserver" in window) {
    var bo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.getAttribute("data-w") + "%";
          bo.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { bo.observe(b); });
  }

  /* ---------- 5. Texto digitado no hero ---------- */
  var typedEl = document.querySelector("[data-typed]");
  if (typedEl) {
    var phrases = JSON.parse(typedEl.getAttribute("data-typed"));
    var pi = 0, ci = 0, deleting = false;
    var out = typedEl.querySelector(".typed-out");
    function tick() {
      var word = phrases[pi];
      if (!deleting) {
        out.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; return setTimeout(tick, 1600); }
      } else {
        out.textContent = word.slice(0, --ci);
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
      }
      setTimeout(tick, deleting ? 40 : 78);
    }
    tick();
  }

  /* ---------- 6. Filtro de projetos por linguagem ---------- */
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".card[data-lang]");
  if (chips.length && cards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var f = chip.getAttribute("data-filter");
        cards.forEach(function (card) {
          var match = f === "all" || card.getAttribute("data-lang") === f;
          card.style.display = match ? "flex" : "none";
        });
      });
    });
  }

  /* ---------- 7. Validação do formulário de contato ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    var note = form.querySelector(".form-note");

    function setState(field, ok, msg) {
      field.classList.remove("valid", "invalid");
      field.classList.add(ok ? "valid" : "invalid");
      var e = field.querySelector(".err");
      if (e) e.textContent = ok ? "" : msg;
      return ok;
    }

    function validName(f) {
      var v = f.querySelector("input").value.trim();
      if (v.length < 2) return setState(f, false, "Informe seu nome (mín. 2 caracteres).");
      return setState(f, true);
    }
    function validEmail(f) {
      var v = f.querySelector("input").value.trim();
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!re.test(v)) return setState(f, false, "E-mail inválido.");
      return setState(f, true);
    }
    function validSubject(f) {
      var v = f.querySelector("input").value.trim();
      if (v.length < 3) return setState(f, false, "Assunto muito curto.");
      return setState(f, true);
    }
    function validMsg(f) {
      var v = f.querySelector("textarea").value.trim();
      if (v.length < 10) return setState(f, false, "Mensagem muito curta (mín. 10 caracteres).");
      return setState(f, true);
    }

    var fName = form.querySelector('[data-field="name"]');
    var fMail = form.querySelector('[data-field="email"]');
    var fSubj = form.querySelector('[data-field="subject"]');
    var fMsg  = form.querySelector('[data-field="message"]');

    // validação em tempo real após o primeiro blur
    [[fName, validName], [fMail, validEmail], [fSubj, validSubject], [fMsg, validMsg]].forEach(function (pair) {
      var field = pair[0], fn = pair[1];
      var el = field.querySelector("input, textarea");
      el.addEventListener("blur", function () { fn(field); });
      el.addEventListener("input", function () {
        if (field.classList.contains("invalid")) fn(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = validName(fName) & validEmail(fMail) & validSubject(fSubj) & validMsg(fMsg);
      if (ok) {
        note.classList.add("show");
        note.textContent = "Valeu, " +
          fName.querySelector("input").value.trim().split(" ")[0] +
          "! Mensagem conferida e pronta pra sair.";
        form.reset();
        [fName, fMail, fSubj, fMsg].forEach(function (f) { f.classList.remove("valid", "invalid"); });
        setTimeout(function () { note.classList.remove("show"); }, 6000);
      } else {
        note.classList.remove("show");
      }
    });
  }

  /* ---------- 8. Ano no rodapé ---------- */
  var y = document.querySelector("#year");
  if (y) y.textContent = new Date().getFullYear();

})();
