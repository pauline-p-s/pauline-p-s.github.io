/* ============================================
   JUSTIFIED GALLERY
   Row-based layout: each row fills container
   width exactly, images keep natural ratio.
   ============================================ */

class JustifiedGallery {
  constructor(container, options = {}) {
    this.el        = container;
    this.rowHeight = options.rowHeight || 300;
    this.gap       = options.gap !== undefined ? options.gap : 6;
    this.maxRatio  = options.maxRatio || 3.5;   // cap very wide images
    this.minRatio  = options.minRatio || 0.45;  // cap very tall images

    this.items = [...container.querySelectorAll('.g-item')];
    if (!this.items.length) return;

    // Collect aspect ratios, wait for all images
    this.ratios = new Array(this.items.length).fill(null);
    let pending = this.items.length;

    this.items.forEach((item, i) => {
      const img = item.querySelector('img');
      if (!img) { this._loaded(i, 1); pending--; if (!pending) this._layout(); return; }

      const onLoad = () => {
        let r = img.naturalWidth / img.naturalHeight || 1;
        r = Math.max(this.minRatio, Math.min(this.maxRatio, r));
        this.ratios[i] = r;
        pending--;
        if (!pending) this._layout();
      };

      if (img.complete && img.naturalWidth > 0) {
        onLoad();
      } else {
        img.addEventListener('load',  onLoad, { once: true });
        img.addEventListener('error', () => { this.ratios[i] = 1; pending--; if (!pending) this._layout(); }, { once: true });
      }
    });

    window.addEventListener('resize', () => {
      clearTimeout(this._rt);
      this._rt = setTimeout(() => this._layout(), 150);
    });
  }

  _layout() {
    const W   = this.el.offsetWidth;
    const gap = this.gap;
    const rh  = this.rowHeight;
    if (!W) return;

    // Build rows: pack items until natural widths fill container
    const rows = [];
    let row = [], rowW = 0;

    this.items.forEach((item, i) => {
      const r = this.ratios[i] || 1;
      const naturalW = rh * r;
      const gapsInRow = row.length * gap; // gap before this item
      rowW += naturalW + (row.length ? gap : 0);
      row.push(i);

      if (rowW >= W) {
        rows.push([...row]);
        row = [];
        rowW = 0;
      }
    });
    if (row.length) rows.push(row);

    // Apply dimensions row by row
    rows.forEach((rowIds, ri) => {
      const isLast = ri === rows.length - 1;
      const gapsW  = (rowIds.length - 1) * gap;
      const naturalTotal = rowIds.reduce((s, i) => s + (this.ratios[i] || 1) * rh, 0);

      // For last row: don't stretch if it's clearly incomplete (items < half of prev row)
      let actualH = rh;
      const shouldStretch = !isLast || rowIds.length >= Math.ceil((rows[0] || rowIds).length * 0.6);

      if (shouldStretch) {
        actualH = (W - gapsW) / naturalTotal * rh;
        // Clamp row height so it doesn't become huge
        actualH = Math.min(actualH, rh * 1.8);
      }

      rowIds.forEach(i => {
        const item = this.items[i];
        const w = (this.ratios[i] || 1) * actualH;
        Object.assign(item.style, {
          width:      Math.floor(w) + 'px',
          height:     Math.floor(actualH) + 'px',
          flexGrow:   '0',
          flexShrink: '0',
          flexBasis:  'auto',
          overflow:   'hidden',
          cursor:     'zoom-in',
        });
        const img = item.querySelector('img');
        if (img) {
          Object.assign(img.style, {
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            display:    'block',
            transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          });
        }
      });
    });

    // Apply flex container styles
    Object.assign(this.el.style, {
      display:       'flex',
      flexWrap:      'wrap',
      gap:           gap + 'px',
      alignContent:  'flex-start',
    });

    // Hover
    this.items.forEach(item => {
      if (item._hoverBound) return;
      item._hoverBound = true;
      const img = item.querySelector('img');
      if (!img) return;
      item.addEventListener('mouseenter', () => img.style.transform = 'scale(1.03)');
      item.addEventListener('mouseleave', () => img.style.transform = '');
    });
  }
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.justified-gallery').forEach(el => {
    const rh = parseInt(el.dataset.rowHeight) || 300;
    el._gallery = new JustifiedGallery(el, { rowHeight: rh, gap: 6 });
  });
});
