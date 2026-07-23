<template>
  <DashboardLayout>
    <div class="page-header-sawmill">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-sawmill"><span class="sawmill-icon">🪚</span></div>
          <div class="header-text-content">
            <h1 class="page-title-sawmill">Produksi Sawmill</h1>
            <p class="page-subtitle-sawmill">
              {{ form.process_type === 'log_jeblosan' ? 'Kayu Log → Jeblosan (Gudang SAWMILL)' : 'Jeblosan → RST Basah (Gudang RSTB)' }}
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">🪵</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🪚</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">📦</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card-sawmill">
      <div class="card-body-sawmill">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge"><span class="section-icon">📅</span></div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
              </div>
            </div>

            <!-- Toggle Proses -->
            <div class="process-type-toggle">
              <button
                type="button"
                :class="['process-type-btn', form.process_type === 'log_jeblosan' ? 'active' : '']"
                @click="setProcessType('log_jeblosan')"
              >
                <span class="process-type-icon">🪵</span>
                <div>
                  <div class="process-type-label">Log → Jeblosan</div>
                  <div class="process-type-desc">Kayu log dibelah jadi jeblosan</div>
                </div>
              </button>
              <button
                type="button"
                :class="['process-type-btn', form.process_type === 'jeblosan_rst' ? 'active' : '']"
                @click="setProcessType('jeblosan_rst')"
              >
                <span class="process-type-icon">🪚</span>
                <div>
                  <div class="process-type-label">Jeblosan → RST</div>
                  <div class="process-type-desc">Jeblosan digergaji jadi RST basah</div>
                </div>
              </button>
            </div>

            <div class="form-grid-3col" style="margin-top:1.25rem;">
              <div class="form-group-modern">
                <label class="form-label-modern">Tanggal <span class="required-star">*</span></label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📅</span>
                  <input v-model="form.date" type="date" class="form-input-modern" required />
                </div>
              </div>
              <div class="form-group-modern">
                <label class="form-label-modern">Estimasi Selesai</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">🏁</span>
                  <input v-model="form.estimated_finish_date" type="date" class="form-input-modern" />
                </div>
              </div>
              <div class="form-group-modern">
                <label class="form-label-modern">Production Order</label>
                <vue-select
                  v-model="form.ref_po_id"
                  :options="productionOrdersForSelect"
                  :reduce="po => po.id"
                  label="label"
                  placeholder="PO (opsional)..."
                  :clearable="true"
                  class="vue-select-item"
                  @option:selected="handlePoChange"
                  @option:deselected="handlePoDeselect"
                />
              </div>
            </div>

            <div class="form-group-modern" style="margin-top:0.5rem;">
              <label class="form-label-modern">Catatan</label>
              <div class="input-wrapper-icon">
                <span class="input-icon">📝</span>
                <input v-model="form.notes" type="text" class="form-input-modern" placeholder="Catatan proses..." />
              </div>
            </div>

            <!-- Info PO -->
            <div v-if="poInfo.buyer_name" class="po-info-box">
              <span>👤</span>
              <div>
                <div style="font-weight:700;">{{ poInfo.buyer_name }}</div>
                <div style="font-size:0.82rem;color:#6b7280;">{{ poInfo.so_number }}</div>
              </div>
            </div>

            <!-- Target PO -->
            <div v-if="poTargets.length" class="po-hint-box">
              <div class="po-hint-header">
                <div class="po-hint-title-wrap">
                  <span>📌</span>
                  <div>
                    <div class="po-hint-title">Target Produksi PO</div>
                    <div class="po-hint-sub">{{ poInfo.buyer_name }} • {{ poInfo.so_number }}</div>
                  </div>
                </div>
                <div class="po-hint-badge">{{ poTargets.length }} item</div>
              </div>
              <table class="po-hint-table">
                <thead>
                  <tr><th>Item</th><th>Target</th><th>Tgl Kirim</th></tr>
                </thead>
                <tbody>
                  <tr v-for="t in poTargets" :key="t.item_id">
                    <td>
                      <div style="font-weight:600;">{{ t.name }}</div>
                      <div style="font-size:0.78rem;color:#9ca3af;">{{ t.code }}</div>
                    </td>
                    <td>{{ Number(t.qty_planned).toLocaleString('id-ID') }} pcs</td>
                    <td>{{ t.delivery_date || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- =================== LOG → JEBLOSAN =================== -->
          <template v-if="form.process_type === 'log_jeblosan'">

            <!-- INPUT: Log -->
            <div class="form-section-modern">
              <div class="section-header section-header-log">
                <div class="section-icon-badge section-badge-log"><span class="section-icon">📥</span></div>
                <div class="section-title-group">
                  <h3 class="section-title">Input — Kayu Log</h3>
                  <p class="section-subtitle">Log yang masuk ke sawmill (opsional)</p>
                </div>
              </div>

              <div v-for="(row, idx) in form.logs" :key="row.local_id" class="item-row-card">
                <div class="item-row-header">
                  <span class="item-row-number">Log #{{ idx + 1 }}</span>
                  <button v-if="form.logs.length > 1" type="button" class="btn-remove-row" @click="removeLog(idx)">✕</button>
                </div>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Item Kayu Log</label>
                    <vue-select
                      v-model="row.item_log_id"
                      :options="logItemsForSelect"
                      :reduce="o => o.id"
                      label="label"
                      placeholder="Pilih kayu log..."
                      class="vue-select-item"
                    />
                  </div>
                  <div class="form-group-modern">
                    <label class="form-label-modern">Qty (pcs)</label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input v-model.number="row.qty_log_pcs" type="number" min="1" class="form-input-modern" placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" class="btn-add-row btn-add-log" @click="addLog">➕ Tambah Log</button>
            </div>

            <!-- OUTPUT: Jeblosan -->
            <div class="form-section-modern">
              <div class="section-header section-header-jeblosan">
                <div class="section-icon-badge section-badge-jeblosan"><span class="section-icon">📤</span></div>
                <div class="section-title-group">
                  <h3 class="section-title">Output — Jeblosan <span class="required-star">*</span></h3>
                  <p class="section-subtitle">
                    Hasil jeblosan masuk Gudang SAWMILL
                    <button type="button" class="btn-quick-add" @click="openModalJeblosan">➕ Jeblosan Baru</button>
                  </p>
                </div>
              </div>

              <div v-for="(row, idx) in form.jeblosans" :key="row.local_id" class="item-row-card item-row-card--jeblosan">
                <div class="item-row-header">
                  <span class="item-row-number">Jeblosan #{{ idx + 1 }}</span>
                  <button v-if="form.jeblosans.length > 1" type="button" class="btn-remove-row" @click="removeJeblosan(idx)">✕</button>
                </div>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Item Jeblosan <span class="required-star">*</span></label>
                    <vue-select
                      v-model="row.item_id"
                      :options="jeblosanItemsForSelect"
                      :reduce="o => o.id"
                      label="label"
                      placeholder="Pilih item jeblosan..."
                      class="vue-select-item"
                      @option:selected="(opt) => onJeblosanSelected(idx, opt)"
                    />
                  </div>
                  <div class="form-group-modern">
                    <label class="form-label-modern">Qty (pcs) <span class="required-star">*</span></label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input v-model.number="row.qty_pcs" type="number" min="1" class="form-input-modern" placeholder="0"
                        @input="updateJeblosanVolume(idx)" />
                    </div>
                  </div>
                </div>
                <div v-if="row.volume_m3 > 0" class="volume-hint">
                  Volume: {{ row.volume_m3.toFixed(4) }} m³
                </div>
              </div>

              <button type="button" class="btn-add-row btn-add-jeblosan" @click="addJeblosan">➕ Tambah Jeblosan</button>
            </div>

          </template>

          <!-- =================== JEBLOSAN → RST =================== -->
          <template v-else>

            <!-- INPUT: Jeblosan (pilih item + qty) -->
            <div class="form-section-modern">
              <div class="section-header section-header-jeblosan">
                <div class="section-icon-badge section-badge-jeblosan"><span class="section-icon">📥</span></div>
                <div class="section-title-group">
                  <h3 class="section-title">Input — Jeblosan dari Gudang SAWMILL (opsional)</h3>
                  <p class="section-subtitle">
                    Isi kalau tau SKU jeblosan spesifik yang dipakai hari ini. Boleh dikosongkan kalau
                    di lapangan tidak ada rincian jeblosan mana jadi RST mana — cukup catat Output RST
                    di bawah, stok jeblosan tetap perlu dicek/disesuaikan berkala lewat Stock Adjustment.
                    <span v-if="loadingStock" class="loading-inline">⏳ memuat stok...</span>
                  </p>
                </div>
              </div>

              <div v-if="!loadingStock && sawmillStock.length === 0" class="empty-hint">
                📭 Tidak ada stok jeblosan di Gudang SAWMILL — boleh dilewati, langsung isi Output RST di bawah
              </div>

              <template v-else>
                <div v-for="(row, idx) in form.jeblosanInputs" :key="row.local_id" class="item-row-card item-row-card--jeblosan">
                  <div class="item-row-header">
                    <span class="item-row-number">Jeblosan #{{ idx + 1 }}</span>
                    <button v-if="form.jeblosanInputs.length > 1" type="button" class="btn-remove-row" @click="removeJeblosanInput(idx)">✕</button>
                  </div>
                  <div class="form-grid-2col">
                    <div class="form-group-modern">
                      <label class="form-label-modern">Item Jeblosan</label>
                      <vue-select
                        v-model="row.item_id"
                        :options="jeblosanStockForSelect"
                        :reduce="o => o.id"
                        label="label"
                        placeholder="Pilih jeblosan dari stok (opsional)..."
                        class="vue-select-item"
                        @option:selected="(opt) => onJeblosanInputSelected(idx, opt)"
                      />
                      <div v-if="row.item_id" class="stock-hint">
                        Stok tersedia: <strong>{{ getAvailableStock(row.item_id) }} pcs</strong>
                      </div>
                    </div>
                    <div class="form-group-modern">
                      <label class="form-label-modern">Qty diproses (pcs)</label>
                      <div class="input-wrapper-icon">
                        <span class="input-icon">🔢</span>
                        <input
                          v-model.number="row.qty_pcs"
                          type="number" min="1"
                          :max="getAvailableStock(row.item_id) || undefined"
                          class="form-input-modern"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn-add-row btn-add-jeblosan" @click="addJeblosanInput">➕ Tambah Baris</button>
              </template>
            </div>

            <!-- OUTPUT: RST -->
            <div class="form-section-modern">
              <div class="section-header section-header-rst">
                <div class="section-icon-badge section-badge-rst"><span class="section-icon">📤</span></div>
                <div class="section-title-group">
                  <h3 class="section-title">Output — RST Basah <span class="required-star">*</span></h3>
                  <p class="section-subtitle">
                    Hasil RST masuk Gudang RSTB
                    <button type="button" class="btn-quick-add btn-quick-add-rst" @click="openModalRst">➕ RST Baru</button>
                  </p>
                </div>
              </div>

              <div v-for="(row, idx) in form.rsts" :key="row.local_id" class="item-row-card item-row-card--rst">
                <div class="item-row-header">
                  <span class="item-row-number">RST #{{ idx + 1 }}</span>
                  <button v-if="form.rsts.length > 1" type="button" class="btn-remove-row" @click="removeRst(idx)">✕</button>
                </div>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Item RST <span class="required-star">*</span></label>
                    <vue-select
                      v-model="row.item_rst_id"
                      :options="rstItemsForSelect"
                      :reduce="o => o.id"
                      label="label"
                      placeholder="Pilih item RST..."
                      class="vue-select-item"
                      @option:selected="(opt) => onRstSelected(idx, opt)"
                    />
                  </div>
                  <div class="form-grid-2col" style="margin-bottom:0;">
                    <div class="form-group-modern">
                      <label class="form-label-modern">Qty (pcs) <span class="required-star">*</span></label>
                      <div class="input-wrapper-icon">
                        <span class="input-icon">🔢</span>
                        <input v-model.number="row.qty_rst_pcs" type="number" min="1" class="form-input-modern" placeholder="0"
                          @input="updateRstVolume(idx)" />
                      </div>
                    </div>
                    <div class="form-group-modern">
                      <label class="form-label-modern">Volume (m³)</label>
                      <div class="input-wrapper-icon">
                        <span class="input-icon">📐</span>
                        <input v-model.number="row.volume_rst_m3" type="number" min="0" step="0.0001" class="form-input-modern" placeholder="0.0000" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" class="btn-add-row btn-add-rst" @click="addRst">➕ Tambah RST</button>
            </div>

          </template>

          <!-- FORM ACTIONS -->
          <div class="form-actions-modern">
            <button type="button" class="btn-action btn-cancel-modern" @click="router.back()">
              <span>↩️</span> Batal
            </button>
            <button type="submit" class="btn-action btn-submit-modern" :disabled="isSubmitting">
              <span>💾</span>
              {{ isSubmitting ? 'Menyimpan...' : (form.process_type === 'log_jeblosan' ? 'Simpan Log→Jeblosan' : 'Simpan Jeblosan→RST') }}
            </button>
          </div>

        </form>
      </div>
    </div>
    <!-- MODAL TAMBAH JEBLOSAN BARU -->
    <div v-if="showModalJeblosan" class="modal-overlay" @click.self="closeModalJeblosan">
      <div class="modal-card">
        <div class="modal-header">
          <h3>➕ Tambah Item Jeblosan Baru</h3>
          <button type="button" class="modal-close" @click="closeModalJeblosan">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">Item baru akan otomatis masuk ke master data Jeblosan.</p>

          <div class="form-group-modern">
            <label class="form-label-modern">Nama Dasar <span class="required-star">*</span></label>
            <input v-model="formJeblosan.nama_dasar" type="text" class="form-input-modern input-plain"
              placeholder="Contoh: Jeblosan Meranti" />
          </div>

          <div class="form-group-modern" style="margin-top:1rem;">
            <label class="form-label-modern">Kode Barang</label>
            <input v-model="formJeblosan.kode_barang" type="text" class="form-input-modern input-plain"
              placeholder="Auto generate jika kosong" />
          </div>

          <div class="modal-dims-label">Dimensi (mm)</div>
          <div class="form-grid-3col" style="margin-bottom:0;">
            <div class="form-group-modern">
              <label class="form-label-modern">Tebal (T)</label>
              <input v-model.number="formJeblosan.tebal_mm" type="number" min="0" step="0.1"
                class="form-input-modern input-plain" placeholder="0" @input="hitungVolume" />
            </div>
            <div class="form-group-modern">
              <label class="form-label-modern">Lebar (L)</label>
              <input v-model.number="formJeblosan.lebar_mm" type="number" min="0" step="0.1"
                class="form-input-modern input-plain" placeholder="0" @input="hitungVolume" />
            </div>
            <div class="form-group-modern">
              <label class="form-label-modern">Panjang (P)</label>
              <input v-model.number="formJeblosan.panjang_mm" type="number" min="0" step="0.1"
                class="form-input-modern input-plain" placeholder="0" @input="hitungVolume" />
            </div>
          </div>

          <!-- Preview nama & volume -->
          <div v-if="previewNamaJeblosan" class="modal-preview">
            <div class="preview-label">Preview nama:</div>
            <div class="preview-name">{{ previewNamaJeblosan }}</div>
            <div v-if="previewVolumeJeblosan > 0" class="preview-vol">
              Volume: {{ previewVolumeJeblosan.toFixed(6) }} m³/pcs
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-action btn-cancel-modern" @click="closeModalJeblosan">Batal</button>
          <button type="button" class="btn-action btn-submit-modern" :disabled="isSavingJeblosan" @click="simpanJeblosanBaru">
            {{ isSavingJeblosan ? '⏳ Menyimpan...' : '💾 Simpan & Pilih' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH RST BARU -->
    <div v-if="showModalRst" class="modal-overlay" @click.self="closeModalRst">
      <div class="modal-card modal-card-wide">
        <div class="modal-header modal-header-rst">
          <h3>➕ Tambah Item Kayu RST Baru</h3>
          <button type="button" class="modal-close" @click="closeModalRst">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">Item baru akan masuk ke master data Kayu RST sesuai kolom Stok Index.</p>

          <div class="form-grid-2col" style="margin-bottom:0.75rem;">
            <div class="form-group-modern">
              <label class="form-label-modern">Nama Dasar <span class="required-star">*</span></label>
              <input v-model="formRst.nama_dasar" type="text" class="form-input-modern input-plain"
                placeholder="Contoh: RST Meranti" />
            </div>
            <div class="form-group-modern">
              <label class="form-label-modern">Kode Barang</label>
              <input v-model="formRst.kode_barang" type="text" class="form-input-modern input-plain"
                placeholder="Auto generate jika kosong" />
            </div>
          </div>

          <div class="modal-dims-label">Dimensi (mm) — T wajib</div>
          <div class="form-grid-3col" style="margin-bottom:0.75rem;">
            <div class="form-group-modern">
              <label class="form-label-modern">Tebal / T <span class="required-star">*</span></label>
              <input v-model.number="formRst.tebal_mm" type="number" min="0" step="0.1"
                class="form-input-modern input-plain" placeholder="0" @input="hitungVolumeRst" />
            </div>
            <div class="form-group-modern">
              <label class="form-label-modern">Lebar / L</label>
              <input v-model.number="formRst.lebar_mm" type="number" min="0" step="0.1"
                class="form-input-modern input-plain" placeholder="0" @input="hitungVolumeRst" />
            </div>
            <div class="form-group-modern">
              <label class="form-label-modern">Panjang / P</label>
              <input v-model.number="formRst.panjang_mm" type="number" min="0" step="0.1"
                class="form-input-modern input-plain" placeholder="0" @input="hitungVolumeRst" />
            </div>
          </div>

          <div class="modal-dims-label">Cutting (mm) — opsional</div>
          <div class="form-grid-3col" style="margin-bottom:0.75rem;">
            <div class="form-group-modern">
              <label class="form-label-modern">C.T</label>
              <input v-model.number="formRst.cutting_tebal_mm" type="number" min="0" step="0.1"
                class="form-input-modern input-plain" placeholder="0" />
            </div>
            <div class="form-group-modern">
              <label class="form-label-modern">C.L</label>
              <input v-model.number="formRst.cutting_lebar_mm" type="number" min="0" step="0.1"
                class="form-input-modern input-plain" placeholder="0" />
            </div>
            <div class="form-group-modern">
              <label class="form-label-modern">C.P</label>
              <input v-model.number="formRst.cutting_panjang_mm" type="number" min="0" step="0.1"
                class="form-input-modern input-plain" placeholder="0" />
            </div>
          </div>

          <div class="form-grid-2col" style="margin-bottom:0;">
            <div class="form-group-modern">
              <label class="form-label-modern">Kualitas</label>
              <input v-model="formRst.kualitas" type="text" class="form-input-modern input-plain"
                placeholder="Contoh: A, B, C" />
            </div>
            <div class="form-group-modern">
              <label class="form-label-modern">No Rak</label>
              <input v-model="formRst.no_rak" type="text" class="form-input-modern input-plain"
                placeholder="Contoh: R-01" />
            </div>
          </div>

          <!-- Preview -->
          <div v-if="previewNamaRst" class="modal-preview modal-preview-rst">
            <div class="preview-label">Preview nama:</div>
            <div class="preview-name">{{ previewNamaRst }}</div>
            <div v-if="previewVolumeRst > 0" class="preview-vol">
              Volume: {{ previewVolumeRst.toFixed(6) }} m³/pcs
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-action btn-cancel-modern" @click="closeModalRst">Batal</button>
          <button type="button" class="btn-action btn-submit-modern btn-submit-rst" :disabled="isSavingRst" @click="simpanRstBaru">
            {{ isSavingRst ? '⏳ Menyimpan...' : '💾 Simpan & Pilih' }}
          </button>
        </div>
      </div>
    </div>

  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const router = useRouter()
const { showSuccess, showError } = useNotification()
const isSubmitting = ref(false)
const loadingStock = ref(false)

const logItems         = ref([])
const rstItems         = ref([])
const jeblosanItems    = ref([])
const sawmillStock     = ref([])
const productionOrders = ref([])
const poInfo           = ref({ buyer_name: null, so_number: null })
const poTargets        = ref([])

// ===== FORM =====
const newLog           = () => ({ local_id: Date.now() + Math.random(), item_log_id: null, qty_log_pcs: null })
const newJeblosan      = () => ({ local_id: Date.now() + Math.random(), item_id: null, qty_pcs: null, volume_m3: 0, volume_per_pcs: 0 })
const newJeblosanInput = () => ({ local_id: Date.now() + Math.random(), item_id: null, qty_pcs: null, volume_per_pcs: 0 })
const newRst           = () => ({ local_id: Date.now() + Math.random(), item_rst_id: null, qty_rst_pcs: null, volume_rst_m3: 0, volume_per_pcs: 0 })

const form = reactive({
  process_type:          'log_jeblosan',
  date:                  new Date().toISOString().slice(0, 10),
  estimated_finish_date: '',
  notes:                 '',
  ref_po_id:             null,
  logs:           [newLog()],
  jeblosans:      [newJeblosan()],
  jeblosanInputs: [newJeblosanInput()],
  rsts:           [newRst()],
})

// ===== COMPUTED =====
const productionOrdersForSelect = computed(() =>
  productionOrders.value.map(po => ({ id: po.id, label: po.po_number || po.label }))
)

const logItemsForSelect = computed(() =>
  logItems.value.map(i => ({ id: i.id, code: i.code, name: i.name, label: `${i.code} - ${i.name}` }))
)

const jeblosanItemsForSelect = computed(() =>
  jeblosanItems.value.map(i => ({ id: i.id, code: i.code, name: i.name, volume_m3: i.volume_m3 || 0, label: `${i.code} - ${i.name}` }))
)

const rstItemsForSelect = computed(() =>
  rstItems.value.map(i => ({ id: i.id, code: i.code, name: i.name, volume_m3: i.volume_m3 || 0, label: `${i.code} - ${i.name}` }))
)

const jeblosanStockForSelect = computed(() =>
  sawmillStock.value.map(s => ({
    id:            s.item_id,
    label:         `${s.item_code} - ${s.item_name} (stok: ${s.qty_available} pcs)`,
    qty_available: s.qty_available,
    volume_m3:     s.volume_m3,
  }))
)

const getAvailableStock = (itemId) => {
  const s = sawmillStock.value.find(s => s.item_id === itemId)
  return s ? s.qty_available : 0
}


// ===== FETCH =====
const fetchBaseData = async () => {
  try {
    const parseItems = (res) => {
      const d = res.data.data
      if (Array.isArray(d)) return d
      if (d?.data && Array.isArray(d.data)) return d.data
      return []
    }

    const [logsRes, rstRes, jebRes, poRes] = await Promise.all([
      apiClient.get('/materials', { params: { category_name: 'Kayu Log', per_page: 500 } }),
      apiClient.get('/materials', { params: { category_name: 'Kayu RST', per_page: 500 } }),
      apiClient.get('/materials', { params: { category_name: 'Jeblosan', per_page: 500 } }),
      apiClient.get('/production-orders', { params: { status_not: 'completed', include: 'sales_order' } }),
    ])

    logItems.value         = parseItems(logsRes)
    rstItems.value         = parseItems(rstRes)
    jeblosanItems.value    = parseItems(jebRes)
    productionOrders.value = parseItems(poRes)
  } catch (e) {
    console.error(e)
    showError('Gagal', 'Gagal mengambil data awal')
  }
}

const fetchSawmillStock = async () => {
  loadingStock.value = true
  try {
    const res = await apiClient.get('/sawmill-productions/sawmill-stock')
    sawmillStock.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingStock.value = false
  }
}

// ===== PROCESS TYPE =====
const setProcessType = (type) => {
  form.process_type = type
  if (type === 'jeblosan_rst') {
    fetchSawmillStock()
  }
}

// ===== PO =====
const handlePoChange = async (opt) => {
  poInfo.value    = { buyer_name: null, so_number: null }
  poTargets.value = []
  if (!opt) return
  try {
    const res  = await apiClient.get(`/production-orders/${opt.id}`)
    const data = res.data.data || {}
    poInfo.value = {
      buyer_name: data.sales_order?.buyer_name || opt.buyer_name || null,
      so_number:  data.sales_order?.so_number  || opt.so_number  || null,
    }
    poTargets.value = data.targets || []
  } catch (e) { console.error(e) }
}

const handlePoDeselect = () => {
  poInfo.value    = { buyer_name: null, so_number: null }
  poTargets.value = []
}

// ===== LOG→JEBLOSAN handlers =====
const addLog      = () => form.logs.push(newLog())
const removeLog   = (i) => form.logs.splice(i, 1)
const addJeblosan = () => form.jeblosans.push(newJeblosan())
const removeJeblosan = (i) => form.jeblosans.splice(i, 1)

const onJeblosanSelected = (idx, opt) => {
  form.jeblosans[idx].volume_per_pcs = opt?.volume_m3 ?? 0
  updateJeblosanVolume(idx)
}
const updateJeblosanVolume = (idx) => {
  const row = form.jeblosans[idx]
  row.volume_m3 = (row.volume_per_pcs || 0) * (row.qty_pcs || 0)
}

// ===== JEBLOSAN→RST handlers =====
const addJeblosanInput    = () => form.jeblosanInputs.push(newJeblosanInput())
const removeJeblosanInput = (i) => form.jeblosanInputs.splice(i, 1)

const onJeblosanInputSelected = (idx, opt) => {
  form.jeblosanInputs[idx].volume_per_pcs = opt?.volume_m3 ?? 0
}

const addRst    = () => form.rsts.push(newRst())
const removeRst = (i) => form.rsts.splice(i, 1)

const onRstSelected = (idx, opt) => {
  form.rsts[idx].volume_per_pcs = opt?.volume_m3 ?? 0
  updateRstVolume(idx)
}
const updateRstVolume = (idx) => {
  const row = form.rsts[idx]
  row.volume_rst_m3 = (row.volume_per_pcs || 0) * (row.qty_rst_pcs || 0)
}

// ===== SUBMIT =====
const handleSubmit = async () => {
  if (form.process_type === 'log_jeblosan') {
    const validJeb = form.jeblosans.filter(j => j.item_id && j.qty_pcs > 0)
    if (validJeb.length === 0) {
      showError('Validasi', 'Minimal satu output jeblosan wajib diisi')
      return
    }
  } else {
    // Input jeblosan sengaja TIDAK wajib -- di lapangan admin sering tidak tau jeblosan SKU mana
    // yang jadi RST mana (tidak ada pakem 1:1), cuma tau RST apa yang keluar. Kalau kebetulan tau,
    // boleh diisi (opsional) supaya stok jeblosan ikut berkurang; kalau tidak, dikosongkan saja.
    const validRst = form.rsts.filter(r => r.item_rst_id && r.qty_rst_pcs > 0)
    if (validRst.length === 0) {
      showError('Validasi', 'Minimal satu output RST wajib diisi')
      return
    }
  }

  isSubmitting.value = true
  try {
    const payload = {
      process_type:          form.process_type,
      date:                  form.date,
      estimated_finish_date: form.estimated_finish_date || null,
      notes:                 form.notes || null,
      ref_po_id:             form.ref_po_id ? Number(form.ref_po_id) : null,
    }

    if (form.process_type === 'log_jeblosan') {
      payload.logs = form.logs
        .filter(l => l.item_log_id && l.qty_log_pcs > 0)
        .map(l => ({ item_log_id: Number(l.item_log_id), qty_log_pcs: Number(l.qty_log_pcs) }))

      payload.jeblosans = form.jeblosans
        .filter(j => j.item_id && j.qty_pcs > 0)
        .map(j => ({
          item_id:   Number(j.item_id),
          qty_pcs:   Number(j.qty_pcs),
          volume_m3: Number(j.volume_m3 || 0),
        }))
    } else {
      payload.jeblosans = form.jeblosanInputs
        .filter(j => j.item_id && j.qty_pcs > 0)
        .map(j => ({
          item_id:   Number(j.item_id),
          qty_pcs:   Number(j.qty_pcs),
          volume_m3: Number((j.volume_per_pcs || 0) * (j.qty_pcs || 0)),
        }))

      payload.rsts = form.rsts
        .filter(r => r.item_rst_id && r.qty_rst_pcs > 0)
        .map(r => ({
          item_rst_id:   Number(r.item_rst_id),
          qty_rst_pcs:   Number(r.qty_rst_pcs),
          volume_rst_m3: Number(r.volume_rst_m3 || 0),
        }))
    }

    await apiClient.post('/sawmill-productions', payload)
    showSuccess('Sukses', `${form.process_type === 'log_jeblosan' ? 'Log→Jeblosan' : 'Jeblosan→RST'} berhasil dicatat`)

    // Reset form
    form.date                  = new Date().toISOString().slice(0, 10)
    form.estimated_finish_date = ''
    form.notes                 = ''
    form.ref_po_id             = null
    form.logs           = [newLog()]
    form.jeblosans      = [newJeblosan()]
    form.jeblosanInputs = [newJeblosanInput()]
    form.rsts           = [newRst()]
    poInfo.value               = { buyer_name: null, so_number: null }
    poTargets.value            = []

    if (form.process_type === 'jeblosan_rst') fetchSawmillStock()

  } catch (error) {
    const msg = error.response?.data?.message
      || (error.response?.data?.errors && JSON.stringify(error.response.data.errors))
      || 'Gagal menyimpan'
    showError('Gagal', msg)
  } finally {
    isSubmitting.value = false
  }
}

// ===== MODAL JEBLOSAN BARU =====
const showModalJeblosan  = ref(false)
const isSavingJeblosan   = ref(false)
const formJeblosan = reactive({ nama_dasar: '', kode_barang: '', tebal_mm: null, lebar_mm: null, panjang_mm: null })

const previewNamaJeblosan = computed(() => {
  if (!formJeblosan.nama_dasar) return ''
  const t = formJeblosan.tebal_mm, l = formJeblosan.lebar_mm, p = formJeblosan.panjang_mm
  return (t && l && p) ? `${formJeblosan.nama_dasar} ${t}x${l}x${p}` : formJeblosan.nama_dasar
})

const previewVolumeJeblosan = computed(() => {
  const t = formJeblosan.tebal_mm || 0
  const l = formJeblosan.lebar_mm || 0
  const p = formJeblosan.panjang_mm || 0
  return (t && l && p) ? (t * l * p) / 1_000_000_000 : 0
})

const hitungVolume = () => {} // computed handles it

const openModalJeblosan = () => {
  formJeblosan.nama_dasar  = ''
  formJeblosan.kode_barang = ''
  formJeblosan.tebal_mm    = null
  formJeblosan.lebar_mm    = null
  formJeblosan.panjang_mm  = null
  showModalJeblosan.value  = true
}

const closeModalJeblosan = () => { showModalJeblosan.value = false }

const simpanJeblosanBaru = async () => {
  if (!formJeblosan.nama_dasar.trim()) {
    showError('Validasi', 'Nama dasar wajib diisi')
    return
  }
  isSavingJeblosan.value = true
  try {
    const res = await apiClient.post('/materials/quick-store-jeblosan', {
      nama_dasar:  formJeblosan.nama_dasar.trim(),
      kode_barang: formJeblosan.kode_barang.trim() || null,
      tebal_mm:    formJeblosan.tebal_mm   || null,
      lebar_mm:    formJeblosan.lebar_mm   || null,
      panjang_mm:  formJeblosan.panjang_mm || null,
    })
    const itemBaru = res.data.data

    // Tambah ke list lokal
    jeblosanItems.value.push({
      id:         itemBaru.id,
      code:       itemBaru.code,
      name:       itemBaru.name,
      volume_m3:  itemBaru.volume_m3 || 0,
    })

    // Auto-pilih di baris jeblosan terakhir yang belum diisi
    const lastEmpty = form.jeblosans.find(j => !j.item_id)
    if (lastEmpty) {
      lastEmpty.item_id        = itemBaru.id
      lastEmpty.volume_per_pcs = itemBaru.volume_m3 || 0
    }

    showSuccess('Berhasil', `Jeblosan "${itemBaru.name}" berhasil ditambahkan`)
    closeModalJeblosan()
  } catch (error) {
    const msg = error.response?.data?.message
      || (error.response?.data?.errors && JSON.stringify(error.response.data.errors))
      || 'Gagal menyimpan'
    showError('Gagal', msg)
  } finally {
    isSavingJeblosan.value = false
  }
}

// ===== MODAL RST BARU =====
const showModalRst  = ref(false)
const isSavingRst   = ref(false)
const formRst = reactive({
  nama_dasar: '', kode_barang: '',
  tebal_mm: null, lebar_mm: null, panjang_mm: null,
  cutting_tebal_mm: null, cutting_lebar_mm: null, cutting_panjang_mm: null,
  kualitas: '', no_rak: '',
})

const previewNamaRst = computed(() => {
  if (!formRst.nama_dasar) return ''
  const t = formRst.tebal_mm || 0
  const l = formRst.lebar_mm || 0
  const p = formRst.panjang_mm || 0
  return `${formRst.nama_dasar} ${t}x${l}x${p}`
})

const previewVolumeRst = computed(() => {
  const t = formRst.tebal_mm || 0
  const l = formRst.lebar_mm || 0
  const p = formRst.panjang_mm || 0
  return (t && l && p) ? (t * l * p) / 1_000_000_000 : 0
})

const hitungVolumeRst = () => {}

const openModalRst = () => {
  Object.assign(formRst, {
    nama_dasar: '', kode_barang: '',
    tebal_mm: null, lebar_mm: null, panjang_mm: null,
    cutting_tebal_mm: null, cutting_lebar_mm: null, cutting_panjang_mm: null,
    kualitas: '', no_rak: '',
  })
  showModalRst.value = true
}

const closeModalRst = () => { showModalRst.value = false }

const simpanRstBaru = async () => {
  if (!formRst.nama_dasar.trim()) {
    showError('Validasi', 'Nama dasar wajib diisi')
    return
  }
  if (!formRst.tebal_mm) {
    showError('Validasi', 'Tebal (T) wajib diisi')
    return
  }
  isSavingRst.value = true
  try {
    const res = await apiClient.post('/materials/quick-store-rst', {
      nama_dasar:         formRst.nama_dasar.trim(),
      kode_barang:        formRst.kode_barang.trim() || null,
      tebal_mm:           formRst.tebal_mm,
      lebar_mm:           formRst.lebar_mm    || null,
      panjang_mm:         formRst.panjang_mm  || null,
      cutting_tebal_mm:   formRst.cutting_tebal_mm  || null,
      cutting_lebar_mm:   formRst.cutting_lebar_mm  || null,
      cutting_panjang_mm: formRst.cutting_panjang_mm || null,
      kualitas:           formRst.kualitas.trim() || null,
      no_rak:             formRst.no_rak.trim()   || null,
    })
    const itemBaru = res.data.data

    // Tambah ke list lokal
    rstItems.value.push({
      id:        itemBaru.id,
      code:      itemBaru.code,
      name:      itemBaru.name,
      volume_m3: itemBaru.volume_m3 || 0,
    })

    // Auto-pilih di baris RST terakhir yang belum diisi
    const lastEmpty = form.rsts.find(r => !r.item_rst_id)
    if (lastEmpty) {
      lastEmpty.item_rst_id    = itemBaru.id
      lastEmpty.volume_per_pcs = itemBaru.volume_m3 || 0
    }

    showSuccess('Berhasil', `RST "${itemBaru.name}" berhasil ditambahkan`)
    closeModalRst()
  } catch (error) {
    const msg = error.response?.data?.message
      || (error.response?.data?.errors && JSON.stringify(error.response.data.errors))
      || 'Gagal menyimpan'
    showError('Gagal', msg)
  } finally {
    isSavingRst.value = false
  }
}

onMounted(fetchBaseData)
</script>

<style scoped>
.page-header-sawmill {
  background: linear-gradient(135deg, #92400e 0%, #78350f 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(146,64,14,0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-sawmill { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; }
.sawmill-icon { font-size: 2.5rem; }
.page-title-sawmill { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-sawmill { color: rgba(255,255,255,0.9); font-size: 1rem; margin: 0; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #78350f; font-weight: 700; }

.content-card-sawmill { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden; }
.card-body-sawmill { padding: 2.5rem; }

.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #f9fafb, #fef3c7); border-radius: 14px; border-left: 5px solid #92400e; }
.section-header-log      { background: linear-gradient(135deg, #f9fafb, #fffbeb) !important; border-left-color: #d97706 !important; }
.section-header-jeblosan { background: linear-gradient(135deg, #f9fafb, #ecfdf5) !important; border-left-color: #16a34a !important; }
.section-header-rst      { background: linear-gradient(135deg, #f9fafb, #eff6ff) !important; border-left-color: #2563eb !important; }

.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #92400e, #78350f); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-badge-log      { background: linear-gradient(135deg, #d97706, #b45309) !important; }
.section-badge-jeblosan { background: linear-gradient(135deg, #16a34a, #15803d) !important; }
.section-badge-rst      { background: linear-gradient(135deg, #2563eb, #1d4ed8) !important; }
.section-icon { font-size: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; }
.section-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0; }

.process-type-toggle { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
.process-type-btn { flex: 1; display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; border: 2px solid #e5e7eb; border-radius: 14px; background: white; cursor: pointer; transition: all 0.2s; text-align: left; }
.process-type-btn:hover { border-color: #92400e; }
.process-type-btn.active { border-color: #92400e; background: #fffbeb; }
.process-type-icon { font-size: 2rem; }
.process-type-label { font-weight: 700; font-size: 1rem; color: #111827; }
.process-type-desc { font-size: 0.82rem; color: #6b7280; margin-top: 2px; }

.form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-group-modern { display: flex; flex-direction: column; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.required-star { color: #ef4444; }
.input-wrapper-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1.125rem; font-size: 1rem; z-index: 1; pointer-events: none; }
.form-input-modern { width: 100%; padding: 0.9rem 1.25rem 0.9rem 3.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: all 0.3s; background: white; }
.form-input-modern:focus { outline: none; border-color: #92400e; box-shadow: 0 0 0 4px rgba(146,64,14,0.15); }

.po-info-box { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; margin-top: 1rem; }

.po-hint-box { border-radius: 16px; border: 1px solid #fde68a; background: linear-gradient(135deg, #fffbeb, #fef9c3); padding: 1.25rem 1.5rem; margin-top: 1rem; }
.po-hint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.po-hint-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
.po-hint-title { font-weight: 700; font-size: 0.95rem; color: #92400e; }
.po-hint-sub { font-size: 0.82rem; color: #b45309; }
.po-hint-badge { background: #92400e; color: white; border-radius: 999px; padding: 2px 12px; font-size: 0.8rem; font-weight: 700; }
.po-hint-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.po-hint-table th { padding: 6px 10px; text-align: left; color: #92400e; font-size: 0.78rem; text-transform: uppercase; border-bottom: 1px solid #fde68a; }
.po-hint-table td { padding: 6px 10px; color: #374151; border-bottom: 1px solid #fef3c7; }

.item-row-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
.item-row-card--jeblosan { border-color: #bbf7d0; background: #f0fdf4; }
.item-row-card--rst      { border-color: #bfdbfe; background: #eff6ff; }
.item-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.item-row-number { font-size: 0.82rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; padding: 3px 10px; font-size: 0.82rem; cursor: pointer; font-weight: 700; }

.volume-hint { font-size: 0.82rem; color: #6b7280; margin-top: 4px; padding: 4px 8px; background: #f3f4f6; border-radius: 6px; display: inline-block; }
.stock-hint { margin-left: 8px; font-size: 0.78rem; color: #92400e; font-weight: 600; }
.qty-warning { margin-top: 4px; font-size: 0.82rem; color: #ef4444; }
.loading-inline { font-size: 0.82rem; color: #6b7280; margin-left: 8px; }
.empty-hint { padding: 2rem; text-align: center; color: #9ca3af; background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db; }

.btn-add-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; border: 2px dashed; background: none; }
.btn-add-log      { border-color: #d97706; color: #92400e; }
.btn-add-log:hover { background: #fef3c7; }
.btn-add-jeblosan { border-color: #16a34a; color: #15803d; }
.btn-add-jeblosan:hover { background: #f0fdf4; }
.btn-add-rst { border-color: #2563eb; color: #1d4ed8; }
.btn-add-rst:hover { background: #eff6ff; }

.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-submit-modern { background: linear-gradient(135deg, #92400e, #78350f); color: white; box-shadow: 0 4px 12px rgba(146,64,14,0.35); }
.btn-submit-modern:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-modern:disabled { opacity: 0.6; cursor: not-allowed; }

.vue-select-item :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; min-height: 54px; }
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color: #92400e; box-shadow: 0 0 0 4px rgba(146,64,14,0.15); }

.item-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.item-option-code { font-size: 0.82rem; font-weight: 700; color: #92400e; }
.item-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }
.item-option-stock { font-size: 0.78rem; color: #6b7280; }

.sawmill-stock-info { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.25rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; font-size: 0.9rem; color: #15803d; font-weight: 500; }
.stock-hint { font-size: 0.78rem; color: #6b7280; margin-top: 0.25rem; }
.sawmill-stock-icon { font-size: 1.1rem; }

.btn-quick-add { margin-left: 8px; padding: 2px 10px; background: #d97706; color: white; border: none; border-radius: 999px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-quick-add:hover { background: #b45309; }
.btn-quick-add-rst { background: #2563eb; }
.btn-quick-add-rst:hover { background: #1d4ed8; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.modal-card { background: white; border-radius: 20px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 2px solid #e5e7eb; background: linear-gradient(135deg, #fffbeb, #fef3c7); }
.modal-header h3 { font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0; }
.modal-close { background: #fee2e2; color: #ef4444; border: none; border-radius: 8px; padding: 4px 10px; cursor: pointer; font-weight: 700; }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.modal-hint { font-size: 0.85rem; color: #6b7280; margin: 0; }
.modal-dims-label { font-size: 0.875rem; font-weight: 600; color: #374151; margin-top: 0.5rem; }
.modal-preview { margin-top: 0.75rem; padding: 0.75rem 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; }
.preview-label { font-size: 0.75rem; color: #6b7280; font-weight: 600; text-transform: uppercase; }
.preview-name { font-size: 0.95rem; font-weight: 700; color: #111827; margin-top: 2px; }
.preview-vol { font-size: 0.82rem; color: #15803d; margin-top: 4px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 2px solid #e5e7eb; }
.input-plain { padding-left: 1.25rem !important; }
.modal-card-wide { max-width: 560px; }
.modal-header-rst { background: linear-gradient(135deg, #eff6ff, #dbeafe) !important; }
.modal-preview-rst { background: #eff6ff; border-color: #bfdbfe; }
.btn-submit-rst { background: linear-gradient(135deg, #2563eb, #1d4ed8) !important; box-shadow: 0 4px 12px rgba(37,99,235,0.35) !important; }

@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns: 1fr; }
  .process-type-toggle { flex-direction: column; }
  .card-body-sawmill { padding: 1.25rem; }
}
</style>
