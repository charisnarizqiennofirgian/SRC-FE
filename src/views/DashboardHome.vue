<template>
  <DashboardLayout>
    <div class="dashboard-home">
      <!-- Welcome Section -->
      <div class="welcome-section-compact">
        <div class="welcome-content">
          <h1 class="welcome-title">Selamat Datang, {{ userName }} 👋</h1>
          <p class="welcome-subtitle">Berikut adalah progress produksi terkini</p>
        </div>
      </div>

      <!-- Widget: Top Priority Production -->
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-icon">🏭</span>
            <h2>Top Priority Production</h2>
          </div>
          <div class="monitor-filter-bar">
            <div class="monitor-month-filter">
              <span class="filter-label">📅 Tgl. Kirim:</span>
              <select v-model="monitorMonthFilter" class="monitor-month-select">
                <option value="">Semua Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
              <select v-model="monitorYearFilter" class="monitor-year-select">
                <option v-for="y in monitorYearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
            <router-link to="/produksi/monitoring" class="view-all-btn">
              Lihat Semua →
            </router-link>
          </div>
        </div>

        <!-- Legend -->
        <div class="legend-bar">
          <span class="legend-title">Keterangan:</span>
          <span class="legend-item">
            <span class="status-badge badge-waiting">🔴</span> Waiting
          </span>
          <span class="legend-item">
            <span class="status-badge badge-progress">🟡</span> In Progress
          </span>
          <span class="legend-item"> <span class="status-badge badge-done">✅</span> Done </span>
          <span class="legend-item">
            <span class="status-badge" style="background:#f3f4f6">⏭️</span> Skip
          </span>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredMonitoringData.length === 0" class="empty-state">
          <span class="empty-icon">📦</span>
          <p>{{ monitorMonthFilter ? 'Tidak ada SO dengan Tgl. Kirim pada bulan tersebut.' : 'Tidak ada Sales Order aktif saat ini.' }}</p>
        </div>

        <!-- Table -->
        <div v-else class="table-wrapper table-wrapper-frozen">
          <table class="monitoring-table">
            <thead>
              <tr>
                <th class="col-so" rowspan="2">No. SO & Buyer</th>
                <th class="col-item" rowspan="2">Item</th>
                <th class="col-num col-target" rowspan="2">Target</th>
                <th class="col-tgl-kirim" rowspan="2">Tgl. Kirim</th>
                <!-- Zona Hulu -->
                <th colspan="5" class="zone-header zone-hulu">
                  <span class="zone-icon">🌲</span> Persiapan Bahan
                </th>
                <!-- Zona Hilir -->
                <th colspan="8" class="zone-header zone-hilir">
                  <span class="zone-icon">⚙️</span> Produksi
                </th>
                <th class="col-num" rowspan="2" style="background:#fee2e2;color:#dc2626;">⚠️ Reject</th>
                <th class="col-num" rowspan="2">Sisa</th>
              </tr>
              <tr>
                <!-- Hulu -->
                <th class="col-status stage-sanwil">Sawmill</th>
                <th class="col-status stage-kd">KD</th>
                <th class="col-status stage-pembahanan">Pembahanan</th>
                <th class="col-num stage-moulding">Moulding</th>
                <th class="col-num stage-mesin">Mesin</th>
                <!-- Hilir -->
                <th class="col-num stage-ruskomp">Rustik Komp</th>
                <th class="col-num stage-assembling">Assembling</th>
                <th class="col-num stage-sanding">Sanding</th>
                <th class="col-num stage-rustik">Rustik</th>
                <th class="col-num stage-finishing">Finishing</th>
                <th class="col-num stage-anyam">Anyam</th>
                <th class="col-num stage-qcfinal">QC Final</th>
                <th class="col-num stage-packing">Packing</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(so, soIndex) in filteredMonitoringData" :key="so.so_id">
                <tr
                  v-for="(item, itemIndex) in so.items"
                  :key="item.detail_id ?? `${so.so_id}-${item.item_id}-${itemIndex}`"
                  :class="{
                    'row-done': item.is_done,
                    'row-even': soIndex % 2 === 0,
                    'row-first-item': itemIndex === 0,
                    'row-last-item': itemIndex === so.items.length - 1,
                  }"
                >
                  <!-- SO Info — hanya tampil di baris pertama (rowspan) -->
                  <td
                    v-if="itemIndex === 0"
                    :rowspan="so.items.length"
                    class="col-so td-so-group"
                  >
                    <div class="so-wrapper">
                      <span class="so-number">{{ so.so_number }}</span>
                      <span class="so-buyer">{{ so.buyer_name }}</span>
                      <span v-if="so.customer_po_number" class="so-po-buyer">
                        PO: {{ so.customer_po_number }}
                      </span>
                      <span class="so-date">{{ so.so_date }}</span>
                      <span v-if="so.is_done" class="so-done-badge">✓ DONE</span>
                    </div>
                  </td>

                  <!-- Item -->
                  <td class="col-item">
                    <div class="item-wrapper">
                      <div class="item-name">{{ item.item_name }}</div>
                      <div class="item-code">{{ item.item_code }}</div>
                    </div>
                  </td>

                  <!-- Target -->
                  <td class="col-num col-target">
                    <span class="target-value">{{ formatNumber(item.target) }}</span>
                  </td>

                  <!-- Tgl Kirim -->
                  <td class="col-tgl-kirim">
                    <span class="tgl-kirim-value">{{ item.delivery_date || '-' }}</span>
                  </td>

                  <!-- Zona Hulu -->
                  <td class="col-status stage-sanwil">
                    <span :class="['status-indicator', getStatusClass(item.status_sanwil)]">
                      {{ getStatusIcon(item.status_sanwil) }}
                    </span>
                  </td>
                  <td class="col-status stage-kd">
                    <span :class="['status-indicator', getStatusClass(item.status_kd)]">
                      {{ getStatusIcon(item.status_kd) }}
                    </span>
                  </td>
                  <td class="col-status stage-pembahanan">
                    <span :class="['status-indicator', getStatusClass(item.status_pembahanan)]">
                      {{ getStatusIcon(item.status_pembahanan) }}
                    </span>
                  </td>
                  <td class="col-num stage-moulding">
                    <HoverPopover :enabled="!!(item.moulding_bom_checklist?.length || item.moulding_components?.length)">
                      <span :class="['qty-value', item.qty_moulding > 0 ? 'has-value' : 'no-value']">
                        {{ formatNumber(item.qty_moulding) }} <span class="stage-pct">({{ stagePercent(item.qty_moulding, item.target) }}%)</span>
                      </span>
                      <template #content>
                        <template v-if="item.moulding_bom_checklist?.length">
                          <div class="moulding-tooltip-title">Checklist Komponen (BOM)</div>
                          <div v-for="c in item.moulding_bom_checklist" :key="c.item_id" class="moulding-tooltip-row">
                            <span class="moulding-tooltip-name">
                              <span :class="c.done ? 'bom-check-ok' : 'bom-check-missing'">{{ c.done ? '✓' : '✗' }}</span>
                              {{ c.item_name }}
                            </span>
                            <span class="moulding-tooltip-qty">{{ c.done ? formatNumber(c.qty_actual) : 'belum ada' }}</span>
                          </div>
                        </template>
                        <template v-else-if="item.moulding_components?.length">
                          <div class="moulding-tooltip-title">Komponen Moulding</div>
                          <div v-for="c in item.moulding_components" :key="c.item_id" class="moulding-tooltip-row">
                            <span class="moulding-tooltip-name">{{ c.item_name }}</span>
                            <span class="moulding-tooltip-qty">{{ formatNumber(c.qty) }}</span>
                          </div>
                        </template>
                      </template>
                    </HoverPopover>
                  </td>
                  <td class="col-num stage-mesin">
                    <HoverPopover :enabled="!!(item.mesin_bom_checklist?.length || item.mesin_components?.length)">
                      <span :class="['qty-value', item.qty_mesin > 0 ? 'has-value' : 'no-value']">
                        {{ formatNumber(item.qty_mesin) }} <span class="stage-pct">({{ stagePercent(item.qty_mesin, item.target) }}%)</span>
                      </span>
                      <template #content>
                        <template v-if="item.mesin_bom_checklist?.length">
                          <div class="moulding-tooltip-title">Checklist Komponen (BOM)</div>
                          <div v-for="c in item.mesin_bom_checklist" :key="c.item_id" class="moulding-tooltip-row">
                            <span class="moulding-tooltip-name">
                              <span :class="c.done ? 'bom-check-ok' : 'bom-check-missing'">{{ c.done ? '✓' : '✗' }}</span>
                              {{ c.item_name }}
                            </span>
                            <span class="moulding-tooltip-qty">{{ c.done ? formatNumber(c.qty_actual) : 'belum ada' }}</span>
                          </div>
                        </template>
                        <template v-else-if="item.mesin_components?.length">
                          <div class="moulding-tooltip-title">Komponen Mesin</div>
                          <div v-for="c in item.mesin_components" :key="c.item_id" class="moulding-tooltip-row">
                            <span class="moulding-tooltip-name">{{ c.item_name }}</span>
                            <span class="moulding-tooltip-qty">{{ formatNumber(c.qty) }}</span>
                          </div>
                        </template>
                      </template>
                    </HoverPopover>
                  </td>

                  <!-- Zona Hilir -->
                  <td class="col-num stage-ruskomp">
                    <span :class="['qty-value', item.qty_ruskomp > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_ruskomp) }} <span class="stage-pct">({{ stagePercent(item.qty_ruskomp, item.target) }}%)</span>
                    </span>
                  </td>
                  <td class="col-num stage-assembling">
                    <span :class="['qty-value', item.qty_assembling > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_assembling) }} <span class="stage-pct">({{ stagePercent(item.qty_assembling, item.target) }}%)</span>
                    </span>
                  </td>
                  <td class="col-num stage-sanding">
                    <span :class="['qty-value', item.qty_sanding > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_sanding) }} <span class="stage-pct">({{ stagePercent(item.qty_sanding, item.target) }}%)</span>
                    </span>
                  </td>
                  <td class="col-num stage-rustik">
                    <span :class="['qty-value', item.qty_rustik > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_rustik) }} <span class="stage-pct">({{ stagePercent(item.qty_rustik, item.target) }}%)</span>
                    </span>
                  </td>
                  <td class="col-num stage-finishing">
                    <span :class="['qty-value', item.qty_finishing > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_finishing) }} <span class="stage-pct">({{ stagePercent(item.qty_finishing, item.target) }}%)</span>
                    </span>
                  </td>
                  <td class="col-num stage-anyam">
                    <span :class="['qty-value', item.qty_anyam > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_anyam) }} <span class="stage-pct">({{ stagePercent(item.qty_anyam, item.target) }}%)</span>
                    </span>
                  </td>
                  <td class="col-num stage-qcfinal">
                    <span :class="['qty-value', item.qty_qc_final > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_qc_final) }} <span class="stage-pct">({{ stagePercent(item.qty_qc_final, item.target) }}%)</span>
                    </span>
                  </td>
                  <td class="col-num stage-packing">
                    <span :class="['qty-value', item.qty_packing > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_packing) }} <span class="stage-pct">({{ stagePercent(item.qty_packing, item.target) }}%)</span>
                    </span>
                  </td>

                  <!-- Reject -->
                  <td class="col-num">
                    <span
                      v-if="item.has_reject"
                      class="reject-badge-table"
                      @click="goToDetail(so)"
                      title="Klik untuk lihat detail reject"
                    >
                      ⚠️ {{ formatNumber(item.qty_reject) }} pcs
                    </span>
                    <span v-else class="no-reject">-</span>
                  </td>

                  <!-- Sisa -->
                  <td class="col-num">
                    <div class="sisa-cell">
                      <span v-if="item.is_done" class="completion-badge">
                        <span class="badge-icon">✓</span> DONE
                      </span>
                      <span v-else class="sisa-value">{{ formatNumber(item.sisa) }}</span>
                      <button
                        v-if="itemIndex === 0"
                        class="detail-btn"
                        @click="goToDetail(so)"
                        title="Lihat Detail"
                      >
                        🔍
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Separator antar SO -->
                <tr class="so-separator">
                  <td colspan="19"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Footer Summary -->
        <div v-if="filteredMonitoringData.length > 0" class="widget-footer">
          <div class="summary-left">
            <span class="summary-icon">📊</span>
            <span class="summary-text">
              Menampilkan <strong>{{ filteredMonitoringData.length }}</strong> SO
              <template v-if="monitorMonthFilter">
                · bulan {{ monthName(monitorMonthFilter) }} {{ monitorYearFilter }}
              </template>
            </span>
          </div>
          <div class="summary-stats">
            <span class="stat-item stat-done">
              <span class="stat-dot"></span>
              {{ doneCount }} selesai
            </span>
            <span class="stat-divider">•</span>
            <span class="stat-item stat-pending">
              <span class="stat-dot"></span>
              {{ pendingCount }} pending
            </span>
          </div>
        </div>
      </div>

    <!-- Widget: Produksi Sampel -->
    <div class="widget-card sampel-widget">
      <div class="widget-header">
        <div class="widget-title">
          <span class="widget-icon">🧪</span>
          <h2>Monitoring Produksi Sampel</h2>
        </div>
        <div class="monitor-filter-bar">
          <div class="monitor-month-filter">
            <span class="filter-label">📅 Tgl. Kirim:</span>
            <select v-model="sampelMonthFilter" class="monitor-month-select sampel-select">
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
            <select v-model="sampelYearFilter" class="monitor-year-select sampel-select">
              <option v-for="y in monitorYearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="legend-bar sampel-legend">
        <span class="legend-title">Keterangan:</span>
        <span class="legend-item"><span class="status-badge badge-waiting">🔴</span> Waiting</span>
        <span class="legend-item"><span class="status-badge badge-progress">🟡</span> In Progress</span>
        <span class="legend-item"><span class="status-badge badge-done">✅</span> Done</span>
        <span class="legend-item"><span class="status-badge" style="background:#f3f4f6">⏭️</span> Skip</span>
      </div>

      <div v-if="isLoadingSampel" class="loading-state">
        <div class="spinner sampel-spinner"></div>
        <p>Memuat data produksi sampel...</p>
      </div>

      <div v-else-if="filteredSampelData.length === 0" class="empty-state">
        <span class="empty-icon">🧪</span>
        <p>{{ sampelMonthFilter ? 'Tidak ada produksi sampel pada bulan tersebut.' : 'Belum ada produksi sampel aktif.' }}</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="sampel-table">
          <thead>
            <tr>
              <th class="col-so" rowspan="2">No. SO & Buyer</th>
              <th class="col-item" rowspan="2">Item</th>
              <th class="col-num" rowspan="2">Target</th>
              <th class="col-tgl-kirim" rowspan="2">Tgl. Kirim</th>
              <th colspan="3" class="zone-header zone-hulu"><span class="zone-icon">🌲</span> Persiapan Bahan</th>
              <th colspan="4" class="zone-header sampel-zone-hilir"><span class="zone-icon">⚙️</span> Produksi Sampel</th>
              <th class="col-num" rowspan="2">Sisa</th>
            </tr>
            <tr>
              <th class="col-status stage-sanwil">Sawmill</th>
              <th class="col-status stage-kd">KD</th>
              <th class="col-status stage-pembahanan">Pembahanan</th>
              <th class="col-num stage-moulding">Moulding</th>
              <th class="col-num sampel-stage-proto">Prototype</th>
              <th class="col-num sampel-stage-sanding">Sanding</th>
              <th class="col-num sampel-stage-packing">Packing</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(po, poIndex) in filteredSampelData" :key="po.po_id">
              <tr
                v-for="(item, itemIndex) in po.items"
                :key="item.detail_id ?? `${po.po_id}-${item.item_id}-${itemIndex}`"
                :class="{ 'row-done': item.is_done, 'row-even': poIndex % 2 === 0 }"
              >
                <td v-if="itemIndex === 0" :rowspan="po.items.length" class="col-so td-so-group">
                  <div class="so-wrapper">
                    <span class="so-number">{{ po.so_number }}</span>
                    <span class="so-buyer">{{ po.buyer_name }}</span>
                    <span class="sampel-po-badge">{{ po.po_number }}</span>
                    <span class="so-date">{{ po.so_date }}</span>
                    <span v-if="po.is_done" class="so-done-badge">✓ DONE</span>
                  </div>
                </td>
                <td class="col-item">
                  <div class="item-wrapper">
                    <div class="item-name">{{ item.item_name }}</div>
                    <div class="item-code">{{ item.item_code }}</div>
                  </div>
                </td>
                <td class="col-num">
                  <span class="target-value">{{ formatNumber(item.target) }}</span>
                </td>
                <td class="col-tgl-kirim">
                  <span class="tgl-kirim-value">{{ item.delivery_date || '-' }}</span>
                </td>
                <!-- Hulu -->
                <td class="col-status stage-sanwil">
                  <span :class="['status-indicator', getStatusClass(item.status_sanwil)]">
                    {{ getStatusIcon(item.status_sanwil) }}
                  </span>
                </td>
                <td class="col-status stage-kd">
                  <span :class="['status-indicator', getStatusClass(item.status_kd)]">
                    {{ getStatusIcon(item.status_kd) }}
                  </span>
                </td>
                <td class="col-status stage-pembahanan">
                  <span :class="['status-indicator', getStatusClass(item.status_pembahanan)]">
                    {{ getStatusIcon(item.status_pembahanan) }}
                  </span>
                </td>
                <!-- Produksi Sampel -->
                <td class="col-num stage-moulding">
                  <HoverPopover :enabled="!!(item.moulding_bom_checklist?.length || item.moulding_components?.length)">
                    <span :class="['qty-value', item.qty_moulding > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_moulding) }} <span class="stage-pct">({{ stagePercent(item.qty_moulding, item.target) }}%)</span>
                    </span>
                    <template #content>
                      <template v-if="item.moulding_bom_checklist?.length">
                        <div class="moulding-tooltip-title">Checklist Komponen (BOM)</div>
                        <div v-for="c in item.moulding_bom_checklist" :key="c.item_id" class="moulding-tooltip-row">
                          <span class="moulding-tooltip-name">
                            <span :class="c.done ? 'bom-check-ok' : 'bom-check-missing'">{{ c.done ? '✓' : '✗' }}</span>
                            {{ c.item_name }}
                          </span>
                          <span class="moulding-tooltip-qty">{{ c.done ? formatNumber(c.qty_actual) : 'belum ada' }}</span>
                        </div>
                      </template>
                      <template v-else-if="item.moulding_components?.length">
                        <div class="moulding-tooltip-title">Komponen Moulding</div>
                        <div v-for="c in item.moulding_components" :key="c.item_id" class="moulding-tooltip-row">
                          <span class="moulding-tooltip-name">{{ c.item_name }}</span>
                          <span class="moulding-tooltip-qty">{{ formatNumber(c.qty) }}</span>
                        </div>
                      </template>
                    </template>
                  </HoverPopover>
                </td>
                <td class="col-num sampel-stage-proto">
                  <span :class="['qty-value', item.qty_prototype > 0 ? 'has-value' : 'no-value']">
                    {{ formatNumber(item.qty_prototype) }} <span class="stage-pct">({{ stagePercent(item.qty_prototype, item.target) }}%)</span>
                  </span>
                </td>
                <td class="col-num sampel-stage-sanding">
                  <span :class="['qty-value', item.qty_sanding > 0 ? 'has-value' : 'no-value']">
                    {{ formatNumber(item.qty_sanding) }} <span class="stage-pct">({{ stagePercent(item.qty_sanding, item.target) }}%)</span>
                  </span>
                </td>
                <td class="col-num sampel-stage-packing">
                  <span :class="['qty-value', item.qty_packing > 0 ? 'has-value' : 'no-value']">
                    {{ formatNumber(item.qty_packing) }} <span class="stage-pct">({{ stagePercent(item.qty_packing, item.target) }}%)</span>
                  </span>
                </td>
                <!-- Sisa -->
                <td class="col-num">
                  <span v-if="item.is_done" class="completion-badge">
                    <span class="badge-icon">✓</span> DONE
                  </span>
                  <span v-else class="sisa-value">{{ formatNumber(item.sisa) }}</span>
                </td>
              </tr>
              <tr class="so-separator"><td colspan="12"></td></tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="filteredSampelData.length > 0" class="widget-footer">
        <div class="summary-left">
          <span class="summary-icon">🧪</span>
          <span class="summary-text">
            <strong>{{ filteredSampelData.length }}</strong> PO Sampel
            <template v-if="sampelMonthFilter">
              · bulan {{ monthName(sampelMonthFilter) }} {{ sampelYearFilter }}
            </template>
          </span>
        </div>
        <div class="summary-stats">
          <span class="stat-item stat-done">
            <span class="stat-dot"></span>
            {{ sampelDoneCount }} selesai
          </span>
          <span class="stat-divider">•</span>
          <span class="stat-item stat-pending">
            <span class="stat-dot"></span>
            {{ sampelPendingCount }} berjalan
          </span>
        </div>
      </div>
    </div>

    <!-- Widget: Sales Order Cetak (PPIC) -->
    <div class="widget-card so-print-widget">
      <div class="widget-header">
        <div class="widget-title">
          <span class="widget-icon">🖨️</span>
          <h2>Daftar Sales Order — Cetak</h2>
        </div>
        <div class="so-search-box">
          <input
            v-model="soSearchQuery"
            type="text"
            placeholder="Cari No. SO / Customer..."
            class="so-search-input"
          />
        </div>
      </div>

      <div v-if="isLoadingSO" class="loading-state">
        <div class="spinner so-spinner"></div>
        <p>Memuat daftar Sales Order...</p>
      </div>

      <div v-else-if="filteredSO.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>Tidak ada Sales Order ditemukan.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="so-table">
          <thead>
            <tr>
              <th class="so-th-no">No</th>
              <th class="so-th-number">No. Pesanan</th>
              <th class="so-th-customer">Customer</th>
              <th class="so-th-date">Tgl. Pesanan</th>
              <th class="so-th-status">Status</th>
              <th class="so-th-actions">Cetak</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(so, index) in paginatedSO" :key="so.id" class="so-row">
              <td class="so-td-no">{{ soPagination.from + index }}</td>
              <td>
                <span class="so-number-badge">{{ so.so_number }}</span>
              </td>
              <td class="so-td-customer">
                <span class="so-customer-icon">👤</span>
                {{ so.buyer?.name || 'N/A' }}
              </td>
              <td class="so-td-date">{{ formatSODate(so.so_date) }}</td>
              <td>
                <span :class="getSoStatusClass(so.status)">{{ so.status }}</span>
              </td>
              <td class="so-td-actions">
                <div class="so-print-btns">
                  <button
                    @click="cetakTglKirim(so.id)"
                    class="so-btn-print"
                    title="Cetak Tgl. Kirim"
                  >
                    📄 Tgl. Kirim
                  </button>
                  <button
                    @click="cetakPPIC(so.id)"
                    class="so-btn-ppic"
                    title="Cetak Disesuaikan PPIC"
                  >
                    📋 PPIC
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="soPagination.last_page > 1" class="so-pagination">
        <span class="so-pagination-info">
          {{ soPagination.from }}–{{ soPagination.to }} dari {{ soPagination.total }} SO
        </span>
        <div class="so-pagination-btns">
          <button
            class="so-page-btn"
            :disabled="soPagination.current_page === 1"
            @click="soPage--"
          >← Prev</button>
          <button
            v-for="p in soPaginationPages"
            :key="p"
            :class="['so-page-btn', { active: p === soPagination.current_page, dots: p === '...' }]"
            :disabled="p === '...'"
            @click="p !== '...' && (soPage = p)"
          >{{ p }}</button>
          <button
            class="so-page-btn"
            :disabled="soPagination.current_page === soPagination.last_page"
            @click="soPage++"
          >Next →</button>
        </div>
      </div>
    </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../components/DashboardLayout.vue'
