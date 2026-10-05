/* ============================================================
   EduNavigator — Frontend ↔ Backend Connector
   API Base: http://localhost:5000/api
   For production, update API_BASE to your deployed server URL.
   ============================================================ */

const API_BASE = 'http://localhost:5000/api';
const isSubpage = location.pathname.includes('/pages/');
const pathPrefix = isSubpage ? '../' : '';
const pagePrefix = isSubpage ? '' : 'pages/';

/* ---------- Auth Helpers ---------- */
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

/* ============================================================
   BOOT — runs on every page
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // AOS animations
  if (window.AOS) AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 60 });

  // Navbar scroll effect
  const nav = document.querySelector('.navbar-edu');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  // Active nav-link highlight
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-edu .nav-link').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === currentPath) a.classList.add('active');
  });

  // Auth state (login modal / user menu)
  initAuth();

  // Page-specific init
  const page = currentPath.toLowerCase();
  if      (page === 'universities.html')    initUniversitiesPage();
  else if (page === 'admissions.html')      initAdmissionsPage();
  else if (page === 'compare.html')         initComparePage();
  else if (page === 'recommendation.html')  initRecommendationPage();
  else if (page === 'scholarships.html')    initScholarshipsPage();
  else if (page === 'my-applications.html') initMyApplicationsPage();
  else if (page === 'contact.html')         initContactPage();
  else if (page === 'notifications.html')   initNotificationsPage();
  else if (page === 'index.html' || page === '') initHomePage();
});

/* ============================================================
   AUTH — Login / Register modal + user menu
   ============================================================ */
function initAuth() {
  const userObj   = getUser();
  const token     = getToken();
  const loginBtns  = document.querySelectorAll('.btn-login');
  const signupBtns = document.querySelectorAll('.btn-signup');

  if (userObj && token) {
    // Replace login/signup buttons in navbar with user dropdown
    const authGroup = document.querySelector('.auth-nav-btns') || (loginBtns.length > 0 ? loginBtns[0].parentElement : null);
    if (authGroup) {
      const searchBtn = authGroup.querySelector('.nav-search');
      authGroup.innerHTML = '';
      if (searchBtn) authGroup.appendChild(searchBtn);

      const dropdown = document.createElement('div');
      dropdown.className = 'user-menu-dropdown';
      dropdown.innerHTML = `
        <button class="user-menu-btn" type="button">
          <i class="bi bi-person-circle"></i> ${userObj.name.split(' ')[0]}
        </button>
        <div class="user-dropdown-content">
          <div class="user-dropdown-header">
            <strong>${userObj.name}</strong>
            <span>${userObj.email || 'Student Account'}</span>
          </div>
          <a href="#"><i class="bi bi-person me-1"></i> Profile</a>
          <a href="${pathPrefix}${pagePrefix}my-applications.html"><i class="bi bi-file-earmark-text me-1"></i> My Applications</a>
          <a href="${pathPrefix}${pagePrefix}universities.html"><i class="bi bi-bookmark-heart me-1"></i> Saved Universities</a>
          <a href="#"><i class="bi bi-gear me-1"></i> Settings</a>
          <hr />
          <button id="logoutBtn" class="w-100 border-0 text-start bg-transparent text-danger fw-semibold"><i class="bi bi-box-arrow-right me-1"></i> Logout</button>
        </div>
      `;
      authGroup.appendChild(dropdown);

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          location.reload();
        });
      }
    }
  } else {
    // Inject auth modal if not already present
    if (!document.querySelector('.auth-overlay')) {
      const modalHTML = `
        <div class="auth-overlay">
          <div class="auth-modal-card">
            <button class="btn-close-modal"><i class="bi bi-x-lg"></i></button>
            <ul class="nav nav-tabs justify-content-center" id="authTabs" role="tablist">
              <li class="nav-item">
                <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#loginFormTab" type="button" role="tab">Sign In</button>
              </li>
              <li class="nav-item">
                <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#registerFormTab" type="button" role="tab">Sign Up</button>
              </li>
            </ul>
            <div class="tab-content" id="authTabsContent">
              <!-- LOGIN -->
              <div class="tab-pane fade show active" id="loginFormTab" role="tabpanel">
                <form id="modalLoginForm">
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Email Address</label>
                    <input type="email" class="form-control" id="loginEmail" required placeholder="name@domain.com">
                  </div>
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Password</label>
                    <input type="password" class="form-control" id="loginPassword" required placeholder="••••••••">
                  </div>
                  <button type="submit" class="btn btn-edu-primary w-100 mt-2">Sign In</button>
                </form>
              </div>
              <!-- REGISTER -->
              <div class="tab-pane fade" id="registerFormTab" role="tabpanel">
                <form id="modalRegisterForm">
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Full Name</label>
                    <input type="text" class="form-control" id="regName" required placeholder="e.g. Ali Khan">
                  </div>
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Email Address</label>
                    <input type="email" class="form-control" id="regEmail" required placeholder="name@domain.com">
                  </div>
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Phone Number</label>
                    <input type="text" class="form-control" id="regPhone" placeholder="03XXXXXXXXX">
                  </div>
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">City</label>
                    <input type="text" class="form-control" id="regCity" placeholder="e.g. Islamabad">
                  </div>
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Password</label>
                    <input type="password" class="form-control" id="regPassword" required placeholder="Min 6 characters">
                  </div>
                  <button type="submit" class="btn btn-edu-primary w-100 mt-2">Sign Up</button>
                </form>
              </div>
            </div>
            <div id="authAlert" class="alert alert-danger mt-3 d-none rounded-4 py-2 small"></div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      const overlay  = document.querySelector('.auth-overlay');
      const closeBtn = document.querySelector('.btn-close-modal');

      closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('active');
      });

      // --- Login submit ---
      document.getElementById('modalLoginForm').addEventListener('submit', async e => {
        e.preventDefault();
        const alertDiv = document.getElementById('authAlert');
        alertDiv.classList.add('d-none');
        try {
          const res  = await fetch(`${API_BASE}/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              email:    document.getElementById('loginEmail').value.trim(),
              password: document.getElementById('loginPassword').value,
            }),
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            overlay.classList.remove('active');
            location.reload();
          } else {
            alertDiv.textContent = data.message || 'Login failed. Check your credentials.';
            alertDiv.classList.remove('d-none');
          }
        } catch {
          alertDiv.textContent = 'Server connection error. Is the backend running on port 5000?';
          alertDiv.classList.remove('d-none');
        }
      });

      // --- Register submit ---
      document.getElementById('modalRegisterForm').addEventListener('submit', async e => {
        e.preventDefault();
        const alertDiv = document.getElementById('authAlert');
        alertDiv.classList.add('d-none');
        try {
          const res  = await fetch(`${API_BASE}/auth/register`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              name:     document.getElementById('regName').value.trim(),
              email:    document.getElementById('regEmail').value.trim(),
              phone:    document.getElementById('regPhone').value.trim(),
              city:     document.getElementById('regCity').value.trim(),
              password: document.getElementById('regPassword').value,
            }),
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            overlay.classList.remove('active');
            location.reload();
          } else {
            alertDiv.textContent = data.message || 'Registration failed.';
            alertDiv.classList.remove('d-none');
          }
        } catch {
          alertDiv.textContent = 'Server connection error. Is the backend running on port 5000?';
          alertDiv.classList.remove('d-none');
        }
      });
    }

    const openAuthModal = (targetTabId) => {
      const overlay = document.querySelector('.auth-overlay');
      if (!overlay) return;
      const tabBtn = document.getElementById(targetTabId);
      if (tabBtn) {
        if (window.bootstrap && bootstrap.Tab) {
          const tab = bootstrap.Tab.getOrCreateInstance(tabBtn);
          tab.show();
        } else {
          tabBtn.click();
        }
      }
      overlay.classList.add('active');
    };

    document.querySelectorAll('.btn-login').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openAuthModal('login-tab');
      });
    });

    document.querySelectorAll('.btn-signup').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openAuthModal('register-tab');
      });
    });
  }
}

/* Guard: opens login modal if not authenticated, returns false */
function requireLogin() {
  if (!getToken()) {
    const overlay = document.querySelector('.auth-overlay');
    if (overlay) overlay.classList.add('active');
    return false;
  }
  return true;
}

/* ============================================================
   HOME PAGE (index.html)
   ============================================================ */
async function initHomePage() {
  // Update university count stat from DB
  try {
    const res  = await fetch(`${API_BASE}/universities?limit=1`);
    const data = await res.json();
    if (data.success) {
      const uniCounter = document.querySelector('[data-target="250"]');
      if (uniCounter) {
        uniCounter.dataset.target = data.total;
        uniCounter.textContent    = data.total + '+';
      }
    }
  } catch { /* stat counter is non-critical */ }

  // Newsletter subscribe (UI feedback only)
  const nForm = document.getElementById('newsletterForm');
  if (nForm) {
    nForm.addEventListener('submit', e => {
      e.preventDefault();
      const input = nForm.querySelector('input[type="email"]');
      if (input) {
        showToast(`Subscribed! Updates will be sent to ${input.value}.`, 'success');
        input.value = '';
      }
    });
  }


}

/* ============================================================
   UNIVERSITIES PAGE (universities.html)
   ============================================================ */
/* ============================================================
   UNIVERSITIES PAGE (universities.html) - Category-First Flow
   ============================================================ */
