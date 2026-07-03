/**
 * Clear All LocalStorage
 * Jalankan di Console Browser (F12)
 */

// Cara 1: Clear semua localStorage
localStorage.clear();

// Cara 2: Clear database tertentu
localStorage.removeItem('vita_rent_db');
localStorage.removeItem('vita_user');
localStorage.removeItem('vita_users');

console.log('✅ Cache dibersihkan! Refresh halaman sekarang.');
