/**
 * SRI NEYA CRANE SERVICES (SNC) - Main JavaScript Engine
 * Caterpillar-inspired UI & High-Performance Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initProjectSlider();
  initWorksDashboard();
  initFleetTracker();
  initLoadCalculator();
  initBookingModal();
  initCounters();
});

/* ============================================================
   1. MOBILE NAVIGATION & HEADER
   ============================================================ */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const closeBtn = document.getElementById('closeMobileDrawer');

  if (toggleBtn && mobileDrawer) {
    toggleBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
      document.body.style.overflow = mobileDrawer.classList.contains('hidden') ? 'auto' : 'hidden';
    });
  }

  if (closeBtn && mobileDrawer) {
    closeBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('hidden');
      document.body.style.overflow = 'auto';
    });
  }
}

/* ============================================================
   2. PROJECT PHOTO SLIDER / CAROUSEL (Real ACE Crane Photos)
   ============================================================ */
function initProjectSlider() {
  const track = document.getElementById('sncCarouselTrack');
  const slides = document.querySelectorAll('.snc-carousel-slide');
  const prevBtn = document.getElementById('sncCarouselPrev');
  const nextBtn = document.getElementById('sncCarouselNext');
  const thumbnails = document.querySelectorAll('.snc-thumbnail');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const totalSlides = slides.length;

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentIndex = index;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentIndex);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5500);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      startAutoplay();
    });
  }

  thumbnails.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.getAttribute('data-slide-index'), 10);
      goToSlide(idx);
      startAutoplay();
    });
  });

  const carouselContainer = document.querySelector('.snc-carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', startAutoplay);

    // Touch swipe support
    let startX = 0;
    let endX = 0;
    carouselContainer.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].screenX;
      if (startX - endX > 50) {
        goToSlide(currentIndex + 1);
      } else if (endX - startX > 50) {
        goToSlide(currentIndex - 1);
      }
      startAutoplay();
    }, { passive: true });
  }

  goToSlide(0);
  startAutoplay();
}

/* ============================================================
   3. 1500+ COMPLETED WORKS REAL-TIME DASHBOARD
   ============================================================ */