async function initUniversitiesPage() {
  const categoriesView       = document.getElementById('categoriesView');
  const categoriesGrid       = document.getElementById('categoriesGrid');
  const universityListView   = document.getElementById('universityListView');
  const universitiesGrid     = document.getElementById('universitiesGrid');
  const btnBackToCategories  = document.getElementById('btnBackToCategories');
  const pageHeroTitle        = document.getElementById('pageHeroTitle');
  const pageHeroSubtitle     = document.getElementById('pageHeroSubtitle');
  const breadcrumbCategory   = document.getElementById('breadcrumbCategory');
  const selectedCategoryHeading = document.getElementById('selectedCategoryHeading');

  const catSearchInput  = document.getElementById('catSearchInput');
  const catCitySelect   = document.getElementById('catCitySelect');
  const catSectorSelect = document.getElementById('catSectorSelect');
  const catFilterBtn    = document.getElementById('catFilterBtn');

  if (!categoriesGrid) return;

  let currentCategory = null;

  // Populate city filter options dynamically
  async function loadCityOptions() {
    if (!catCitySelect) return;
    try {
      const res = await fetch(`${API_BASE}/universities/cities`);
      const data = await res.json();
      if (data.success && Array.isArray(data.cities)) {
        catCitySelect.innerHTML = '<option value="">All Cities</option>' + 
          data.cities.map(c => `<option value="${c}">${c}</option>`).join('');
      }
    } catch {}
  }
  loadCityOptions();

  // Load and render dynamic categories
  async function loadCategories() {
    categoriesGrid.innerHTML = `
      <div class="text-center w-100 py-5">
        <div class="loading-spinner"></div>
        <p class="mt-3 text-muted">Loading University Categories...</p>
      </div>`;

    try {
      const res = await fetch(`${API_BASE}/universities/categories`);
      const data = await res.json();

      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        categoriesGrid.innerHTML = '';
        data.categories.forEach((cat, idx) => {
          const col = document.createElement('div');
          col.className = 'col-12 col-md-6 col-lg-4 col-xl-3';
          col.setAttribute('data-aos', 'fade-up');
          col.setAttribute('data-aos-delay', (idx % 4) * 100);

          col.innerHTML = `
            <div class="category-card" data-category="${cat.name}">
              <div>
                <div class="category-icon-wrap">
                  <i class="bi ${cat.icon || 'bi-mortarboard-fill'}"></i>
                </div>
                <div class="category-title">${cat.name}</div>
                <div class="category-desc">${cat.description || 'Explore specialized programs and institutes.'}</div>
              </div>
              <div>
                <span class="category-count-pill">(${cat.count || 0} Universities)</span>
              </div>
            </div>
          `;

          col.querySelector('.category-card').addEventListener('click', () => {
            selectCategory(cat.name);
          });

          categoriesGrid.appendChild(col);
        });
      } else {
        categoriesGrid.innerHTML = `<div class="alert alert-warning w-100">No categories found in database.</div>`;
      }
    } catch (e) {
      categoriesGrid.innerHTML = `<div class="alert alert-danger w-100">Failed to load categories. Is the backend running on port 5000?</div>`;
    }
  }

  // Switch to Stage 2: Selected Category Universities List
  async function selectCategory(catName) {
    currentCategory = catName;
    if (pageHeroTitle) pageHeroTitle.textContent = catName;
    if (pageHeroSubtitle) pageHeroSubtitle.textContent = `Showing universities offering ${catName}`;
    if (selectedCategoryHeading) selectedCategoryHeading.textContent = catName;

    if (breadcrumbCategory) {
      breadcrumbCategory.innerHTML = `<a href="#" id="breadcrumbReset">${catName}</a>`;
      const bReset = document.getElementById('breadcrumbReset');
      if (bReset) bReset.addEventListener('click', e => { e.preventDefault(); showCategoriesView(); });
    }

    if (catSearchInput) {
      catSearchInput.value = '';
      catSearchInput.placeholder = `Search within ${catName}...`;
    }
    if (catCitySelect) catCitySelect.value = '';
    if (catSectorSelect) catSectorSelect.value = '';

    categoriesView.classList.add('d-none');
    universityListView.classList.remove('d-none');

    await fetchUniversitiesByCategory();
  }

  // Restore Stage 1: Categories View
  function showCategoriesView() {
    currentCategory = null;
    if (pageHeroTitle) pageHeroTitle.textContent = 'University Categories';
    if (pageHeroSubtitle) pageHeroSubtitle.textContent = 'Select a category to explore specialized universities in Pakistan.';
    if (breadcrumbCategory) breadcrumbCategory.textContent = 'Universities';

    universityListView.classList.add('d-none');
    categoriesView.classList.remove('d-none');
  }

  // Fetch universities belonging to selected category from backend
  async function fetchUniversitiesByCategory() {
    if (!universitiesGrid || !currentCategory) return;

    universitiesGrid.innerHTML = `
      <div class="text-center w-100 py-5">
        <div class="loading-spinner"></div>
        <p class="mt-3 text-muted">Fetching universities in ${currentCategory}...</p>
      </div>`;

    let url = `${API_BASE}/universities?category=${encodeURIComponent(currentCategory)}&limit=50`;

    if (catSearchInput?.value.trim()) {
      url += `&search=${encodeURIComponent(catSearchInput.value.trim())}`;
    }
    if (catCitySelect?.value) {
      url += `&city=${encodeURIComponent(catCitySelect.value)}`;
    }
    if (catSectorSelect?.value) {
      url += `&sector=${encodeURIComponent(catSectorSelect.value)}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        universitiesGrid.innerHTML = '';
        data.items.forEach((uni, idx) => {
          const rank = uni.ranking ? `#${uni.ranking}` : 'N/A';
          const defaultImg = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80';
          const calc = calculateClientAdmissionStatus(uni.admissionStatus?.lastDate);
          const statusText = calc.isOpen ? (calc.isLastDay ? 'Last Day' : 'Open') : 'Closed';
          const statusCls  = calc.isOpen ? (calc.isLastDay ? 'badge-status closing' : 'badge-status') : 'badge-status closed';
          
          const minFee = uni.programs?.length
            ? Math.min(...uni.programs.map(p => p.feePerSemester || Infinity))
            : null;
          const feeStr = minFee && isFinite(minFee) ? `PKR ${(minFee/1000).toFixed(0)}K / sem` : 'Fee N/A';

          const uniCard = document.createElement('div');
          uniCard.className = 'col-md-6 col-lg-4';
          uniCard.setAttribute('data-aos', 'fade-up');
          uniCard.setAttribute('data-aos-delay', (idx % 3) * 100);

          uniCard.innerHTML = `
            <div class="uni-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div class="img-wrap">
                  <img src="${uni.campusImage || uni.image || defaultImg}" alt="${uni.name}" onerror="this.src='${defaultImg}'" />
                  <span class="badge-rank">Rank ${rank}</span>
                  <span class="${statusCls}">${statusText}</span>
                </div>
                <div class="body p-3">
                  <h5 class="fw-bold mb-1">${uni.shortName || uni.name}</h5>
                  <small class="d-block mb-2 text-muted">${uni.name}</small>
                  <div class="meta d-flex justify-content-between text-muted small mb-2">
                    <span><i class="bi bi-geo-alt me-1"></i>${uni.city}, ${uni.province || 'Pakistan'}</span>
                    <span class="badge bg-light text-dark border">${uni.sector || 'Public'}</span>
                  </div>
                  <p class="fee fw-semibold text-primary mb-2">${feeStr}</p>
                  <p class="small text-muted line-clamp-2" style="font-size:0.85rem;">${uni.name} is a recognized ${uni.sector || 'Public'} sector institution located in ${uni.city}.</p>
                </div>
              </div>
              <div class="p-3 pt-0">
                <div class="uni-actions-group">
                  <a href="${uni.website || '#'}" target="_blank" class="btn btn-sm btn-outline-primary" title="View Details">
                    <i class="bi bi-eye me-1"></i> Details
                  </a>
                  <a href="${pagePrefix}compare.html?uni=${uni._id}" class="btn btn-sm btn-outline-warning" title="Compare">
                    <i class="bi bi-arrow-left-right me-1"></i> Compare
                  </a>
                  <a href="${pagePrefix}apply.html?uni=${uni._id}" class="btn btn-sm btn-edu-primary" title="Apply Now">
                    <i class="bi bi-send me-1"></i> Apply
                  </a>
                </div>
              </div>
            </div>
          `;

          universitiesGrid.appendChild(uniCard);
        });
      } else {
        universitiesGrid.innerHTML = `
          <div class="text-center w-100 py-5">
            <i class="bi bi-search-heart display-4 text-muted"></i>
            <h5 class="mt-3 text-muted">No universities found in ${currentCategory} matching your filters.</h5>
          </div>`;
      }
    } catch {
      universitiesGrid.innerHTML = `<div class="alert alert-danger w-100">Error fetching universities for ${currentCategory}.</div>`;
    }
  }

  // Event Listeners
  btnBackToCategories?.addEventListener('click', showCategoriesView);
  catFilterBtn?.addEventListener('click', fetchUniversitiesByCategory);
  catSearchInput?.addEventListener('keyup', e => { if (e.key === 'Enter') fetchUniversitiesByCategory(); });

  // Initial call to load categories grid
  loadCategories();
}

/* ============================================================
   SHARED ADMISSION STATUS CALCULATION HELPER
   ============================================================ */
function calculateClientAdmissionStatus(deadlineInput) {
  if (!deadlineInput) {
    return { status: 'Closed', remainingDays: 'Deadline Passed', isOpen: false, isLastDay: false };
  }
  const deadline = new Date(deadlineInput);
  if (isNaN(deadline.getTime())) {
    return { status: 'Closed', remainingDays: 'Deadline Passed', isOpen: false, isLastDay: false };
  }

  const now = new Date();
  const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineReset = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

  const diffTime = deadlineReset.getTime() - todayReset.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'Closed', remainingDays: 'Deadline Passed', isOpen: false, isLastDay: false };
  } else if (diffDays === 0) {
    return { status: 'Open', remainingDays: 'Last Day to Apply', isOpen: true, isLastDay: true };
  } else {
    return {
      status: 'Open',
      remainingDays: `${diffDays} day${diffDays === 1 ? '' : 's'} left`,
      isOpen: true,
      isLastDay: false,
    };
  }
}

