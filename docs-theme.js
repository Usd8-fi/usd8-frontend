(function () {
    document.title = "USD8 docs";

    function injectSidebarLogo() {
        var scrollbox = document.querySelector("#mdbook-sidebar .sidebar-scrollbox");
        if (!scrollbox || scrollbox.querySelector(".sidebar-brand")) return;

        var brand = document.createElement("div");
        brand.className = "sidebar-brand";

        var link = document.createElement("a");
        link.className = "sidebar-logo";
        link.href = "/";
        link.setAttribute("aria-label", "USD8 home");

        var logo = document.createElement("img");
        logo.src = "/assets/usd8Logo.svg";
        logo.alt = "USD8";
        link.appendChild(logo);

        var betaLink = document.createElement("a");
        betaLink.className = "sidebar-beta-link";
        betaLink.href = "faqs.html#whats-different-in-beta";
        betaLink.textContent = "beta";

        brand.appendChild(link);
        brand.appendChild(betaLink);
        scrollbox.prepend(brand);
    }

    function injectAppLink() {
        var chapter = document.querySelector("#mdbook-sidebar .chapter");
        if (!chapter || chapter.querySelector(".sidebar-app-link")) return;

        var item = document.createElement("li");
        item.className = "chapter-item sidebar-app-link";

        var wrapper = document.createElement("span");
        wrapper.className = "chapter-link-wrapper";

        var link = document.createElement("a");
        link.href = "/";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "USD8 App";
        var externalIcon = document.createElement("span");
        externalIcon.className = "sidebar-external-icon";
        externalIcon.setAttribute("aria-hidden", "true");
        externalIcon.textContent = "↗";
        link.appendChild(externalIcon);
        wrapper.appendChild(link);
        item.appendChild(wrapper);
        chapter.appendChild(item);
    }

    function addSocialLink(container, className, href, label, glyph) {
        var link = document.createElement("a");
        link.className = className;
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", label);

        var mark = document.createElement("span");
        mark.setAttribute("aria-hidden", "true");
        if (className === "sidebar-x") {
            mark.className = "x-mark";
        } else {
            mark.textContent = glyph;
        }
        link.appendChild(mark);
        container.appendChild(link);
    }

    function injectSocialLinks() {
        var sidebar = document.getElementById("mdbook-sidebar");
        if (!sidebar || sidebar.querySelector(".sidebar-social")) return;

        var social = document.createElement("div");
        social.className = "sidebar-social";
        addSocialLink(social, "sidebar-telegram", "https://t.me/+e84i2oYk1ao1MTk1", "Join our Telegram", "");
        addSocialLink(social, "sidebar-x", "https://x.com/usd8_fi", "Visit our X account", "");
        addSocialLink(social, "sidebar-github", "https://github.com/Usd8-fi", "Visit our GitHub", "");
        sidebar.appendChild(social);
    }

    function initializeFaqs() {
        var title = document.querySelector(".faq-title");
        if (!title) return;

        for (var element = title.nextElementSibling; element;) {
            if (element.tagName !== "H2") {
                element = element.nextElementSibling;
                continue;
            }

            var question = element;
            var answer = document.createElement("div");
            answer.className = "faq-answer";
            answer.hidden = true;

            var next = question.nextElementSibling;
            while (next && next.tagName !== "H2") {
                var following = next.nextElementSibling;
                answer.appendChild(next);
                next = following;
            }
            question.after(answer);

            var link = question.querySelector("a.header");
            if (link) {
                link.classList.add("faq-question");
                link.setAttribute("role", "button");
                link.setAttribute("aria-expanded", "false");
                link.addEventListener("click", function (event) {
                    event.preventDefault();
                    var expanded = this.getAttribute("aria-expanded") === "true";
                    this.setAttribute("aria-expanded", String(!expanded));
                    this.closest("h2").nextElementSibling.hidden = expanded;
                });
            }

            element = next;
        }
    }

    function expandFaqFromHash() {
        if (!window.location.hash) return;

        var id;
        try {
            id = decodeURIComponent(window.location.hash.slice(1));
        } catch (_) {
            return;
        }

        var question = document.getElementById(id);
        if (!question || question.tagName !== "H2") return;

        var link = question.querySelector("a.faq-question");
        var answer = question.nextElementSibling;
        if (!link || !answer || !answer.classList.contains("faq-answer")) return;

        link.setAttribute("aria-expanded", "true");
        answer.hidden = false;
    }

    function initialize() {
        injectSidebarLogo();
        injectAppLink();
        injectSocialLinks();
        initializeFaqs();
        expandFaqFromHash();
    }

    window.addEventListener("hashchange", expandFaqFromHash);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