const SNC_COMPLETED_WORKS = [
  {
    id: "SNC-W1544",
    title: "Dual ACE Crane Steel PEB Roof Truss Tandem Erection",
    sector: "infrastructure",
    sectorLabel: "PEB Truss & Structural",
    location: "Dindigul Highway Industrial Corridor",
    client: "Commercial Logistics & Warehouse EPC",
    capacity: "Combined 32 Ton (Dual ACE 16XW Tandem Lift)",
    date: "Oct 2026",
    status: "Completed - 100% Precision Alignment",
    description: "Synchronized dual ACE crane tandem lift erecting wide-span heavy structural steel PEB triangular roof truss frame atop building concrete slab with zero deflection.",
    image: "assets/images/project-peb-truss-tandem-lift.jpg"
  },
  {
    id: "SNC-W1543",
    title: "Multi-Storey Rooftop Heavy Material & Slab Hoisting",
    sector: "infrastructure",
    sectorLabel: "Urban Construction",
    location: "Ponnagaram Commercial Hub, Dindigul",
    client: "Urban Infrastructure & Building Developers",
    capacity: "16 Ton (ACE 16XW Reg: TN-57-BL-9267)",
    date: "Sep 2026",
    status: "Completed - Precision Hoisting",
    description: "High-reach boom extension with ACE hydraulic mobile crane (TN-57-BL-9267) safely hoisting heavy construction materials, granite slabs, and structural components to multi-storey building terrace.",
    image: "assets/images/project-building-material-lift.jpg"
  },
  {
    id: "SNC-W1542",
    title: "High-Mast Floodlight Tower Erection (30m)",
    sector: "lighting",
    sectorLabel: "High-Mast & Lighting",
    location: "Dindigul Town Junction / NH-44",
    client: "Municipal Corp & Highway Authority",
    capacity: "16 Ton (ACE 16XW Heavy Hydraulic)",
    date: "Sep 2026",
    status: "Completed - 100% Safety Clearance",
    description: "Full erection and vertical alignment of 30-meter heavy polygonal high-mast lighting pole with circular lantern ring assembly using ACE 16XW heavy hydraulic crane.",
    image: "assets/images/project-high-mast-erection.jpg"
  },
  {
    id: "SNC-W1541",
    title: "Dual-Crane Heavy Plant Machinery Tandem Lift",
    sector: "industrial",
    sectorLabel: "Factory Machinery",
    location: "SIPCOT Industrial Complex, Nilakottai",
    client: "Auto Components Manufacturing Plant",
    capacity: "28 Ton Combined (Dual ACE 14XW & 16XW)",
    date: "Jun 2026",
    status: "Completed - Zero Downtime",
    description: "Precision synchronized dual crane tandem lift to unload, rotate, and install a 24-ton hydraulic stamping press base into deep foundation pit.",
    image: "assets/images/project-dual-crane-tandem-lift.jpg"
  },
  {
    id: "SNC-W1540",
    title: "TNEB Power Substation Transformer & Pole Rigging",
    sector: "power",
    sectorLabel: "Power & Utilities",
    location: "Natham - Dindigul Highway Sector",
    client: "State Electricity Board Contractors",
    capacity: "16 Ton (ACE Hydraulic Mobile Crane)",
    date: "Aug 2026",
    status: "Completed - Rapid 2hr Turnaround",
    description: "Urgent erection of heavy concrete HT electric poles and mounting of 11kV transformer structure along highway utility corridor.",
    image: "assets/images/project-power-transformer-lift.jpg"
  },
  {
    id: "SNC-W1539",
    title: "Multi-Storey Rooftop Telecom Lattice Tower Lift",
    sector: "telecom",
    sectorLabel: "Telecommunication",
    location: "Commercial Complex, Ponnagaram, Dindigul",
    client: "National Telecom Infrastructure Co.",
    capacity: "14 Ton (ACE 14XW Telescopic)",
    date: "Sep 2026",
    status: "Completed - Zero Disturbance",
    description: "Precision lifting of 4-ton steel lattice telecommunication base and GSM antenna array to rooftop of 4-storey commercial building.",
    image: "assets/images/project-telecom-tower-lift.jpg"
  },
  {
    id: "SNC-W1538",
    title: "Precision Rooftop Construction Equipment Placement",
    sector: "infrastructure",
    sectorLabel: "Commercial Infrastructure",
    location: "Natham Byepass Commercial Enclave",
    client: "Civil Contracting & Engineering Ltd",
    capacity: "16 Ton ACE Pick & Carry Crane",
    date: "Sep 2026",
    status: "Completed - Smooth Lift Execution",
    description: "High-boom vertical material elevation delivering multi-ton construction payload to elevated commercial terrace with certified ground riggers.",
    image: "assets/images/project-rooftop-heavy-lift.jpg"
  },
  {
    id: "SNC-W1537",
    title: "Highway Flyover Girder Placement (35m Precast)",
    sector: "infrastructure",
    sectorLabel: "Infrastructure & Roads",
    location: "Madurai-Dindigul Ring Road Project",
    client: "National Highway EPC Contractor",
    capacity: "100 Ton All-Terrain Crane",
    date: "Jul 2026",
    status: "Completed - Millimeter Alignment",
    description: "Tandem placement of 8 precast concrete bridge girders across river crossing flyover spans during nighttime traffic shutdown.",
    image: "assets/images/project-power-transformer-lift.jpg"
  },
  {
    id: "SNC-W1536",
    title: "Commercial Site Heavy Pick & Carry Operation",
    sector: "industrial",
    sectorLabel: "Industrial Lifting",
    location: "Dindigul Ring Road Project Zone",
    client: "High-Rise Development Partners",
    capacity: "ACE 16XW Heavy Hydraulic (TN-57-BL-9267)",
    date: "May 2026",
    status: "Completed - On-Schedule",
    description: "Rapid on-site mobilization and heavy component elevation using ACE 16XW mobile crane with precision hydraulic joystick controls.",
    image: "assets/images/project-ace-crane-construction-lift.jpg"
  },
  {
    id: "SNC-W1535",
    title: "Wind Turbine Nacelle Maintenance & Generator Rigging",
    sector: "power",
    sectorLabel: "Power & Utilities",
    location: "Palani-Dharapuram Wind Farm Corridor",
    client: "Renewable Energy Asset Management",
    capacity: "250 Ton Crawler / Telescopic Crane",
    date: "Apr 2026",
    status: "Completed - High-Wind Safety Certified",
    description: "Heavy lift of 28-ton wind turbine gearbox and generator unit to 80-meter hub height under monitored wind conditions.",
    image: "assets/images/project-high-mast-erection.jpg"
  },
  {
    id: "SNC-W1534",
    title: "Steel Pre-Engineered Building (PEB) Truss Erection",
    sector: "infrastructure",
    sectorLabel: "PEB Truss & Structural",
    location: "Dindigul Industrial Estate",
    client: "Logistics Hub Warehouse Developers",
    capacity: "Dual ACE Mobile Cranes (Tandem)",
    date: "Mar 2026",
    status: "Completed - 40,000 sq.ft covered",
    description: "Continuous lifting and rigging of 36-meter span steel roof trusses and cold-formed rafters for cold storage facility.",
    image: "assets/images/project-peb-truss-tandem-lift.jpg"
  },
  {
    id: "SNC-W1533",
    title: "Sugar Mill Heavy Boiler Drum Installation",
    sector: "industrial",
    sectorLabel: "Factory Machinery",
    location: "Alanganallur Sugar Mills",
    client: "Bio-Energy & Sugar Refining Co.",
    capacity: "80 Ton Heavy Hydraulic Crane",
    date: "Feb 2026",
    status: "Completed - Zero Defect",
    description: "Complex vertical positioning of 38-ton steam boiler vessel inside 5-tier structural tower.",
    image: "assets/images/project-dual-crane-tandem-lift.jpg"
  },
  {
    id: "SNC-W1532",
    title: "Solar Power Plant Inverter Station Offloading",
    sector: "power",
    sectorLabel: "Power & Utilities",
    location: "Ottanchattiram 50MW Solar Park",
    client: "Solar EPC Infrastructure Ltd",
    capacity: "16 Ton ACE Pick & Carry Crane",
    date: "Jan 2026",
    status: "Completed - 12 Units Installed",
    description: "Rough terrain unloading, internal site transport, and foundation mounting of 12 containerized solar inverter central stations.",
    image: "assets/images/project-power-transformer-lift.jpg"
  },
  {
    id: "SNC-W1531",
    title: "Multi-Axle Overturned Container Trailer Rescue",
    sector: "rescue",
    sectorLabel: "Highway Breakdown Rescue",
    location: "Natham Byepass, NH-383 Junction",
    client: "South India Logistics & Police Dispatch",
    capacity: "50 Ton Heavy Hydraulic Crane + Recovery Unit",
    date: "Dec 2025",
    status: "Emergency Completed - 45 Min Clearance",
    description: "Midnight emergency highway recovery of 32-ton overturned freight container truck blocking arterial highway lane, cleared safely without cargo damage.",
    image: "assets/images/project-building-material-lift.jpg"
  }
];

