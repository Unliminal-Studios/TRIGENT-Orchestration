// Public recognition only. No Sponsors API, payment data, or account tokens.
// Add individuals and organizations to TRIGENT_LANDING_DATA.supporters.
// Individuals use { github, displayName? }; identity and links always use github.
// Organizations use { name, url, logo }; logos are approved local asset paths.
(() => {
  const safeLink = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  };

  const normalize = (directory = {}) => {
    const result = { individuals: [], organizations: [] };
    for (const key of Object.keys(result)) {
      const seen = new Set();
      const entries = Array.isArray(directory?.[key]) ? directory[key] : [];
      for (const entry of entries) {
        if (!entry || typeof entry !== 'object') continue;
        const individual = key === 'individuals';
        const name = individual ? entry.github : entry.name;
        if (typeof name !== 'string' || !name.trim()) continue;
        if (individual && !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(name)) continue;
        const identity = name.trim().toLowerCase();
        if (seen.has(identity)) continue;
        seen.add(identity);
        const href = individual ? `https://github.com/${name}` : safeLink(entry.url);
        const logo = !individual && typeof entry.logo === 'string' && /^assets\/[a-z\d_.@-]+\.(?:png|jpe?g|webp|svg)$/i.test(entry.logo) ? entry.logo : null;
        const displayName = individual && typeof entry.displayName === 'string' ? entry.displayName.trim() : '';
        const label = displayName ? `${displayName}（${name}）` : name.trim();
        result[key].push({ name: label, href, logo });
      }
    }
    return result;
  };

  const render = (directory = {}, copy = {}, root = document) => {
    const normalized = normalize(directory);
    for (const [key, emptyCopy] of [['individuals', copy.personalEmpty], ['organizations', copy.corporateEmpty]]) {
      const list = root.querySelector(`[data-supporter-list="${key}"]`);
      const empty = root.querySelector(`[data-supporter-empty="${key}"]`);
      if (!list || !empty) continue;
      const individual = key === 'individuals';
      const cards = [];
      for (const { name, href, logo } of normalized[key]) {
        const card = root.createElement('li');
        const content = root.createElement(href ? 'a' : 'div');
        content.setAttribute('class', individual ? 'supporter-name' : 'supporter-organization');
        if (href) {
          content.setAttribute('href', href);
          content.setAttribute('target', '_blank');
          content.setAttribute('rel', 'noopener noreferrer');
        }
        if (logo) {
          const image = root.createElement('img');
          image.setAttribute('src', logo);
          image.setAttribute('alt', ''); // The organization name is always visible below.
          image.setAttribute('loading', 'lazy');
          image.setAttribute('decoding', 'async');
          image.addEventListener('error', () => { image.hidden = true; });
          content.append(image);
        }
        const label = root.createElement('span');
        label.textContent = name;
        content.append(label);
        if (individual) {
          const arrow = root.createElement('span');
          arrow.setAttribute('aria-hidden', 'true');
          arrow.textContent = '↗';
          content.append(arrow);
        }
        card.append(content);
        cards.push(card);
      }
      list.replaceChildren(...cards);
      list.hidden = cards.length === 0;
      empty.textContent = emptyCopy || '';
      empty.hidden = cards.length !== 0;
    }
  };
  window.TRIGENT_SUPPORTERS = { render, normalize };
})();