/* ============================================================
   ADMISSIONS PAGE (admissions.html)
   ============================================================ */
async function initAdmissionsPage() {
  const tbody = document.querySelector('table tbody');
  const searchInput = document.getElementById('admissionSearchInput');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="loading-spinner"></div></td></tr>';

  let loadedAdmissions = [];

  function helperFormatUrl(url) {
    if (!url) return '#';
    const trimmed = url.trim();
    if (!trimmed) return '#';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function renderRows(items) {
    tbody.innerHTML = '';

    // Filter out missing, invalid, or "Unknown University" records (Requirement 6)
    const validItems = items.filter(ad => {
      const uName = ad.university?.name || ad.universityName || ad.name;
      return uName && typeof uName === 'string' && uName.trim().toLowerCase() !== 'unknown university';
    });

    if (validItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No admission records found matching your criteria.</td></tr>';
      return;
    }

    validItems.forEach(ad => {
      const uniName  = ad.university?.name || ad.universityName || ad.name || '';
      const uniShort = ad.university?.shortName || ad.shortName || '';
      const deadlineRaw = ad.applyDeadline || ad.lastDate || ad.university?.admissionStatus?.lastDate || ad.admissionStatus?.lastDate;

      const calc = calculateClientAdmissionStatus(deadlineRaw);
      const canApply = typeof ad.canApply === 'boolean' ? ad.canApply : calc.isOpen;

      let formattedDate = 'N/A';
      if (deadlineRaw) {
        const d = new Date(deadlineRaw);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
          });
        }
      }

      // Requirement 9 UI Badges:
      // Open -> Green badge (bg-success)
      // Closed -> Red badge (bg-danger)
      // Last Day -> Orange badge (bg-warning text-dark)
      let badgeHtml = '';
      if (!calc.isOpen) {
        badgeHtml = '<span class="badge bg-danger">Closed</span>';
      } else if (calc.isLastDay) {
        badgeHtml = '<span class="badge bg-warning text-dark">Open</span>';
      } else {
        badgeHtml = '<span class="badge bg-success">Open</span>';
      }

      // Official Website URL from MongoDB document (Requirement 4)
      const officialWebsite = ad.website || ad.university?.website || ad.applyLink || '';
      const targetUrl = helperFormatUrl(officialWebsite);

      // Action column button behavior (Requirements 2, 3, 4, 5):
      // canApply === true -> Active green/theme button "Apply Now" opening official website in new tab (_blank)
      // canApply === false -> Disabled gray button "Admission Closed" (non-clickable, no redirection)
      let actionBtnHtml = '';
      if (canApply && targetUrl !== '#') {
        actionBtnHtml = `
          <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-edu-primary">
            <i class="bi bi-box-arrow-up-right me-1"></i>Apply Now
          </a>
        `;
      } else if (canApply) {
        const applyUniId = ad.university?._id || ad._id || '';
        actionBtnHtml = `
          <a href="${pagePrefix}apply.html?uni=${applyUniId}" class="btn btn-sm btn-edu-primary">
            <i class="bi bi-send me-1"></i>Apply Now
          </a>
        `;
      } else {
        actionBtnHtml = `
          <button class="btn btn-sm btn-secondary disabled" disabled style="cursor: not-allowed; opacity: 0.65;">
            <i class="bi bi-x-circle me-1"></i>Admission Closed
          </button>
        `;
      }

      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>
            <strong>${uniShort || uniName}</strong>
            ${uniShort ? `<small class="d-block text-muted">${uniName}</small>` : ''}
          </td>
          <td>${formattedDate}</td>
          <td><span class="${calc.isOpen ? (calc.isLastDay ? 'text-warning fw-bold' : 'text-success') : 'text-danger'}">${calc.remainingDays}</span></td>
          <td>${badgeHtml}</td>
          <td>${actionBtnHtml}</td>
        </tr>
      `);
    });
  }

  function filterAndRender() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    if (!query) {
      renderRows(loadedAdmissions);
      return;
    }

    const filtered = loadedAdmissions.filter(ad => {
      const name  = (ad.university?.name || ad.universityName || ad.name || '').toLowerCase();
      const short = (ad.university?.shortName || ad.shortName || '').toLowerCase();
      const city  = (ad.university?.city || ad.city || '').toLowerCase();
      const prov  = (ad.university?.province || ad.province || '').toLowerCase();
      const prog  = (ad.program || '').toLowerCase();

      return name.includes(query) ||
             short.includes(query) ||
             city.includes(query) ||
             prov.includes(query) ||
             prog.includes(query);
    });

    renderRows(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterAndRender);
  }

  try {
    const res  = await fetch(`${API_BASE}/admissions`);
    const data = await res.json();

    if (data.success && Array.isArray(data.items) && data.items.length > 0) {
      loadedAdmissions = data.items;
      renderRows(loadedAdmissions);
    } else {
      // Fallback: pull from universities API using admissionStatus
      const uRes  = await fetch(`${API_BASE}/universities?limit=500`);
      const uData = await uRes.json();
      if (uData.success && Array.isArray(uData.items) && uData.items.length > 0) {
        loadedAdmissions = uData.items
          .filter(u => u.admissionStatus?.lastDate && u.name && u.name.toLowerCase() !== 'unknown university')
          .map(u => ({
            university:     { name: u.name, shortName: u.shortName, _id: u._id, city: u.city, province: u.province, website: u.website },
            universityName: u.name,
            shortName:      u.shortName || '',
            city:           u.city || '',
            province:       u.province || '',
            website:        u.website || '',
            applyDeadline:  u.admissionStatus.lastDate,
            program:        u.programs?.[0]?.name || '',
          }));
        if (loadedAdmissions.length > 0) {
          renderRows(loadedAdmissions);
          return;
        }
      }
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No current admissions open. Check back soon.</td></tr>';
    }
  } catch {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-danger">Failed to fetch admissions. Is the backend running?</td></tr>';
  }
}

/* ============================================================
   COMPARE PAGE (compare.html) - Main logic moved to initComparePage below
   ============================================================ */

/* ============================================================
   AI RECOMMENDATION PAGE (recommendation.html)
   ============================================================ */
function initRecommendationPage() {
  const form      = document.getElementById('aiForm');
  const resultDiv = document.getElementById('aiResult');
  const cityInput = document.getElementById('recCity');
  const suggestionsBox = document.getElementById('citySuggestions');
  if (!form) return;

  const programInput = document.getElementById('recProgram');
  const programSuggestionsBox = document.getElementById('programSuggestions');

  let cityOptions = [];
  let programOptions = [];

  const populateOptions = async () => {
    try {
      const res  = await fetch(`${API_BASE}/universities?limit=500`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        if (cityInput) {
          cityOptions = [...new Set(data.items.map(u => u.city).filter(Boolean))].sort();
        }
        if (programInput) {
          programOptions = [...new Set(data.items.flatMap(u => (u.programs || []).map(p => p.name)).filter(Boolean))].sort();
        }
      }
    } catch {}

    if (cityInput && !cityOptions.length) {
      cityOptions = [
        'Bahawalpur', 'Chakdara', 'Chitral', 'Faisalabad', 'Gujrat', 'Haripur',
        'Hyderabad', 'Islamabad', 'Jamshoro', 'Karachi', 'Khairpur', 'Lahore',
        'Mardan', 'Multan', 'Muzaffarabad', 'Nawabshah', 'Peshawar', 'Quetta',
        'Rawalpindi', 'Sargodha', 'Sialkot', 'Swabi', 'Taxila', 'Wah Cantt'
      ];
    }

    if (programInput && !programOptions.length) {
      programOptions = [
        'Bachelor of Architecture', 'Bachelor of Fine Arts', 'Bachelor of Graphic Design', 'BBA', 'BBA (Honors)',
        'BE Aerospace Engineering', 'BE Agricultural Engineering', 'BE Automotive Engineering', 'BE Avionics Engineering',
        'BE Biomedical Engineering', 'BE Chemical Engineering', 'BE Civil Engineering', 'BE Computer Engineering',
        'BE Electrical Engineering', 'BE Environmental Engineering', 'BE Industrial Engineering', 'BE Materials Engineering',
        'BE Mechanical Engineering', 'BE Mechatronics Engineering', 'BE Mining Engineering', 'BE Petroleum Engineering',
        'BE Polymer Engineering', 'BE Software Engineering', 'BE Textile Engineering', 'BS Accounting & Finance',
        'BS Agriculture', 'BS Applied Psychology', 'BS Artificial Intelligence', 'BS Biochemistry',
        'BS Bioinformatics', 'BS Biotechnology', 'BS Business Analytics', 'BS Chemistry',
        'BS Civil Technology', 'BS Computer Engineering', 'BS Computer Science', 'BS Cyber Security',
        'BS Data Science', 'BS Economics', 'BS Electrical Technology', 'BS English',
        'BS Environmental Science', 'BS Fashion Design', 'BS Food Science & Technology', 'BS Forensic Science',
        'BS Geology', 'BS Information Technology', 'BS Mass Communication', 'BS Mathematics',
        'BS Mechanical Technology', 'BS Medical Lab Technology (MLT)', 'BS Microbiology', 'BS Physics',
        'BS Psychology', 'BS Public Administration', 'BS Software Engineering', 'BS Statistics',
        'BS Supply Chain Management', 'BS Textile Design', 'Doctor of Pharmacy (Pharm-D)',
        'Doctor of Physical Therapy (DPT)', 'Doctor of Veterinary Medicine (DVM)', 'LLB (5 Years)'
      ].sort();
    }
  };

  const renderSuggestions = (query = '') => {
    if (!suggestionsBox) return;

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = !normalizedQuery
      ? cityOptions
      : cityOptions.filter(city => city.toLowerCase().includes(normalizedQuery));

    if (!filtered.length) {
      suggestionsBox.classList.add('d-none');
      suggestionsBox.innerHTML = '';
      return;
    }

    suggestionsBox.innerHTML = filtered.map(city => `
      <button type="button" class="list-group-item list-group-item-action border-0" data-city="${city}">${city}</button>
    `).join('');
    suggestionsBox.classList.remove('d-none');

    suggestionsBox.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        cityInput.value = btn.dataset.city;
        suggestionsBox.classList.add('d-none');
      });
    });
  };

const FACULTY_PROGRAM_MAP = {
  "Computing & Information Technology": [
    "Computer Science", "Software Engineering", "Information Technology",
    "Artificial Intelligence", "Cyber Security", "Data Science",
    "Computer Engineering", "Computer Systems Engineering", "Information Security",
    "Robotics", "Game Development"
  ],
  "Engineering": [
    "Civil Engineering", "Electrical Engineering", "Mechanical Engineering",
    "Chemical Engineering", "Mechatronics Engineering", "Petroleum Engineering",
    "Industrial Engineering", "Aerospace Engineering", "Environmental Engineering",
    "Mining Engineering", "Textile Engineering", "Automotive Engineering",
    "Metallurgical Engineering", "Energy Engineering"
  ],
  "Medicine & Health Sciences": [
    "MBBS", "BDS", "Doctor of Pharmacy (Pharm-D)", "Nursing",
    "Doctor of Physical Therapy (DPT)", "Medical Laboratory Technology",
    "Radiology & Imaging Technology", "Optometry", "Public Health",
    "Nutrition & Dietetics", "Occupational Therapy", "Speech & Language Pathology",
    "Emergency Medical Technology"
  ],
  "Business & Management Sciences": [
    "BBA", "MBA", "Accounting & Finance", "Banking & Finance",
    "Marketing", "Human Resource Management", "Supply Chain Management",
    "Business Analytics", "Entrepreneurship", "Commerce",
    "International Business", "Project Management"
  ],
  "Natural Sciences": [
    "Mathematics", "Statistics", "Physics", "Chemistry",
    "Biology", "Biotechnology", "Microbiology", "Environmental Science",
    "Geology", "Zoology", "Botany", "Biochemistry"
  ],
  "Social Sciences": [
    "Economics", "Psychology", "Sociology", "Political Science",
    "International Relations", "Public Administration", "Anthropology",
    "Social Work", "Criminology", "Gender Studies"
  ],
  "Arts & Humanities": [
    "English", "Urdu", "Arabic", "Persian", "History",
    "Philosophy", "Islamic Studies", "Pakistan Studies", "Linguistics", "Archaeology"
  ],
  "Law": [
    "LLB", "LLM", "International Law", "Corporate Law", "Criminal Law", "Constitutional Law"
  ],
  "Agriculture": [
    "Agriculture", "Agronomy", "Horticulture", "Plant Breeding & Genetics",
    "Soil Science", "Entomology", "Plant Pathology", "Food Science",
    "Agricultural Engineering", "Animal Sciences"
  ],
  "Education": [
    "B.Ed", "M.Ed", "Educational Leadership", "Curriculum & Instruction",
    "Early Childhood Education", "Special Education", "Educational Psychology"
  ],
  "Architecture & Design": [
    "Architecture", "Interior Design", "Graphic Design", "Industrial Design",
    "Fashion Design", "Textile Design", "Urban & Regional Planning"
  ],
  "Media & Communication Studies": [
    "Mass Communication", "Journalism", "Media Studies", "Digital Media",
    "Film & Television", "Advertising", "Public Relations"
  ],
  "Environmental Sciences": [
    "Environmental Science", "Environmental Management", "Climate Change Studies",
    "Forestry", "Wildlife Management", "Water Resource Management"
  ],
  "Veterinary & Animal Sciences": [
    "Doctor of Veterinary Medicine (DVM)", "Animal Sciences", "Poultry Science",
    "Dairy Technology", "Livestock Management", "Fisheries & Aquaculture"
  ],
  "Pharmacy": [
    "Pharm-D", "Pharmaceutical Sciences", "Pharmacology", "Pharmaceutics",
    "Clinical Pharmacy", "Pharmaceutical Chemistry"
  ],
  "Islamic & Religious Studies": [
    "Islamic Studies", "Quran & Tafseer", "Hadith Studies", "Fiqh & Shariah",
    "Comparative Religion", "Islamic Banking & Finance"
  ],
  "Economics & Commerce": [
    "Economics", "Applied Economics", "Commerce", "Accounting",
    "Finance", "Business Economics"
  ],
  "Languages & Literature": [
    "English Literature", "English Linguistics", "Urdu Literature",
    "Arabic", "Chinese", "French", "German", "Turkish"
  ],
  "Fine Arts & Performing Arts": [
    "Fine Arts", "Painting", "Sculpture", "Music", "Theatre",
    "Performing Arts", "Photography"
  ],
  "Aviation & Aerospace": [
    "Aeronautical Engineering", "Aerospace Engineering", "Aviation Management",
    "Aircraft Maintenance Engineering", "Pilot Training"
  ],
  "Marine & Maritime Studies": [
    "Marine Engineering", "Maritime Studies", "Naval Architecture",
    "Oceanography", "Coastal Management"
  ],
  "Food Science & Nutrition": [
    "Food Science & Technology", "Human Nutrition", "Dietetics",
    "Food Engineering", "Food Safety & Quality"
  ],
  "Sports Sciences & Physical Education": [
    "Physical Education", "Sports Sciences", "Sports Management",
    "Exercise Science", "Sports Coaching"
  ],
  "Nursing & Allied Health Sciences": [
    "BS Nursing", "Post RN BSN", "Medical Laboratory Technology",
    "Operation Theatre Technology", "Anesthesia Technology", "Cardiac Technology",
    "Dental Technology", "Emergency Care Technology"
  ],
  "Dentistry": [
    "BDS", "Orthodontics", "Oral Surgery", "Prosthodontics",
    "Periodontology", "Operative Dentistry"
  ],
  "Public Health": [
    "Public Health", "Epidemiology", "Health Policy & Management",
    "Community Health", "Global Health"
  ],
  "Biotechnology & Life Sciences": [
    "Biotechnology", "Bioinformatics", "Molecular Biology",
    "Genetics", "Cell Biology", "Biochemistry"
  ],
  "Earth & Geographical Sciences": [
    "Geography", "Geology", "GIS & Remote Sensing", "Geophysics",
    "Hydrology", "Meteorology"
  ],
  "Mathematics & Statistics": [
    "Mathematics", "Applied Mathematics", "Statistics",
    "Actuarial Science", "Data Analytics"
  ],
  "Applied Sciences": [
    "Applied Physics", "Applied Chemistry", "Applied Mathematics",
    "Nanotechnology", "Materials Science", "Renewable Energy"
  ]
};

/**
 * Dynamic Province & City Dropdowns (Fetched strictly from MongoDB)
 */
async function initDynamicProvinceCityDropdown(provinceSelectId = 'province', citySelectId = 'recCity') {
  const provinceSelect = document.getElementById(provinceSelectId);
  const citySelect     = document.getElementById(citySelectId);
  if (!provinceSelect || !citySelect) return;

  // 1. On Page Load: Fetch all available distinct provinces dynamically from MongoDB
  try {
    const res  = await fetch(`${API_BASE}/universities/provinces`);
    const data = await res.json();
    if (data.success && Array.isArray(data.provinces) && data.provinces.length > 0) {
      provinceSelect.innerHTML = '<option value="">All Provinces</option>';
      data.provinces.forEach(prov => {
        const option = document.createElement('option');
        option.value = prov;
        option.textContent = prov;
        provinceSelect.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Failed to load provinces from database:', err);
  }

  // Ensure initial City dropdown state
  citySelect.innerHTML = '<option value="">Select Province First</option>';
  citySelect.disabled = true;

  // 2. When user selects a province
  const onProvinceChange = async () => {
    const selectedProvince = provinceSelect.value.trim();

    // Reset City dropdown
    citySelect.innerHTML = '';

    if (!selectedProvince) {
      // Province selection cleared
      citySelect.disabled = true;
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Select Province First';
      citySelect.appendChild(opt);
      return;
    }

    // Show temporary loading state
    citySelect.disabled = true;
    const loadingOpt = document.createElement('option');
    loadingOpt.value = '';
    loadingOpt.textContent = 'Loading cities...';
    citySelect.appendChild(loadingOpt);

    try {
      // Fetch distinct cities for selected province from MongoDB via backend API
      const res  = await fetch(`${API_BASE}/universities/cities?province=${encodeURIComponent(selectedProvince)}`);
      const data = await res.json();

      citySelect.innerHTML = '';

      if (data.success && Array.isArray(data.cities) && data.cities.length > 0) {
        citySelect.disabled = false;

        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '-- Select City --';
        citySelect.appendChild(defaultOpt);

        data.cities.forEach(city => {
          const option = document.createElement('option');
          option.value = city;
          option.textContent = city;
          citySelect.appendChild(option);
        });
      } else {
        // If no universities/cities exist in DB for this province
        citySelect.disabled = true;
        const noCityOpt = document.createElement('option');
        noCityOpt.value = '';
        noCityOpt.textContent = 'No cities available';
        citySelect.appendChild(noCityOpt);
      }
    } catch (err) {
      console.error('Failed to fetch cities from database:', err);
      citySelect.innerHTML = '';
      citySelect.disabled = true;
      const errorOpt = document.createElement('option');
      errorOpt.value = '';
      errorOpt.textContent = 'Error loading cities';
      citySelect.appendChild(errorOpt);
    }
  };

  provinceSelect.addEventListener('change', onProvinceChange);
}

/**
 * Scalable dependent dropdown handler for Faculty (Desired Field) -> Program selection
 */
function setupDependentDropdowns(fieldSelectId, programSelectId) {
  const fieldSelect = document.getElementById(fieldSelectId);
  const programSelect = document.getElementById(programSelectId);
  if (!fieldSelect || !programSelect) return;

  const updatePrograms = () => {
    const selectedFaculty = fieldSelect.value;
    const programs = FACULTY_PROGRAM_MAP[selectedFaculty];

    programSelect.innerHTML = '';

    if (!selectedFaculty || !programs || !programs.length) {
      programSelect.disabled = true;
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Select a faculty first';
      programSelect.appendChild(defaultOpt);
    } else {
      programSelect.disabled = false;
      const placeholderOpt = document.createElement('option');
      placeholderOpt.value = '';
      placeholderOpt.textContent = '-- Select Program --';
      programSelect.appendChild(placeholderOpt);

      programs.forEach(prog => {
        const option = document.createElement('option');
        option.value = prog;
        option.textContent = prog;
        programSelect.appendChild(option);
      });
    }
  };

  fieldSelect.addEventListener('change', updatePrograms);
  updatePrograms();
}

  if (cityInput && cityInput.tagName === 'INPUT') {
    cityInput.addEventListener('focus', () => renderSuggestions(cityInput.value));
    cityInput.addEventListener('input', (e) => renderSuggestions(e.target.value));
  }

  document.addEventListener('click', (e) => {
    if (!suggestionsBox?.contains(e.target) && e.target !== cityInput) {
      suggestionsBox?.classList.add('d-none');
    }
  });

  populateOptions();
  setupDependentDropdowns('field', 'recProgram');
  initDynamicProvinceCityDropdown('province', 'recCity');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const field    = document.getElementById('field')?.value     || '';
    const program  = document.getElementById('recProgram')?.value?.trim() || '';
    const sector   = document.getElementById('recSector')?.value  || '';
    const budget   = parseFloat(document.getElementById('recBudget')?.value) || 0;
    const province = document.getElementById('province')?.value   || '';
    const city     = (document.getElementById('recCity')?.value   || '').trim();

    // — Show skeleton cards while loading —
    const resultsSection = document.getElementById('mlResultsSection');
    const cardsGrid      = document.getElementById('recCardsGrid');
    const titleEl        = document.getElementById('recResultsTitle');
    const badgeEl        = document.getElementById('recSourceBadge');

    if (resultsSection) {
      cardsGrid.innerHTML = renderSkeletons(6);
      resultsSection.classList.add('visible');
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
      const res  = await fetch(`${API_BASE}/recommendation`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ field, program, sector, city, province, budget, topN: 10 }),
      });
      const data = await res.json();

      if (data.success && data.recommendations.length > 0) {
        const count = data.recommendations.length;
        if (titleEl) titleEl.textContent = `Top ${count} University Matches`;
        if (badgeEl) {
          badgeEl.textContent = data.source === 'ml' ? '🤖 ML Powered' : '⚡ Quick Match';
        }
        cardsGrid.innerHTML = '';
        data.recommendations.forEach((rec, idx) => renderRecCard(cardsGrid, rec, idx));

        // Animate score bars after render
        requestAnimationFrame(() => {
          document.querySelectorAll('.score-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.score + '%';
          });
        });
      } else {
        cardsGrid.innerHTML = `
          <div class="col-12">
            <div class="text-center py-5">
              <i class="bi bi-search-heart" style="font-size:3.5rem;color:var(--gold)"></i>
              <h5 class="mt-3 fw-bold text-navy">No Matches Found</h5>
              <p class="text-muted">Try broadening your search — remove the city filter or increase your budget.</p>
            </div>
          </div>`;
      }
    } catch (err) {
      console.error(err);
      cardsGrid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger rounded-4">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Failed to get recommendations. Is the backend running on port 5000?
          </div>
        </div>`;
    }
  });

}