function initWorksDashboard() {
  const container = document.getElementById('worksDashboardGrid');
  const filterBtns = document.querySelectorAll('.work-filter-btn');
  const searchInput = document.getElementById('workSearchInput');
  const countBadge = document.getElementById('worksCountBadge');

  if (!container) return;

  let currentSector = 'all';
  let currentSearch = '';

  function renderWorks() {
    const filtered = SNC_COMPLETED_WORKS.filter(work => {
      const matchSector = currentSector === 'all' || work.sector === currentSector;
      const matchSearch = currentSearch === '' || 
        work.title.toLowerCase().includes(currentSearch) ||
        work.location.toLowerCase().includes(currentSearch) ||
        work.client.toLowerCase().includes(currentSearch) ||
        work.id.toLowerCase().includes(currentSearch);
      return matchSector && matchSearch;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} of 1,542+ Verified Projects`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-gray-400 bg-cat-dark p-8 border border-cat-dark">
          <svg class="w-12 h-12 mx-auto text-cat-yellow mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-xl font-bold uppercase tracking-wide text-white">No Lifting Works Found</p>
          <p class="text-sm mt-1">Try refining your search terms or selecting 'ALL SECTORS'.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(work => `
      <div class="cat-card group">
        <div class="cat-card-accent-line"></div>
        <div class="relative h-48 overflow-hidden bg-black">
          <span class="cat-card-header-tag">${work.id}</span>
          <img src="${work.image}" alt="${work.title}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span class="bg-black/80 text-cat-yellow text-xs font-bold px-2.5 py-1 uppercase tracking-wider border border-cat-yellow/30">${work.sectorLabel}</span>
            <span class="text-xs text-gray-300 font-semibold bg-zinc-900/90 px-2 py-0.5">${work.date}</span>
          </div>
        </div>
        <div class="p-5 flex flex-col justify-between flex-grow">
          <div>
            <h4 class="text-lg font-bold text-white uppercase group-hover:text-cat-yellow transition">${work.title}</h4>
            <div class="mt-3 space-y-1.5 text-xs text-gray-300">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-cat-yellow shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span class="truncate">${work.location}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-cat-yellow shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                <span class="truncate">Client: ${work.client}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-cat-yellow shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <span class="text-cat-yellow font-bold">${work.capacity}</span>
              </div>
            </div>
            <p class="mt-3 text-xs text-gray-400 line-clamp-2">${work.description}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-400">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Verified Record
            </span>
            <button onclick="openWorkDetail('${work.id}')" class="text-xs uppercase font-extrabold text-cat-yellow hover:text-white flex items-center gap-1 transition">
              View Log
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSector = btn.getAttribute('data-sector');
      renderWorks();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderWorks();
    });
  }

  renderWorks();
}

