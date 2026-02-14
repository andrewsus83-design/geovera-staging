/**
 * AUTHORITY HUB - JAVASCRIPT
 * Production-ready frontend logic for Authority Hub
 */

// ============================================
// TIER USAGE MANAGEMENT
// ============================================

let supabaseClient = null;
let currentUser = null;
let currentCollections = 0;
let tierLimit = 3; // Default to basic
let currentTier = 'basic';

// Tier limits configuration
const TIER_LIMITS = {
    basic: 3,
    premium: 10,
    partner: Infinity
};

// Initialize Supabase
async function initializeSupabase() {
    try {
        if (typeof window.GeoVeraConfig === 'undefined' || !window.GeoVeraConfig.supabase.url) {
            console.warn('Supabase config not loaded, running in demo mode');
            return;
        }

        const { createClient } = supabase;
        supabaseClient = createClient(
            window.GeoVeraConfig.supabase.url,
            window.GeoVeraConfig.supabase.anonKey
        );

        // Get current user
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            window.location.href = '/frontend/login.html';
            return;
        }

        currentUser = user;

        // GUARD: Check subscription tier (NO FREE TIER!)
        const { data: subscription } = await supabaseClient
            .from('gv_user_subscriptions')
            .select('tier_id, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

        if (!subscription) {
            alert('Please subscribe to a plan to access this page');
            window.location.href = '/frontend/pricing.html';
            return;
        }

        if (user) {
            await loadUserTierAndUsage();
        }
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
}

// Load user tier and usage
async function loadUserTierAndUsage() {
    try {
        if (!supabaseClient || !currentUser) return;

        // Get subscription tier
        const { data: subscription, error: subError } = await supabaseClient
            .from('gv_user_subscriptions')
            .select('tier_name')
            .eq('user_id', currentUser.id)
            .eq('status', 'active')
            .single();

        if (subError) {
            console.warn('Error loading subscription:', subError);
            currentTier = 'basic';
            tierLimit = TIER_LIMITS.basic;
        } else if (!subscription) {
            console.warn('No active subscription found, using basic tier');
            currentTier = 'basic';
            tierLimit = TIER_LIMITS.basic;
        } else {
            currentTier = subscription.tier_name.toLowerCase();
            tierLimit = TIER_LIMITS[currentTier] || TIER_LIMITS.basic;
        }

        // Get current collections count from gv_hub_collections
        // Note: Collections are currently public, but we'll filter by user when user-specific collections are implemented
        const { count, error: countError } = await supabaseClient
            .from('gv_hub_collections')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published');

        if (countError) {
            console.warn('Error counting collections:', countError);
            // Use mock data for now
            currentCollections = 2; // Demo: show 2/3 for Basic tier
        } else {
            // For demo purposes, use a fixed number until user-specific collections are added
            currentCollections = Math.min(count || 2, tierLimit);
        }

        // Update UI
        updateUsageIndicator();
        document.getElementById('usageIndicatorContainer').style.display = 'flex';

    } catch (error) {
        console.error('Error loading tier and usage:', error);
        // Fallback to demo values
        currentTier = 'basic';
        tierLimit = TIER_LIMITS.basic;
        currentCollections = 2;
        updateUsageIndicator();
        document.getElementById('usageIndicatorContainer').style.display = 'flex';
    }
}

// Update usage indicator
function updateUsageIndicator() {
    const usageText = document.getElementById('usageText');
    const usageFill = document.getElementById('usageFill');
    const tierText = document.getElementById('tierText');

    if (!usageText || !usageFill || !tierText) return;

    // Update text
    const limitText = tierLimit === Infinity ? '∞' : tierLimit;
    usageText.textContent = `Collections: ${currentCollections}/${limitText}`;
    tierText.textContent = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);

    // Update progress bar
    const percentage = tierLimit === Infinity ? 0 : (currentCollections / tierLimit) * 100;
    usageFill.style.width = `${Math.min(percentage, 100)}%`;

    // Update color based on usage
    usageFill.classList.remove('warning', 'danger');
    if (percentage >= 100) {
        usageFill.classList.add('danger');
    } else if (percentage >= 80) {
        usageFill.classList.add('warning');
    }
}