/* ─── Render skeleton loading cards ─────────────────────────────────────── */
function renderSkeletons(n) {
  return Array.from({ length: n }, () => `
    <div class="col-md-6 col-lg-4">
      <div class="rec-skeleton-card">
        <div class="d-flex gap-3 align-items-start mb-3">
          <div class="skel skel-badge" style="flex-shrink:0"></div>
          <div style="flex:1">
            <div class="skel skel-h" style="width:70%"></div>
            <div class="skel skel-sm" style="width:45%"></div>
          </div>
        </div>
        <div class="skel skel-h mb-2" style="width:90%"></div>
        <div class="skel skel-h mb-2" style="width:75%"></div>
        <div class="skel skel-sm" style="width:55%"></div>
      </div>
    </div>`).join('');
}

/* ─── Render a single recommendation card ───────────────────────────────── */
function renderRecCard(grid, rec, idx) {
  const u      = rec.university || {};
  const score  = rec.matchPercent || rec.score || 0;
  const tier   = score >= 70 ? 'high' : score >= 45 ? 'medium' : '';

  // Initial letter logo
  const initials = (u.shortName || u.name || '?').charAt(0).toUpperCase();

  // Fee display
  const fee = rec.semesterFee || rec.minFee;
  const feeStr = fee ? `PKR ${parseInt(fee).toLocaleString()}/sem` : 'N/A';

  // Admission status
  const calc = calculateClientAdmissionStatus(u.admissionStatus?.lastDate);
  const isOpen = calc.isOpen;
  const statusCls = isOpen ? 'open' : 'closed';
  const statusTxt = isOpen ? '● Open' : '○ Closed';

  // Rating stars (0–5)
  const rating = parseFloat(u.rating || 0);
  const stars  = renderStars(rating);

  // Ranking
  const rank = u.ranking;
  const hecStr = rank ? `#${rank}` : '';

  // Match reasons
  const reasons = (rec.reasons || []).slice(0, 5).map(r => {
    const cls = r.startsWith('✔') ? 'positive' : r.startsWith('⚡') ? 'warning' : r.startsWith('✘') ? 'negative' : '';
    return `<div class="rec-reason ${cls}">${escHtml(r)}</div>`;
  }).join('');

  // Matched program
  const progName = rec.matchedProgram || (u.programs?.[0]?.name) || 'N/A';

  const cardHTML = `
    <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${(idx % 3) * 80}">
      <div class="rec-card">
        <!-- Header -->
        <div class="rec-card-header">
          <div class="rec-card-logo">${escHtml(initials)}</div>
          <div class="rec-card-title">
            <h5 title="${escHtml(u.name || '')}">${escHtml(u.shortName || u.name || 'Unknown')}</h5>
            <small>${escHtml(u.city || '')}${u.province ? ` · ${escHtml(u.province)}` : ''}</small>
          </div>
          <div class="match-badge">
            <div class="match-percent ${tier}">${score}%</div>
            <div class="match-label">Match</div>
            <div class="score-bar-wrap" style="width:50px">
              <div class="score-bar-track">
                <div class="score-bar-fill ${tier}" data-score="${score}" style="width:0%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info grid -->
        <div class="rec-info-grid">
          <div class="rec-info-item">
            <i class="bi bi-mortarboard"></i>
            <span>${escHtml(progName)}</span>
          </div>
          <div class="rec-info-item">
            <i class="bi bi-currency-dollar"></i>
            <span>${escHtml(feeStr)}</span>
          </div>
          <div class="rec-info-item">
            <i class="bi bi-building"></i>
            <span>${escHtml(u.sector || 'N/A')}</span>
          </div>
          <div class="rec-info-item">
            <i class="bi bi-award"></i>
            <span>${escHtml(hecStr || `${rating}/5 ★`)}</span>
          </div>
        </div>

        <!-- Admission status + Rating row -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span class="rec-status-badge ${statusCls}">${statusTxt} Admissions</span>
          <div class="rec-stars">${stars}<span>(${rating}/5)</span></div>
        </div>

        <!-- Match reasons -->
        ${reasons ? `<div class="rec-reasons">${reasons}</div>` : ''}

        <!-- CTA buttons -->
        <div class="rec-card-actions">
          ${u.website
            ? `<a href="${escHtml(u.website)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary flex-fill">
                <i class="bi bi-globe2 me-1"></i>Website
               </a>`
            : ''}
          <a href="${pagePrefix}apply.html?uni=${escHtml(u._id || '')}"
             class="btn btn-sm btn-edu-primary flex-fill">
            <i class="bi bi-send-plus me-1"></i>Apply
          </a>
        </div>
      </div>
    </div>`;
  grid.insertAdjacentHTML('beforeend', cardHTML);
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html   = '';
  for (let i = 0; i < full; i++)  html += '<i class="bi bi-star-fill"></i>';
  if (half)                        html += '<i class="bi bi-star-half"></i>';
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="bi bi-star"></i>';
  return html;
}