window.openWorkDetail = function(workId) {
  const work = SNC_COMPLETED_WORKS.find(w => w.id === workId);
  if (!work) return;

  const modal = document.getElementById('workDetailModal');
  const content = document.getElementById('workDetailContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="p-6">
      <div class="flex items-center justify-between border-b border-zinc-700 pb-4 mb-4">
        <div>
          <span class="bg-cat-yellow text-black font-extrabold text-xs px-2 py-0.5 uppercase tracking-wider">${work.id}</span>
          <h3 class="text-xl font-black text-white mt-1 uppercase">${work.title}</h3>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img src="${work.image}" alt="${work.title}" class="w-full h-64 object-cover border-2 border-zinc-700 rounded-sm" />
          <div class="mt-3 bg-black/60 p-3 border border-zinc-800 text-xs text-gray-300">
            <span class="text-cat-yellow font-bold uppercase">Job Location:</span> ${work.location}
          </div>
        </div>
        <div class="space-y-4">
          <div class="bg-zinc-900 p-4 border-l-4 border-cat-yellow">
            <div class="text-xs uppercase font-bold text-gray-400">Operating Equipment</div>
            <div class="text-base font-extrabold text-white">${work.capacity}</div>
          </div>
          <div class="bg-zinc-900 p-4 border border-zinc-800">
            <div class="text-xs uppercase font-bold text-gray-400">Client / Authority</div>
            <div class="text-sm font-semibold text-white">${work.client}</div>
          </div>
          <div class="bg-zinc-900 p-4 border border-zinc-800">
            <div class="text-xs uppercase font-bold text-gray-400">Execution Status</div>
            <div class="text-sm font-bold text-green-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              ${work.status}
            </div>
          </div>
          <div class="text-sm text-gray-300 leading-relaxed">
            ${work.description}
          </div>
          <div class="pt-2">
            <a href="https://wa.me/917373399937?text=Hello%20SNC,%20I%20saw%20project%20${work.id}%20(${encodeURIComponent(work.title)})%20and%20need%20a%20similar%20crane%20service." target="_blank" class="btn-cat-primary w-full text-center">
              Request Similar Lifting Solution
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
};

/* ============================================================
   4. LIVE FLEET & GPS TRACKER SIMULATION (/tracking)
   ============================================================ */
const SNC_FLEET_VEHICLES = [
  {
    id: "SNC-ACE-1601",
    reg: "TN-57-BL-9267",
    name: "ACE 16XW Pick & Carry Mobile Crane",
    capacity: "16 Ton Heavy Hydraulic",
    status: "active",
    statusText: "On-Site Rigging Operation",
    location: "Natham Byepass, Dindigul",
    lat: 10.3624,
    lng: 78.0125,
    topPercent: 46,
    leftPercent: 48,
    operator: "M. Murugan (Lic: TN57/2018/HE)",
    riggingCrew: "3 Certified Riggers",
    fuelLevel: "88%",
    boomReach: "15.8 Meters",
    heading: "Stationary (Stabilized on Outriggers)"
  },
  {
    id: "SNC-ACE-1402",
    reg: "TN-57-AX-4812",
    name: "ACE 14XW Telescopic Mobile Crane",
    capacity: "14 Ton Hydraulic",
    status: "enroute",
    statusText: "En Route to Nilakottai SIPCOT",
    location: "Dindigul-Batlagundu Highway (NH-83)",
    lat: 10.2850,
    lng: 77.8920,
    topPercent: 62,
    leftPercent: 32,
    operator: "K. Selvakumar",
    riggingCrew: "2 Riggers En Route",
    fuelLevel: "94%",
    boomReach: "13.5 Meters",
    heading: "Speed: 38 km/h | ETA: 18 mins"
  },
  {
    id: "SNC-HYD-5001",
    reg: "TN-57-CD-3109",
    name: "50T Hydraulic Telescopic Mobile Crane",
    capacity: "50 Ton Heavy Lift",
    status: "standby",
    statusText: "Standby at Head Office Yard",
    location: "Kullanampatti Petrol Bunk, Dindigul",
    lat: 10.3673,
    lng: 77.9803,
    topPercent: 38,
    leftPercent: 52,
    operator: "R. Sundararaj & Team",
    riggingCrew: "4 Heavy Rigging Specialists",
    fuelLevel: "100%",
    boomReach: "42.0 Meters",
    heading: "Ready for Instant Dispatch (24/7)"
  },
  {
    id: "SNC-REC-4001",
    reg: "TN-57-ER-7788",
    name: "Heavy Commercial Breakdown Recovery Unit",
    capacity: "40 Ton Towing & Recovery",
    status: "active",
    statusText: "Highway Breakdown Rescue (NH-44)",
    location: "Vedasandur Toll Plaza, NH-44",
    lat: 10.5340,
    lng: 77.9540,
    topPercent: 22,
    leftPercent: 44,
    operator: "P. Vignesh & Rescue Team",
    riggingCrew: "Heavy Winch Technicians",
    fuelLevel: "76%",
    boomReach: "Twin Heavy Underlift",
    heading: "Active Towing Operation"
  },
  {
    id: "SNC-CRN-1001",
    reg: "TN-57-HZ-1100",
    name: "100T All-Terrain Heavy Crane",
    capacity: "100 Ton All-Terrain",
    status: "standby",
    statusText: "Yard Standby / Scheduled Night Lift",
    location: "Ponnagaram Hub Yard, Dindigul",
    lat: 10.3580,
    lng: 77.9650,
    topPercent: 42,
    leftPercent: 60,
    operator: "S. Arumugam (Master Rigger)",
    riggingCrew: "5 Industrial Riggers",
    fuelLevel: "92%",
    boomReach: "58.0 Meters",
    heading: "Dispatch Available in 15 mins"
  }
];

function initFleetTracker() {
  const mapCanvas = document.getElementById('fleetMapCanvas');
  const vehicleList = document.getElementById('fleetVehicleList');
  const filterBtns = document.querySelectorAll('.tracker-filter-btn');
  const searchInput = document.getElementById('trackerSearchInput');

  if (!mapCanvas || !vehicleList) return;

  let currentFilter = 'all';
  let searchQuery = '';

  function renderTracker() {
    const filtered = SNC_FLEET_VEHICLES.filter(v => {
      const matchFilter = currentFilter === 'all' || v.status === currentFilter;
      const matchSearch = searchQuery === '' || 
        v.id.toLowerCase().includes(searchQuery) ||
        v.reg.toLowerCase().includes(searchQuery) ||
        v.name.toLowerCase().includes(searchQuery) ||
        v.location.toLowerCase().includes(searchQuery);
      return matchFilter && matchSearch;
    });

    // Render Map Pins
    mapCanvas.innerHTML = `
      <div class="map-grid-bg">
        <!-- SVG Regional Road Network Overlay -->
        <svg class="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <line x1="20%" y1="10%" x2="80%" y2="90%" stroke="#FFCD11" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="10%" y1="60%" x2="90%" y2="40%" stroke="#FFFFFF" stroke-width="1.5" />
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#FFCD11" stroke-width="1.5" />
          <circle cx="50%" cy="45%" r="60" stroke="#FFCD11" stroke-width="1" fill="none" opacity="0.4" />
          <text x="52%" y="42%" fill="#FFCD11" font-size="12" font-weight="bold">DINDIGUL HQ</text>
          <text x="75%" y="85%" fill="#888888" font-size="11">MADURAI</text>
          <text x="45%" y="15%" fill="#888888" font-size="11">KARUR / SALEM</text>
          <text x="15%" y="65%" fill="#888888" font-size="11">THENI / BATLAGUNDU</text>
          <text x="80%" y="30%" fill="#888888" font-size="11">NATHAM / TRICHY</text>
        </svg>

        ${filtered.map(v => `
          <div class="map-pin" style="top: ${v.topPercent}%; left: ${v.leftPercent}%;" onclick="selectVehicle('${v.id}')">
            <div class="map-pin-pulse" style="background-color: ${v.status === 'active' ? '#4CAF50' : v.status === 'enroute' ? '#FFCD11' : '#2196F3'}"></div>
            <div class="map-pin-icon" style="border-color: ${v.status === 'active' ? '#4CAF50' : v.status === 'enroute' ? '#FFCD11' : '#2196F3'}">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div class="map-pin-label">${v.id} (${v.reg})</div>
          </div>
        `).join('')}
      </div>
    `;

    // Render Vehicle Cards in sidebar
    vehicleList.innerHTML = filtered.map(v => `
      <div class="cat-card p-4 cursor-pointer hover:border-cat-yellow transition ${v.status === 'active' ? 'border-l-4 border-l-green-500' : v.status === 'enroute' ? 'border-l-4 border-l-cat-yellow' : 'border-l-4 border-l-blue-500'}" onclick="selectVehicle('${v.id}')">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold bg-zinc-900 text-cat-yellow px-2 py-0.5 border border-zinc-700">${v.id}</span>
          <span class="text-[11px] uppercase font-extrabold px-2 py-0.5 rounded-xs ${v.status === 'active' ? 'bg-green-950 text-green-400 border border-green-700' : v.status === 'enroute' ? 'bg-yellow-950 text-cat-yellow border border-yellow-700' : 'bg-blue-950 text-blue-400 border border-blue-700'}">
            ${v.status.toUpperCase()}
          </span>
        </div>
        <h5 class="text-sm font-bold text-white mt-2 uppercase">${v.name}</h5>
        <div class="text-xs text-gray-300 mt-1 font-semibold flex items-center gap-1">
          <span class="text-cat-yellow font-bold">${v.capacity}</span> &bull; Reg: ${v.reg}
        </div>
        <div class="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-cat-yellow shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
          <span class="truncate">${v.location}</span>
        </div>
        <div class="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-gray-400">
          <span>Operator: <strong class="text-white">${v.operator.split(' ')[0]}</strong></span>
          <span class="text-cat-yellow font-bold">${v.fuelLevel} Fuel</span>
        </div>
      </div>
    `).join('');
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-status');
      renderTracker();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTracker();
    });
  }

  renderTracker();
}