import HoverPopover from '../components/HoverPopover.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/api/axios'

const router = useRouter()
const userName = ref('User')
const monitoringData = ref([])
const isLoading = ref(false)
const totalSO = ref(0)

// Monitoring filter state
const currentYear = new Date().getFullYear()
const monitorMonthFilter = ref('')
const monitorYearFilter  = ref(String(currentYear))
const monitorYearOptions = [currentYear - 1, currentYear, currentYear + 1]

// Backend returns delivery_date as "dd/mm/yyyy" — parse accordingly
const parseDeliveryDate = (str) => {
  if (!str || str === '-') return null
  const parts = str.split('/')
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
  }
  return new Date(str)
}

const filteredMonitoringData = computed(() => {
  if (!monitorMonthFilter.value) return monitoringData.value
  const month = parseInt(monitorMonthFilter.value)
  const year  = monitorYearFilter.value ? parseInt(monitorYearFilter.value) : null
  return monitoringData.value.filter((so) => {
    return so.items?.some((item) => {
      const d = parseDeliveryDate(item.delivery_date)
      if (!d || isNaN(d)) return false
      const matchMonth = d.getMonth() + 1 === month
      const matchYear  = year ? d.getFullYear() === year : true
      return matchMonth && matchYear
    })
  })
})

const MONTH_NAMES = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const monthName = (m) => MONTH_NAMES[parseInt(m)] || ''