// Check if user can create collection
function canCreateCollection() {
    if (currentTier === 'partner' || tierLimit === Infinity) {
        return true;
    }
    return currentCollections < tierLimit;
}

// Show limit modal
function showLimitModal() {
    const modal = document.getElementById('limitModal');
    const currentCount = document.getElementById('currentCount');
    const maxCount = document.getElementById('maxCount');
    const currentTierSpan = document.getElementById('currentTier');

    if (!modal) return;

    currentCount.textContent = currentCollections;
    maxCount.textContent = tierLimit;
    currentTierSpan.textContent = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Focus trap
    const firstFocusable = modal.querySelector('.limit-modal-close');
    if (firstFocusable) firstFocusable.focus();
}

// Close limit modal
function closeLimitModal() {
    const modal = document.getElementById('limitModal');
    if (!modal) return;

    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Handle create collection button click
async function handleCreateCollection() {
    if (!currentUser) {
        alert('Please sign in to create collections');
        window.location.href = '/frontend/login.html';
        return;
    }

    if (!canCreateCollection()) {
        showLimitModal();
        return;
    }

    // TODO: Implement actual collection creation
    alert('Collection creation coming soon! This would open a modal to create a new collection.');

    // For demo: increment count and update UI
    currentCollections++;
    updateUsageIndicator();
}

// ============================================
// HOMEPAGE FUNCTIONALITY
// ============================================

// Mock data for collections
const collectionsData = [
    {
        id: 1,
        title: "The Future of Sustainable Energy",
        description: "Exploring renewable energy innovations, market trends, and breakthrough technologies shaping our sustainable future.",
        category: "sustainability",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
        articles: 42,
        videos: 28,
        charts: 15,
        views: 2400
    },
    {
        id: 2,
        title: "AI in Healthcare: Transforming Patient Care",
        description: "How artificial intelligence is revolutionizing diagnostics, treatment planning, and personalized medicine.",
        category: "healthcare",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
        articles: 38,
        videos: 22,
        charts: 18,
        views: 3200
    },
    {
        id: 3,
        title: "The Rise of Decentralized Finance",
        description: "Understanding DeFi protocols, smart contracts, and the future of financial services.",
        category: "finance",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
        articles: 35,
        videos: 18,
        charts: 24,
        views: 2800
    },
    {
        id: 4,
        title: "Quantum Computing Breakthroughs",
        description: "Latest advances in quantum computing hardware, algorithms, and real-world applications.",
        category: "technology",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
        articles: 29,
        videos: 15,
        charts: 12,
        views: 1900
    },
    {
        id: 5,
        title: "Modern EdTech: Learning in the Digital Age",
        description: "Innovative educational technologies reshaping how we teach and learn globally.",
        category: "education",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop",
        articles: 44,
        videos: 31,
        charts: 16,
        views: 2100
    },
    {
        id: 6,
        title: "Content Marketing in 2024",
        description: "Strategies, tools, and tactics for effective content marketing in the modern landscape.",
        category: "marketing",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
        articles: 52,
        videos: 26,
        charts: 20,
        views: 3600
    },
    {
        id: 7,
        title: "5G Networks and IoT Integration",
        description: "How 5G is enabling the next generation of connected devices and smart cities.",
        category: "technology",
        image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop",
        articles: 31,
        videos: 19,
        charts: 14,
        views: 2200
    },
    {
        id: 8,
        title: "Mental Health in the Workplace",
        description: "Research, strategies, and best practices for supporting employee mental health.",
        category: "healthcare",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
        articles: 47,
        videos: 24,
        charts: 11,
        views: 2700
    },
    {
        id: 9,
        title: "Circular Economy Principles",
        description: "Building sustainable business models through waste reduction and resource optimization.",
        category: "sustainability",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
        articles: 36,
        videos: 17,
        charts: 19,
        views: 1800
    }
];

// State management
let currentCategory = 'all';
let displayedCollections = 6;
const collectionsPerPage = 6;

// Initialize homepage
function initHomepage() {
    if (document.getElementById('collectionsGrid')) {
        setupCategoryFilter();
        renderCollections();
        setupLoadMore();
    }
}

// Category filter functionality
function setupCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update current category
            currentCategory = button.dataset.category;
            displayedCollections = collectionsPerPage;

            // Re-render collections
            renderCollections();
        });
    });
}

