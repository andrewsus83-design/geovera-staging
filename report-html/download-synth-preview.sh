#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# GeoVera — Download Synthetic Image Preview ke Mac lokal
#
# Usage:
#   ./download-synth-preview.sh aquviva
#   ./download-synth-preview.sh kata-oma
#   ./download-synth-preview.sh twc-gshock-dw5900
#
# Hasil:
#   report-html/{slug}/synth_01.png ... synth_20.png
#   report-html/{slug}/quality-report.json
#   report-html/{slug}/index.html   ← buka di browser untuk preview
# ═══════════════════════════════════════════════════════════════════

set -e

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Usage: $0 <slug>"
  echo "Example: $0 aquviva"
  exit 1
fi

SUPABASE_URL="https://vozjwptzutolvkvfpknk.supabase.co"
STORAGE_BASE="${SUPABASE_URL}/storage/v1/object/public/report-images/report-html/${SLUG}"
OUTPUT_DIR="$(dirname "$0")/${SLUG}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " GeoVera Synthetic Preview Download"
echo " Slug:   ${SLUG}"
echo " Source: ${STORAGE_BASE}/"
echo " Output: ${OUTPUT_DIR}/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p "${OUTPUT_DIR}"

# Download quality-report.json first
echo ""
echo "→ Downloading quality-report.json..."
if curl -sf "${STORAGE_BASE}/quality-report.json" -o "${OUTPUT_DIR}/quality-report.json" 2>/dev/null; then
  echo "  ✓ quality-report.json"
  # Show summary
  if command -v python3 &>/dev/null; then
    python3 -c "
import json
with open('${OUTPUT_DIR}/quality-report.json') as f:
    r = json.load(f)