// Produksi Sampel widget state
const sampelData = ref([])
const isLoadingSampel = ref(false)
const sampelMonthFilter = ref('')
const sampelYearFilter = ref(String(currentYear))

const filteredSampelData = computed(() => {
  if (!sampelMonthFilter.value) return sampelData.value
  const month = parseInt(sampelMonthFilter.value)
  const year = sampelYearFilter.value ? parseInt(sampelYearFilter.value) : null
  return sampelData.value.filter((po) => {
    return po.items?.some((item) => {
      const d = parseDeliveryDate(item.delivery_date)
      if (!d || isNaN(d)) return false
      const matchMonth = d.getMonth() + 1 === month
      const matchYear = year ? d.getFullYear() === year : true
      return matchMonth && matchYear
    })
  })
})

const sampelDoneCount = computed(() => sampelData.value.filter((po) => po.is_done).length)
const sampelPendingCount = computed(() => sampelData.value.filter((po) => !po.is_done).length)

const fetchSampelData = async () => {
  isLoadingSampel.value = true
  try {
    const response = await axios.get('/production-monitoring/sample')
    if (response.data.success) {
      sampelData.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching sample production data:', error)
  } finally {
    isLoadingSampel.value = false
  }
}

// Sales Order widget state
const allSalesOrders = ref([])
const isLoadingSO = ref(false)
const soSearchQuery = ref('')
const soPage = ref(1)
const soPerPage = 10

const filteredSO = computed(() => {
  if (!soSearchQuery.value) return allSalesOrders.value
  const q = soSearchQuery.value.toLowerCase()
  return allSalesOrders.value.filter(
    (so) =>
      so.so_number?.toLowerCase().includes(q) ||
      so.buyer?.name?.toLowerCase().includes(q),
  )
})

const soPagination = computed(() => {
  const total = filteredSO.value.length
  const lastPage = Math.max(1, Math.ceil(total / soPerPage))
  const current = Math.min(soPage.value, lastPage)
  const from = total > 0 ? (current - 1) * soPerPage + 1 : 0
  const to = Math.min(current * soPerPage, total)
  return { current_page: current, last_page: lastPage, total, from, to }
})

const paginatedSO = computed(() => {
  const start = (soPagination.value.current_page - 1) * soPerPage
  return filteredSO.value.slice(start, start + soPerPage)
})

const soPaginationPages = computed(() => {
  const pages = []
  const last = soPagination.value.last_page
  const cur = soPagination.value.current_page
  if (last <= 7) {
    for (let i = 1; i <= last; i++) pages.push(i)
  } else if (cur <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push('...')
    pages.push(last)
  } else if (cur >= last - 3) {
    pages.push(1)
    pages.push('...')
    for (let i = last - 4; i <= last; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push('...')
    for (let i = cur - 1; i <= cur + 1; i++) pages.push(i)
    pages.push('...')
    pages.push(last)
  }
  return pages
})

watch(soSearchQuery, () => { soPage.value = 1 })

const fetchSalesOrders = async () => {
  isLoadingSO.value = true
  try {
    const response = await axios.get('/sales-orders', { params: { per_page: 200 } })
    const data = response.data.data
    allSalesOrders.value = data?.data || data || []
  } catch (error) {
    console.error('Error fetching sales orders:', error)
  } finally {
    isLoadingSO.value = false
  }
}

const cetakTglKirim = (id) => {
  const routeData = router.resolve({ name: 'CetakSalesOrder', params: { id } })
  window.open(routeData.href, '_blank')
}

const cetakPPIC = (id) => {
  const routeData = router.resolve({ name: 'CetakSalesOrderPPIC', params: { id } })
  window.open(routeData.href, '_blank')
}

const formatSODate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getSoStatusClass = (status) => {
  const map = {
    Draft: 'so-status so-draft',
    Confirmed: 'so-status so-confirmed',
    Shipped: 'so-status so-shipped',
    Cancelled: 'so-status so-cancelled',
  }
  return map[status] || 'so-status so-default'
}

const fetchMonitoringData = async () => {
  isLoading.value = true

  try {
    const response = await axios.get('/production-monitoring')

    if (response.data.success) {
      monitoringData.value = response.data.data
      totalSO.value = response.data.total_so
    }
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
  } finally {
    isLoading.value = false
  }
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  const number = parseFloat(num)
  if (Number.isInteger(number)) {
    return number.toLocaleString('id-ID')
  }
  return number.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// Persentase qty stage terhadap target SO — live, dihitung ulang tiap render, berlaku
// merata untuk data lama maupun baru (bukan kolom tersimpan di database).
const stagePercent = (qty, target) => {
  const t = parseFloat(target)
  if (!t || t <= 0) return 0
  return Math.round((parseFloat(qty || 0) / t) * 100)
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'done':       return '✅'
    case 'in_progress': return '🟡'
    case 'skip':       return '⏭️'
    case 'waiting':
    default:           return '🔴'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'done':        return 'status-done'
    case 'in_progress': return 'status-progress'
    case 'skip':        return 'status-skip'
    case 'waiting':
    default:            return 'status-waiting'
  }
}

const goToDetail = (so) => {
  router.push({ name: 'ProductionMonitoring', query: { so_id: so.so_id } })
}

const doneCount = computed(() => {
  return monitoringData.value.filter((so) => so.is_done).length
})

const pendingCount = computed(() => {
  return monitoringData.value.filter((so) => !so.is_done).length
})

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userName.value = user.name || 'User'
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }
  fetchMonitoringData()
  fetchSampelData()
  fetchSalesOrders()
})
</script>

