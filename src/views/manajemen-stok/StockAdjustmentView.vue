<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge-adj">
            <span class="adj-icon">⚖️</span>
          </div>

          <div class="header-text">
            <h1 class="page-title">Penyesuaian Stok</h1>
            <p class="page-subtitle">Sesuaikan stok manual atau upload stok awal.</p>
          </div>
        </div>

        <div class="header-buttons">
          <button class="btn-upload btn-upload-secondary" @click="showUploadModalUmum = true">
            <span class="btn-icon">📤</span>
            <span class="btn-text">Upload Stok Umum</span>
          </button>

          <!-- NEW: Karton Box -->
          <button class="btn-upload btn-upload-secondary" @click="showUploadModalKarton = true">
            <span class="btn-icon">📦</span>
            <span class="btn-text">Upload Karton Box</span>
          </button>

          <!-- NEW: Komponen -->
          <button class="btn-upload btn-upload-secondary" @click="showUploadModalKomponen = true">
            <span class="btn-icon">🧩</span>
            <span class="btn-text">Upload Komponen</span>
          </button>

          <button class="btn-upload" @click="showUploadModalKayuRst = true">
            <span class="btn-icon">🪵</span>
            <span class="btn-text">Upload Stok Kayu RST</span>
          </button>

          <button class="btn-upload" @click="showUploadModalKayu = true">
            <span class="btn-icon">🌲</span>
            <span class="btn-text">Upload Stok Kayu Log</span>
          </button>

          <button class="btn-upload btn-upload-produk" @click="showUploadModalProdukJadi = true">
            <span class="btn-icon">🏭</span>
            <span class="btn-text">Upload Produk Jadi</span>
          </button>

          <!-- Jeblosan -->
          <button class="btn-upload btn-upload-secondary" @click="showUploadModalJeblosan = true">
            <span class="btn-icon">🪓</span>
            <span class="btn-text">Upload Jeblosan</span>
          </button>

          <!-- NEW: BOM Produk -->
          <button class="btn-upload btn-upload-secondary" @click="showUploadModalBom = true">
            <span class="btn-icon">🧾</span>
            <span class="btn-text">Upload BOM Produk</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filter dan Tabel -->
    <div class="content-card filter-card">
      <div class="card-header-accent"></div>
      <div class="card-body">
        <div class="filter-container">
          <div class="filter-header">
            <span class="filter-icon">🔍</span>
            <div>
              <h3 class="filter-title">Pilih Kategori Stok</h3>
              <p class="filter-desc">Pilih kategori untuk menampilkan dan menyesuaikan stok.</p>
            </div>
          </div>

          <div class="filter-input-group">
            <div class="select-wrapper">
              <span class="select-icon">📂</span>
              <select id="kategori-filter" v-model="selectedCategory" class="form-control" @change="onKategoriChange">
                <option :value="null" disabled>Pilih kategori...</option>
                <option v-for="kategori in daftarKategori" :key="kategori.id" :value="kategori.id">
                  {{ kategori.name }}
                </option>
              </select>
              <span class="select-arrow">▼</span>
            </div>

            <!-- Filter gudang — hanya tampil saat kategori Komponen -->
            <div v-if="isKomponen" class="select-wrapper">
              <span class="select-icon">🏭</span>
              <select v-model="selectedWarehouse" class="form-control">
                <option :value="null">Semua Gudang</option>
                <option v-for="wh in daftarWarehouse" :key="wh.id" :value="wh.id">
                  {{ wh.name }}
                </option>
              </select>
              <span class="select-arrow">▼</span>
            </div>

            <button
              @click="fetchStokBarang"
              class="btn-primary"
              :disabled="!selectedCategory || loading.stok"
            >
              <span class="btn-icon">{{ loading.stok ? '⏳' : '🔎' }}</span>
              <span class="btn-text">{{ loading.stok ? 'Memuat...' : 'Tampilkan Barang' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading.stok" class="loading-container">
      <div class="loading-animation">
        <div class="spinner"></div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p class="loading-text">Memuat daftar stok...</p>
    </div>

    <!-- Tabel Stok -->
    <div v-if="daftarStok.length > 0 && !loading.stok" class="content-card table-card">
      <div class="search-bar-container">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            class="search-input"
            placeholder="Cari berdasarkan nama atau kode barang..."
          />
          <span v-if="searchQuery" @click="clearSearch" class="clear-search">✕</span>
        </div>
        <div class="search-info">
          <span class="info-icon">📊</span>
          <span class="info-text">
            Menampilkan {{ paginatedStok.length }} dari {{ filteredStok.length }} barang
            <span v-if="searchQuery">(hasil pencarian)</span>
          </span>
        </div>
      </div>

      <div class="card-body-table">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-nama">Nama Barang</th>
                <th v-if="isKomponen" class="th-nama">Nama Produk</th>
                <th class="th-kategori">Kategori</th>
                <th class="th-satuan">Satuan</th>
                <th v-if="isKomponen" class="th-dimensi">P (mm)</th>
                <th v-if="isKomponen" class="th-dimensi">L (mm)</th>
                <th v-if="isKomponen" class="th-dimensi">T (mm)</th>
                <th v-if="!isKomponen" class="th-stok-saat-ini">Stok Saat Ini</th>
                <th v-if="isKomponen" class="th-stok-saat-ini">Qty Natural</th>
                <th v-if="isKomponen" class="th-stok-saat-ini">Qty Warna</th>
                <th v-if="!isKomponen" class="th-stok-baru">Jml Penyesuaian (+/-)</th>
                <th v-if="isKomponen" class="th-stok-baru">Adj Natural (+/-)</th>
                <th v-if="isKomponen" class="th-stok-baru">Adj Warna (+/-)</th>
                <th class="th-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedStok.length === 0">
                <td :colspan="isKomponen ? 12 : 6" class="no-data">
                  <span class="no-data-icon">🔍</span>
                  <p>Tidak ada barang yang sesuai dengan pencarian "{{ searchQuery }}"</p>
                </td>
              </tr>
              <tr v-for="item in paginatedStok" :key="item.id" class="data-row">
                <td class="td-nama">
                  <div class="item-wrapper">
                    <span class="item-icon">📦</span>
                    <span class="item-name">{{ item.name }}</span>
                  </div>
                </td>
                <td v-if="isKomponen" class="td-nama">
                  <span class="item-name">{{ item.nama_produk || '—' }}</span>
                </td>
                <td class="td-kategori">
                  <span class="badge-category">{{ item.category?.name }}</span>
                </td>
                <td class="td-satuan">
                  <span class="badge-unit">{{ item.unit?.name }}</span>
                </td>
                <td v-if="isKomponen" class="td-dimensi">
                  <span class="dimensi-value">{{ item.specifications?.p ?? '—' }}</span>
                </td>
                <td v-if="isKomponen" class="td-dimensi">
                  <span class="dimensi-value">{{ item.specifications?.l ?? '—' }}</span>
                </td>
                <td v-if="isKomponen" class="td-dimensi">
                  <span class="dimensi-value">{{ item.specifications?.t ?? '—' }}</span>
                </td>
                <!-- Stok saat ini: non-komponen -->
                <td v-if="!isKomponen" class="td-stok-saat-ini">
                  <span class="stock-value">{{ parseFloat(item.stock) }}</span>
                </td>
                <!-- Stok saat ini: komponen — natural + warna terpisah -->
                <td v-if="isKomponen" class="td-stok-saat-ini">
                  <span class="stock-value qty-natural-val">{{ parseFloat(item.qty_natural || 0) }}</span>
                </td>
                <td v-if="isKomponen" class="td-stok-saat-ini">
                  <span class="stock-value qty-warna-val">{{ parseFloat(item.qty_warna || 0) }}</span>
                </td>

                <!-- Input adjustment: non-komponen -->
                <td v-if="!isKomponen" class="td-stok-baru">
                  <div class="input-wrapper">
                    <input
                      type="number"
                      v-model.number="item.new_stock"
                      class="form-control-table"
                      placeholder="Contoh: 5 atau -2"
                    />
                  </div>
                </td>
                <!-- Input adjustment: komponen -->
                <td v-if="isKomponen" class="td-stok-baru">
                  <div class="input-wrapper">
                    <input
                      type="number"
                      v-model.number="item.adj_natural"
                      class="form-control-table input-natural"
                      placeholder="+/- Natural"
                    />
                  </div>
                </td>
                <td v-if="isKomponen" class="td-stok-baru">
                  <div class="input-wrapper">
                    <input
                      type="number"
                      v-model.number="item.adj_warna"
                      class="form-control-table input-warna"
                      placeholder="+/- Warna"
                    />
                  </div>
                </td>

                <td class="td-aksi">
                  <button
                    @click="handleAdjusment(item)"
                    class="btn-action-save"
                    :disabled="isKomponen ? (!item.adj_natural && !item.adj_warna) : !item.new_stock"
                  >
                    <span class="save-icon">💾</span>
                    <span class="save-text">Simpan</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">Halaman {{ currentPage }} dari {{ totalPages }}</div>
        <div class="pagination-controls">
          <button @click="goToPage(1)" class="pagination-btn" :disabled="currentPage === 1">
            ⏮️ First
          </button>
          <button
            @click="goToPage(currentPage - 1)"
            class="pagination-btn"
            :disabled="currentPage === 1"
          >
            ◀️ Prev
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="pagination-btn pagination-number"
            :class="{ active: currentPage === page }"
          >
            {{ page }}
          </button>

          <button
            @click="goToPage(currentPage + 1)"
            class="pagination-btn"
            :disabled="currentPage === totalPages"
          >
            Next ▶️
          </button>
          <button
            @click="goToPage(totalPages)"
            class="pagination-btn"
            :disabled="currentPage === totalPages"
          >
            Last ⏭️
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 1: UPLOAD UMUM -->
    <div v-if="showUploadModalUmum" class="modal-overlay" @click.self="closeModalUmum">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">📤</span>
            <h3 class="modal-title">Upload Stok Awal (Umum)</h3>
          </div>
          <button @click="closeModalUmum" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <span class="info-icon">ℹ️</span>
            <div class="info-text">
              <p class="info-main">
                Gunakan ini untuk upload stok <strong>Bahan Operasional</strong> &
                <strong>Karton Box</strong> (barang umum).
              </p>
              <p class="info-sub">
                Template hanya butuh 6 kolom: kode, nama, kategori, satuan, stok_awal, deskripsi.
              </p>
            </div>
          </div>

          <div class="template-download-box">
            <div class="template-header">
              <span class="template-icon">📄</span>
              <p class="template-title">Belum punya template?</p>
            </div>
            <a href="#" @click.prevent="downloadTemplateUmum" class="template-link">
              <span class="download-icon">⬇️</span>
              Download template (Umum)
            </a>
            <p class="template-note">
              <strong>Penting:</strong> Kolom 'kategori' di template harus diisi dengan
              <strong>nama</strong> kategori yang <strong>sudah ada</strong>.
            </p>
          </div>

          <div class="form-group-upload">
            <label class="form-label-upload" for="file-upload-umum">
              <span class="label-icon">📁</span>
              Pilih File (Umum)
            </label>
            <input
              id="file-upload-umum"
              type="file"
              @change="handleFileChangeUmum"
              class="form-control-file"
              accept=".xlsx, .xls"
            />
            <small class="form-hint">Format: .xlsx, .xls (Maks. 5MB)</small>
            <div v-if="uploadFileUmum" class="file-info">
              <span class="file-icon">✅</span>
              File dipilih: <strong>{{ uploadFileUmum.name }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModalUmum" class="btn-secondary">
            <span class="btn-icon-sec">↩️</span>
            Batal
          </button>
          <button
            @click="handleUploadUmum"
            class="btn-primary-modal"
            :disabled="!uploadFileUmum || isUploadingUmum"
          >
            <span class="btn-icon-upload">{{ isUploadingUmum ? '⏳' : '📤' }}</span>
            {{ isUploadingUmum ? 'Mengupload...' : 'Upload Sekarang' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 1B: UPLOAD KARTON BOX -->
    <div v-if="showUploadModalKarton" class="modal-overlay" @click.self="closeModalKarton">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">📦</span>
            <h3 class="modal-title">Upload Stok Awal (Karton Box)</h3>
          </div>
          <button @click="closeModalKarton" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <span class="info-icon">ℹ️</span>
            <div class="info-text">
              <p class="info-main">
                Gunakan ini untuk upload stok <strong>Karton Box</strong> dengan dimensi P, L, T.
              </p>
              <p class="info-sub">
                Template kolom: <code>kode, nama, kategori, satuan, p, l, t, stok_awal</code>.
              </p>
            </div>
          </div>

          <div class="template-download-box">
            <div class="template-header">
              <span class="template-icon">📄</span>
              <p class="template-title">Template Karton Box</p>
            </div>
            <a href="#" @click.prevent="downloadTemplateKarton" class="template-link">
              <span class="download-icon">⬇️</span>
              Download template (Karton Box)
            </a>
            <p class="template-note">
              <strong>Penting:</strong> Kolom <code>kategori</code> isi dengan
              <strong>Karton Box</strong>.
            </p>
          </div>

          <div class="form-group-upload">
            <label class="form-label-upload" for="file-upload-karton">
              <span class="label-icon">📁</span>
              Pilih File (Karton Box)
            </label>
            <input
              id="file-upload-karton"
              type="file"
              @change="handleFileChangeKarton"
              class="form-control-file"
              accept=".xlsx, .xls"
            />
            <small class="form-hint">Format: .xlsx, .xls (Maks. 5MB)</small>
            <div v-if="uploadFileKarton" class="file-info">
              <span class="file-icon">✅</span>
              File dipilih: <strong>{{ uploadFileKarton.name }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModalKarton" class="btn-secondary">
            <span class="btn-icon-sec">↩️</span>
            Batal
          </button>
          <button
            @click="handleUploadKarton"
            class="btn-primary-modal"
            :disabled="!uploadFileKarton || isUploadingKarton"
          >
            <span class="btn-icon-upload">{{ isUploadingKarton ? '⏳' : '📤' }}</span>
            {{ isUploadingKarton ? 'Mengupload...' : 'Upload Karton Box' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 1C: UPLOAD KOMPONEN -->
    <div v-if="showUploadModalKomponen" class="modal-overlay" @click.self="closeModalKomponen">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">🧩</span>
            <h3 class="modal-title">Upload Stok Awal (Komponen)</h3>
          </div>
          <button @click="closeModalKomponen" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <span class="info-icon">ℹ️</span>
            <div class="info-text">
              <p class="info-main">
                Gunakan ini untuk upload stok <strong>Komponen</strong> dengan dimensi P, L, T.
              </p>
              <p class="info-sub">
                Template kolom: <code>kode, nama, kategori, satuan, p, l, t, stok_awal</code>.
              </p>
            </div>
          </div>

          <div class="template-download-box">
            <div class="template-header">
              <span class="template-icon">📄</span>
              <p class="template-title">Template Komponen</p>
            </div>
            <a href="#" @click.prevent="downloadTemplateKomponen" class="template-link">
              <span class="download-icon">⬇️</span>
              Download template (Komponen)
            </a>
            <p class="template-note">
              <strong>Penting:</strong> Kolom <code>kategori</code> isi dengan
              <strong>Komponen</strong>.
            </p>
          </div>

          <div class="form-group-upload">
            <label class="form-label-upload" for="file-upload-komponen">
              <span class="label-icon">📁</span>
              Pilih File (Komponen)
            </label>
            <input
              id="file-upload-komponen"
              type="file"
              @change="handleFileChangeKomponen"
              class="form-control-file"
              accept=".xlsx, .xls"
            />
            <small class="form-hint">Format: .xlsx, .xls (Maks. 5MB)</small>
            <div v-if="uploadFileKomponen" class="file-info">
              <span class="file-icon">✅</span>
              File dipilih: <strong>{{ uploadFileKomponen.name }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModalKomponen" class="btn-secondary">
            <span class="btn-icon-sec">↩️</span>
            Batal
          </button>
          <button
            @click="handleUploadKomponen"
            class="btn-primary-modal"
            :disabled="!uploadFileKomponen || isUploadingKomponen"
          >
            <span class="btn-icon-upload">{{ isUploadingKomponen ? '⏳' : '📤' }}</span>
            {{ isUploadingKomponen ? 'Mengupload...' : 'Upload Komponen' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: UPLOAD KAYU RST -->
    <div v-if="showUploadModalKayuRst" class="modal-overlay" @click.self="closeModalKayuRst">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">🪵</span>
            <h3 class="modal-title">Upload Stok Awal (Kayu RST)</h3>
          </div>
          <button @click="closeModalKayuRst" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box info-box-kayu">
            <span class="info-icon">ℹ️</span>
            <div class="info-text">
              <p class="info-main">
                Gunakan ini untuk upload stok <strong>Kayu RST</strong> (plank, mal, dll).
              </p>
              <p class="info-sub">
                Sistem akan membuat / memperbarui master Kayu RST dan stok awal per
                <strong>gudang</strong>.
              </p>
            </div>
          </div>

          <div class="template-download-box">
            <div class="template-header">
              <span class="template-icon">📄</span>
              <p class="template-title">Template Kayu RST</p>
            </div>
            <a href="#" @click.prevent="downloadTemplateKayuRst" class="template-link">
              <span class="download-icon">⬇️</span>
              Download template (Kayu RST)
            </a>
            <p class="template-note">
              <strong>Penting:</strong> Template Kayu RST memiliki kolom:
              <code>
                kode_barang, nama_dasar, jenis, kualitas, bentuk, tebal_mm, lebar_mm, panjang_mm,
                stok_awal, gudang </code
              >. Kolom <code>gudang</code> diisi dengan <strong>kode gudang</strong> yang sudah ada.
            </p>
          </div>

          <div class="form-group-upload">
            <label class="form-label-upload" for="file-upload-kayu-rst">
              <span class="label-icon">📁</span>
              Pilih File (Kayu RST)
            </label>
            <input
              id="file-upload-kayu-rst"
              type="file"
              @change="handleFileChangeKayuRst"
              class="form-control-file"
              accept=".xlsx, .xls"
            />
            <small class="form-hint">Format: .xlsx, .xls (Maks. 5MB)</small>
            <div v-if="uploadFileKayuRst" class="file-info">
              <span class="file-icon">✅</span>
              File dipilih: <strong>{{ uploadFileKayuRst.name }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModalKayuRst" class="btn-secondary">
            <span class="btn-icon-sec">↩️</span>
            Batal
          </button>
          <button
            @click="handleUploadKayuRst"
            class="btn-primary-modal"
            :disabled="!uploadFileKayuRst || isUploadingKayuRst"
          >
            <span class="btn-icon-upload">{{ isUploadingKayuRst ? '⏳' : '📤' }}</span>
            {{ isUploadingKayuRst ? 'Mengupload...' : 'Upload Kayu RST' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 3: UPLOAD KAYU LOG -->
    <div v-if="showUploadModalKayu" class="modal-overlay" @click.self="closeModalKayu">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">🌲</span>
            <h3 class="modal-title">Upload Stok Awal (Kayu Log)</h3>
          </div>
          <button @click="closeModalKayu" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box info-box-kayu">
            <span class="info-icon">ℹ️</span>
            <div class="info-text">
              <p class="info-main">
                Gunakan ini HANYA untuk upload stok <strong>Kayu Log</strong> (qty dalam batang).
              </p>
              <p class="info-sub">
                Sistem akan membuat / memperbarui master Kayu Log lalu mengisi stok awal per
                <strong>gudang</strong>.
              </p>
            </div>
          </div>

          <div class="template-download-box">
            <div class="template-header">
              <span class="template-icon">📄</span>
              <p class="template-title">Template Kayu Log</p>
            </div>
            <a href="#" @click.prevent="downloadTemplateKayu" class="template-link">
              <span class="download-icon">⬇️</span>
              Download template (Kayu Log)
            </a>
            <p class="template-note">
              <strong>Penting:</strong> Template Kayu Log memiliki kolom:
              <code>
                kode_item, nama_item, kategori, satuan, gudang, qty_batang, diameter_cm, panjang_cm,
                jenis_kayu, kubikasi_m3 </code
              >. Kolom <code>gudang</code> diisi dengan <strong>kode gudang</strong> (mis: LOG).
            </p>
          </div>

          <div class="form-group-upload">
            <label class="form-label-upload" for="file-upload-kayu">
              <span class="label-icon">📁</span>
              Pilih File (Kayu Log)
            </label>
            <input
              id="file-upload-kayu"
              type="file"
              @change="handleFileChangeKayu"
              class="form-control-file"
              accept=".xlsx, .xls"
            />
            <small class="form-hint">Format: .xlsx, .xls (Maks. 5MB)</small>
            <div v-if="uploadFileKayu" class="file-info">
              <span class="file-icon">✅</span>
              File dipilih: <strong>{{ uploadFileKayu.name }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModalKayu" class="btn-secondary">
            <span class="btn-icon-sec">↩️</span>
            Batal
          </button>
          <button
            @click="handleUploadKayu"
            class="btn-primary-modal"
            :disabled="!uploadFileKayu || isUploadingKayu"
          >
            <span class="btn-icon-upload">{{ isUploadingKayu ? '⏳' : '📤' }}</span>
            {{ isUploadingKayu ? 'Mengupload...' : 'Upload Kayu Log' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 4: UPLOAD PRODUK JADI -->
    <div v-if="showUploadModalProdukJadi" class="modal-overlay" @click.self="closeModalProdukJadi">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">🏭</span>
            <h3 class="modal-title">Upload Stok Awal (Produk Jadi)</h3>
          </div>
          <button @click="closeModalProdukJadi" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box info-box-produk">
            <span class="info-icon">ℹ️</span>
            <div class="info-text">
              <p class="info-main">
                Gunakan ini untuk upload stok <strong>Produk Jadi</strong> dengan DNA (NW, GW, Wood,
                M³ Karton).
              </p>
              <p class="info-sub">
                Sistem akan otomatis update master DNA dan stok awal produk jadi.
              </p>
            </div>
          </div>

          <div class="template-download-box">
            <div class="template-header">
              <span class="template-icon">📄</span>
              <p class="template-title">Template Produk Jadi</p>
            </div>
            <a href="#" @click.prevent="downloadTemplateProdukJadi" class="template-link">
              <span class="download-icon">⬇️</span>
              Download template (Produk Jadi)
            </a>
            <p class="template-note">
              Template:
              <code>
                kode_barang, nama_produk, stok_awal, nw_per_box, gw_per_box, wood_consumed_per_pcs,
                m3_per_carton </code
              >.
            </p>
          </div>

          <div class="form-group-upload">
            <label class="form-label-upload" for="file-upload-produk-jadi">
              <span class="label-icon">📁</span>
              Pilih File (Produk Jadi)
            </label>
            <input
              id="file-upload-produk-jadi"
              type="file"
              @change="handleFileChangeProdukJadi"
              class="form-control-file"
              accept=".xlsx, .xls"
            />
            <small class="form-hint">Format: .xlsx, .xls (Maks. 5MB)</small>
            <div v-if="uploadFileProdukJadi" class="file-info">
              <span class="file-icon">✅</span>
              File dipilih: <strong>{{ uploadFileProdukJadi.name }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModalProdukJadi" class="btn-secondary">
            <span class="btn-icon-sec">↩️</span>
            Batal
          </button>
          <button
            @click="handleUploadProdukJadi"
            class="btn-primary-modal"
            :disabled="!uploadFileProdukJadi || isUploadingProdukJadi"
          >
            <span class="btn-icon-upload">{{ isUploadingProdukJadi ? '⏳' : '📤' }}</span>
            {{ isUploadingProdukJadi ? 'Mengupload...' : 'Upload Produk Jadi' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: UPLOAD JEBLOSAN -->
    <div v-if="showUploadModalJeblosan" class="modal-overlay" @click.self="closeModalJeblosan">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">🪓</span>
            <h3 class="modal-title">Upload Stok Awal (Jeblosan)</h3>
          </div>
          <button @click="closeModalJeblosan" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box info-box-kayu">
            <span class="info-icon">ℹ️</span>
            <div class="info-text">
              <p class="info-main">
                Gunakan ini untuk upload stok <strong>Jeblosan</strong> dengan dimensi T, L, P.
              </p>
              <p class="info-sub">
                Kolom: <code>kode_barang, nama_dasar, tebal_mm, lebar_mm, panjang_mm, m3_per_pcs, stok_awal, satuan, gudang</code>
              </p>
            </div>
          </div>

          <div class="template-download-box">
            <div class="template-header">
              <span class="template-icon">📄</span>
              <p class="template-title">Template Jeblosan</p>
            </div>
            <a href="#" @click.prevent="downloadTemplateJeblosan" class="template-link">
              <span class="download-icon">⬇️</span>
              Download template (Jeblosan)
            </a>
            <p class="template-note">
              <strong>Penting:</strong> Kolom <code>gudang</code> diisi dengan
              <strong>kode gudang</strong> yang sudah ada (mis: SAWMILL).
            </p>
          </div>

          <div class="form-group-upload">
            <label class="form-label-upload" for="file-upload-jeblosan">
              <span class="label-icon">📁</span>
              Pilih File (Jeblosan)
            </label>
            <input
              id="file-upload-jeblosan"
              type="file"
              @change="handleFileChangeJeblosan"
              class="form-control-file"
              accept=".xlsx, .xls"
            />
            <small class="form-hint">Format: .xlsx, .xls (Maks. 5MB)</small>
            <div v-if="uploadFileJeblosan" class="file-info">
              <span class="file-icon">✅</span>
              File dipilih: <strong>{{ uploadFileJeblosan.name }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModalJeblosan" class="btn-secondary">
            <span class="btn-icon-sec">↩️</span>
            Batal
          </button>
          <button
            @click="handleUploadJeblosan"
            class="btn-primary-modal"
            :disabled="!uploadFileJeblosan || isUploadingJeblosan"
          >
            <span class="btn-icon-upload">{{ isUploadingJeblosan ? '⏳' : '📤' }}</span>
            {{ isUploadingJeblosan ? 'Mengupload...' : 'Upload Jeblosan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 5: UPLOAD BOM PRODUK -->
    <div v-if="showUploadModalBom" class="modal-overlay" @click.self="closeModalBom">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">🧾</span>
            <h3 class="modal-title">Upload BOM Produk</h3>
          </div>
          <button @click="closeModalBom" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <span class="info-icon">ℹ️</span>
            <div class="info-text">
              <p class="info-main">
                Gunakan ini untuk upload <strong>BOM Produk</strong> (relasi Produk Utama &
                Komponen).
              </p>
              <p class="info-sub">
                Template kolom:
                <code>Kode Produk Utama, Kode Komponen, Jumlah per Produk</code>.
              </p>
            </div>
          </div>

          <div class="template-download-box">
            <div class="template-header">
              <span class="template-icon">📄</span>
              <p class="template-title">Template BOM Produk</p>
            </div>
            <a href="#" @click.prevent="downloadTemplateBom" class="template-link">
              <span class="download-icon">⬇️</span>
              Download template (BOM Produk)
            </a>
            <p class="template-note">
              <strong>Penting:</strong> Kode harus sama dengan kolom <code>code</code> di master
              Item.
            </p>
          </div>

          <div class="form-group-upload">
            <label class="form-label-upload" for="file-upload-bom">
              <span class="label-icon">📁</span>
              Pilih File (BOM Produk)
            </label>
            <input
              id="file-upload-bom"
              type="file"
              @change="handleFileChangeBom"
              class="form-control-file"
              accept=".xlsx, .xls"
            />
            <small class="form-hint">Format: .xlsx, .xls (Maks. 5MB)</small>
            <div v-if="uploadFileBom" class="file-info">
              <span class="file-icon">✅</span>
              File dipilih: <strong>{{ uploadFileBom.name }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModalBom" class="btn-secondary">
            <span class="btn-icon-sec">↩️</span>
            Batal
          </button>
          <button
            @click="handleUploadBom"
            class="btn-primary-modal"
            :disabled="!uploadFileBom || isUploadingBom"
          >
            <span class="btn-icon-upload">{{ isUploadingBom ? '⏳' : '📤' }}</span>
            {{ isUploadingBom ? 'Mengupload...' : 'Upload BOM Produk' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref({
  kategori: true,
  stok: false,
})

const daftarKategori  = ref([])
const selectedCategory = ref(null)
const daftarStok      = ref([])
const daftarWarehouse = ref([])
const selectedWarehouse = ref(null)

const isKomponen = computed(() => {
  if (!selectedCategory.value) return false
  const cat = daftarKategori.value.find((k) => k.id === selectedCategory.value)
  return cat?.name?.toLowerCase().includes('komponen') ?? false
})

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredStok = computed(() => {
  if (!searchQuery.value) {
    return daftarStok.value
  }

  const query = searchQuery.value.toLowerCase()
  return daftarStok.value.filter((item) => {
    const name = (item.name || '').toLowerCase()
    const code = (item.code || '').toLowerCase()
    return name.includes(query) || code.includes(query)
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredStok.value.length / itemsPerPage.value)
})

const paginatedStok = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredStok.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

const showUploadModalUmum = ref(false)
const uploadFileUmum = ref(null)
const isUploadingUmum = ref(false)

const showUploadModalKarton = ref(false)
const uploadFileKarton = ref(null)
const isUploadingKarton = ref(false)

const showUploadModalKomponen = ref(false)
const uploadFileKomponen = ref(null)
const isUploadingKomponen = ref(false)

const showUploadModalKayuRst = ref(false)
const uploadFileKayuRst = ref(null)
const isUploadingKayuRst = ref(false)

const showUploadModalKayu = ref(false)
const uploadFileKayu = ref(null)
const isUploadingKayu = ref(false)

const showUploadModalProdukJadi = ref(false)
const uploadFileProdukJadi = ref(null)
const isUploadingProdukJadi = ref(false)

const showUploadModalJeblosan = ref(false)
const uploadFileJeblosan      = ref(null)
const isUploadingJeblosan     = ref(false)

// NEW: BOM Produk
const showUploadModalBom = ref(false)
const uploadFileBom = ref(null)
const isUploadingBom = ref(false)

const fetchDaftarKategori = async () => {
  loading.value.kategori = true
  try {
    const response = await apiClient.get('/categories/all')
    daftarKategori.value = response.data.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    toast.error('Gagal memuat daftar kategori.')
  } finally {
    loading.value.kategori = false
  }
}

const fetchDaftarWarehouse = async () => {
  try {
    const res = await apiClient.get('/warehouses')
    const all = res.data.data || res.data || []
    // Tampilkan semua gudang yang relevan untuk komponen
    daftarWarehouse.value = all
  } catch { /* silent */ }
}

const onKategoriChange = () => {
  // Reset filter gudang saat ganti kategori
  selectedWarehouse.value = null
  daftarStok.value = []
}

const fetchStokBarang = async () => {
  if (!selectedCategory.value) {
    toast.error('Silakan pilih kategori terlebih dahulu.')
    return
  }

  loading.value.stok = true
  daftarStok.value = []
  searchQuery.value = ''
  currentPage.value = 1

  try {
    const params = {
      category_id: selectedCategory.value,
      include:     'unit,category,specifications',
      per_page:    9999,
    }
    if (isKomponen.value && selectedWarehouse.value) {
      params.warehouse_id = selectedWarehouse.value
    }
    const response = await apiClient.get('/materials', { params })

    let items = []
    if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
      items = response.data.data.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      items = response.data.data
    } else if (Array.isArray(response.data)) {
      items = response.data
    }

    daftarStok.value = items.map((item) => ({
      ...item,
      new_stock:   null,
      adj_natural: null,
      adj_warna:   null,
    }))
  } catch (error) {
    console.error('Error:', error)
    toast.error('Gagal memuat daftar stok.')
  } finally {
    loading.value.stok = false
  }
}

const handleAdjusment = async (item) => {
  try {
    // ── KOMPONEN: kirim adj_natural + adj_warna ─────────────────────────────
    if (isKomponen.value) {
      const adjNatural = item.adj_natural || 0
      const adjWarna   = item.adj_warna   || 0

      if (adjNatural === 0 && adjWarna === 0) {
        toast.error('Minimal satu penyesuaian (Natural atau Warna) harus diisi.')
        return
      }
      if ((item.qty_natural || 0) + adjNatural < 0 || (item.qty_warna || 0) + adjWarna < 0) {
        toast.error('Stok tidak boleh negatif.')
        return
      }

      const response = await apiClient.post('/stock-adjustments', {
        item_id:      item.id,
        adj_natural:  adjNatural,
        adj_warna:    adjWarna,
        warehouse_id: selectedWarehouse.value || null,
        notes: `Penyesuaian komponen: Natural ${adjNatural >= 0 ? '+' : ''}${adjNatural}, Warna ${adjWarna >= 0 ? '+' : ''}${adjWarna}`,
      })

      item.qty_natural = response.data.qty_natural
      item.qty_warna   = response.data.qty_warna
      item.stock       = response.data.new_stock
      item.adj_natural = null
      item.adj_warna   = null

      toast.success(`${item.name} berhasil disesuaikan.`)
      return
    }

    // ── NON-KOMPONEN: behaviour lama ────────────────────────────────────────
    const adjustmentAmount = item.new_stock

    if (adjustmentAmount == null || adjustmentAmount === 0) {
      toast.error('Jumlah penyesuaian tidak boleh nol.')
      return
    }

    const currentStock = parseFloat(item.stock) || 0
    const newStock     = currentStock + adjustmentAmount

    if (newStock < 0) {
      toast.error('Stok tidak boleh negatif.')
      return
    }

    const type     = adjustmentAmount > 0 ? 'Stok Masuk' : 'Stok Keluar'
    const quantity = Math.abs(adjustmentAmount)

    const response = await apiClient.post('/stock-adjustments', {
      item_id:      item.id,
      type:         type,
      quantity:     quantity,
      warehouse_id: selectedWarehouse.value || null,
      notes:        `Penyesuaian manual: ${adjustmentAmount > 0 ? '+' : ''}${adjustmentAmount}. Dari ${currentStock} menjadi ${newStock}.`,
    })

    item.stock     = response.data.new_stock
    item.new_stock = null

    toast.success(`${item.name} berhasil disesuaikan.`)
  } catch (error) {
    console.error('Error:', error)
    toast.error(error.response?.data?.message || 'Gagal menyimpan penyesuaian stok.')
  }
}

onMounted(() => {
  fetchDaftarKategori()
  fetchDaftarWarehouse()
})

// UPLOAD UMUM
const handleFileChangeUmum = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFileUmum.value = file
  }
}

const closeModalUmum = () => {
  showUploadModalUmum.value = false
  uploadFileUmum.value = null
}

const handleUploadUmum = async () => {
  if (!uploadFileUmum.value) {
    toast.error('Silakan pilih file Excel (Umum) terlebih dahulu.')
    return
  }

  isUploadingUmum.value = true
  const formData = new FormData()
  formData.append('file', uploadFileUmum.value)

  try {
    await apiClient.post('/materials/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    toast.success('Stok awal UMUM berhasil di-import! Memuat ulang data...')
    closeModalUmum()

    if (selectedCategory.value) {
      await fetchStokBarang()
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal meng-upload file umum.'
    toast.error(errorMsg)
    console.error('Error Upload Umum:', error.response?.data)
  } finally {
    isUploadingUmum.value = false
  }
}

const downloadTemplateUmum = async () => {
  try {
    const response = await apiClient.get('/stock-adjustments/template-umum', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let fileName = 'template_saldo_awal_umum.xlsx'

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1]
      }
    }

    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Template saldo awal umum (Excel) telah diunduh.')
  } catch (error) {
    console.error('Error downloading template:', error)
    toast.error('Gagal mendownload template umum.')
  }
}

// UPLOAD KARTON BOX
const handleFileChangeKarton = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFileKarton.value = file
  }
}

const closeModalKarton = () => {
  showUploadModalKarton.value = false
  uploadFileKarton.value = null
}

const handleUploadKarton = async () => {
  if (!uploadFileKarton.value) {
    toast.error('Silakan pilih file Excel (Karton Box) terlebih dahulu.')
    return
  }

  isUploadingKarton.value = true
  const formData = new FormData()
  formData.append('file', uploadFileKarton.value)

  try {
    await apiClient.post('/stock-adjustments/upload-karton-box', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    toast.success('Stok awal KARTON BOX berhasil di-import! Memuat ulang data...')

    closeModalKarton()

    if (selectedCategory.value) {
      await fetchStokBarang()
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal meng-upload file Karton Box.'
    toast.error(errorMsg)
    console.error('Error Upload Karton Box:', error.response?.data)
  } finally {
    isUploadingKarton.value = false
  }
}

const downloadTemplateKarton = async () => {
  try {
    const response = await apiClient.get('/stock-adjustments/template-karton-box', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let fileName = 'template_saldo_awal_karton_box.xlsx'

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1]
      }
    }

    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Template saldo awal Karton Box (Excel) telah diunduh.')
  } catch (error) {
    console.error('Error downloading template:', error)
    toast.error('Gagal mendownload template Karton Box.')
  }
}

// UPLOAD KOMPONEN
const handleFileChangeKomponen = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFileKomponen.value = file
  }
}

const closeModalKomponen = () => {
  showUploadModalKomponen.value = false
  uploadFileKomponen.value = null
}

const handleUploadKomponen = async () => {
  if (!uploadFileKomponen.value) {
    toast.error('Silakan pilih file Excel (Komponen) terlebih dahulu.')
    return
  }

  isUploadingKomponen.value = true
  const formData = new FormData()
  formData.append('file', uploadFileKomponen.value)

  try {
    const response = await apiClient.post('/stock-adjustments/upload-komponen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const skipped = response.data?.skipped || []
    if (skipped.length > 0) {
      console.warn('Baris yang dilewati saat import Komponen:', skipped)
      const preview = skipped
        .slice(0, 5)
        .map((s) => `Baris ${s.baris} (${s.kode || '-'}): ${s.alasan}`)
        .join('\n')
      const more = skipped.length > 5 ? `\n...dan ${skipped.length - 5} baris lainnya (lihat console)` : ''
      toast.warning(
        `${skipped.length} baris DILEWATI (tidak ter-import):\n${preview}${more}`,
        { timeout: 15000 }
      )
    } else {
      toast.success('Stok awal KOMPONEN berhasil di-import! Memuat ulang data...')
    }

    closeModalKomponen()

    if (selectedCategory.value) {
      await fetchStokBarang()
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal meng-upload file Komponen.'
    toast.error(errorMsg)
    console.error('Error Upload Komponen:', error.response?.data)
  } finally {
    isUploadingKomponen.value = false
  }
}

const downloadTemplateKomponen = async () => {
  try {
    const response = await apiClient.get('/stock-adjustments/template-komponen', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let fileName = 'template_saldo_awal_komponen.xlsx'

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1]
      }
    }

    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Template saldo awal Komponen (Excel) telah diunduh.')
  } catch (error) {
    console.error('Error downloading template:', error)
    toast.error('Gagal mendownload template Komponen.')
  }
}

// UPLOAD KAYU RST
const handleFileChangeKayuRst = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFileKayuRst.value = file
  }
}

const closeModalKayuRst = () => {
  showUploadModalKayuRst.value = false
  uploadFileKayuRst.value = null
}

const handleUploadKayuRst = async () => {
  if (!uploadFileKayuRst.value) {
    toast.error('Silakan pilih file Excel (Kayu RST) terlebih dahulu.')
    return
  }

  isUploadingKayuRst.value = true
  const formData = new FormData()
  formData.append('file', uploadFileKayuRst.value)

  try {
    await apiClient.post('/materials/import-kayu-rst', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    toast.success(
      'Stok awal KAYU RST berhasil di-import! Master data & stok per gudang diperbarui. Memuat ulang data...',
    )

    closeModalKayuRst()

    if (selectedCategory.value) {
      await fetchStokBarang()
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal meng-upload file Kayu RST.'
    toast.error(errorMsg)
    console.error('Error Upload Kayu RST:', error.response?.data)
  } finally {
    isUploadingKayuRst.value = false
  }
}

const downloadTemplateKayuRst = async () => {
  try {
    const response = await apiClient.get('/stock-adjustments/template-kayu-rst', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    let fileName = 'template_saldo_awal_kayu_rst.xlsx'
    const contentDisposition = response.headers['content-disposition']

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1]
      }
    }

    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Template saldo awal Kayu RST (Excel) telah diunduh.')
  } catch (error) {
    console.error('Error downloading template:', error)
    toast.error('Gagal mendownload template Kayu RST.')
  }
}

// UPLOAD KAYU LOG
const handleFileChangeKayu = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFileKayu.value = file
  }
}

const closeModalKayu = () => {
  showUploadModalKayu.value = false
  uploadFileKayu.value = null
}

const handleUploadKayu = async () => {
  if (!uploadFileKayu.value) {
    toast.error('Silakan pilih file Excel (Kayu Log) terlebih dahulu.')
    return
  }

  isUploadingKayu.value = true
  const formData = new FormData()
  formData.append('file', uploadFileKayu.value)

  try {
    await apiClient.post('/stock-adjustments/upload-saldo-awal-kayu', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    toast.success(
      'Stok awal KAYU LOG berhasil di-import! Master data & stok per gudang diperbarui. Memuat ulang data...',
    )

    closeModalKayu()

    if (selectedCategory.value) {
      await fetchStokBarang()
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal meng-upload file kayu log.'
    toast.error(errorMsg)
    console.error('Error Upload Kayu Log:', error.response?.data)
  } finally {
    isUploadingKayu.value = false
  }
}

const downloadTemplateKayu = async () => {
  try {
    const response = await apiClient.get('/stock-adjustments/template-kayu', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let fileName = 'template_saldo_awal_kayu_log.xlsx'

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1]
      }
    }

    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Template saldo awal Kayu Log (Excel) telah diunduh.')
  } catch (error) {
    console.error('Error downloading template:', error)
    toast.error('Gagal mendownload template Kayu Log.')
  }
}

// UPLOAD PRODUK JADI
const handleFileChangeProdukJadi = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFileProdukJadi.value = file
  }
}

const closeModalProdukJadi = () => {
  showUploadModalProdukJadi.value = false
  uploadFileProdukJadi.value = null
}

const handleUploadProdukJadi = async () => {
  if (!uploadFileProdukJadi.value) {
    toast.error('Silakan pilih file Excel (Produk Jadi) terlebih dahulu.')
    return
  }

  isUploadingProdukJadi.value = true
  const formData = new FormData()
  formData.append('file', uploadFileProdukJadi.value)

  try {
    await apiClient.post('/stock-adjustments/upload-produk-jadi', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    toast.success(
      'Stok awal PRODUK JADI berhasil di-import! DNA & stok diperbarui. Memuat ulang data...',
    )

    closeModalProdukJadi()

    if (selectedCategory.value) {
      await fetchStokBarang()
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal meng-upload file produk jadi.'
    toast.error(errorMsg)
    console.error('Error Upload Produk Jadi:', error.response?.data)
  } finally {
    isUploadingProdukJadi.value = false
  }
}

const downloadTemplateProdukJadi = async () => {
  try {
    const response = await apiClient.get('/stock-adjustments/template-produk-jadi', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let fileName = 'template_saldo_awal_produk_jadi.xlsx'

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1]
      }
    }

    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Template saldo awal produk jadi (Excel) telah diunduh.')
  } catch (error) {
    console.error('Error downloading template:', error)
    toast.error('Gagal mendownload template produk jadi.')
  }
}

// UPLOAD JEBLOSAN
const handleFileChangeJeblosan = (event) => {
  const file = event.target.files[0]
  if (file) uploadFileJeblosan.value = file
}

const closeModalJeblosan = () => {
  showUploadModalJeblosan.value = false
  uploadFileJeblosan.value = null
  isUploadingJeblosan.value = false
}

const handleUploadJeblosan = async () => {
  if (!uploadFileJeblosan.value) {
    toast.error('Silakan pilih file Excel (Jeblosan) terlebih dahulu.')
    return
  }

  isUploadingJeblosan.value = true
  const formData = new FormData()
  formData.append('file', uploadFileJeblosan.value)

  try {
    await apiClient.post('/stock-adjustments/upload-jeblosan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    toast.success('Stok awal Jeblosan berhasil di-import!')
    closeModalJeblosan()
    if (selectedCategory.value) await fetchStokBarang()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal meng-upload file Jeblosan.')
  } finally {
    isUploadingJeblosan.value = false
  }
}

const downloadTemplateJeblosan = async () => {
  try {
    const response = await apiClient.get('/stock-adjustments/template-jeblosan', {
      responseType: 'blob',
    })
    const url  = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', 'template_saldo_awal_jeblosan.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    toast.success('Template Jeblosan berhasil diunduh.')
  } catch {
    toast.error('Gagal mendownload template Jeblosan.')
  }
}

// NEW: UPLOAD BOM PRODUK
const handleFileChangeBom = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFileBom.value = file
  }
}

const closeModalBom = () => {
  showUploadModalBom.value = false
  uploadFileBom.value = null
  isUploadingBom.value = false
}

const handleUploadBom = async () => {
  if (!uploadFileBom.value) {
    toast.error('Silakan pilih file Excel (BOM Produk) terlebih dahulu.')
    return
  }

  isUploadingBom.value = true
  const formData = new FormData()
  formData.append('file', uploadFileBom.value)

  try {
    await apiClient.post('/stock-adjustments/upload-bom', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    toast.success('BOM Produk berhasil di-import.')
    closeModalBom()
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal meng-upload file BOM Produk.'
    toast.error(errorMsg)
    console.error('Error Upload BOM Produk:', error.response?.data)
  } finally {
    isUploadingBom.value = false
  }
}

const downloadTemplateBom = async () => {
  try {
    const response = await apiClient.get('/stock-adjustments/template-bom', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    let fileName = 'template_bom_produk.xlsx'
    const contentDisposition = response.headers['content-disposition']

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1]
      }
    }

    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Template BOM Produk (Excel) telah diunduh.')
  } catch (error) {
    console.error('Error downloading template BOM:', error)
    toast.error('Gagal mendownload template BOM Produk.')
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 32px 36px;
  border-radius: 24px;
  margin-bottom: 24px;
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.header-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.icon-badge-adj {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(20px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.adj-icon {
  font-size: 36px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.page-title {
  font-size: 30px;
  font-weight: 900;
  margin: 0 0 6px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
  font-weight: 500;
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  color: #10b981;
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-upload:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.btn-upload-secondary {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.95);
  color: #10b981;
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-upload-secondary:hover {
  background: white;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.btn-upload-produk {
  background: rgba(255, 255, 255, 0.95);
  color: #10b981;
}

.btn-upload-produk:hover {
  background: white;
}

.filter-card {
  margin-bottom: 24px;
}

.card-header-accent {
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669);
}

.content-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f0f0;
}

.card-body {
  padding: 28px;
}

.filter-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.filter-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.filter-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.filter-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.filter-input-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.select-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 16px;
  font-size: 20px;
  pointer-events: none;
  z-index: 1;
}

.form-control {
  width: 100%;
  padding: 14px 20px 14px 50px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s ease;
  appearance: none;
  background: #f9fafb;
  cursor: pointer;
}

.form-control:hover {
  border-color: #cbd5e1;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.select-arrow {
  position: absolute;
  right: 16px;
  font-size: 10px;
  color: #9ca3af;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.form-control:focus + .select-arrow {
  transform: rotate(180deg);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 14px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 32px;
}

.loading-animation {
  position: relative;
}

.spinner {
  width: 70px;
  height: 70px;
  border: 6px solid #f0f0f0;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 18px;
  color: #64748b;
  font-weight: 700;
}

.table-card {
  margin-top: 24px;
}

/* ========== SEARCH BAR (BARU) ========== */
.search-bar-container {
  padding: 24px 28px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-bottom: 3px solid #10b981;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 18px;
  font-size: 22px;
  color: #10b981;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 16px 56px 16px 56px;
  border: 2px solid #10b981;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  background: white;
  transition: all 0.3s ease;
}

.search-input:hover {
  border-color: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.search-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 500;
}

.clear-search {
  position: absolute;
  right: 18px;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  background: #f3f4f6;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-weight: bold;
}

.clear-search:hover {
  background: #e5e7eb;
  color: #1e293b;
  transform: rotate(90deg);
}

.search-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #166534;
  font-weight: 700;
}

.info-icon {
  font-size: 18px;
}

.info-text {
  font-weight: 600;
}

/* ========== TABLE ========== */
.card-body-table {
  padding: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
}

.data-table thead {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.data-table th {
  padding: 18px 20px;
  text-align: left;
  color: white;
  font-weight: 900;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.th-nama {
  width: 30%;
}
.th-kategori {
  width: 15%;
}
.th-satuan {
  width: 10%;
}
.th-dimensi {
  width: 7%;
  text-align: center;
}
.td-dimensi {
  text-align: center;
  vertical-align: middle;
}
.dimensi-value {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 2px 8px;
  min-width: 36px;
}
.th-stok-saat-ini {
  width: 12%;
  text-align: center;
}
.th-stok-baru {
  width: 18%;
}
.th-aksi {
  width: 15%;
  text-align: center;
}

.data-row {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.25s ease;
}

.data-row:hover {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  transform: scale(1.002);
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.1);
}

.data-table td {
  padding: 16px 20px;
  vertical-align: middle;
}

.qty-natural-val { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #065f46; font-weight: 800; display:inline-block; padding:4px 10px; border-radius:8px; }
.qty-warna-val   { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1e40af; font-weight: 800; display:inline-block; padding:4px 10px; border-radius:8px; }
.input-natural:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
.input-warna:focus   { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

.no-data {
  text-align: center;
  padding: 60px 20px !important;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.no-data-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.no-data p {
  font-size: 16px;
  color: #92400e;
  font-weight: 700;
  margin: 0;
}

.item-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  font-size: 20px;
}

.item-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.badge-category {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border-radius: 12px;
  font-weight: 800;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-unit {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-radius: 12px;
  font-weight: 700;
  font-size: 12px;
}

.td-stok-saat-ini {
  text-align: center;
}

.stock-value {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #1e293b;
  border-radius: 10px;
  font-weight: 900;
  font-size: 16px;
  min-width: 60px;
}

.input-wrapper {
  position: relative;
}

.form-control-table {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #f9fafb;
}

.form-control-table:hover {
  border-color: #cbd5e1;
  background: white;
}

.form-control-table:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.btn-action-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  white-space: nowrap;
}

.btn-action-save:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-action-save:disabled {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  cursor: not-allowed;
  opacity: 0.6;
}

.save-icon {
  font-size: 16px;
}

/* ========== PAGINATION (BARU) ========== */
.pagination-container {
  padding: 24px 28px;
  background: #f9fafb;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 15px;
  font-weight: 700;
  color: #475569;
}

.pagination-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #475569;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #10b981;
  color: #10b981;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-number {
  min-width: 44px;
  text-align: center;
}

.pagination-number.active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transform: scale(1.05);
}

.pagination-number.active:hover {
  transform: scale(1.05);
}

/* ========== MODALS ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 650px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px 32px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.modal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  line-height: 1.6;
}

.info-box {
  display: flex;
  gap: 16px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  padding: 20px;
  border-radius: 16px;
  border-left: 4px solid #1e40af;
  margin-bottom: 24px;
}

.info-box-kayu {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-left-color: #92400e;
}

.info-box-produk {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-left-color: #4338ca;
}

.info-icon {
  font-size: 28px;
}

.info-text {
  flex: 1;
}

.info-main {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.info-sub {
  font-size: 14px;
  color: #334155;
  margin: 0;
}

.template-download-box {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 2px solid #10b981;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 28px;
}

.template-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.template-icon {
  font-size: 28px;
}

.template-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.template-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #10b981;
  font-weight: 800;
  font-size: 15px;
  text-decoration: none;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  margin-bottom: 16px;
}

.template-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.download-icon {
  font-size: 18px;
}

.template-note {
  font-size: 13px;
  color: #166534;
  margin: 0;
  line-height: 1.5;
}

.form-group-upload {
  margin-top: 0;
}

.form-label-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: 800;
  font-size: 16px;
  color: #1e293b;
}

.label-icon {
  font-size: 20px;
}

.form-control-file {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-control-file:hover {
  border-color: #10b981;
}

.file-info {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 12px;
  font-size: 14px;
  color: #166534;
  font-weight: 600;
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
  display: block;
  font-weight: 500;
}

.file-icon {
  font-size: 20px;
}

.modal-footer {
  padding: 24px 32px;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  border-top: 2px solid #f3f4f6;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  color: #374151;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 15px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.btn-icon-sec {
  font-size: 18px;
}

.btn-primary-modal {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-primary-modal:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-primary-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon-upload {
  font-size: 18px;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-buttons {
    width: 100%;
    flex-direction: column;
  }

  .btn-upload,
  .btn-upload-secondary,
  .btn-upload-produk {
    width: 100%;
    justify-content: center;
  }

  .filter-input-group {
    flex-direction: column;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .pagination-container {
    flex-direction: column;
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 24px 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary-modal {
    width: 100%;
    justify-content: center;
  }
}
</style>
