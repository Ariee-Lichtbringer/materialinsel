const subjects = {
  "praktische-philosophie": {
    name: "Praktische Philosophie", image: "../../assets/fach-praktische-philosophie.png", accent: "#0b8792",
    subtitle: "Denken, prüfen und begründen",
    materials: {
      7: [{
        title: "Wenn Bauch und Kopf streiten",
        description: "Gefühls- und Verstandesentscheidungen auf dem Prüfstand – mit Immanuel Kant als philosophischer Grundlage.",
        files: [{ label: "Arbeitsmappe als PDF", href: "../../materialien/praktische-philosophie/Arbeitsmappe_PP_Bauch_und_Kopf_2026_Klasse7.pdf" }]
      }],
      8: [{
        title: "Stell dir eine Welt vor, in der …",
        description: "Utopien und ihre politische Funktion – Thomas Morus und Ernst Bloch vergleichen, Zukunftsbilder prüfen und eine eigene politische Utopie entwickeln.",
        files: [{ label: "Arbeitsmappe als PDF", href: "../../materialien/praktische-philosophie/Arbeitsmappe_PP_Utopien_2026_Klasse8.pdf" }]
      }]
    }
  },
  "geschichte": { name: "Geschichte", image: "../../assets/fach-geschichte.png", accent: "#a65d38", subtitle: "Vergangenheit untersuchen und Gegenwart verstehen", materials: {} },
  "gl": { name: "Gesellschaftslehre", image: "../../assets/fach-gl.png", accent: "#24778e", subtitle: "Räume, Zeiten und Gesellschaft zusammendenken", materials: {} },
  "deutsch": { name: "Deutsch", image: "../../assets/fach-deutsch.png", accent: "#8d4e86", subtitle: "Lesen, schreiben, sprechen und Sprache untersuchen", materials: {} },
  "politik": { name: "Politik", image: "../../assets/fach-politik.png", accent: "#466a3b", subtitle: "Gesellschaft verstehen, urteilen und mitbestimmen", materials: {} }
};

const key = document.body.dataset.subject;
const subject = subjects[key];
document.documentElement.style.setProperty("--fach-accent", subject.accent);
document.title = `${subject.name} · Materialinsel`;
document.querySelector("[data-name]").textContent = subject.name;
document.querySelector("[data-subtitle]").textContent = subject.subtitle;
document.querySelector("[data-icon]").innerHTML = `<img src="${subject.image}" alt="">`;

const list = document.querySelector("[data-grades]");
for (let grade = 5; grade <= 10; grade += 1) {
  const details = document.createElement("details");
  details.className = "grade";
  if (subject.materials[grade]) details.open = true;
  const summary = document.createElement("summary");
  summary.textContent = `Jahrgang ${grade}`;
  const content = document.createElement("div");
  content.className = "grade__content";
  const themes = subject.materials[grade] || [];
  if (!themes.length) {
    content.innerHTML = '<p class="empty">Für diesen Jahrgang werden die Themenbereiche und Materialien nach und nach ergänzt.</p>';
  } else {
    themes.forEach((theme) => {
      const article = document.createElement("article");
      article.className = "theme";
      const buttons = theme.files.map(file => `<a class="download-button" href="${file.href}" download>${file.label} <span aria-hidden="true">↓</span></a>`).join("");
      article.innerHTML = `<p class="eyebrow teal">THEMENBEREICH</p><h3>${theme.title}</h3><p>${theme.description}</p><div class="download-row">${buttons}</div>`;
      content.appendChild(article);
    });
  }
  details.append(summary, content);
  list.appendChild(details);
}