<style scoped>
/* ============================================
   MODERN DASHBOARD VARIABLES & BASE
   ============================================ */
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-600: #6b7280;
  --color-gray-900: #111827;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --transition-base: all 0.2s ease-in-out;
}

.dashboard-home {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* ============================================
   WELCOME SECTION - MODERN HERO
   ============================================ */
.welcome-section-compact {
  margin-bottom: 28px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  color: white;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 15px;
  opacity: 0.95;
  font-weight: 400;
}

/* ============================================
   WIDGET CARD - ELEVATED MODERN CARD
   ============================================ */
.widget-card {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: var(--transition-base);
}

.widget-card:hover {
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 12px 32px rgba(0, 0, 0, 0.08);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid var(--color-gray-100);
  background: linear-gradient(to right, #fafbfc 0%, #ffffff 100%);
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.widget-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.widget-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
  letter-spacing: -0.3px;
}

.view-all-btn {
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.view-all-btn:hover {
  background: #eff6ff;
  color: #2563eb;
  transform: translateX(2px);
}

/* ============================================
   LEGEND BAR - MODERN STATUS GUIDE
   ============================================ */
.legend-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-bottom: 1px solid #fbbf24;
  font-size: 13px;
  font-weight: 500;
}

.legend-title {
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #78716c;
  transition: var(--transition-base);
}

.legend-item:hover {
  color: #44403c;
  transform: scale(1.05);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: var(--shadow-sm);
}

.badge-waiting {
  background: #fee2e2;
}

.badge-progress {
  background: #fef3c7;
}

.badge-done {
  background: #d1fae5;
}

/* ============================================
   LOADING & EMPTY STATES
   ============================================ */
.loading-state {
  padding: 80px 20px;
  text-align: center;
  color: var(--color-gray-600);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: var(--color-gray-600);
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* ============================================
   TABLE - MODERN DATA GRID
   ============================================ */
.table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
}

.table-wrapper-frozen {
  overflow-y: auto;
  max-height: 65vh;
}

.monitoring-table {
  width: 100%;
  min-width: 1500px;
  border-collapse: separate;
  border-spacing: 0;
}

.monitoring-table th,
.monitoring-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-gray-200);
  transition: var(--transition-base);
}

