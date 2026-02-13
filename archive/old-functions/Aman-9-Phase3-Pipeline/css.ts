export const css = `
:root{--hero:#16A34A;--hero-light:#DCFCE7;--hero-glow:rgba(22,163,74,0.08);--anchor:#0B0F19;--canvas:#FAFBFC;--surface:#FFF;--body:#64748B;--muted:#94A3B8;--divider:#F1F5F9;--secondary:#2563EB;--secondary-light:#DBEAFE;--risk:#EF4444;--risk-light:#FEF2F2;--amber:#F59E0B;--amber-light:#FFFBEB;--serif:'DM Serif Display',Georgia,serif;--sans:'DM Sans',system-ui,sans-serif;--r:14px;--r-sm:10px;--r-xs:6px}
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;overflow:hidden;font-size:16px;-webkit-font-smoothing:antialiased}
body{font-family:var(--sans);color:var(--anchor);background:var(--canvas)}
.layout{display:flex;height:100vh;overflow:hidden}
.sidebar{width:260px;min-width:260px;background:var(--surface);border-right:1px solid var(--divider);display:flex;flex-direction:column;height:100vh;overflow:hidden}
.sidebar-brand{padding:28px 24px;display:flex;align-items:center;gap:12px;flex-shrink:0}
.sidebar-brand .logo{width:36px;height:36px;background:var(--hero);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(22,163,74,0.25)}
.sidebar-brand .logo svg{color:#fff}
.sidebar-brand .wordmark{font-family:var(--serif);font-size:20px;color:var(--anchor)}
.sidebar-nav{flex:1;padding:8px 12px;overflow-y:auto}
.nav-label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;padding:20px 12px 8px}
.nav-link{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:var(--r-sm);font-size:15px;color:var(--body);cursor:pointer;transition:all .2s;text-decoration:none;position:relative}
.nav-link:hover{background:var(--canvas);color:var(--anchor)}
.nav-link.active{background:var(--hero-glow);color:var(--hero);font-weight:600}
.nav-link svg{width:20px;height:20px;flex-shrink:0}
.nav-link .count{margin-left:auto;font-size:12px;font-weight:600;background:var(--divider);color:var(--body);padding:2px 8px;border-radius:99px}
.nav-link.active .count{background:var(--hero-light);color:var(--hero)}
.sidebar-bottom{padding:16px;border-top:1px solid var(--divider);flex-shrink:0}
.user-card{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:var(--r-sm);background:var(--canvas)}
.user-card .avatar{width:36px;height:36px;border-radius:var(--r-sm);background:linear-gradient(135deg,var(--hero),#059669);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#fff}
.user-card .name{font-size:14px;font-weight:600}
.user-card .role{font-size:12px;color:var(--muted)}
.main-area{flex:1;display:flex;flex-direction:column;height:100vh;overflow:hidden}
.topbar{flex-shrink:0;background:rgba(250,251,252,0.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--divider);padding:16px 40px;display:flex;align-items:center;justify-content:space-between}
.search-wrap{position:relative;width:360px}
.search-wrap input{width:100%;padding:10px 16px;font-size:15px;font-family:var(--sans);border:1px solid var(--divider);border-radius:var(--r);background:var(--surface);outline:none;color:var(--anchor)}
.search-wrap input:focus{border-color:var(--hero);box-shadow:0 0 0 3px var(--hero-glow)}
.btn-run{display:flex;align-items:center;gap:8px;padding:10px 20px;font-size:15px;font-weight:600;font-family:var(--sans);color:#fff;background:var(--hero);border:none;border-radius:var(--r-sm);cursor:pointer;box-shadow:0 2px 8px rgba(22,163,74,0.25)}
.btn-run:hover{background:#15803D}
.content-scroll{flex:1;overflow-y:auto;overflow-x:hidden}
.page{max-width:960px;margin:0 auto;padding:40px 40px 80px}
.hero{margin-bottom:48px}
.hero h1{font-family:var(--serif);font-size:36px;letter-spacing:0.02em;word-spacing:0.08em;line-height:1.15}
.hero .accent-line{width:48px;height:3px;background:var(--hero);border-radius:99px;margin:16px 0 20px}
.hero .subtitle{font-size:16px;color:var(--muted)}
.notice{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:var(--r-sm);font-size:15px;margin-bottom:12px}
.notice.info{background:var(--divider)}
.notice.warn{background:var(--amber-light);color:#92400E}
.notice.success{background:var(--hero-light);color:#166534}
.section{margin-bottom:40px}
.section-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px}
.section-head h2{font-family:var(--serif);font-size:22px;letter-spacing:0.02em;word-spacing:0.08em}
.section-head .link{font-size:14px;font-weight:500;color:var(--secondary);text-decoration:none}
.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.metric-card{background:var(--surface);border:1px solid var(--divider);border-radius:var(--r);padding:24px;transition:all .2s}
.metric-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.04);transform:translateY(-2px)}
.mc-label{font-size:13px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:12px}
.mc-row{display:flex;align-items:flex-end;gap:10px}
.mc-value{font-family:var(--serif);font-size:36px;line-height:1}
.mc-trend{font-size:14px;font-weight:600;margin-bottom:4px}
.mc-trend.up{color:var(--hero)}.mc-trend.down{color:var(--risk)}
.sep{border:none;border-top:1px solid var(--divider);margin:40px 0}
.insight-stack{display:flex;flex-direction:column;gap:12px}
.insight{background:var(--surface);border:1px solid var(--divider);border-left:4px solid;border-radius:var(--r);padding:20px 24px;transition:all .2s}
.insight:hover{box-shadow:0 4px 16px rgba(0,0,0,0.05)}
.insight.positive{border-left-color:var(--hero)}
.insight.neutral{border-left-color:#CBD5E1}
.insight.risk{border-left-color:var(--risk)}
.tags{display:flex;gap:8px;margin-bottom:10px}
.pillar{font-size:12px;font-weight:600;color:var(--body);background:var(--divider);padding:3px 10px;border-radius:99px}
.conf{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:3px 10px;border-radius:99px}
.conf.high{background:var(--hero-light);color:#166534}
.conf.mid{background:var(--divider);color:var(--body)}
.conf .dot{width:6px;height:6px;border-radius:99px}
.conf.high .dot{background:var(--hero)}.conf.mid .dot{background:var(--muted)}
.insight h3{font-size:17px;font-weight:600;line-height:1.4;margin-bottom:6px}
.insight .body{font-size:15px;color:var(--body);line-height:1.65}
.insight .src{margin-top:10px;font-size:13px;color:var(--muted)}
.insight .src a{color:var(--secondary);text-decoration:none}
.quote{border-left:3px solid var(--hero);padding-left:24px;margin:8px 0}
.quote p{font-size:17px;color:#475569;font-style:italic;line-height:1.7}
.quote cite{font-size:13px;color:var(--muted);font-style:normal;display:block;margin-top:8px}
.task-table{background:var(--surface);border:1px solid var(--divider);border-radius:var(--r);overflow:hidden}
.t-head{display:grid;grid-template-columns:5fr 2fr 2.5fr 3fr;gap:12px;padding:14px 24px;background:var(--canvas);border-bottom:1px solid var(--divider)}
.t-head span{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em}
.t-row{display:grid;grid-template-columns:5fr 2fr 2.5fr 3fr;gap:12px;padding:14px 24px;border-bottom:1px solid var(--divider);align-items:center;cursor:pointer}
.t-row:last-child{border-bottom:none}
.t-row:hover{background:var(--canvas)}
.t-title{font-size:15px;font-weight:500}.t-cat{font-size:13px;color:var(--muted);margin-top:2px}
.prio{font-size:13px;font-weight:600}.prio.high{color:var(--risk)}.prio.medium{color:var(--amber)}
.due{font-size:14px;color:var(--body)}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:99px;font-size:13px;font-weight:600}
.pill .dot{width:7px;height:7px;border-radius:99px}
.pill.completed{background:var(--hero-light);color:#166534}.pill.completed .dot{background:var(--hero)}
.pill.in_progress{background:var(--secondary-light);color:#1E40AF}.pill.in_progress .dot{background:var(--secondary)}
.pill.pending{background:var(--amber-light);color:#92400E}.pill.pending .dot{background:var(--amber)}
.pill.failed{background:var(--risk-light);color:#991B1B}.pill.failed .dot{background:var(--risk)}
.pill.draft{background:var(--divider);color:var(--body)}.pill.draft .dot{background:var(--muted)}
.auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.auth-card{background:var(--surface);border:1px solid var(--divider);border-radius:var(--r);padding:24px;transition:all .2s}
.auth-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.04)}
.auth-card .card-top{display:flex;justify-content:space-between;gap:12px;margin-bottom:12px}
.auth-card h4{font-family:var(--serif);font-size:18px;line-height:1.3}
.auth-card .desc{font-size:14px;color:var(--body);line-height:1.6;margin-bottom:16px}
.btns{display:flex;gap:8px}
.btn-sm{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;font-size:14px;font-weight:600;font-family:var(--sans);border-radius:var(--r-xs);cursor:pointer;border:none}
.btn-sm.primary{background:var(--hero);color:#fff}
.btn-sm.outline{background:transparent;border:1px solid var(--divider);color:var(--body)}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;border:1px dashed #CBD5E1;border-radius:var(--r);text-align:center}
.empty .icon-circle{width:56px;height:56px;border-radius:16px;background:var(--divider);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.empty .e-title{font-size:16px;font-weight:600;margin-bottom:4px}
.empty .e-desc{font-size:14px;color:var(--muted);max-width:260px}
.footer{text-align:center;padding:24px 0 0;margin-top:48px;border-top:1px solid var(--divider)}
.footer p{font-size:13px;color:var(--muted)}
`;