function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}




/* ============================================================
   SCHOLARSHIPS PAGE (scholarships.html)
   ============================================================ */
async function initScholarshipsPage() {
  const container = document.querySelector('.row.g-4');
  if (!container) return;

  container.innerHTML = '<div class="text-center w-100 py-5"><div class="loading-spinner"></div></div>';

  try {
    const res  = await fetch(`${API_BASE}/scholarships`);
    const data = await res.json();

    if (data.success && data.items.length > 0) {
      container.innerHTML = '';
      data.items.forEach((s, idx) => {
        const deadline = s.deadline
          ? new Date(s.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Open';
        const icons = {
          Need: 'bi-cash-coin', Merit: 'bi-trophy-fill',
          International: 'bi-globe', Sports: 'bi-star-fill',
        };
        const icon = icons[s.type] || 'bi-mortarboard-fill';

        container.insertAdjacentHTML('beforeend', `
          <div class="col-md-6 col-lg-4" data-aos="zoom-in" data-aos-delay="${(idx % 3) * 100}">
            <div class="schol-card">
              <div class="icon"><i class="bi ${icon}"></i></div>
              <h5>${s.title}</h5>
              <p class="text-muted small">${s.eligibility || 'All high-achieving applicants'}</p>
              <p class="amount">${s.amount || 'Varies'}</p>
              <small class="text-danger fw-semibold d-block mb-3">Deadline: ${deadline}</small>
              <a href="${s.applyLink || '#'}" target="_blank" class="btn btn-sm btn-edu-primary w-100">Apply Link</a>
            </div>
          </div>
        `);
      });
    } else {
      container.innerHTML = '<div class="text-center w-100 py-5 text-muted">No active scholarships listed at the moment.</div>';
    }
  } catch {
    container.innerHTML = '<div class="alert alert-danger w-100">Failed to load scholarships. Is the backend running?</div>';
  }
}

/* ============================================================
   APPLY ONLINE PAGE (apply.html)
   ============================================================ */
async function initApplyPage() {
  const form       = document.getElementById('applyForm');
  const uniSelect  = document.getElementById('applyUniversity');
  const progSelect = document.getElementById('applyProgram');

  if (!form || !uniSelect || !progSelect) return;

  // Pre-fill from query params (coming from admissions/compare "Apply" links)
  const urlParams = new URLSearchParams(location.search);
  const paramUni  = urlParams.get('uni');
  const paramProg = urlParams.get('prog');

  let loadedUnis = [];

  // Populate university dropdown from backend
  try {
    const res  = await fetch(`${API_BASE}/universities?limit=100`);
    const data = await res.json();
    if (data.success) {
      loadedUnis = data.items;
      uniSelect.innerHTML = '<option value="">-- Choose University --</option>';
      loadedUnis.forEach(u => {
        const selected = u._id === paramUni ? 'selected' : '';
        uniSelect.insertAdjacentHTML('beforeend',
          `<option value="${u._id}" ${selected}>${u.name}</option>`);
      });
      loadPrograms();
    }
  } catch { console.error('Failed to load universities dropdown.'); }

  function loadPrograms() {
    const u = loadedUnis.find(x => x._id === uniSelect.value);
    progSelect.innerHTML = '<option value="">-- Select Program --</option>';
    if (u?.programs) {
      u.programs.forEach(p => {
        const selected = p.name === paramProg ? 'selected' : '';
        const level    = p.degreeLevel || 'Bachelors';
        const fee      = p.feePerSemester ? ` — PKR ${(p.feePerSemester/1000).toFixed(0)}K/sem` : '';
        progSelect.insertAdjacentHTML('beforeend',
          `<option value="${p.name}" ${selected}>${p.name} (${level}${fee})</option>`);
      });
    }
  }
  uniSelect.addEventListener('change', loadPrograms);

  // Load My Applications tab when clicked
  document.getElementById('myapps-tab')?.addEventListener('shown.bs.tab', loadMyApplications);

  // Pre-load if already logged in
  if (getToken()) loadMyApplications();

  async function loadMyApplications() {
    const listDiv = document.getElementById('myApplicationsList');
    if (!listDiv) return;

    if (!getToken()) {
      listDiv.innerHTML = `
        <div class="alert alert-info rounded-4 text-center">
          <i class="bi bi-lock-fill me-1"></i>
          Please <strong>login</strong> to view your application history.
        </div>`;
      return;
    }

    listDiv.innerHTML = '<div class="text-center py-3"><div class="loading-spinner"></div></div>';
    try {
      const res  = await fetch(`${API_BASE}/applications/mine`, { headers: getAuthHeader() });
      const data = await res.json();

      if (data.success && data.items.length > 0) {
        listDiv.innerHTML = '';
        data.items.forEach(app => {
          const date       = new Date(app.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
          });
          const status     = app.status || 'Pending';
          const badgeColor = status === 'Accepted'     ? 'bg-success'
            : status === 'Rejected'                    ? 'bg-danger'
            : status === 'Under Review'                ? 'bg-warning text-dark'
            : 'bg-secondary';

          listDiv.insertAdjacentHTML('beforeend', `
            <div class="border rounded-4 p-3 mb-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="mb-1 fw-bold">${app.university?.name || 'University'}</h6>
                  <p class="mb-1 text-muted small">${app.program || 'Program N/A'}</p>
                  <small class="text-muted">Submitted: ${date}</small>
                </div>
                <span class="badge ${badgeColor}">${status}</span>
              </div>
              ${app.notes
                ? `<p class="mt-2 mb-0 small text-muted"><i class="bi bi-chat-left-text me-1"></i>${app.notes}</p>`
                : ''}
            </div>
          `);
        });
      } else {
        listDiv.innerHTML = `
          <div class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-2"></i>
            <p class="mt-2">No applications yet. Use the <strong>New Application</strong> tab to apply.</p>
          </div>`;
      }
    } catch {
      listDiv.innerHTML = '<div class="alert alert-danger">Failed to load applications. Server offline?</div>';
    }
  }

  // Submit new application
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!requireLogin()) return;

    const uniId   = uniSelect.value;
    const program = progSelect.value;

    if (!uniId || !program) {
      alert('Please select a university and a program before submitting.');
      return;
    }

    const successDiv = document.getElementById('applySuccess');
    successDiv.classList.add('d-none');

    const payload = {
      university:               uniId,
      program,
      fullName:                 document.getElementById('applyFullName')?.value || '',
      email:                    document.getElementById('applyEmail')?.value    || '',
      phone:                    document.getElementById('applyPhone')?.value    || '',
      cnic:                     document.getElementById('applyCnic')?.value     || '',
      matricPercentage:         parseFloat(document.getElementById('applyMatric')?.value) || 0,
      intermediatePercentage:   parseFloat(document.getElementById('applyInter')?.value)  || 0,
      notes:                    document.getElementById('applySOP')?.value      || '',
    };

    try {
      const res  = await fetch(`${API_BASE}/applications`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        successDiv.innerHTML = `
          <i class="bi bi-check-circle-fill"></i>
          Application submitted successfully!
          Tracking ID: <strong>${data.application._id}</strong>`;
        successDiv.classList.remove('d-none');
        form.reset();
        loadMyApplications(); // refresh history tab
      } else {
        alert(data.message || 'Failed to submit application.');
      }
    } catch {
      alert('Server connection error. Is the backend running?');
    }
  });
}