.monitoring-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.monitoring-table th {
  background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
  font-weight: 700;
  font-size: 11px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  vertical-align: middle;
}

.monitoring-table td {
  font-size: 13px;
  color: #1f2937;
  background: white;
}

.monitoring-table tbody tr {
  transition: var(--transition-base);
}

.monitoring-table tbody tr:hover {
  background: #f9fafb;
  transform: scale(1.002);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.row-even {
  background: #fafbfc;
}

.row-done {
  background: linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%) !important;
}

.row-done:hover {
  background: linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%) !important;
}

/* ============================================
   ZONE HEADERS - COLORFUL PRODUCTION STAGES
   ============================================ */
.zone-header {
  text-align: center !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  padding: 16px 12px !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 3px solid;
}

.zone-icon {
  font-size: 18px;
  margin-right: 6px;
}

.zone-hulu {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%) !important;
  color: #3730a3 !important;
  border-bottom-color: #6366f1 !important;
}

.zone-hilir {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
  color: #1e40af !important;
  border-bottom-color: #3b82f6 !important;
}

/* ============================================
   STAGE COLUMNS - GRADIENT BACKGROUNDS
   ============================================ */
.stage-sanwil,
.stage-kd,
.stage-pembahanan {
  background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%) !important;
}

.stage-moulding {
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%) !important;
  color: #1e40af !important;
}