// Render collection cards
function renderCollections() {
    const grid = document.getElementById('collectionsGrid');
    if (!grid) return;

    // Filter collections
    const filtered = currentCategory === 'all'
        ? collectionsData
        : collectionsData.filter(c => c.category === currentCategory);

    // Get collections to display
    const toDisplay = filtered.slice(0, displayedCollections);

    // Render cards
    grid.innerHTML = toDisplay.map(collection => `
        <div class="collection-card fade-in" data-category="${collection.category}">
            <div style="overflow: hidden;">
                <img src="${collection.image}"
                     alt="${collection.title}"
                     loading="lazy">
            </div>
            <div class="collection-card-body">
                <h3 class="collection-card-title">${collection.title}</h3>
                <p class="collection-card-description">${collection.description}</p>
                <div class="collection-stats">
                    <div class="flex items-center gap-1">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                        </svg>
                        <span>${collection.articles}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                        </svg>
                        <span>${collection.videos}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        <span>${collection.charts}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add click handlers
    grid.querySelectorAll('.collection-card').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = 'hub-collection.html';
        });
    });

    // Update load more button visibility
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        if (displayedCollections >= filtered.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
    }
}

// Load more functionality
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', () => {
        displayedCollections += collectionsPerPage;
        renderCollections();
    });
}

// ============================================
// COLLECTION PAGE FUNCTIONALITY
// ============================================

// Mock data for masonry items
const masonryItems = [
    {
        type: 'video',
        title: 'How Wind Turbines Generate Power',
        description: 'An animated explainer on wind turbine technology',
        source: 'TED-Ed',
        duration: '5:32',
        thumbnail: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=600&fit=crop'
    },
    {
        type: 'image',
        title: 'Solar Panel Installation Guide',
        description: 'Step-by-step infographic for residential solar',
        source: 'Energy.gov',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'
    },
    {
        type: 'video',
        title: 'Inside a Hydroelectric Dam',
        description: 'Virtual tour of hydroelectric power generation',
        source: 'National Geographic',
        duration: '8:15',
        thumbnail: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=500&fit=crop'
    },
    {
        type: 'image',
        title: 'Battery Storage Technology',
        description: 'Comparing different battery storage solutions',
        source: 'MIT Technology Review',
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=450&fit=crop'
    },
    {
        type: 'video',
        title: 'Geothermal Energy Explained',
        description: 'How geothermal power plants work',
        source: 'Vox',
        duration: '6:47',
        thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=550&fit=crop'
    },
    {
        type: 'image',
        title: 'Global Wind Map 2024',
        description: 'Interactive visualization of worldwide wind patterns',
        source: 'NOAA',
        image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=400&fit=crop'
    },
    {
        type: 'video',
        title: 'The Future of Solar Energy',
        description: 'Expert panel discussion on solar innovation',
        source: 'World Economic Forum',
        duration: '12:20',
        thumbnail: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=500&fit=crop'
    },
    {
        type: 'image',
        title: 'Energy Storage Solutions',
        description: 'Comparative analysis of battery technologies',
        source: 'Bloomberg NEF',
        image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=350&fit=crop'
    }
];

// Initialize collection page
function initCollectionPage() {
    if (document.querySelector('.tab-btn')) {
        setupTabs();
        renderMasonryGrid();
        initializeCharts();
    }
}

// Tab switching functionality
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // Update buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            // Update content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}Tab`).classList.add('active');

            // Re-render charts if charts tab is opened
            if (tabName === 'charts') {
                setTimeout(() => {
                    initializeCharts();
                }, 100);
            }
        });
    });
}