print(f\"  Brand:      {r.get('brand_name', '?')}\")
print(f\"  Generated:  {r.get('generated_at', '?')[:19]}\")
print(f\"  Synthetic:  {r.get('synthetic_images', '?')} images\")
print(f\"  Pass ≥95%:  {r.get('passing_95pct', '?')}/{r.get('synthetic_images', '?')}\")
print(f\"  Avg score:  {r.get('avg_similarity', '?')}\")
" 2>/dev/null || true
  fi
else
  echo "  ✗ quality-report.json not found yet (pipeline may still be running)"
fi

# Download synthetic images
echo ""
echo "→ Downloading synthetic images..."
DOWNLOADED=0
FAILED=0

for i in $(seq 1 20); do
  FILENAME="synth_$(printf '%02d' $i).png"
  URL="${STORAGE_BASE}/${FILENAME}"
  OUT="${OUTPUT_DIR}/${FILENAME}"

  if curl -sf "$URL" -o "$OUT" 2>/dev/null; then
    SIZE=$(du -sh "$OUT" 2>/dev/null | cut -f1)
    echo "  ✓ ${FILENAME} (${SIZE})"
    DOWNLOADED=$((DOWNLOADED + 1))
  else
    echo "  ✗ ${FILENAME} — not ready yet"
    FAILED=$((FAILED + 1))
    # Clean up empty file
    rm -f "$OUT"
  fi
done

echo ""
echo "→ Downloaded: ${DOWNLOADED}/20 images"

# Generate HTML gallery for quick preview
echo ""
echo "→ Generating HTML gallery..."

QUALITY_JSON=""
if [ -f "${OUTPUT_DIR}/quality-report.json" ]; then
  QUALITY_JSON=$(cat "${OUTPUT_DIR}/quality-report.json")
fi

cat > "${OUTPUT_DIR}/index.html" << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GeoVera Synthetic Preview — ${SLUG}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #e0e0e0; }
  header { background: #1a1a1a; border-bottom: 1px solid #333; padding: 20px 32px; display: flex; align-items: center; gap: 16px; }
  header h1 { font-size: 20px; font-weight: 600; color: #fff; }
  header .badge { background: #2a6ef5; color: #fff; font-size: 12px; padding: 3px 10px; border-radius: 20px; }
  .meta { background: #1a1a1a; border-bottom: 1px solid #222; padding: 16px 32px; display: flex; gap: 32px; flex-wrap: wrap; }
  .meta-item { display: flex; flex-direction: column; gap: 2px; }
  .meta-item .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta-item .value { font-size: 15px; font-weight: 600; color: #fff; }
  .meta-item .value.pass { color: #4ade80; }
  .meta-item .value.warn { color: #fbbf24; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; padding: 24px 32px; }
  .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; transition: border-color 0.2s; }
  .card:hover { border-color: #444; }
  .card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; background: #111; }
  .card .info { padding: 12px; }
  .card .row { display: flex; justify-content: space-between; align-items: center; }
  .card .angle { font-size: 13px; font-weight: 500; color: #ccc; }
  .card .num { font-size: 12px; color: #555; }
  .score-bar { height: 4px; background: #2a2a2a; border-radius: 2px; margin: 8px 0 4px; }
  .score-fill { height: 100%; border-radius: 2px; }
  .score-fill.high { background: #4ade80; }
  .score-fill.mid  { background: #fbbf24; }
  .score-fill.low  { background: #f87171; }
  .score-label { font-size: 12px; color: #888; }
  .score-pct { font-size: 12px; font-weight: 600; }
  .score-pct.high { color: #4ade80; }
  .score-pct.mid  { color: #fbbf24; }
  .score-pct.low  { color: #f87171; }
  .no-img { aspect-ratio: 1; background: #111; display: flex; align-items: center; justify-content: center; color: #333; font-size: 13px; }
  footer { text-align: center; padding: 32px; color: #444; font-size: 13px; border-top: 1px solid #1a1a1a; }
  .approve-btn { display: block; margin: 0 auto 32px; background: #2a6ef5; color: #fff; border: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .approve-btn:hover { background: #1a5ee5; }
  .instructions { background: #1a2a1a; border: 1px solid #2a4a2a; border-radius: 8px; padding: 16px 24px; margin: 0 32px 24px; font-size: 13px; color: #aaa; line-height: 1.8; }
  .instructions code { background: #0f1a0f; padding: 2px 6px; border-radius: 4px; color: #4ade80; font-family: monospace; }
</style>
</head>
<body>
<header>
  <h1>🖼️ Synthetic Preview — ${SLUG}</h1>
  <span class="badge">Gemini Quality Check</span>
</header>

<div class="meta" id="meta-bar">
  <div class="meta-item"><span class="label">Slug</span><span class="value">${SLUG}</span></div>
  <div class="meta-item"><span class="label">Downloaded</span><span class="value">${DOWNLOADED}/20</span></div>
  <div class="meta-item"><span class="label">Quality Report</span><span class="value" id="report-status">Loading...</span></div>
</div>

<div class="instructions">
  <strong>📋 Review Instructions:</strong><br>
  1. Check semua gambar di bawah — pastikan kemiripan dengan produk asli ≥95%<br>
  2. Lihat Gemini score di bawah tiap gambar (hijau = ✅ pass, kuning = ⚠️ borderline, merah = ❌ gagal)<br>
  3. Kalau sudah OK, jalankan perintah ini untuk mulai training:<br>
  <code>curl -X POST https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/generate-synthetic-data \
  -H "Content-Type: application/json" \
  -d '{"slug":"${SLUG}","brand_name":"...","image_urls":[...],"then_train":true}'</code>
</div>

<div class="grid" id="gallery"></div>

<footer>GeoVera Intelligence Platform · RTX 3090 FLUX.1-dev · Gemini Quality Scoring</footer>

<script>
const slug = "${SLUG}";
const supabase = "https://vozjwptzutolvkvfpknk.supabase.co/storage/v1/object/public/report-images/report-html/" + slug;

// Try to load quality report
fetch("quality-report.json")
  .then(r => r.json())
  .then(report => {
    document.getElementById("report-status").textContent = report.avg_similarity || "?";
    document.getElementById("report-status").className = "value pass";

    const bar = document.getElementById("meta-bar");
    bar.innerHTML += \`
      <div class="meta-item"><span class="label">Avg Similarity</span><span class="value pass">\${report.avg_similarity || "?"}</span></div>
      <div class="meta-item"><span class="label">Pass ≥95%</span><span class="value \${report.passing_95pct >= report.synthetic_images ? 'pass' : 'warn'}">\${report.passing_95pct || 0}/\${report.synthetic_images || 20}</span></div>
      <div class="meta-item"><span class="label">Generated</span><span class="value">\${(report.generated_at || "").substring(0,10)}</span></div>
    \`;

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    const images = report.images || [];

    for (let i = 1; i <= 20; i++) {
      const img = images.find(x => x.index === i) || { index: i, angle: "angle " + i, similarity_pct: null };
      const score = img.similarity_pct;
      const cls = score === null ? "" : score >= 95 ? "high" : score >= 75 ? "mid" : "low";
      const filename = "synth_" + String(i).padStart(2, "0") + ".png";

      gallery.innerHTML += \`
        <div class="card">
          <img src="\${filename}" alt="synth_\${i}" onerror="this.parentNode.innerHTML='<div class=no-img>Not downloaded</div>' + this.parentNode.innerHTML.replace(this.outerHTML,'')">
          <div class="info">
            <div class="row">
              <span class="angle">\${img.angle || 'angle'}</span>
              <span class="num">#\${i}</span>
            </div>
            \${score !== null ? \`
            <div class="score-bar"><div class="score-fill \${cls}" style="width:\${score}%"></div></div>
            <div class="row">
              <span class="score-label">Gemini similarity</span>
              <span class="score-pct \${cls}">\${score}%</span>
            </div>\` : '<div style="color:#444;font-size:12px;margin-top:8px">No score yet</div>'}
          </div>
        </div>
      \`;
    }
  })
  .catch(() => {
    document.getElementById("report-status").textContent = "No report yet";
    // Show plain image grid without scores
    const gallery = document.getElementById("gallery");
    for (let i = 1; i <= 20; i++) {
      const filename = "synth_" + String(i).padStart(2, "0") + ".png";
      gallery.innerHTML += \`
        <div class="card">
          <img src="\${filename}" alt="synth_\${i}" onerror="this.style.display='none'">
          <div class="info"><div class="row"><span class="angle">Image \${i}</span></div></div>
        </div>
      \`;
    }
  });
</script>
</body>
</html>
HTMLEOF

echo "  ✓ index.html generated"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✅ Done!"
echo ""
echo " Files saved to: report-html/${SLUG}/"
echo " Open preview:   open report-html/${SLUG}/index.html"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Auto-open if images were downloaded
if [ $DOWNLOADED -gt 0 ]; then
  open "${OUTPUT_DIR}/index.html"
fi