.stage-mesin {
  background: linear-gradient(180deg, #ecfeff 0%, #cffafe 100%) !important;
  color: #0e7490 !important;
}

.stage-assembling {
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%) !important;
}

.stage-anyam {
  background: linear-gradient(180deg, #fdf4ff 0%, #fae8ff 100%) !important;
  color: #86198f !important;
}

.stage-ruskomp {
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%) !important;
  color: #9a3412 !important;
}

.stage-rustik {
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%) !important;
}

.stage-sanding {
  background: linear-gradient(180deg, #fefce8 0%, #fef9c3 100%) !important;
}

.stage-finishing {
  background: linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%) !important;
}

.stage-qcfinal {
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%) !important;
}

.stage-packing {
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%) !important;
}

/* ============================================
   COLUMN ALIGNMENTS
   ============================================ */
.col-num {
  text-align: right !important;
  font-variant-numeric: tabular-nums;
}

.col-status {
  text-align: center !important;
}

.col-tgl-kirim {
  text-align: center !important;
  white-space: nowrap;
  min-width: 90px;
}

.col-so,
.col-item,
.col-target,
.col-tgl-kirim {
  position: sticky;
  z-index: 3;
  background: white;
  box-sizing: border-box;
}

.monitoring-table thead .col-so,
.monitoring-table thead .col-item,
.monitoring-table thead .col-target,
.monitoring-table thead .col-tgl-kirim {
  z-index: 12;
}