window.selectVehicle = function(vehicleId) {
  const v = SNC_FLEET_VEHICLES.find(item => item.id === vehicleId);
  if (!v) return;

  const modal = document.getElementById('vehicleDetailModal');
  const content = document.getElementById('vehicleDetailContent');
  if (!modal || !content) {
    showToast(`Vehicle ${v.id} (${v.reg}) - Status: ${v.statusText}`);
    return;
  }

  content.innerHTML = `
    <div class="p-6">
      <div class="flex items-center justify-between border-b border-zinc-700 pb-4 mb-4">
        <div>
          <span class="bg-cat-yellow text-black font-extrabold text-xs px-2 py-0.5 uppercase">${v.id}</span>
          <h3 class="text-xl font-black text-white mt-1 uppercase">${v.name}</h3>
          <p class="text-xs text-cat-yellow font-bold uppercase">Registration: ${v.reg}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-zinc-900 p-3.5 border border-zinc-800">
          <div class="text-xs text-gray-400 uppercase font-bold">Current Status</div>
          <div class="text-sm font-extrabold text-green-400 mt-1 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            ${v.statusText}
          </div>
        </div>
        <div class="bg-zinc-900 p-3.5 border border-zinc-800">
          <div class="text-xs text-gray-400 uppercase font-bold">GPS Location Coordinates</div>
          <div class="text-sm font-bold text-white mt-1">${v.location} (${v.lat.toFixed(4)}, ${v.lng.toFixed(4)})</div>
        </div>
        <div class="bg-zinc-900 p-3.5 border border-zinc-800">
          <div class="text-xs text-gray-400 uppercase font-bold">Assigned Certified Operator</div>
          <div class="text-sm font-bold text-white mt-1">${v.operator}</div>
        </div>
        <div class="bg-zinc-900 p-3.5 border border-zinc-800">
          <div class="text-xs text-gray-400 uppercase font-bold">Support Crew</div>
          <div class="text-sm font-bold text-white mt-1">${v.riggingCrew}</div>
        </div>
        <div class="bg-zinc-900 p-3.5 border border-zinc-800">
          <div class="text-xs text-gray-400 uppercase font-bold">Max Boom / Lift Height</div>
          <div class="text-sm font-bold text-cat-yellow mt-1">${v.boomReach}</div>
        </div>
        <div class="bg-zinc-900 p-3.5 border border-zinc-800">
          <div class="text-xs text-gray-400 uppercase font-bold">Telemetry / Fuel</div>
          <div class="text-sm font-bold text-white mt-1">${v.fuelLevel} | Telemetry Online</div>
        </div>
      </div>
      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <a href="tel:+917373399937" class="btn-cat-primary flex-1 text-center">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          Direct Dispatch Call
        </a>
        <a href="https://wa.me/917373399937?text=Dispatch%20Inquiry%20for%20Crane%20${v.id}%20(${v.reg})%20at%20${encodeURIComponent(v.location)}" target="_blank" class="btn-cat-secondary flex-1 text-center">
          WhatsApp Dispatch
        </a>
      </div>
    </div>
  `;

  modal.classList.add('open');
};