/* ============================================================
   CONTACT PAGE (contact.html)
   ============================================================ */
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const successDiv = document.getElementById('contactMsg');
    successDiv.classList.add('d-none');

    const payload = {
      name:    document.getElementById('contactName')?.value.trim()    || '',
      email:   document.getElementById('contactEmail')?.value.trim()   || '',
      subject: document.getElementById('contactSubject')?.value.trim() || '',
      message: document.getElementById('contactMessage')?.value.trim() || '',
    };

    try {
      const res  = await fetch(`${API_BASE}/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        successDiv.classList.remove('d-none');
        form.reset();
      } else {
        alert(data.message || 'Failed to send message.');
      }
    } catch {
      alert('Connection failed. Is the backend running?');
    }
  });
}

/* ============================================================
   NOTIFICATIONS PAGE (notifications.html)
   ============================================================ */
async function initNotificationsPage() {
  const container = document.querySelector('.col-lg-8.mx-auto');
  if (!container) return;

  if (!getToken()) {
    // Static public notifications when logged out
    container.innerHTML = `
      <div class="alert alert-info border-0 rounded-4 text-center py-3">
        <i class="bi bi-info-circle-fill"></i>
        Please <strong>login</strong> to view your personalized application status alerts.
      </div>
      <div class="alert-card mb-3">
        <div class="icon"><i class="bi bi-bell-fill"></i></div>
        <div><h6>NUST NET-1 registration open</h6><p class="text-muted small mb-1">General Announcement</p></div>
      </div>
      <div class="alert-card mb-3">
        <div class="icon"><i class="bi bi-award-fill"></i></div>
        <div><h6>Ehsaas Undergraduate Scholarship extended</h6><p class="text-muted small mb-1">Scholarship alert</p></div>
      </div>
      <div class="alert-card mb-3">
        <div class="icon"><i class="bi bi-book-fill"></i></div>
        <div><h6>LUMS launches new BS AI program</h6><p class="text-muted small mb-1">Program alert</p></div>
      </div>
    `;
    return;
  }

  container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner"></div></div>';

  try {
    const res  = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeader() });
    const data = await res.json();

    if (data.success && data.items.length > 0) {
      container.innerHTML = '';
      data.items.forEach(item => {
        const dateStr   = new Date(item.createdAt || Date.now()).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short',
        });
        const icon      = item.read ? 'bi-envelope-open' : 'bi-bell-fill';
        const readClass = item.read ? 'opacity-75' : 'fw-bold';

        const card = document.createElement('div');
        card.className    = `alert-card mb-3 ${readClass}`;
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <div class="icon"><i class="bi ${icon}" id="notif-icon-${item._id}"></i></div>
          <div>
            <h6>${item.title || 'Notification Alert'}</h6>
            <p class="mb-1">${item.message || ''}</p>
            <span class="text-muted small">${dateStr}</span>
          </div>
        `;

        // Mark as read on click
        if (!item.read) {
          card.addEventListener('click', async () => {
            try {
              await fetch(`${API_BASE}/notifications/${item._id}/read`, {
                method:  'PATCH',
                headers: getAuthHeader(),
              });
              card.classList.remove('fw-bold');
              card.classList.add('opacity-75');
              const iconEl = document.getElementById(`notif-icon-${item._id}`);
              if (iconEl) { iconEl.className = 'bi bi-envelope-open'; }
            } catch { /* mark-read is non-critical */ }
          });
        }

        container.appendChild(card);
      });
    } else {
      container.innerHTML = `
        <div class="alert-card mb-3">
          <div class="icon"><i class="bi bi-bell-fill"></i></div>
          <div>
            <h6>Welcome to EduNavigator!</h6>
            <p class="text-muted small mb-1">No alerts yet. Apply to universities to track your progress.</p>
          </div>
        </div>`;
    }
  } catch {
    container.innerHTML = '<div class="alert alert-danger">Failed to fetch notifications. Is the backend running?</div>';
  }
}

