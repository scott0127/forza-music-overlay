(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const revealItems = document.querySelectorAll([
        ".overview-grid > div",
        ".feature",
        ".install-grid > div",
        ".ready-note",
        ".usage-card",
        ".install-card",
        ".updates-head",
        ".update",
        "footer .wrap"
      ].join(","));

      revealItems.forEach((item, index) => {
        item.classList.add("reveal");
        item.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 70, 350)}ms`);
      });

      if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12
      });

      revealItems.forEach((item) => observer.observe(item));
    })();

(() => {
      const DL_KEY = "fmo_dl_modal_shown";
      const backdrop = document.getElementById("dlBackdrop");
      const modal = document.getElementById("dlModal");
      const streamEl = document.getElementById("dlStream");
      const actionsEl = document.getElementById("dlActions");
      if (!backdrop || !streamEl) return;

      const MESSAGE = document.getElementById("dlStream").dataset.message.replace(/\n/g, "
");
      const CHAR_DELAY = 38;
      let streamTimeout = null;
      let charIndex = 0;

      function close() {
        clearTimeout(streamTimeout);
        backdrop.classList.remove("is-open");
        sessionStorage.setItem(DL_KEY, "1");
      }

      function streamText() {
        if (charIndex >= MESSAGE.length) {
          // Remove cursor, show actions
          const cursor = streamEl.querySelector(".dl-cursor");
          if (cursor) cursor.remove();
          actionsEl.classList.add("is-shown");
          return;
        }
        const ch = MESSAGE[charIndex];
        // Insert text before cursor
        const cursor = streamEl.querySelector(".dl-cursor");
        if (ch === "\n") {
          cursor.before(document.createElement("br"));
        } else {
          cursor.before(document.createTextNode(ch));
        }
        charIndex++;
        streamTimeout = setTimeout(streamText, CHAR_DELAY);
      }

      function open() {
        if (sessionStorage.getItem(DL_KEY)) return;
        // Reset state
        charIndex = 0;
        streamEl.textContent = "";
        actionsEl.classList.remove("is-shown");
        const cursor = document.createElement("span");
        cursor.className = "dl-cursor";
        streamEl.appendChild(cursor);
        backdrop.classList.add("is-open");
        // Start streaming after title + divider animations finish
        streamTimeout = setTimeout(streamText, 1300);
      }

      document.getElementById("dlClose").addEventListener("click", close);
      document.getElementById("dlSkip").addEventListener("click", close);
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) close();
      });

      // Listen for download clicks
      document.querySelectorAll('[data-dl]').forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault(); // Prevent default link opening
          const dlUrl = link.getAttribute("href");

          // 1. Open the original download modal
          setTimeout(open, 600);

          // 2. Pop up a small donation window (not a full-screen tab)
          window.open("https://buymeacoffee.com/scott5497", "DonateWindow", "width=550,height=800,left=150,top=150");

          // 3. Trigger the actual download
          setTimeout(() => {
            window.location.href = dlUrl;
          }, 200);
        });
      });
    })();