/* ============================================================
   5. LOAD & CAPACITY CALCULATOR
   ============================================================ */
function initLoadCalculator() {
  const weightInput = document.getElementById('calcWeight');
  const radiusInput = document.getElementById('calcRadius');
  const heightInput = document.getElementById('calcHeight');
  const resultCard = document.getElementById('calcResult');
  const calcBtn = document.getElementById('calcSubmitBtn');

  if (!calcBtn || !weightInput || !radiusInput || !heightInput || !resultCard) return;

  calcBtn.addEventListener('click', () => {
    const weight = parseFloat(weightInput.value);
    const radius = parseFloat(radiusInput.value);
    const height = parseFloat(heightInput.value);

    if (isNaN(weight) || isNaN(radius) || isNaN(height) || weight <= 0) {
      showToast("Please enter valid weight, radius, and height parameters.");
      return;
    }

    let recommendedModel = "";
    let capacityTons = 0;
    let safetyMargin = "99.8% Safe Lift Index";

    if (weight <= 12 && radius <= 10 && height <= 14) {
      recommendedModel = "ACE 14XW Pick & Carry Mobile Crane";
      capacityTons = 14;
    } else if (weight <= 15 && radius <= 14 && height <= 18) {
      recommendedModel = "ACE 16XW Heavy Hydraulic Mobile Crane";
      capacityTons = 16;
    } else if (weight <= 45 && radius <= 25 && height <= 38) {
      recommendedModel = "50-Ton Telescopic Hydraulic Crane";
      capacityTons = 50;
    } else if (weight <= 75 && radius <= 35 && height <= 50) {
      recommendedModel = "80-Ton Rough Terrain Heavy Crane";
      capacityTons = 80;
    } else if (weight <= 120 && radius <= 45 && height <= 65) {
      recommendedModel = "150-Ton All-Terrain Heavy Crane";
      capacityTons = 150;
    } else {
      recommendedModel = "250-Ton Heavy All-Terrain / Dual Crane Tandem Lift";
      capacityTons = 250;
    }

    resultCard.innerHTML = `
      <div class="bg-black/90 p-6 border-2 border-cat-yellow rounded-sm">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
          <span class="text-xs uppercase font-extrabold text-cat-yellow">Engineered Recommendation</span>
          <span class="text-xs font-bold text-green-400">${safetyMargin}</span>
        </div>
        <h4 class="text-xl font-black text-white uppercase">${recommendedModel}</h4>
        <p class="text-xs text-gray-300 mt-1">Calculated for <strong class="text-cat-yellow">${weight} Tons</strong> at <strong class="text-white">${radius}m radius</strong> and <strong class="text-white">${height}m lift height</strong>.</p>
        
        <div class="grid grid-cols-3 gap-2 mt-4 text-center">
          <div class="bg-zinc-900 p-2 border border-zinc-800">
            <div class="text-[10px] text-gray-400 uppercase">Min Rating</div>
            <div class="text-base font-black text-cat-yellow">${capacityTons}T</div>
          </div>
          <div class="bg-zinc-900 p-2 border border-zinc-800">
            <div class="text-[10px] text-gray-400 uppercase">Rigging Crew</div>
            <div class="text-base font-black text-white">Included</div>
          </div>
          <div class="bg-zinc-900 p-2 border border-zinc-800">
            <div class="text-[10px] text-gray-400 uppercase">Response Time</div>
            <div class="text-base font-black text-white">&lt; 30 Mins</div>
          </div>
        </div>

        <div class="mt-4 flex flex-col sm:flex-row gap-2">
          <a href="https://wa.me/917373399937?text=Hello%20SNC,%20I%20used%20your%20Load%20Calculator:%20Weight%20${weight}T,%20Radius%20${radius}m,%20Height%20${height}m.%20Recommended:%20${encodeURIComponent(recommendedModel)}.%20Please%20provide%20quotation." target="_blank" class="btn-cat-primary text-center flex-1 text-sm py-2.5">
            Book This Crane on WhatsApp
          </a>
          <a href="tel:+917373399937" class="btn-cat-secondary text-center text-sm py-2.5">
            Call Dispatch Now
          </a>
        </div>
      </div>
    `;

    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ============================================================
   6. BOOKING MODAL & FORM HANDLER
   ============================================================ */
function initBookingModal() {
  const openBtns = document.querySelectorAll('.open-booking-modal');
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('closeBookingModal');
  const form = document.getElementById('craneBookingForm');

  if (openBtns.length > 0 && modal) {
    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('open');
      });
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  // Close when clicking modal backdrop
  document.querySelectorAll('.snc-modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  // Modal close buttons
  document.querySelectorAll('.close-modal-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.snc-modal-backdrop').classList.remove('open');
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('bookName')?.value || 'Valued Client';
      const phone = document.getElementById('bookPhone')?.value || '';
      const location = document.getElementById('bookLocation')?.value || 'Dindigul & Surrounding Region';
      const craneType = document.getElementById('bookCraneType')?.value || 'Standard Mobile Crane';
      const notes = document.getElementById('bookNotes')?.value || 'Immediate Requirement';

      const whatsappUrl = `https://wa.me/917373399937?text=CRANE%20BOOKING%20REQUEST:%0AName:%20${encodeURIComponent(name)}%0APhone:%20${encodeURIComponent(phone)}%0ALocation:%20${encodeURIComponent(location)}%0ARequested%20Equipment:%20${encodeURIComponent(craneType)}%0ANotes:%20${encodeURIComponent(notes)}`;

      showToast("Dispatch request submitted! Redirecting to 24/7 Operations Desk...");
      if (modal) modal.classList.remove('open');
      form.reset();

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
    });
  }
}

/* ============================================================
   7. ANIMATED STATS COUNTERS
   ============================================================ */
function initCounters() {
  const counterElements = document.querySelectorAll('.counter-animate');
  if (counterElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        let count = 0;
        const speed = target > 1000 ? target / 50 : target / 30;

        const timer = setInterval(() => {
          count += Math.ceil(speed);
          if (count >= target) {
            el.textContent = `${target.toLocaleString()}${suffix}`;
            clearInterval(timer);
          } else {
            el.textContent = `${count.toLocaleString()}${suffix}`;
          }
        }, 30);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counterElements.forEach(el => observer.observe(el));
}

/* ============================================================
   8. TOAST NOTIFICATION UTILITY
   ============================================================ */
function showToast(message) {
  let toast = document.getElementById('sncGlobalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sncGlobalToast';
    toast.className = 'snc-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg class="w-5 h-5 text-cat-yellow shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <div class="text-sm font-semibold">${message}</div>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}
