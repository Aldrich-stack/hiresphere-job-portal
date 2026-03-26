// HireSphere App Logic

// Initial Data
const DEFAULT_JOBS = [
    {
        id: 'j1',
        title: 'Senior Product Designer',
        company: 'Linear',
        location: 'Remote',
        type: 'Full-time',
        salary: '$140k - $180k',
        tags: ['UX', 'Figma', 'Product'],
        posted: '2d ago',
        applicants: 12
    },
    {
        id: 'j2',
        title: 'Lead Frontend Engineer',
        company: 'Vercel',
        location: 'San Francisco, CA',
        type: 'Hybrid',
        salary: '$160k - $210k',
        tags: ['React', 'Next.js', 'Typescript'],
        posted: '5h ago',
        applicants: 45
    },
    {
        id: 'j3',
        title: 'Marketing Manager',
        company: 'Stripe',
        location: 'Dublin, Ireland',
        type: 'Full-time',
        salary: '€90k - €120k',
        tags: ['Growth', 'Ads', 'B2B'],
        posted: '1d ago',
        applicants: 8
    }
];

// App State
const state = {
    view: 'home',
    user: JSON.parse(localStorage.getItem('hs_user')) || null,
    jobs: JSON.parse(localStorage.getItem('hs_jobs')) || DEFAULT_JOBS,
    applications: JSON.parse(localStorage.getItem('hs_apps')) || [],
    users: JSON.parse(localStorage.getItem('hs_all_users')) || [] // Store all registered users for admin
};

// Selectors
const mainContent = document.getElementById('main-content');
const modalContainer = document.getElementById('modal-container');
const modalBody = document.getElementById('modal-body');
const loginTrigger = document.getElementById('login-trigger');

// Initialize
function init() {
    if (!state.user && (state.view === 'home' || state.view === 'seeker-dashboard')) {
        renderView('login');
    } else {
        renderView(state.view);
    }
    updateNav();
    setupEventListeners();
}

// Nav Update
function updateNav() {
    if (state.user) {
        loginTrigger.textContent = state.user.role === 'admin' ? 'Admin Panel' : 'Dashboard';
        loginTrigger.classList.remove('btn-primary');
        loginTrigger.classList.add('btn-secondary');
        loginTrigger.onclick = () => {
            if (state.user.role === 'admin') renderView('admin-dashboard');
            else renderView(state.user.role === 'employer' ? 'employer-dashboard' : 'seeker-dashboard');
        };
    } else {
        loginTrigger.textContent = 'Login';
        loginTrigger.onclick = () => renderView('login');
    }
}

// Router - Simple Renderer
function renderView(view) {
    state.view = view;
    mainContent.className = 'animate-up';

    switch (view) {
        case 'home':
            renderHome();
            break;
        case 'jobs':
            renderJobsListing();
            break;
        case 'login':
            renderLogin();
            break;
        case 'seeker-dashboard':
            renderSeekerDashboard();
            break;
        case 'employer-dashboard':
            renderEmployerDashboard();
            break;
        case 'admin-dashboard':
            renderAdminDashboard();
            break;
    }
    window.scrollTo(0, 0);
}

// --- View Renderers ---