/* ============================================================
   UTILITY — Toast notification (non-blocking)
   ============================================================ */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.edu-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'edu-toast alert position-fixed shadow-lg';
  toast.classList.add(type === 'success' ? 'alert-success' : 'alert-info');
  toast.style.cssText = 'bottom:1.5rem;right:1.5rem;z-index:9999;min-width:280px;border-radius:12px;';
  toast.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'info-circle-fill'} me-2"></i>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/* ============================================================
   MY APPLICATIONS PAGE — User Applications Dashboard
   ============================================================ */
async function initMyApplicationsPage() {
  const container = document.getElementById('myApplicationsContainer');
  if (!container) return;

  const user = getUser();
  const token = getToken();

  if (!user || !token) {
    container.innerHTML = `
      <div class="empty-applications-state">
        <i class="bi bi-lock-fill"></i>
        <h4>Authentication Required</h4>
        <p>Please sign in to your account to view and manage your submitted applications.</p>
        <button class="btn btn-edu-primary btn-login" onclick="document.querySelector('.btn-login')?.click()">
          <i class="bi bi-box-arrow-in-right me-1"></i> Sign In Now
        </button>
      </div>
    `;
    return;
  }

  try {
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading applications...</span>
        </div>
        <p class="mt-3 text-muted">Fetching your applications...</p>
      </div>
    `;

    const res = await fetch(`${API_BASE}/applications/mine`, {
      headers: getAuthHeader()
    });
    const data = await res.json();

    if (!data.success || !data.items || data.items.length === 0) {
      container.innerHTML = `
        <div class="empty-applications-state">
          <i class="bi bi-folder-x"></i>
          <h4>You haven't submitted any applications yet</h4>
          <p>Start exploring top universities in Pakistan and apply online to track your application status here.</p>
          <a href="universities.html" class="btn btn-edu-primary">
            <i class="bi bi-search me-1"></i> Explore Universities
          </a>
        </div>
      `;
      return;
    }

    // Render applications table
    let rowsHtml = '';
    data.items.forEach((app, idx) => {
      const dateStr = new Date(app.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      const uniName = app.university?.name || 'University';
      const statusBadge = getStatusBadgeHtml(app.status);
      const isCancellable = ['Pending', 'Submitted', 'Under Review'].includes(app.status);

      rowsHtml += `
        <tr>
          <td>
            <strong class="d-block text-navy">${uniName}</strong>
            <span class="text-muted small">${app.university?.city || ''}</span>
          </td>
          <td><span class="fw-semibold">${app.program || 'N/A'}</span></td>
          <td><span class="text-secondary">${dateStr}</span></td>
          <td>${statusBadge}</td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-edu-outline px-3" onclick="viewApplicationDetails('${app._id}')">
                <i class="bi bi-eye me-1"></i> View
              </button>
              ${isCancellable ? `
                <button class="btn btn-sm btn-outline-danger px-3" onclick="cancelApplicationAction('${app._id}')">
                  <i class="bi bi-x-circle me-1"></i> Cancel
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="ai-card shadow-sm p-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <h4 class="mb-1 fw-bold text-navy"><i class="bi bi-file-earmark-text me-2 text-gold"></i>My Submitted Applications</h4>
            <p class="text-muted mb-0 small">Track real-time status and view application details.</p>
          </div>
          <span class="badge bg-navy text-white px-3 py-2 rounded-pill fs-7 fw-semibold">
            Total: ${data.items.length} ${data.items.length === 1 ? 'Application' : 'Applications'}
          </span>
        </div>
        <div class="table-responsive">
          <table class="table table-applications align-middle">
            <thead>
              <tr>
                <th>University</th>
                <th>Program</th>
                <th>Application Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Error fetching user applications:', err);
    container.innerHTML = `
      <div class="alert alert-danger p-4 rounded-4 shadow-sm">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        Failed to load your applications. Please ensure the backend server is running and try refreshing the page.
      </div>
    `;
  }
}

function getStatusBadgeHtml(status) {
  switch (status) {
    case 'Pending':
      return `<span class="app-status-badge pending"><i class="bi bi-clock-history"></i> Pending</span>`;
    case 'Submitted':
      return `<span class="app-status-badge submitted"><i class="bi bi-send-check"></i> Submitted</span>`;
    case 'Under Review':
      return `<span class="app-status-badge under-review"><i class="bi bi-search"></i> Under Review</span>`;
    case 'Accepted':
      return `<span class="app-status-badge accepted"><i class="bi bi-check-circle-fill"></i> Accepted</span>`;
    case 'Rejected':
      return `<span class="app-status-badge rejected"><i class="bi bi-x-circle-fill"></i> Rejected</span>`;
    case 'Cancelled':
      return `<span class="app-status-badge cancelled"><i class="bi bi-dash-circle"></i> Cancelled</span>`;
    default:
      return `<span class="app-status-badge pending">🟡 ${status || 'Pending'}</span>`;
  }
}

async function viewApplicationDetails(id) {
  try {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      headers: getAuthHeader()
    });
    const data = await res.json();
    if (!data.success || !data.item) {
      showToast('Could not load application details.', 'danger');
      return;
    }

    const app = data.item;
    const dateStr = new Date(app.createdAt).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let modalEl = document.getElementById('appDetailsModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'appDetailsModal';
      modalEl.className = 'modal fade';
      modalEl.tabIndex = -1;
      document.body.appendChild(modalEl);
    }

    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
          <div class="modal-header bg-navy text-white px-4 py-3">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-file-text me-2 text-gold"></i> Application Details
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom flex-wrap gap-2">
              <div>
                <h4 class="fw-bold text-navy mb-1">${app.university?.name || 'University'}</h4>
                <p class="text-muted mb-0"><i class="bi bi-geo-alt me-1 text-gold"></i> ${app.university?.city || 'Pakistan'}</p>
              </div>
              <div>${getStatusBadgeHtml(app.status)}</div>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <span class="text-muted small d-block">Applied Program</span>
                  <strong class="text-navy fs-6">${app.program || 'N/A'}</strong>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <span class="text-muted small d-block">Application Date</span>
                  <strong class="text-navy fs-6">${dateStr}</strong>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <span class="text-muted small d-block">Applicant Name</span>
                  <strong class="text-navy fs-6">${app.fullName || app.user?.name || 'N/A'}</strong>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <span class="text-muted small d-block">Contact Email</span>
                  <strong class="text-navy fs-6">${app.email || app.user?.email || 'N/A'}</strong>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <span class="text-muted small d-block">Phone Number</span>
                  <strong class="text-navy fs-6">${app.phone || 'N/A'}</strong>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <span class="text-muted small d-block">CNIC / B-Form</span>
                  <strong class="text-navy fs-6">${app.cnic || 'N/A'}</strong>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <span class="text-muted small d-block">Matriculation Marks</span>
                  <strong class="text-navy fs-6">${app.matricPercentage ? app.matricPercentage + '%' : 'N/A'}</strong>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <span class="text-muted small d-block">Intermediate Marks</span>
                  <strong class="text-navy fs-6">${app.intermediatePercentage ? app.intermediatePercentage + '%' : 'N/A'}</strong>
                </div>
              </div>
              ${app.notes ? `
                <div class="col-12">
                  <div class="p-3 bg-light rounded-3">
                    <span class="text-muted small d-block">Admin Notes</span>
                    <p class="mb-0 text-dark small">${app.notes}</p>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="modal-footer bg-light border-0 px-4 py-3">
            <button type="button" class="btn btn-edu-outline rounded-pill px-4" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (err) {
    console.error(err);
    showToast('Failed to display application details', 'danger');
  }
}

async function cancelApplicationAction(id) {
  if (!confirm('Are you sure you want to cancel this application? This action cannot be undone.')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/applications/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    const data = await res.json();
    if (data.success) {
      showToast('Application cancelled successfully', 'success');
      initMyApplicationsPage();
    } else {
      showToast(data.message || 'Failed to cancel application', 'danger');
    }
  } catch (err) {
    console.error(err);
    showToast('Error cancelling application', 'danger');
  }
}

/* ============================================================
   COMPARE PAGE — Dynamic MongoDB University Comparison
   ============================================================ */
async function initComparePage() {
  const select1 = document.getElementById('compareUniSelect1');
  const select2 = document.getElementById('compareUniSelect2');
  const select3 = document.getElementById('compareUniSelect3');
  const btnCompare = document.getElementById('btnRunCompare');
  const cardsContainer = document.getElementById('compareCardsContainer');

  if (!select1 || !select2 || !cardsContainer) return;

  try {
    // 1. Fetch list of universities from MongoDB to populate comparison dropdowns
    const res = await fetch(`${API_BASE}/universities?limit=500`);
    const data = await res.json();
    const rawUniversities = data.items || data.universities || [];

    if (rawUniversities.length === 0) {
      cardsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="alert alert-warning d-inline-block px-4 py-3 rounded-4 shadow-sm">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            No university records found in MongoDB to compare.
          </div>
        </div>
      `;
      return;
    }

    // Fixed location ordering: Islamabad -> Lahore -> Peshawar -> Karachi -> Faisalabad -> Rawalpindi -> Abbottabad -> Multan -> Other
    const CITY_ORDER = [
      'islamabad',
      'lahore',
      'peshawar',
      'karachi',
      'faisalabad',
      'rawalpindi',
      'abbottabad',
      'multan'
    ];

    const getCityRank = (cityStr) => {
      if (!cityStr) return CITY_ORDER.length;
      const normalized = String(cityStr).trim().toLowerCase();
      const index = CITY_ORDER.indexOf(normalized);
      return index !== -1 ? index : CITY_ORDER.length;
    };

    // Stable sort in JS preserves relative database order within each city group
    const universities = [...rawUniversities].sort((a, b) => getCityRank(a.city) - getCityRank(b.city));

    // Populate dropdown options
    const populateDropdown = (selectEl, defaultLabel) => {
      selectEl.innerHTML = `<option value="">${defaultLabel}</option>`;
      universities.forEach(u => {
        const option = document.createElement('option');
        option.value = u._id || u.id;
        option.textContent = `${u.name} (${u.city || 'Pakistan'})`;
        selectEl.appendChild(option);
      });
    };

    populateDropdown(select1, 'Select University 1...');
    populateDropdown(select2, 'Select University 2...');
    populateDropdown(select3, 'Select University 3 (Optional)...');

    // Pre-select universities based on URL query params or defaults
    const urlParams = new URLSearchParams(window.location.search);
    const paramU1 = urlParams.get('u1') || urlParams.get('uni1');
    const paramU2 = urlParams.get('u2') || urlParams.get('uni2');
    const paramU3 = urlParams.get('u3') || urlParams.get('uni3');
    const paramIds = urlParams.get('ids') ? urlParams.get('ids').split(',') : null;

    if (paramU1) select1.value = paramU1;
    else if (paramIds && paramIds[0]) select1.value = paramIds[0];
    else if (universities[0]) select1.value = universities[0]._id || universities[0].id;

    if (paramU2) select2.value = paramU2;
    else if (paramIds && paramIds[1]) select2.value = paramIds[1];
    else if (universities[1]) select2.value = universities[1]._id || universities[1].id;

    if (paramU3) select3.value = paramU3;
    else if (paramIds && paramIds[2]) select3.value = paramIds[2];
    else if (universities[2] && !paramU1 && !paramU2) select3.value = universities[2]._id || universities[2].id;

    // Execute comparison function
    const runComparison = async () => {
      const selectedIds = [select1.value, select2.value, select3.value].filter(Boolean);

      if (selectedIds.length === 0) {
        cardsContainer.innerHTML = `
          <div class="col-12 text-center py-5">
            <div class="alert alert-info d-inline-block px-4 py-3 rounded-4 shadow-sm">
              <i class="bi bi-info-circle me-2"></i>
              Please select at least one university from the dropdowns above to compare.
            </div>
          </div>
        `;
        return;
      }

      cardsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading comparison data...</span>
          </div>
          <p class="text-muted mt-2">Fetching university data directly from MongoDB...</p>
        </div>
      `;

      try {
        const compRes = await fetch(`${API_BASE}/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        const compData = await compRes.json();

        if (compData.success && compData.matrix && compData.matrix.length > 0) {
          renderCompareCards(compData.matrix, cardsContainer);
        } else {
          // Fallback: search local universities array if compare endpoint matrix empty
          const matchedUnis = universities.filter(u => selectedIds.includes(u._id || u.id));
          renderCompareCards(matchedUnis, cardsContainer);
        }
      } catch (err) {
        console.error('Error executing comparison:', err);
        const matchedUnis = universities.filter(u => selectedIds.includes(u._id || u.id));
        renderCompareCards(matchedUnis, cardsContainer);
      }
    };

    if (btnCompare) {
      btnCompare.addEventListener('click', e => {
        e.preventDefault();
        runComparison();
      });
    }

    // Run comparison on initial page load
    runComparison();

  } catch (err) {
    console.error('Failed to initialize Compare page:', err);
    cardsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-danger d-inline-block px-4 py-3 rounded-4">
          <i class="bi bi-exclamation-octagon me-2"></i>
          Failed to load university comparison data. Please ensure the backend server is running.
        </div>
      </div>
    `;
  }
}

/**
 * Render side-by-side comparison cards from MongoDB document data
 */
function renderCompareCards(matrix, container) {
  container.innerHTML = '';

  const colClass = matrix.length === 1 ? 'col-lg-6' : matrix.length === 2 ? 'col-lg-6 col-md-6' : 'col-lg-4 col-md-6';

  matrix.forEach((uni, index) => {
    const col = document.createElement('div');
    col.className = `${colClass}`;
    if (window.AOS) {
      col.setAttribute('data-aos', 'fade-up');
      col.setAttribute('data-aos-delay', (index * 100).toString());
    }

    // 1. Sector (field 1)
    const sectorText = uni.sector && String(uni.sector).trim() ? String(uni.sector).trim() : null;
    const sectorHtml = sectorText
      ? `<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">${escapeHtml(sectorText)}</span>`
      : `<span class="text-not-available">Information not available</span>`;

    // 2. Programs (field 2)
    let programNames = [];
    if (Array.isArray(uni.programs)) {
      programNames = uni.programs
        .map(p => {
          if (!p) return '';
          if (typeof p === 'string') return p.trim();
          return (p.name || p.programName || p.title || '').trim();
        })
        .filter(Boolean);
    } else if (typeof uni.programs === 'string' && uni.programs.trim()) {
      programNames = uni.programs.split(',').map(s => s.trim()).filter(Boolean);
    }

    let programsHtml = '';
    if (programNames.length > 0) {
      programsHtml = `
        <ul class="compare-details-list">
          ${programNames.map(p => `
            <li>
              <i class="bi bi-journal-text text-primary me-2"></i>
              <span>${escapeHtml(p)}</span>
            </li>
          `).join('')}
        </ul>
      `;
    } else {
      programsHtml = `<span class="text-not-available">Information not available</span>`;
    }

    // 3. Facilities (field 3)
    let facilityItems = [];
    if (Array.isArray(uni.facilities)) {
      facilityItems = uni.facilities
        .map(f => {
          if (!f) return '';
          if (typeof f === 'string') return f.trim();
          return (f.name || f.title || f.facility || f.label || String(f)).trim();
        })
        .filter(Boolean);
    } else if (uni.facilities && typeof uni.facilities === 'object') {
      facilityItems = Object.entries(uni.facilities)
        .filter(([key, val]) => val && val !== false && val !== 'No' && val !== 0 && val !== 'false')
        .map(([key, val]) => {
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .replace(/^./, str => str.toUpperCase())
            .trim();
          return typeof val === 'string' && val.toLowerCase() !== 'true' && val.toLowerCase() !== 'yes'
            ? `${formattedKey}: ${val}`
            : formattedKey;
        })
        .filter(Boolean);
    } else if (typeof uni.facilities === 'string' && uni.facilities.trim()) {
      facilityItems = uni.facilities.split(',').map(s => s.trim()).filter(Boolean);
    }

    let facilitiesHtml = '';
    if (facilityItems.length > 0) {
      facilitiesHtml = `
        <ul class="compare-details-list">
          ${facilityItems.map(f => `
            <li>
              <i class="bi bi-check-circle-fill text-success me-2"></i>
              <span>${escapeHtml(f)}</span>
            </li>
          `).join('')}
        </ul>
      `;
    } else {
      facilitiesHtml = `<span class="text-not-available">Information not available</span>`;
    }

    // 4. Website link for "More Details" button
    let websiteUrl = uni.website ? String(uni.website).trim() : '';
    let websiteBtnHtml = '';

    if (websiteUrl && websiteUrl !== '#' && websiteUrl !== 'N/A') {
      if (!/^https?:\/\//i.test(websiteUrl)) {
        websiteUrl = 'https://' + websiteUrl;
      }
      websiteBtnHtml = `
        <a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-edu-primary w-100 font-semibold shadow-sm">
          <i class="bi bi-box-arrow-up-right me-1"></i> More Details
        </a>
      `;
    } else {
      websiteBtnHtml = `
        <button class="btn btn-outline-secondary w-100 font-semibold opacity-75" onclick="alert('Official website URL is not available in database for this university.')">
          <i class="bi bi-box-arrow-up-right me-1"></i> More Details
        </button>
      `;
    }

    // Logo & Header info
    const name = uni.name || 'University';
    const city = uni.city || 'Pakistan';
    const logoUrl = uni.campusImage || uni.image || uni.logo || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=120&q=80';

    col.innerHTML = `
      <div class="compare-card shadow-sm rounded-4 p-4 bg-white">
        <div>
          <!-- Header: Logo, Name, City -->
          <div class="compare-card-header">
            <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(name)}" class="compare-uni-logo" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=120&q=80';">
            <div>
              <h5 class="fw-bold mb-1 text-navy">${escapeHtml(name)}</h5>
              <small class="text-muted"><i class="bi bi-geo-alt me-1"></i>${escapeHtml(city)}</small>
            </div>
          </div>

          <!-- 1. Sector -->
          <div class="compare-section">
            <div class="compare-section-title"><i class="bi bi-building"></i> Sector</div>
            <div>${sectorHtml}</div>
          </div>

          <!-- 2. Programs -->
          <div class="compare-section">
            <div class="compare-section-title"><i class="bi bi-journal-bookmark"></i> Programs (${programNames.length})</div>
            <div class="compare-scroll-container">
              ${programsHtml}
            </div>
          </div>

          <!-- 3. Facilities -->
          <div class="compare-section">
            <div class="compare-section-title"><i class="bi bi-shield-check"></i> Facilities (${facilityItems.length})</div>
            <div class="compare-scroll-container">
              ${facilitiesHtml}
            </div>
          </div>
        </div>

        <!-- Footer: More Details Button -->
        <div class="compare-card-footer pt-3 border-top mt-3">
          ${websiteBtnHtml}
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