.col-so { left: 0; width: 170px; min-width: 170px; max-width: 170px; }
.col-item { left: 170px; width: 220px; min-width: 220px; max-width: 220px; }
.col-target { left: 390px; width: 70px; min-width: 70px; max-width: 70px; }
.col-tgl-kirim {
  left: 460px;
  box-shadow: 4px 0 6px -4px rgba(0, 0, 0, 0.2);
}

.tgl-kirim-value {
  font-size: 12px;
  font-weight: 600;
  color: #0369a1;
  background: #e0f2fe;
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-block;
}

/* ============================================
   SO & ITEM CELLS - STRUCTURED INFO
   ============================================ */
.so-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.so-number {
  font-weight: 700;
  color: #1f2937;
  font-size: 13px;
  display: block;
}

.so-date {
  font-size: 11px;
  color: var(--color-gray-600);
  display: block;
}

.item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
  line-height: 1.3;
  overflow-wrap: break-word;
}

.item-code {
  font-size: 11px;
  color: var(--color-gray-600);
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.buyer-name {
  font-weight: 500;
  color: #374151;
}

.target-value {
  font-weight: 700;
  color: #1e40af;
  font-size: 14px;
}

/* ============================================
   STATUS INDICATORS - 3D BADGES
   ============================================ */
.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 16px;
  transition: var(--transition-base);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-indicator:hover {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.status-done {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
}

.status-progress {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  animation: pulse 2s ease-in-out infinite;
}

.status-waiting {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #ef4444;
}

.status-skip {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px solid #9ca3af;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* ============================================
   QUANTITY VALUES - BOLD NUMBERS
   ============================================ */
.qty-value {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  transition: var(--transition-base);
}

.has-value {
  color: #059669;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

.has-value:hover {
  background: #a7f3d0;
  transform: scale(1.05);
}

.no-value {
  color: #d1d5db;
  font-weight: 400;
}

.stage-pct {
  font-size: 10.5px;
  font-weight: 500;
  opacity: 0.7;
}

.moulding-tooltip-title {
  font-weight: 700;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  background: #1f2937;
}

.moulding-tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 2px 0;
}

.moulding-tooltip-name {
  color: #e5e7eb;
  word-break: break-word;
}

.moulding-tooltip-qty {
  color: #6ee7b7;
  font-weight: 700;
  flex-shrink: 0;
  white-space: nowrap;
}

.bom-check-ok {
  color: #34d399;
  font-weight: 700;
  margin-right: 4px;
}

.bom-check-missing {
  color: #f87171;
  font-weight: 700;
  margin-right: 4px;
}

.sisa-value {
  font-weight: 800;
  color: #dc2626;
  font-size: 15px;
  display: inline-block;
  padding: 4px 10px;
  background: #fee2e2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

/* ============================================
   COMPLETION BADGE - SUCCESS STATE
   ============================================ */
.completion-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transition: var(--transition-base);
}

.completion-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.badge-icon {
  font-weight: 900;
  font-size: 13px;
}

/* ============================================
   WIDGET FOOTER - SUMMARY STATS
   ============================================ */
.widget-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-top: 2px solid var(--color-gray-200);
  font-size: 13px;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-gray-600);
}

.summary-icon {
  font-size: 20px;
}

.summary-text strong {
  color: var(--color-gray-900);
  font-weight: 700;
}

.summary-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  transition: var(--transition-base);
}

.stat-done {
  color: #059669;
  background: #d1fae5;
}

.stat-pending {
  color: #dc2626;
  background: #fee2e2;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.stat-divider {
  color: var(--color-gray-400);
  font-weight: 300;
}

