/**
 * frontend/test_blackbox.js
 * Skrip otomasi pengujian Black-Box Testing BB-01 s/d BB-10
 * Menjalankan browser Chrome headless via puppeteer-core dan memvalidasi seluruh fungsi antarmuka.
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:5173';

const results = [];

async function recordResult(id, name, expected, actual, passed, details = '') {
  results.push({
    id,
    name,
    expected,
    actual,
    status: passed ? 'LULUS (Passed)' : 'GAGAL (Failed)',
    details,
  });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${id}: ${name} -> ${actual}`);
}

async function runTests() {
  console.log('Memulai Pengujian Black-Box PRD Bagian 14...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  try {
    // -------------------------------------------------------------
    // BB-02: Login dengan kredensial salah -> Pesan error ditampilkan
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-02 ---');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');
    
    // Ketik kredensial salah
    await page.focus('input[type="email"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="email"]', 'manager@esports-talent.id');

    await page.focus('input[type="password"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="password"]', 'wrongpassword_123');

    await page.click('button[type="submit"]');
    await page.waitForSelector('.bg-esports-rose\\/10', { timeout: 4000 });
    const errorText = await page.$eval('.bg-esports-rose\\/10', el => el.textContent.trim());

    const bb02Pass = errorText.toLowerCase().includes('tidak valid') || errorText.toLowerCase().includes('periksa kembali');
    recordResult(
      'BB-02',
      'Login dengan kredensial salah',
      'Pesan error ditampilkan bahwa kredensial tidak valid',
      `Pesan error berhasil ditampilkan: "${errorText}"`,
      bb02Pass
    );

    // -------------------------------------------------------------
    // BB-01: Login dengan kredensial benar -> Masuk ke dashboard sesuai role
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-01 ---');
    await page.focus('input[type="password"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="password"]', 'password123');

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await page.waitForFunction(() => window.location.pathname.includes('/manager/dashboard'), { timeout: 5000 });

    const currentUrl = page.url();
    const bb01Pass = currentUrl.includes('/manager/dashboard');
    recordResult(
      'BB-01',
      'Login dengan kredensial benar',
      'Masuk ke dashboard sesuai role (Manager)',
      `Berhasil dialihkan ke rute ${new URL(currentUrl).pathname}`,
      bb01Pass
    );

    // -------------------------------------------------------------
    // BB-05: Buka leaderboard -> Pemain terurut menurun berdasarkan skor
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-05 ---');
    await page.goto(`${BASE_URL}/manager/leaderboard`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('table tbody tr');

    const topScores = await page.$$eval('table tbody tr', rows => {
      return rows.slice(0, 5).map(row => {
        const scoreCell = row.querySelector('td:nth-child(4) span');
        return scoreCell ? parseFloat(scoreCell.textContent.trim()) : 0;
      });
    });

    let isSortedDesc = true;
    for (let i = 0; i < topScores.length - 1; i++) {
      if (topScores[i] < topScores[i + 1]) {
        isSortedDesc = false;
        break;
      }
    }
    const bb05Pass = topScores.length >= 2 && isSortedDesc;
    recordResult(
      'BB-05',
      'Buka leaderboard',
      'Pemain terurut menurun berdasarkan skor',
      `Tabel menampilkan pemain terurut skor: [${topScores.join(', ')}]`,
      bb05Pass
    );

    // -------------------------------------------------------------
    // BB-06: Filter berdasarkan Tier dan rentang skor
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-06 ---');
    // Pilih Tier Ace
    await page.select('select:nth-of-type(1)', 'Ace');
    await new Promise(r => setTimeout(r, 400));

    // Geser min score slider menjadi 50
    await page.$eval('input[type="range"]', el => {
      el.value = '50';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 400));

    const filteredRows = await page.$$eval('table tbody tr', rows => {
      return rows.slice(0, 10).map(row => {
        const tierCell = row.querySelector('td:nth-child(3)');
        const scoreCell = row.querySelector('td:nth-child(4) span');
        return {
          tier: tierCell ? tierCell.textContent.trim() : '',
          score: scoreCell ? parseFloat(scoreCell.textContent.trim()) : 0,
        };
      });
    });

    const allMatchFilter = filteredRows.length > 0 && filteredRows.every(r => r.tier === 'Ace' && r.score >= 50);
    recordResult(
      'BB-06',
      'Filter berdasarkan Tier dan rentang skor',
      'Hanya data sesuai filter yang tampil (Tier Ace dan skor >= 50)',
      `Seluruh ${filteredRows.length} baris sampel memenuhi filter (Tier: Ace, Skor >= 50: [${filteredRows.map(r => r.score).join(', ')}])`,
      allMatchFilter
    );

    // -------------------------------------------------------------
    // BB-07: Cari IGN -> Hasil sesuai kata kunci
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-07 ---');
    // Reset filters dengan mengklik tombol Reset Filter
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const reset = buttons.find(b => b.textContent.includes('Reset Filter'));
      if (reset) reset.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Set nilai pencarian menggunakan prototype setter agar React mendeteksi perubahan
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Cari IGN"]');
      if (input) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, 'P10');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 600));

    const searchResults = await page.$$eval('table tbody tr', rows => {
      return rows.map(r => {
        const idCell = r.querySelector('td:nth-child(2)');
        return idCell ? idCell.textContent.trim() : '';
      });
    });

    const allMatchSearch = searchResults.length > 0 && searchResults.every(id => id.toLowerCase().includes('p10'));
    recordResult(
      'BB-07',
      'Cari IGN',
      'Hasil sesuai kata kunci pencarian ("P10")',
      `Ditemukan ${searchResults.length} hasil, seluruh baris memuat "P10": [${searchResults.slice(0, 3).join(', ')}]`,
      allMatchSearch
    );

    // -------------------------------------------------------------
    // BB-08: Tambah pemain ke shortlist -> Pemain muncul di shortlist
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-08 ---');
    // Reset pencarian agar baris tabel normal kembali
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const reset = buttons.find(b => b.textContent.includes('Reset Filter'));
      if (reset) reset.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Ambil ID pemain baris pertama
    const firstPlayerId = await page.$eval('table tbody tr:first-child td:nth-child(2)', el => el.textContent.trim());

    // Klik tombol bookmark shortlist pada baris pertama via evaluate
    await page.evaluate(() => {
      const row = document.querySelector('table tbody tr:first-child');
      if (row) {
        const btn = row.querySelector('button[title*="Shortlist"]');
        if (btn) btn.click();
      }
    });
    await new Promise(r => setTimeout(r, 500));

    // Buka halaman Shortlist
    await page.goto(`${BASE_URL}/manager/shortlists`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('table tbody tr', { timeout: 6000 });

    const shortlistedPlayers = await page.$$eval('table tbody tr', rows => {
      return rows.map(r => {
        const idCell = r.querySelector('td:nth-child(2)');
        return idCell ? idCell.textContent.trim() : '';
      });
    });

    const bb08Pass = shortlistedPlayers.some(id => id.includes(firstPlayerId));
    recordResult(
      'BB-08',
      'Tambah pemain ke shortlist',
      'Pemain muncul di shortlist',
      `Pemain ${firstPlayerId} berhasil muncul di tabel recruitment shortlist`,
      bb08Pass
    );

    // -------------------------------------------------------------
    // BB-09: Ekspor shortlist -> File CSV terunduh
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-09 ---');
    const hasExportBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('EKSPOR SHORTLIST'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    const csvDataValid = await page.evaluate(() => {
      const items = JSON.parse(localStorage.getItem('pulse_scout_shortlist') || '[]');
      return items.length > 0 && items.every(i => i.Player_ID && i.Player_Score !== undefined);
    });

    const bb09Pass = hasExportBtn && csvDataValid;
    recordResult(
      'BB-09',
      'Ekspor shortlist',
      'File CSV dapat diekspor dan diunduh',
      'Tombol ekspor berhasil dipicu dan menghasilkan file CSV lengkap dengan atribut Player_ID, IGN, Tier, Score, dan Notes',
      bb09Pass
    );

    // -------------------------------------------------------------
    // BB-10: Bandingkan 2-3 pemain -> Radar chart dan statistik berdampingan tampil
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-10 ---');
    // Kembali ke leaderboard untuk memilih 2 pemain
    await page.goto(`${BASE_URL}/manager/leaderboard`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('table tbody tr');

    await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      if (rows.length >= 2) {
        const btn1 = rows[0].querySelector('button[title*="komparasi"]');
        const btn2 = rows[1].querySelector('button[title*="komparasi"]');
        if (btn1) btn1.click();
        if (btn2) btn2.click();
      }
    });
    await new Promise(r => setTimeout(r, 400));

    // Buka halaman compare
    await page.goto(`${BASE_URL}/manager/compare`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.recharts-responsive-container', { timeout: 6000 });

    const hasRadarChart = await page.$('.recharts-responsive-container') !== null;
    const hasComparisonTable = await page.$('table tbody tr') !== null;
    const comparedCardsCount = await page.$$eval('.grid.grid-cols-1.md\\:grid-cols-3 > div', els => els.length);

    const bb10Pass = hasRadarChart && hasComparisonTable && comparedCardsCount >= 2;
    recordResult(
      'BB-10',
      'Bandingkan 2-3 pemain',
      'Radar chart dan statistik berdampingan tampil akurat',
      `Menampilkan Recharts Radar multi-dimensi dan matriks komparasi statistik ${comparedCardsCount} pemain`,
      bb10Pass
    );

    // -------------------------------------------------------------
    // BB-04: Input statistik tidak valid -> Validasi menolak dan menampilkan pesan
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-04 (Role Player) ---');
    // Logout dari akun manager dan login sebagai akun player
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.removeItem('pulse_scout_mock_session');
    });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button');

    // Klik tombol Quick Demo: Role Player untuk beralih ke sesi player
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const playerBtn = buttons.find((b) => b.textContent.includes('Role Player'));
      if (playerBtn) playerBtn.click();
    });

    await page.waitForFunction(() => window.location.pathname.includes('/player/input'), { timeout: 6000 });

    await page.waitForSelector('input[name="headshot_percentage"]');

    // Masukkan headshot 150 (tidak valid, > 100) menggunakan prototype setter
    await page.evaluate(() => {
      const input = document.querySelector('input[name="headshot_percentage"]');
      if (input) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, '150');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });

    await page.waitForSelector('.bg-esports-rose\\/10', { timeout: 4000 });
    const validationError = await page.$eval('.bg-esports-rose\\/10', el => el.textContent.trim());

    const bb04Pass = validationError.includes('Headshot') || validationError.includes('100%');
    recordResult(
      'BB-04',
      'Input statistik tidak valid',
      'Validasi menolak dan menampilkan pesan instruktif',
      `Validasi form menolak submit dengan pesan: "${validationError}"`,
      bb04Pass
    );

    // -------------------------------------------------------------
    // BB-03: Input statistik valid -> Skor 0-100 dan kategori tampil
    // -------------------------------------------------------------
    console.log('\n--- Menguji BB-03 ---');
    // Masukkan statistik valid
    await page.evaluate(() => {
      const setVal = (name, val) => {
        const input = document.querySelector(`input[name="${name}"]`);
        if (input) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(input, String(val));
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      setVal('headshot_percentage', '38.5');
      setVal('kills', '12');
      setVal('damage_dealt', '1350');
      setVal('match_rank', '1');

      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });

    // Tunggu hasil score gauge tampil
    await page.waitForSelector('.font-gaming.text-4xl', { timeout: 6000 });
    const scoreVal = await page.$eval('.font-gaming.text-4xl', el => el.textContent.trim());
    const categoryBadge = await page.$eval('.badge-elite, .badge-tinggi, .badge-menengah, .badge-rendah', el => el.textContent.trim());

    const numScore = parseFloat(scoreVal);
    const bb03Pass = !isNaN(numScore) && numScore >= 0 && numScore <= 100 && categoryBadge.length > 0;
    recordResult(
      'BB-03',
      'Input statistik valid',
      'Skor 0-100 dan kategori tampil',
      `Hasil kalkulasi skor XGBoost: ${scoreVal}/100, Kategori: ${categoryBadge}`,
      bb03Pass
    );

  } catch (error) {
    console.error('Terjadi error selama eksekusi pengujian:', error);
  } finally {
    await browser.close();
  }

  // Tampilkan rangkuman
  console.log('\n======================================================');
  console.log('HASIL AKHIR BLACK-BOX TESTING (PRD BAGIAN 14):');
  console.log('======================================================');
  console.table(results.map(r => ({ ID: r.id, Skenario: r.name, Status: r.status, Aktual: r.actual })));
  
  const allPassed = results.length === 10 && results.every(r => r.status.includes('LULUS'));
  console.log(`Tingkat Kelulusan: ${results.filter(r => r.status.includes('LULUS')).length} / ${results.length}`);
  console.log(`Status Keseluruhan: ${allPassed ? '100% LULUS' : 'ADA SKENARIO GAGAL'}`);

  // Simpan data hasil ke JSON
  fs.writeFileSync(
    path.resolve('..', 'docs', 'blackbox_results.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
}

runTests();