function renderHome() {
    const isEmployer = state.user && state.user.role === 'employer';
    const isAdmin = state.user && state.user.role === 'admin';

    mainContent.innerHTML = `
        <section class="hero">
            <h1 class="animate-up">Find your next <span class="gradient-text">Masterpiece</span> Career.</h1>
            <p class="animate-up" style="animation-delay: 0.1s">The premium job portal for high-growth tech talent and innovative companies looking for the next star.</p>
            <div class="hero-actions animate-up" style="animation-delay: 0.2s; display: flex; justify-content: center; gap: 1.5rem;">
                <button class="btn btn-primary btn-lg" onclick="renderView('jobs')">Browse Jobs</button>
                ${isEmployer || isAdmin ?
            `<button class="btn btn-secondary btn-lg" onclick="renderView(${isAdmin ? "'admin-dashboard'" : "'employer-dashboard'"})">Post a Job</button>` :
            `<button class="btn btn-secondary btn-lg" onclick="renderView('login')">Hiring? Post a Job</button>`
        }
            </div>
            
            <div class="stats-row animate-up" style="margin-top: 5rem; display: flex; justify-content: center; gap: 3rem;">
                <div class="stat-item">
                    <h2 style="font-size: 2.5rem; color: var(--primary)">12k+</h2>
                    <p style="color: var(--text-muted)">Active Jobs</p>
                </div>
                <div class="stat-item">
                    <h2 style="font-size: 2.5rem; color: var(--secondary)">4k+</h2>
                    <p style="color: var(--text-muted)">Companies</p>
                </div>
                <div class="stat-item">
                    <h2 style="font-size: 2.5rem; color: var(--accent)">98%</h2>
                    <p style="color: var(--text-muted)">Match Rate</p>
                </div>
            </div>

            <div class="featured-companies animate-up" style="margin-top: 6rem; padding: 2rem; background: rgba(255,255,255,0.02); border-radius: 20px;">
                <p style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; margin-bottom: 2rem;">Trusted by industry leaders</p>
                <div style="display: flex; justify-content: space-around; align-items: center; opacity: 0.5; filter: grayscale(1);">
                    <span style="font-size: 1.5rem; font-weight: 800;">STRIPE</span>
                    <span style="font-size: 1.5rem; font-weight: 800;">VERCEL</span>
                    <span style="font-size: 1.5rem; font-weight: 800;">LINEAR</span>
                    <span style="font-size: 1.5rem; font-weight: 800;">SLACK</span>
                    <span style="font-size: 1.5rem; font-weight: 800;">AIRBNB</span>
                </div>
            </div>
        </section>
    `;
}

function renderJobsListing() {
    mainContent.innerHTML = `
        <div style="padding: 120px 5% 50px; max-width: 1400px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem;">
                <div>
                    <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Open Positions</h2>
                    <p style="color: var(--text-muted)">Explore the opportunities in top leading companies</p>
                </div>
                <div class="search-box glass-card" style="padding: 0.5rem 1rem; display: flex; align-items: center; gap: 1rem;">
                    <input type="text" id="job-search-input" placeholder="Job title or keyword" style="border: none; background: transparent; min-width: 300px;" oninput="filterJobs()">
                    <button class="btn btn-primary" onclick="filterJobs()">Search</button>
                </div>
            </div>
            <div class="job-grid" id="job-list-container">
                ${state.jobs.map(job => renderJobCard(job)).join('')}
            </div>
        </div>
    `;
}

function renderJobCard(job) {
    return `
        <div class="glass-card job-card">
            <div class="job-header">
                <div class="company-logo">${job.company ? job.company[0] : 'H'}</div>
                <span class="tag" style="color: var(--accent)">${job.posted}</span>
            </div>
            <div>
                <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${job.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">${job.company} • ${job.location}</p>
            </div>
            <div class="job-tags">
                ${job.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                <span style="font-weight: 600;">${job.salary}</span>
                <button class="btn btn-primary" onclick="applyJob('${job.id}')">Apply Now</button>
            </div>
        </div>
    `;
}

window.filterJobs = () => {
    const query = document.getElementById('job-search-input').value.toLowerCase();
    const container = document.getElementById('job-list-container');
    const filtered = state.jobs.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.tags.some(t => t.toLowerCase().includes(query))
    );

    container.innerHTML = filtered.length > 0
        ? filtered.map(job => renderJobCard(job)).join('')
        : `<div class="glass-card" style="grid-column: 1/-1; text-align: center;">No jobs found matching "${query}"</div>`;
};

