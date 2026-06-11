/* ============================================================
   Portenhocas — comportamento do site
   ============================================================ */

(function () {
  "use strict";

  /* ---- Repulgue (trança) gerado em SVG e aplicado aos divisores ---- */
  var braid =
    "<svg xmlns='http://www.w3.org/2000/svg' width='56' height='16'>" +
    "<g stroke='#1B2B4D' stroke-width='1'>" +
    "<rect x='-13' y='-4.5' width='26' height='9' rx='4.5' fill='#75AADB' transform='translate(7,8) rotate(-42)'/>" +
    "<rect x='-13' y='-4.5' width='26' height='9' rx='4.5' fill='#FFFDF8' transform='translate(21,8) rotate(-42)'/>" +
    "<rect x='-13' y='-4.5' width='26' height='9' rx='4.5' fill='#E8A33D' transform='translate(35,8) rotate(-42)'/>" +
    "<rect x='-13' y='-4.5' width='26' height='9' rx='4.5' fill='#3E6B2F' transform='translate(49,8) rotate(-42)'/>" +
    "</g></svg>";
  var uri = 'url("data:image/svg+xml,' + encodeURIComponent(braid) + '")';
  document.querySelectorAll(".repulgue").forEach(function (el) {
    el.style.backgroundImage = uri;
  });

  /* ---- Menu mobile ---- */
  var toggle = document.getElementById("navtoggle");
  var links = document.getElementById("navlinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
      });
    });
  }

  /* ---- Reveal ao rolar (respeitando preferências de movimento) ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach(function (el) {
      obs.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---- Montador de pedido (2 passos) ---- */
  (function () {
    var PRICE = 9,
      DOZEN = 90,
      DSIZE = 12,
      MINQ = 1,
      MAXQ = 120;
    var FLAVORS = [
      { name: "Carne suave" },
      { name: "Carne à faca" },
      { name: "Carne picante", hot: true },
      { name: "Carne à faca picante", hot: true },
      { name: "Camarão baiano" },
      { name: "4 queijos" },
      { name: "Roquefort com presunto" },
      { name: "Queijo com cebola" }
    ];
    var qty = 12,
      counts = {};
    var $ = function (id) { return document.getElementById(id); };
    var step1 = $("step1"), step2 = $("step2");
    if (!step1 || !step2) return;

    function priceFor(n) { return Math.floor(n / DSIZE) * DOZEN + (n % DSIZE) * PRICE; }
    function fmt(n) { return "R$ " + Math.round(n); }
    function sumCounts() { var s = 0; for (var k in counts) { s += counts[k]; } return s; }

    function updatePreview() {
      var total = priceFor(qty), full = qty * PRICE, save = full - total;
      $("qval").textContent = qty;
      $("ppTotal").textContent = fmt(total);
      var d = qty + " empanada" + (qty > 1 ? "s" : "");
      if (save > 0) {
        $("ppDetail").innerHTML = d + ' · <span class="pp-save">economia de ' + fmt(save) + "</span>";
      } else {
        $("ppDetail").textContent = d;
      }
      $("osTotal").textContent = fmt(total);
      $("qchips").querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("active", parseInt(b.dataset.q, 10) === qty);
      });
    }

    function setQty(n) {
      qty = Math.min(MAXQ, Math.max(MINQ, n));
      counts = {};
      updatePreview();
    }

    $("qchips").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) setQty(parseInt(b.dataset.q, 10));
    });
    $("qminus").addEventListener("click", function () { setQty(qty - 1); });
    $("qplus").addEventListener("click", function () { setQty(qty + 1); });

    function renderFlavors() {
      var box = $("flavors");
      box.innerHTML = "";
      FLAVORS.forEach(function (f) {
        if (counts[f.name] == null) counts[f.name] = 0;
        var row = document.createElement("div");
        row.className = "frow";
        var name = document.createElement("div");
        name.className = "fname";
        name.textContent = f.name;
        if (f.hot) {
          var t = document.createElement("span");
          t.className = "pill-hot";
          t.textContent = "picante";
          name.appendChild(t);
        }
        var step = document.createElement("div");
        step.className = "fstep";
        var minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Tirar " + f.name);
        var c = document.createElement("span");
        c.className = "fcount";
        c.textContent = counts[f.name];
        var plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Adicionar " + f.name);
        minus.addEventListener("click", function () {
          if (counts[f.name] > 0) { counts[f.name]--; c.textContent = counts[f.name]; updateRemaining(); }
        });
        plus.addEventListener("click", function () {
          if (sumCounts() < qty) { counts[f.name]++; c.textContent = counts[f.name]; updateRemaining(); }
        });
        step.appendChild(minus);
        step.appendChild(c);
        step.appendChild(plus);
        row.appendChild(name);
        row.appendChild(step);
        box.appendChild(row);
      });
    }

    function updateRemaining() {
      var sum = sumCounts(), rem = qty - sum;
      var remBox = $("remaining"), full = sum >= qty;
      $("remBar").style.width = (qty ? (sum / qty) * 100 : 0) + "%";
      if (rem > 0) {
        $("remText").textContent = "Faltam " + rem + " de " + qty;
        remBox.classList.remove("done");
      } else {
        $("remText").textContent = "Pronto! " + qty + " empanadas selecionadas";
        remBox.classList.add("done");
      }
      $("sendOrder").disabled = !(sum === qty && sum > 0);
      $("flavors").querySelectorAll(".fstep button:last-child").forEach(function (p) {
        p.disabled = full;
      });
    }

    $("toStep2").addEventListener("click", function () {
      renderFlavors();
      step1.hidden = true;
      step2.hidden = false;
      updateRemaining();
      var smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      step2.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "nearest" });
    });

    $("backStep1").addEventListener("click", function () {
      step2.hidden = true;
      step1.hidden = false;
    });

    $("sendOrder").addEventListener("click", function () {
      var lines = [];
      FLAVORS.forEach(function (f) {
        if (counts[f.name] > 0) lines.push("• " + f.name + " × " + counts[f.name]);
      });
      var total = priceFor(qty);
      var msg =
        "Olá! Quero fazer um pedido na Portenhocas 🥟\n\n" +
        "Quantidade: " + qty + " empanadas\n" +
        lines.join("\n") + "\n\n" +
        "Total: " + fmt(total) + "\n" +
        "Retirada/entrega com 5 dias de antecedência.";
      window.open("https://wa.me/5521989859840?text=" + encodeURIComponent(msg), "_blank");
    });

    updatePreview();
  })();
})();