/* ============================================
   SISA CELL - DETAIL BUTTON
   ============================================ */
.sisa-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.detail-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 6px;
  transition: var(--transition-base);
  line-height: 1;
  flex-shrink: 0;
}

.detail-btn:hover {
  background: #eff6ff;
  transform: scale(1.2);
}

.reject-badge-table {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}
.reject-badge-table:hover {
  background: #fecaca;
  transform: scale(1.05);
}
.no-reject {
  color: #d1d5db;
  font-size: 0.82rem;
}

.td-so-group {
  vertical-align: top;
  padding-top: 16px !important;
  border-right: 2px solid #e5e7eb;
  background: #f9fafb !important;
}

.so-buyer {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 4px;
}

.so-po-buyer {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  padding: 2px 7px;
  border-radius: 4px;
}

.so-done-badge {
  display: inline-block;
  margin-top: 6px;
  background: #d1fae5;
  color: #065f46;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.row-first-item td {
  border-top: 2px solid #e5e7eb;
}

.so-separator td {
  padding: 4px 0 !important;
  background: #f3f4f6 !important;
  border: none !important;
}

/* ============================================
   PRODUKSI SAMPEL WIDGET
   ============================================ */
.sampel-widget {
  margin-top: 28px;
}

.sampel-spinner {
  border-top-color: #7c3aed;
}

.sampel-select {
  accent-color: #7c3aed;
}
.sampel-select:focus {
  border-color: #7c3aed !important;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15) !important;
}

.sampel-legend {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%) !important;
  border-bottom-color: #8b5cf6 !important;
}

.sampel-legend .legend-title {
  color: #4c1d95 !important;
}

.sampel-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: separate;
  border-spacing: 0;
}

.sampel-table th,
.sampel-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-gray-200);
  transition: var(--transition-base);
}

.sampel-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.sampel-table th {
  background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
  font-weight: 700;
  font-size: 11px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  vertical-align: middle;
}

.sampel-table td {
  font-size: 13px;
  color: #1f2937;
  background: white;
}

.sampel-table tbody tr:hover {
  background: #faf5ff;
}

.sampel-zone-hilir {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%) !important;
  color: #4c1d95 !important;
  border-bottom-color: #8b5cf6 !important;
}

.sampel-stage-proto {
  background: linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%) !important;
  color: #5b21b6 !important;
}

.sampel-stage-sanding {
  background: linear-gradient(180deg, #fefce8 0%, #fef9c3 100%) !important;
  color: #92400e !important;
}

.sampel-stage-packing {
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%) !important;
  color: #065f46 !important;
}

.sampel-po-badge {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #6d28d9;
  background: #ede9fe;
  border: 1px solid #c4b5fd;
  padding: 2px 7px;
  border-radius: 4px;
}

/* ============================================
   SO PRINT WIDGET
   ============================================ */
.so-print-widget {
  margin-top: 28px;
}

/* ============================================
   MONITOR FILTER BAR
   ============================================ */
.monitor-filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.monitor-month-filter {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  white-space: nowrap;
}

.monitor-month-select,
.monitor-year-select {
  padding: 7px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  background: white;
  cursor: pointer;
  outline: none;
  transition: var(--transition-base);
}

.monitor-month-select { min-width: 130px; }
.monitor-year-select  { min-width: 80px; }

.monitor-month-select:focus,
.monitor-year-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* ============================================
   SO PRINT WIDGET
   ============================================ */
.so-search-box {
  display: flex;
  align-items: center;
}

.so-search-input {
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  font-size: 13px;
  min-width: 220px;
  outline: none;
  transition: var(--transition-base);
}

.so-search-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.so-spinner {
  border-top-color: #8b5cf6;
}

.so-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.so-table th,
.so-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.so-table thead {
  background: #f9fafb;
}

.so-table th {
  font-weight: 700;
  font-size: 11px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.so-table tbody tr:hover {
  background: #faf5ff;
}

.so-th-no,
.so-td-no {
  width: 50px;
  text-align: center;
}

.so-th-actions {
  width: 180px;
  text-align: center;
}

.so-number-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.so-td-customer {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #374151;
}

.so-customer-icon {
  font-size: 14px;
}

.so-td-date {
  color: #6b7280;
  font-size: 12px;
  white-space: nowrap;
}

.so-status {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.so-draft     { background: #f3f4f6; color: #6b7280; }
.so-confirmed { background: #dcfce7; color: #15803d; }
.so-shipped   { background: #dbeafe; color: #1d4ed8; }
.so-cancelled { background: #fee2e2; color: #b91c1c; }
.so-default   { background: #e5e7eb; color: #374151; }

.so-td-actions { text-align: center; }

.so-print-btns {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.so-btn-print,
.so-btn-ppic {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: var(--transition-base);
}

.so-btn-print {
  background: #ede9fe;
  color: #7c3aed;
  border: 1px solid #c4b5fd;
}

.so-btn-print:hover {
  background: #7c3aed;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.so-btn-ppic {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #6ee7b7;
}

.so-btn-ppic:hover {
  background: #059669;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.so-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 13px;
}

.so-pagination-info {
  color: #6b7280;
}

.so-pagination-btns {
  display: flex;
  gap: 4px;
}

.so-page-btn {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition-base);
}

.so-page-btn.active {
  background: #7c3aed;
  color: white;
  border-color: #7c3aed;
}

.so-page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.so-page-btn.dots {
  cursor: default;
}

/* ============================================
   RESPONSIVE DESIGN
   ============================================ */
@media (max-width: 1024px) {
  .dashboard-home {
    padding: 16px;
  }

  .widget-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .legend-bar {
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 24px;
  }

  .widget-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .summary-stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