function renderSeekerDashboard() {
    const userApps = state.applications.filter(app => app.userId === state.user.id);

    mainContent.innerHTML = `
        <div style="padding: 120px 5% 50px; max-width: 1400px; margin: 0 auto;">
            <div style="margin-bottom: 3rem;">
                <h1>Welcome back, ${state.user.name} 👋</h1>
                <p style="color: var(--text-muted)">Track your applications and career growth</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <div>
                    <h2 style="margin-bottom: 2rem;">My Applications</h2>
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 3rem;">
                        ${userApps.length === 0 ? '<p class="glass-card">No applications yet. Start exploring!</p>' : userApps.map(app => {
        const job = state.jobs.find(j => j.id === app.jobId);
        return `
                                <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <h3>${job.title}</h3>
                                        <p style="color: var(--text-muted)">${job.company} • Applied on ${new Date(app.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                            <div class="score-badge" style="--score: ${app.score}%" data-score="${app.score}"></div>
                                            <span class="tag" style="background: ${app.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)'}; color: ${app.status === 'pending' ? '#eab308' : '#22c55e'}">
                                                ${app.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            `;
    }).join('')}
                    </div>

                    <h2 style="margin-bottom: 2rem;">Top Recommendations</h2>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${state.jobs.slice(0, 3).map(job => `
                            <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h3>${job.title}</h3>
                                    <p style="color: var(--text-muted)">${job.company} • ${job.location}</p>
                                </div>
                                <button class="btn btn-primary" onclick="applyJob('${job.id}')">Quick Apply</button>
                            </div>
                        `).join('')}
                        <button class="btn btn-secondary" style="width: 100%; margin-top: 1rem;" onclick="renderView('jobs')">See All Jobs</button>
                    </div>
                </div>
                <div class="glass-card">
                    <h3>Career Stats</h3>
                    <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
                        <div>
                            <p style="color: var(--text-muted); margin-bottom: 0.5rem;">Profile Completion</p>
                            <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                                <div style="width: 85%; height: 100%; background: var(--primary);"></div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Profile Views</span>
                            <span style="color: var(--accent)">142</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Interviews</span>
                            <span style="color: var(--secondary)">3</span>
                        </div>
                        <button class="btn btn-primary" style="width: 100%;" onclick="alert('Profile Editor Coming Soon!')">Edit Profile</button>
                        <button class="btn btn-secondary" style="width: 100%;" onclick="logout()">Logout</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderEmployerDashboard() {
    const employerJobs = state.jobs.filter(j => j.employerId === state.user.id);

    mainContent.innerHTML = `
        <div style="padding: 120px 5% 50px; max-width: 1400px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
                <div>
                    <h1>Employer Portal: ${state.user.company}</h1>
                    <p style="color: var(--text-muted)">Welcome, hiring manager! Manage your talent pipeline.</p>
                </div>
                <button class="btn btn-primary" onclick="showJobPostingModal()">+ Post New Job</button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                <div class="glass-card">
                    <p style="color: var(--text-muted)">Active Listings</p>
                    <h2 style="font-size: 2rem;">${employerJobs.length}</h2>
                </div>
                <div class="glass-card">
                    <p style="color: var(--text-muted)">Total Applicants</p>
                    <h2 style="font-size: 2rem;">${employerJobs.reduce((acc, current) => acc + current.applicants, 0)}</h2>
                </div>
                <div class="glass-card">
                    <p style="color: var(--text-muted)">Pipeline Status</p>
                    <h2 style="font-size: 2rem; color: var(--accent)">Active</h2>
                </div>
            </div>

            <h2 style="margin-bottom: 2rem;">Your Job Posts</h2>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${employerJobs.length === 0 ? '<p class="glass-card">No jobs posted yet. Click + Post New Job to start.</p>' : employerJobs.map(job => `
                    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin-bottom: 0.5rem;">${job.title}</h3>
                            <p style="color: var(--text-muted)">Posted: ${job.posted} • <strong>${job.applicants}</strong> candidates applied</p>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-secondary" onclick="viewJobApplicants('${job.id}')">View Candidates</button>
                            <button class="btn btn-primary" style="background: var(--secondary); box-shadow: none;" onclick="deleteJob('${job.id}')">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-secondary" style="margin-top: 3rem;" onclick="logout()">Logout Employer Account</button>
        </div>
    `;
}

window.deleteJob = (jobId) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;

    state.jobs = state.jobs.filter(j => j.id !== jobId);
    localStorage.setItem('hs_jobs', JSON.stringify(state.jobs));

    // Also cleanup applications for this job
    state.applications = state.applications.filter(a => a.jobId !== jobId);
    localStorage.setItem('hs_apps', JSON.stringify(state.applications));

    alert('Job deleted successfully.');

    // Refresh the current view
    if (state.user.role === 'admin') renderAdminDashboard();
    else renderEmployerDashboard();
};

// --- Modals & Interaction ---

function showAuthModal() {
    modalBody.innerHTML = `
        <div class="auth-form animate-up">
            <h2 style="text-align: center; margin-bottom: 1rem;">Join HireSphere</h2>
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <button class="btn btn-secondary" style="flex: 1;" id="seeker-toggle">Job Seeker</button>
                <button class="btn btn-secondary" style="flex: 1;" id="employer-toggle">Employer</button>
            </div>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="auth-name" placeholder="John Doe">
            </div>
            <div class="form-group" id="company-field" style="display: none;">
                <label>Company Name</label>
                <input type="text" id="auth-company" placeholder="Acme Inc">
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="auth-email" placeholder="john@example.com">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="auth-pass" placeholder="••••••••">
            </div>
            <button class="btn btn-primary" onclick="handleAuth()">Complete Registration</button>
        </div>
    `;

    let role = 'seeker';
    const seekerBtn = document.getElementById('seeker-toggle');
    const employerBtn = document.getElementById('employer-toggle');
    const companyField = document.getElementById('company-field');

    seekerBtn.classList.add('btn-primary');
    seekerBtn.classList.remove('btn-secondary');

    seekerBtn.onclick = () => {
        role = 'seeker';
        seekerBtn.classList.add('btn-primary'); seekerBtn.classList.remove('btn-secondary');
        employerBtn.classList.add('btn-secondary'); employerBtn.classList.remove('btn-primary');
        companyField.style.display = 'none';
    };

    employerBtn.onclick = () => {
        role = 'employer';
        employerBtn.classList.add('btn-primary'); employerBtn.classList.remove('btn-secondary');
        seekerBtn.classList.add('btn-secondary'); seekerBtn.classList.remove('btn-primary');
        companyField.style.display = 'block';
    };

    window.handleAuth = () => {
        const name = document.getElementById('auth-name').value;
        const email = document.getElementById('auth-email').value;
        const company = document.getElementById('auth-company').value;

        if (!name || !email) return alert('Please fill in required fields');

        state.user = {
            id: 'u' + Date.now(),
            name,
            email,
            role,
            company: role === 'employer' ? company : null
        };

        // Save to global user list for admin/login
        state.users.push(state.user);
        localStorage.setItem('hs_all_users', JSON.stringify(state.users));

        localStorage.setItem('hs_user', JSON.stringify(state.user));
        closeModal();
        updateNav();
        renderView(role === 'employer' ? 'employer-dashboard' : 'seeker-dashboard');
    };

    openModal();
}

function showJobPostingModal() {
    modalBody.innerHTML = `
        <div class="auth-form animate-up">
            <h2>Post a New Job</h2>
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" id="job-title" placeholder="e.g. Senior Backend Dev">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" id="job-loc" placeholder="Remote / City">
            </div>
            <div class="form-group">
                <label>Salary Range</label>
                <input type="text" id="job-salt" placeholder="$100k - $120k">
            </div>
            <div class="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" id="job-tags" placeholder="React, Node, SQL">
            </div>
            <button class="btn btn-primary" onclick="handleJobPost()">Post Listing</button>
        </div>
    `;

    window.handleJobPost = () => {
        const title = document.getElementById('job-title').value;
        const location = document.getElementById('job-loc').value;
        const salary = document.getElementById('job-salt').value;
        const tags = document.getElementById('job-tags').value.split(',').map(t => t.trim());

        if (!title) return alert('Job Title is required');

        const newJob = {
            id: 'j' + Date.now(),
            title,
            company: state.user.company,
            location,
            salary,
            tags,
            posted: 'Just now',
            applicants: 0,
            employerId: state.user.id
        };

        state.jobs.unshift(newJob);
        localStorage.setItem('hs_jobs', JSON.stringify(state.jobs));
        closeModal();
        renderEmployerDashboard();
    };

    openModal();
}

window.applyJob = (jobId) => {
    if (!state.user) return renderView('login');
    if (state.user.role === 'admin') return alert('Admins cannot apply for jobs!');

    // Show application details form
    modalBody.innerHTML = `
        <div class="auth-form animate-up">
            <h2>Complete Your Application</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Please provide your details for this position.</p>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="app-name" value="${state.user.name}">
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="app-phone" placeholder="+1 (555) 000-0000">
            </div>
            <div class="form-group">
                <label>Years of Experience</label>
                <input type="number" id="app-exp" placeholder="e.g. 5">
            </div>
            <div class="form-group">
                <label>Resume / Portfolio Link</label>
                <input type="url" id="app-resume" placeholder="https://linkedin.com/in/yourname">
            </div>
            <button class="btn btn-primary" onclick="submitFinalApplication('${jobId}')">Submit Application</button>
        </div>
    `;
    openModal();
};

window.submitFinalApplication = (jobId) => {
    const name = document.getElementById('app-name').value;
    const phone = document.getElementById('app-phone').value;
    const exp = document.getElementById('app-exp').value;
    const resume = document.getElementById('app-resume').value;

    if (!name || !phone || !resume) return alert('Please fill in all required fields');

    const existing = state.applications.find(a => a.jobId === jobId && a.userId === state.user.id);
    if (existing) {
        closeModal();
        return alert('You have already applied for this job.');
    }

    // Simulated AI Scoring Feature
    const score = Math.floor(Math.random() * (98 - 75 + 1)) + 75;

    const newApp = {
        id: 'a' + Date.now(),
        userId: state.user.id,
        jobId: jobId,
        status: 'pending',
        date: new Date().toISOString(),
        score: score,
        details: { name, phone, exp, resume }
    };

    state.applications.push(newApp);
    localStorage.setItem('hs_apps', JSON.stringify(state.applications));

    const jobIndex = state.jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
        state.jobs[jobIndex].applicants += 1;
        localStorage.setItem('hs_jobs', JSON.stringify(state.jobs));
    }

    modalBody.innerHTML = `
        <div class="animate-up" style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🚀</div>
            <h2>Application Standard High!</h2>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Your profile has been shared with the hiring team.</p>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                <div class="score-badge" style="--score: ${score}%" data-score="${score}"></div>
                <p><strong>AI Profile Match: ${score}%</strong></p>
            </div>
            <button class="btn btn-primary" style="margin-top: 2rem; width: 100%;" onclick="closeModal(); renderView('seeker-dashboard')">View My Applications</button>
        </div>
    `;
};

function openModal() {
    modalContainer.classList.remove('hidden');
}

function closeModal() {
    modalContainer.classList.add('hidden');
}

function logout() {
    state.user = null;
    localStorage.removeItem('hs_user');
    updateNav();
    renderView('home');
}

function setupEventListeners() {
    document.getElementById('home-btn').onclick = () => renderView('home');
    document.querySelector('[data-view="jobs"]').onclick = (e) => {
        e.preventDefault();
        renderView('jobs');
    };
    document.querySelector('.close-modal').onclick = closeModal;
}

// Start the app
init();

// --- Login & Admin Views ---

function renderLogin() {
    mainContent.innerHTML = `
        <div style="padding: 160px 5% 50px; display: flex; justify-content: center;">
            <div class="glass-card" style="width: 100%; max-width: 450px;">
                <h2 style="text-align: center; margin-bottom: 2rem;">Welcome Back</h2>
                <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                    <button class="btn btn-secondary" style="flex: 1;" id="type-user">User</button>
                    <button class="btn btn-secondary" style="flex: 1;" id="type-admin">Admin</button>
                </div>
                <div class="auth-form" id="login-form">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="login-email" placeholder="name@example.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="login-pass" placeholder="••••••••">
                    </div>
                    <button class="btn btn-primary" onclick="handleLoginSubmit()">Sign In</button>
                    <p style="text-align: center; margin-top: 1rem; color: var(--text-muted);">
                        Don't have an account? <a href="#" onclick="showAuthModal()" style="color: var(--primary);">Register Now</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    let loginType = 'user';
    const userBtn = document.getElementById('type-user');
    const adminBtn = document.getElementById('type-admin');

    userBtn.classList.add('btn-primary');
    userBtn.classList.remove('btn-secondary');

    userBtn.onclick = () => {
        loginType = 'user';
        userBtn.classList.add('btn-primary'); userBtn.classList.remove('btn-secondary');
        adminBtn.classList.add('btn-secondary'); adminBtn.classList.remove('btn-primary');
    };
    adminBtn.onclick = () => {
        loginType = 'admin';
        adminBtn.classList.add('btn-primary'); adminBtn.classList.remove('btn-secondary');
        userBtn.classList.add('btn-secondary'); userBtn.classList.remove('btn-primary');
    };

    window.handleLoginSubmit = () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;

        if (loginType === 'admin') {
            if (email === 'admin@hiresphere.com' && pass === 'admin123') {
                state.user = { id: 'admin', name: 'System Admin', role: 'admin' };
                localStorage.setItem('hs_user', JSON.stringify(state.user));
                updateNav();
                renderView('admin-dashboard');
            } else {
                alert('Invalid Admin Credentials (Hint: admin@hiresphere.com / admin123)');
            }
        } else {
            const user = state.users.find(u => u.email === email);
            if (user) {
                state.user = user;
                localStorage.setItem('hs_user', JSON.stringify(state.user));
                updateNav();
                renderView(user.role === 'employer' ? 'employer-dashboard' : 'seeker-dashboard');
            } else {
                alert('User not found. Try registering!');
            }
        }
    };
}

function renderAdminDashboard() {
    mainContent.innerHTML = `
        <div style="padding: 120px 5% 50px; max-width: 1400px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
                <div>
                    <h1>Admin Control Panel</h1>
                    <p style="color: var(--text-muted)">Welcome back, High Authority</p>
                </div>
                <button class="btn btn-primary" onclick="showAdminPostingModal()">+ Create New Listing</button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 4rem;">
                <div class="glass-card">
                    <p style="color: var(--text-muted)">Platform Users</p>
                    <h2 style="font-size: 2.5rem;">${state.users.length + 1}</h2>
                </div>
                <div class="glass-card">
                    <p style="color: var(--text-muted)">Global Listings</p>
                    <h2 style="font-size: 2.5rem;">${state.jobs.length}</h2>
                </div>
                <div class="glass-card">
                    <p style="color: var(--text-muted)">Total Applicants</p>
                    <h2 style="font-size: 2.5rem; color: var(--accent);">${state.applications.length}</h2>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h3>Active Job Postings</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${state.jobs.map(j => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid var(--border);">
                                <div>
                                    <h4 style="margin-bottom: 0.25rem;">${j.title}</h4>
                                    <p style="color: var(--text-muted); font-size: 0.85rem;">${j.company} • ${j.applicants} Applicants</p>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-secondary" style="padding: 0.5rem 1rem;" onclick="viewJobApplicants('${j.id}')">Review</button>
                                    <button class="btn btn-primary" style="padding: 0.5rem 1rem; background: var(--secondary); box-shadow: none;" onclick="deleteJob('${j.id}')">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <button class="btn btn-secondary" style="margin-top: 3rem;" onclick="logout()">Terminate Admin Session</button>
        </div>
    `;
}

window.showAdminPostingModal = () => {
    modalBody.innerHTML = `
        <div class="auth-form animate-up">
            <h2>Create Institutional Listing</h2>
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" id="admin-job-title" placeholder="e.g. Lead Developer">
            </div>
            <div class="form-group">
                <label>Company Display Name</label>
                <input type="text" id="admin-job-comp" placeholder="e.g. HireSphere Labs">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" id="admin-job-loc" placeholder="Remote">
            </div>
            <div class="form-group">
                <label>Salary Range</label>
                <input type="text" id="admin-job-sal" placeholder="$150k - $200k">
            </div>
            <div class="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" id="admin-job-tags" placeholder="AI, Cloud, Python">
            </div>
            <button class="btn btn-primary" onclick="handleAdminJobPost()">Publish Job</button>
        </div>
    `;
    openModal();
};

window.handleAdminJobPost = () => {
    const title = document.getElementById('admin-job-title').value;
    const company = document.getElementById('admin-job-comp').value;
    const location = document.getElementById('admin-job-loc').value;
    const salary = document.getElementById('admin-job-sal').value;
    const tags = document.getElementById('admin-job-tags').value.split(',').map(t => t.trim());

    if (!title || !company) return alert('Fill title and company');

    const newJob = {
        id: 'j' + Date.now(),
        title, company, location, salary, tags,
        posted: 'Just now',
        applicants: 0,
        employerId: 'admin'
    };

    state.jobs.unshift(newJob);
    localStorage.setItem('hs_jobs', JSON.stringify(state.jobs));
    closeModal();
    renderAdminDashboard();
};

window.viewJobApplicants = (jobId) => {
    const job = state.jobs.find(j => j.id === jobId);
    const applicants = state.applications.filter(a => a.jobId === jobId);

    modalBody.innerHTML = `
        <div class="animate-up" style="max-height: 80vh; overflow-y: auto;">
            <h2 style="margin-bottom: 2rem;">Applicants for ${job.title}</h2>
            ${applicants.length === 0 ? '<p>No applications received yet.</p>' : applicants.map(app => `
                <div class="glass-card" style="margin-bottom: 1rem; border-color: var(--primary);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3>${app.details?.name || 'Candidate'}</h3>
                        <span class="tag" style="background: var(--primary)">Match: ${app.score}%</span>
                    </div>
                    <p><strong>Experience:</strong> ${app.details?.exp || 'N/A'} years</p>
                    <p><strong>Contact:</strong> ${app.details?.phone || 'N/A'}</p>
                    <p><strong>Resume/Portfolio:</strong> <a href="${app.details?.resume}" target="_blank" style="color: var(--accent)">View Link</a></p>
                </div>
            `).join('')}
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="closeModal()">Close Viewer</button>
        </div>
    `;
    openModal();
};