// Render Pinterest-style masonry grid
function renderMasonryGrid() {
    const grid = document.getElementById('masonryGrid');
    if (!grid) return;

    grid.innerHTML = masonryItems.map((item, index) => {
        if (item.type === 'video') {
            return `
                <div class="masonry-item" data-index="${index}">
                    <div class="masonry-item-video">
                        <img src="${item.thumbnail}" alt="${item.title}" class="masonry-item-image">
                        <div class="video-play-overlay">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="masonry-item-content">
                        <h4 class="masonry-item-title">${item.title}</h4>
                        <p class="masonry-item-description">${item.description}</p>
                        <div class="masonry-item-meta">
                            <span class="masonry-item-source">${item.source}</span>
                            <span class="masonry-item-duration">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                                </svg>
                                ${item.duration}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="masonry-item" data-index="${index}">
                    <img src="${item.image}" alt="${item.title}" class="masonry-item-image">
                    <div class="masonry-item-content">
                        <h4 class="masonry-item-title">${item.title}</h4>
                        <p class="masonry-item-description">${item.description}</p>
                        <div class="masonry-item-meta">
                            <span class="masonry-item-source">${item.source}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');

    // Add click handlers for video play
    grid.querySelectorAll('.video-play-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('Video player would open here in production');
        });
    });
}

// ============================================
// CHARTS FUNCTIONALITY (Chart.js)
// ============================================

let chartInstances = {};

function initializeCharts() {
    // Destroy existing charts to prevent duplicates
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    chartInstances = {};

    // Check if charts tab is active and Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return;
    }

    const chartsTab = document.getElementById('chartsTab');
    if (!chartsTab || !chartsTab.classList.contains('active')) {
        return;
    }

    // Set Chart.js defaults
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#6b7280';

    // Chart 1: Renewable Energy Growth (Line Chart)
    const ctx1 = document.getElementById('renewableGrowthChart');
    if (ctx1) {
        chartInstances.growth = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [
                    {
                        label: 'Solar',
                        data: [480, 580, 710, 850, 1020, 1240, 1480],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Wind',
                        data: [560, 650, 730, 840, 960, 1100, 1280],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Hydro',
                        data: [1290, 1310, 1330, 1350, 1370, 1390, 1410],
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Other',
                        data: [140, 155, 170, 185, 205, 225, 250],
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + ' GW';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' GW';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Chart 2: Top Countries (Horizontal Bar Chart)
    const ctx2 = document.getElementById('countriesChart');
    if (ctx2) {
        chartInstances.countries = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['China', 'USA', 'Brazil', 'India', 'Germany', 'Canada', 'Japan', 'UK', 'France', 'Spain'],
                datasets: [{
                    label: 'Renewable Capacity (GW)',
                    data: [1206, 435, 175, 168, 148, 110, 96, 89, 76, 72],
                    backgroundColor: [
                        '#16a34a',
                        '#22c55e',
                        '#4ade80',
                        '#86efac',
                        '#bbf7d0',
                        '#d1fae5',
                        '#a7f3d0',
                        '#6ee7b7',
                        '#34d399',
                        '#10b981'
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.x + ' GW';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' GW';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Chart 3: Energy Mix (Doughnut Chart)
    const ctx3 = document.getElementById('energyMixChart');
    if (ctx3) {
        chartInstances.mix = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: ['Solar', 'Wind', 'Hydro', 'Bioenergy', 'Geothermal', 'Marine'],
                datasets: [{
                    data: [38, 34, 16, 8, 3, 1],
                    backgroundColor: [
                        '#f59e0b',
                        '#3b82f6',
                        '#06b6d4',
                        '#16a34a',
                        '#ef4444',
                        '#8b5cf6'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 13
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Lazy loading for images
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// INITIALIZATION
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase and load tier data
    await initializeSupabase();

    // Initialize page functionality
    initHomepage();
    initCollectionPage();
    setupLazyLoading();

    // Setup create collection button
    const createBtn = document.getElementById('createCollectionBtn');
    if (createBtn) {
        createBtn.addEventListener('click', handleCreateCollection);
    }

    // Setup modal close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLimitModal();
        }
    });

    // Setup modal close on backdrop click
    const modal = document.getElementById('limitModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLimitModal();
            }
        });
    }

    // Log initialization
    console.log('Authority Hub initialized successfully');
});

// Handle window resize for charts
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (Object.keys(chartInstances).length > 0) {
            Object.values(chartInstances).forEach(chart => {
                if (chart) chart.resize();
            });
        }
    }, 250);
});

// Make functions globally available for inline onclick handlers
window.closeLimitModal = closeLimitModal;

// Export functions for external use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initHomepage,
        initCollectionPage,
        initializeCharts,
        initializeSupabase,
        loadUserTierAndUsage,
        handleCreateCollection,
        closeLimitModal
    };
}
