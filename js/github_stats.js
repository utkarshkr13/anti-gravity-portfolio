/* ============================================================
   GITHUB STATS & PORTFOLIO FEATURE SPOTLIGHT
   Loads stats dynamically and updates the frontend UI.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Load GitHub stats
  fetch('assets/github_stats.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      updateGitHubUI(data);
    })
    .catch(error => {
      console.error('Error loading GitHub stats:', error);
      // fallback metrics if local assets don't exist yet
      updateGitHubUI(getFallbackStats());
    });

  // Load portfolio design spotlight
  fetch('assets/feature_inspiration.json')
    .then(response => {
      if (response.ok) return response.json();
    })
    .then(data => {
      if (data) {
        // Apply dynamic theme color injection
        if (data.accent_h && data.accent_s && data.accent_l) {
          const h = data.accent_h;
          const s = data.accent_s;
          const l = data.accent_l;
          
          document.documentElement.style.setProperty('--accent-h', h);
          document.documentElement.style.setProperty('--accent-s', s);
          document.documentElement.style.setProperty('--accent-l', l);
          
          console.log(`[Theme Engine] Injected dynamic accent color: hsl(${h}, ${s}, ${l}) representing ${data.theme_name || 'custom'} theme.`);
        }

        // Render showcase card inside portfolioSpotlightText
        const spotlightEl = document.getElementById('portfolioSpotlightText');
        if (spotlightEl) {
          const repoName = data.repo_name || 'unknown/portfolio';
          const stars = data.stars || 0;
          const url = data.url || '#';
          const homepage = data.homepage;
          const trend = data.featured_trend || '';
          const themeName = data.theme_name || 'Steel Blue';
          const lastSync = data.last_sync || 'just now';

          let homepageLink = '';
          if (homepage && homepage !== '#') {
            homepageLink = `
              <a href="${homepage}" target="_blank" rel="noopener" class="spotlight-btn-demo" style="display:inline-flex; align-items:center; gap:4px; font-size:0.75rem; font-weight:700; color:#fff; background:var(--accent); padding:6px 12px; border-radius:6px; transition:all 0.2s; text-decoration:none; margin-right:8px;">
                <i data-lucide="external-link" style="width:12px; height:12px;"></i> Live Demo
              </a>
            `;
          }

          spotlightEl.innerHTML = `
            <div class="spotlight-card-content" style="display:flex; flex-direction:column; gap:12px; color:var(--text-secondary); text-align:left;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <a href="${url}" target="_blank" rel="noopener" style="font-size:0.85rem; font-weight:700; color:var(--text-primary); text-decoration:none; display:flex; align-items:center; gap:4px; transition:color 0.2s;">
                  <i data-lucide="github" style="width:14px; height:14px; display:inline-block; vertical-align:middle;"></i> <span style="vertical-align:middle;">${repoName}</span>
                </a>
                <span style="font-size:0.7rem; font-weight:700; background:var(--bg-subtle-hover); padding:3px 8px; border-radius:100px; color:var(--text-primary); display:flex; align-items:center; gap:4px; border:1px solid var(--border-color);">
                  <i data-lucide="star" style="width:10px; height:10px; color:#f59e0b;"></i> ${stars.toLocaleString()}
                </span>
              </div>
              <p style="font-size:0.78rem; line-height:1.4; color:var(--text-secondary); margin:0;">
                ${trend}
              </p>
              <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-top:4px;">
                <div style="display:flex; align-items:center;">
                  ${homepageLink}
                  <a href="${url}" target="_blank" rel="noopener" style="font-size:0.75rem; font-weight:600; color:var(--text-secondary); border:1px solid var(--border-color); padding:5px 10px; border-radius:6px; transition:all 0.2s; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                    Source Code
                  </a>
                </div>
                <div style="font-size:0.65rem; color:var(--text-tertiary); font-weight:500; text-align:right; line-height:1.3;">
                  Theme: <span style="color:var(--accent); font-weight:700;">${themeName}</span><br/>
                  Synced: ${lastSync}
                </div>
              </div>
            </div>
          `;
          
          // Re-trigger Lucide icons inside spotlight element
          if (window.lucide) {
            window.lucide.createIcons();
          }
        }
      }
    })
    .catch(error => console.log('Error loading design spotlight:', error));
});

function updateGitHubUI(data) {
  const profile = data.profile || {};
  const languages = data.languages || [];
  const repos = data.pinned_repos || [];

  // Update Profile metrics
  const reposEl = document.getElementById('githubReposCount');
  const starsEl = document.getElementById('githubStarsCount');
  const followersEl = document.getElementById('githubFollowersCount');

  if (reposEl) reposEl.innerText = profile.public_repos || '0';
  if (starsEl) starsEl.innerText = profile.total_stars || '0';
  if (followersEl) followersEl.innerText = profile.followers || '0';

  // Update Language distribution list
  const langContainer = document.getElementById('githubLanguagesList');
  if (langContainer) {
    langContainer.innerHTML = '';
    languages.slice(0, 5).forEach(lang => {
      const row = document.createElement('div');
      row.className = 'github-lang-row';
      row.style.marginBottom = '12px';
      
      row.innerHTML = `
        <div class="github-lang-meta" style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600; margin-bottom:4px;">
          <span>${lang.name}</span>
          <span>${lang.percentage}%</span>
        </div>
        <div class="github-lang-bar-bg" style="width:100%; height:6px; background:var(--border-color); border-radius:3px; overflow:hidden;">
          <div class="github-lang-bar-fill" style="width:${lang.percentage}%; height:100%; background:var(--accent); border-radius:3px; transition: width 1s var(--ease-out);"></div>
        </div>
      `;
      langContainer.appendChild(row);
    });
  }

  // Update Repository Cards
  const reposGrid = document.getElementById('githubReposGrid');
  if (reposGrid) {
    reposGrid.innerHTML = '';
    repos.forEach(repo => {
      const card = document.createElement('a');
      card.href = repo.url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.className = 'github-repo-card reveal';
      card.style.display = 'block';

      card.innerHTML = `
        <div class="github-repo-card-inner" style="padding:20px; background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:12px; height:100%; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.3s;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary); margin:0;">${repo.name}</h4>
              <i data-lucide="external-link" style="width:14px; height:14px; color:var(--text-tertiary);"></i>
            </div>
            <p style="font-size:0.78rem; color:var(--text-secondary); line-height:1.4; margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${repo.description}</p>
          </div>
          <div style="display:flex; gap:16px; font-size:0.75rem; color:var(--text-tertiary); font-weight:600;">
            <span style="display:flex; align-items:center; gap:4px;">
              <span style="width:8px; height:8px; border-radius:50%; background:${getLanguageColor(repo.language)}; display:inline-block;"></span>
              ${repo.language}
            </span>
            <span style="display:flex; align-items:center; gap:4px;">
              <i data-lucide="star" style="width:12px; height:12px;"></i>
              ${repo.stars} stars
            </span>
          </div>
        </div>
      `;
      reposGrid.appendChild(card);
    });
    // Create new Lucide icons inside injected HTML
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

function getLanguageColor(lang) {
  const colors = {
    "Python": "#3572A5",
    "JavaScript": "#f1e05a",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "TypeScript": "#3178c6",
    "Go": "#00ADD8",
    "Rust": "#dea584",
    "Java": "#b07219",
    "C++": "#f34b7d"
  };
  return colors[lang] || "#8b949e";
}

function getFallbackStats() {
  return {
    "profile": {
      "username": "utkarshkr13",
      "public_repos": 14,
      "followers": 12,
      "following": 15,
      "total_stars": 8
    },
    "languages": [
      {"name": "Python", "percentage": 48.5},
      {"name": "JavaScript", "percentage": 32.0},
      {"name": "HTML", "percentage": 10.5},
      {"name": "CSS", "percentage": 9.0}
    ],
    "pinned_repos": [
      {
        "name": "anti-gravity-portfolio",
        "description": "Premium dynamic developer portfolio with integrated smooth Lenis scroll, GSAP animations, yfinance ticker, and developer utilities.",
        "stars": 4,
        "language": "JavaScript",
        "url": "https://github.com/utkarshkr13/anti-gravity-portfolio"
      },
      {
        "name": "Side_Quest",
        "description": "Python, automation, and microservices exploring developer utilities and scrapers.",
        "stars": 2,
        "language": "Python",
        "url": "https://github.com/utkarshkr13/Side_Quest"
      }
    ]
  };
}
