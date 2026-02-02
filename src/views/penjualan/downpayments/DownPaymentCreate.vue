<template>
  <DashboardLayout>
    <div class="page-container">
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon-box">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div class="hero-text">
            <h1>Penerimaan Uang Muka (DP)</h1>
            <p>Buat faktur uang muka berdasarkan Sales Order yang disetujui</p>
          </div>
        </div>
        <button @click="goBack" class="btn-glass"><i class="fas fa-arrow-left"></i> Kembali</button>
      </div>

      <div class="main-content">
        <div class="search-section">
          <div class="card search-card">
            <div class="card-body">
              <label class="section-label">
                <i class="fas fa-search text-primary"></i> Cari Referensi Sales Order
              </label>

              <div class="search-wrapper" ref="searchWrapper">
                <div class="input-icon-wrapper">
                  <i class="fas fa-search icon-left"></i>
                  <input
                    v-model="searchSO"
                    @input="handleSearch"
                    @focus="showDropdown = true"
                    type="text"
                    class="modern-input search-field"
                    placeholder="Ketik Nomor SO atau Nama Customer..."
                    autocomplete="off"
                    :disabled="selectedSO !== null"
                  />

                  <div v-if="loadingSO" class="spinner-small"></div>
                  <button
                    v-else-if="selectedSO"
                    @click="clearSelection"
                    class="btn-clear"
                    type="button"
                  >
                    <i class="fas fa-times"></i> Ganti Order
                  </button>
                </div>

                <transition name="fade">
                  <div
                    v-if="
                      showDropdown && (searchSO || filteredSalesOrders.length > 0) && !selectedSO
                    "
                    class="dropdown-results"
                  >
                    <div v-if="loadingSO" class="state-box">
                      <i class="fas fa-spinner fa-spin"></i> Mencari data...
                    </div>

                    <div v-else-if="filteredSalesOrders.length === 0" class="state-box text-muted">
                      Data Sales Order tidak ditemukan.
                    </div>

                    <div v-else class="result-list">
                      <div
                        v-for="(so, index) in filteredSalesOrders"
                        :key="so.id"
                        class="result-item"
                        :class="{ active: index === hoverIndex }"
                        @mouseenter="hoverIndex = index"
                        @click="selectSO(so)"
                      >
                        <div class="ri-left">
                          <span class="ri-so">{{ so.so_number }}</span>
                          <span class="ri-cust"
                            ><i class="fas fa-user-circle"></i>
                            {{ so.buyer?.name || 'Cash Customer' }}</span
                          >
                        </div>
                        <div class="ri-right">
                          <span class="ri-date">{{ formatDate(so.so_date) }}</span>
                          <span class="ri-amount">{{
                            formatCurrency(so.grand_total, so.currency)
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <transition name="slide-up">
          <div v-if="selectedSO" class="split-grid">
            <div class="left-col">
              <div class="card form-card">
                <div class="card-header-clean">
                  <h3><i class="fas fa-pen-fancy"></i> Rincian Pembayaran</h3>
                </div>
                <div class="card-body">
                  <form id="dp-form" @submit.prevent="submitDP">
                    <div class="row-2">
                      <div class="form-group">
                        <label>Tanggal Terima <span class="required">*</span></label>
                        <input
                          v-model="form.payment_date"
                          type="date"
                          class="modern-input"
                          required
                        />
                      </div>

                      <div class="form-group">
                        <label>Akun Kas/Bank (COA) <span class="required">*</span></label>

                        <!-- Search COA Input -->
                        <div class="search-wrapper-coa" ref="coaSearchWrapper">
                          <div class="input-icon-wrapper">
                            <i class="fas fa-search icon-left"></i>
                            <input
                              v-model="searchCOA"
                              @input="handleCOASearch"
                              @focus="showCOADropdown = true"
                              type="text"
                              class="modern-input search-field"
                              placeholder="Ketik kode atau nama COA..."
                              autocomplete="off"
                            />

                            <button
                              v-if="selectedCOA"
                              @click="clearCOA"
                              class="btn-clear-coa"
                              type="button"
                            >
                              <i class="fas fa-times"></i>
                            </button>
                          </div>

                          <!-- Dropdown COA Results -->
                          <transition name="fade">
                            <div
                              v-if="showCOADropdown && filteredCOAs.length > 0"
                              class="dropdown-results dropdown-coa"
                            >
                              <div class="result-list">
                                <div
                                  v-for="(coa, index) in filteredCOAs"
                                  :key="coa.id"
                                  class="result-item coa-item"
                                  :class="{ active: index === hoverCOAIndex }"
                                  @mouseenter="hoverCOAIndex = index"
                                  @click="selectCOA(coa)"
                                >
                                  <div class="coa-code">{{ coa.code }}</div>
                                  <div class="coa-name">{{ coa.name }}</div>
                                </div>
                              </div>
                            </div>
                          </transition>
                        </div>

                        <!-- Selected COA Info -->
                        <div v-if="selectedCOA" class="selected-coa-info">
                          <span class="coa-badge">
                            <i class="fas fa-check-circle"></i>
                            {{ selectedCOA.code }} - {{ selectedCOA.name }}
                          </span>
                        </div>

                        <small class="helper-text">Pilih akun kas atau bank untuk pencatatan</small>
                      </div>
                    </div>

                    <div class="divider"></div>

                    <div class="row-2">
                      <div class="form-group">
                        <label
                          >Nominal DP ({{ selectedSO.currency }})
                          <span class="required">*</span></label
                        >
                        <div class="input-currency-group">
                          <span class="curr-symbol">{{ selectedSO.currency }}</span>
                          <input
                            v-model.number="form.amount"
                            type="number"
                            step="0.01"
                            class="modern-input font-bold input-amount"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div class="quick-actions">
                          <span @click="setPercentage(0.3)" class="badge-percent">30%</span>
                          <span @click="setPercentage(0.5)" class="badge-percent">50%</span>
                          <span @click="setPercentage(0.7)" class="badge-percent">70%</span>
                        </div>
                      </div>

                      <div class="form-group">
                        <label>Kurs (Rate IDR) <span class="required">*</span></label>
                        <div class="input-currency-group">
                          <span class="curr-symbol">Rp</span>
                          <input
                            v-model.number="form.exchange_rate"
                            type="number"
                            step="0.01"
                            class="modern-input"
                            required
                          />
                        </div>
                        <small class="helper-text">Kurs saat ini</small>
                      </div>
                    </div>

                    <div class="form-group mt-3">
                      <label>Catatan / Keterangan</label>
                      <textarea
                        v-model="form.notes"
                        class="modern-input"
                        rows="3"
                        placeholder="Contoh: Pembayaran DP Tahap 1 untuk Proyek A..."
                      ></textarea>
                    </div>
                  </form>
                </div>
                <div class="card-footer">
                  <button
                    type="submit"
                    form="dp-form"
                    :disabled="submitting || !isFormValid"
                    class="btn-submit"
                  >
                    <span v-if="submitting" style="color: white !important">
                      <i class="fas fa-spinner fa-spin" style="color: white !important"></i>
                      Memproses...
                    </span>
                    <span v-else style="color: white !important">
                      <i class="fas fa-save" style="color: white !important"></i> Simpan Transaksi
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div class="right-col">
              <div class="sticky-wrapper">
                <div class="card summary-card">
                  <div class="summary-header">
                    <span><i class="fas fa-info-circle"></i> INFO ORDER</span>
                    <span class="badge-so">{{ selectedSO.so_number }}</span>
                  </div>
                  <div class="summary-body">
                    <div class="info-row">
                      <label>Customer</label>
                      <div class="val text-dark fw-bold">{{ selectedSO.buyer?.name }}</div>
                    </div>
                    <div class="info-row">
                      <label>Total Order</label>
                      <div class="val text-primary">
                        {{ formatCurrency(selectedSO.grand_total, selectedSO.currency) }}
                      </div>
                    </div>
                    <div class="dashed-line"></div>
                    <div class="info-row">
                      <label>Sisa Tagihan</label>
                      <div class="val text-danger">
                        {{
                          formatCurrency(
                            selectedSO.remaining_amount || selectedSO.grand_total,
                            selectedSO.currency,
                          )
                        }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="amountIDR > 0" class="card total-card">
                  <div class="total-label">ESTIMASI RUPIAH (IDR)</div>
                  <div class="total-value">{{ formatRupiah(amountIDR) }}</div>
                  <div class="total-note">Akan dicatat ke Jurnal Umum</div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

export default {
  name: 'DownPaymentCreate',
  components: { DashboardLayout },
  data() {
    return {
      salesOrders: [],
      allSalesOrders: [],
      selectedSO: null,
      cashBankAccounts: [],
      selectedCOA: null,
      searchSO: '',
      searchCOA: '',
      loadingSO: false,
      submitting: false,
      showDropdown: false,
      showCOADropdown: false,
      hoverIndex: -1,
      hoverCOAIndex: -1,
      form: {
        sales_order_id: null,
        payment_date: new Date().toISOString().split('T')[0],
        amount: 0,
        account_id: '',
        exchange_rate: 1,
        notes: '',
      },
    }
  },
  computed: {
    isFormValid() {
      return (
        this.selectedSO && this.form.payment_date && this.form.amount > 0 && this.form.account_id
      )
    },
    amountIDR() {
      return (this.form.amount || 0) * (this.form.exchange_rate || 1)
    },
    filteredSalesOrders() {
      if (!this.searchSO) return []
      const search = this.searchSO.toLowerCase()
      return this.allSalesOrders
        .filter((so) => {
          const soNumber = so.so_number?.toLowerCase() || ''
          const customer = so.buyer?.name?.toLowerCase() || ''
          return soNumber.includes(search) || customer.includes(search)
        })
        .slice(0, 10)
    },
    filteredCOAs() {
      if (!this.searchCOA) return this.cashBankAccounts.slice(0, 10)

      const search = this.searchCOA.toLowerCase()
      return this.cashBankAccounts
        .filter((coa) => {
          const code = coa.code?.toLowerCase() || ''
          const name = coa.name?.toLowerCase() || ''
          return code.includes(search) || name.includes(search)
        })
        .slice(0, 10)
    },
  },
  mounted() {
    this.loadCashBankAccounts()
    this.loadSalesOrders()
    document.addEventListener('click', this.handleClickOutside)
    document.addEventListener('click', this.handleClickOutsideCOA)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    document.removeEventListener('click', this.handleClickOutsideCOA)
  },
  methods: {
    handleClickOutside(e) {
      if (this.$refs.searchWrapper && !this.$refs.searchWrapper.contains(e.target)) {
        this.showDropdown = false
      }
    },
    handleClickOutsideCOA(e) {
      if (this.$refs.coaSearchWrapper && !this.$refs.coaSearchWrapper.contains(e.target)) {
        this.showCOADropdown = false
      }
    },
    handleSearch() {
      this.showDropdown = true
    },
    handleCOASearch() {
      this.showCOADropdown = true
    },
    async loadSalesOrders() {
      this.loadingSO = true
      try {
        const response = await apiClient.get('/sales-orders', {
          params: { status: 'APPROVED', per_page: 100 },
        })
        const result = response.data.data
        this.allSalesOrders = Array.isArray(result) ? result : result.data || []
      } catch (error) {
        console.error('Gagal load SO:', error)
      } finally {
        this.loadingSO = false
      }
    },
    async loadCashBankAccounts() {
      try {
        const response = await apiClient.get('/coa', {
          params: {
            account_type: 'CASH,BANK',
            is_active: 1,
          },
        })

        this.cashBankAccounts = (response.data.data || response.data || []).map((coa) => ({
          id: coa.id,
          code: coa.code,
          name: coa.name || coa.account_name,
          type: coa.type || coa.account_type,
        }))
      } catch (error) {
        console.error('Gagal load COA:', error)
        this.cashBankAccounts = []
      }
    },
    selectSO(so) {
      this.selectedSO = so
      this.form.sales_order_id = so.id
      this.searchSO = `${so.so_number} - ${so.buyer?.name}`
      this.showDropdown = false

      if (so.exchange_rate) this.form.exchange_rate = so.exchange_rate
      this.form.amount = 0
    },
    selectCOA(coa) {
      this.selectedCOA = coa
      this.form.account_id = coa.id
      this.searchCOA = `${coa.code} - ${coa.name}`
      this.showCOADropdown = false
    },
    clearCOA() {
      this.selectedCOA = null
      this.form.account_id = ''
      this.searchCOA = ''
      this.showCOADropdown = false
      this.$nextTick(() => {
        const input = this.$refs.coaSearchWrapper?.querySelector('input')
        if (input) input.focus()
      })
    },
    setPercentage(decimal) {
      if (this.selectedSO) {
        this.form.amount = Math.round(this.selectedSO.grand_total * decimal * 100) / 100
      }
    },
    clearSelection() {
      this.selectedSO = null
      this.form.sales_order_id = null
      this.searchSO = ''
      this.form.amount = 0
      this.form.account_id = ''

      this.selectedCOA = null
      this.searchCOA = ''

      this.showDropdown = true
      this.$nextTick(() => {
        const input = this.$el.querySelector('.search-field')
        if (input) input.focus()
      })
    },
    async submitDP() {
      if (!this.isFormValid) return
      this.submitting = true
      try {
        await apiClient.post('/down-payments', this.form)
        alert('DP Berhasil disimpan!')
        this.$router.push(`/admin/penjualan/down-payments`)
      } catch (error) {
        alert(error.response?.data?.message || 'Gagal menyimpan transaksi')
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.push('/admin/penjualan/down-payments')
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    },
    formatRupiah(val) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(val)
    },
    formatCurrency(val, curr) {
      if (val === null || val === undefined) return '-'
      const number = typeof val === 'string' ? parseFloat(val) : val
      if (isNaN(number)) return '-'

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr || 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(number)
    },
  },
}
</script>

<style scoped>
:root {
  --primary: #10b981;
  --primary-dark: #059669;
  --text-dark: #1e293b;
  --border-color: #e2e8f0;
  --bg-input: #f8fafc;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.page-container {
  max-width: 1280px;
  width: 95%;
  margin: 0 auto;
  padding-bottom: 50px;
  color: #334155;
  font-family: 'Inter', sans-serif;
}

.hero-header {
  background: white;
  border-radius: 12px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-left: 6px solid var(--primary);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 20px;
}
.hero-icon-box {
  font-size: 28px;
  color: white;
  background: var(--primary);
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}
.hero-text h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}
.hero-text p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #64748b;
}

.btn-glass {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}
.btn-glass:hover {
  background: #f1f5f9;
  color: var(--primary);
  border-color: var(--primary);
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: visible;
}
.card-body {
  padding: 30px;
  position: relative;
  background: white;
  z-index: 10; /* Base z-index for content */
}
.search-card {
  z-index: 20;
  margin-bottom: 24px;
}

.section-label {
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
  color: #334155;
  font-size: 15px;
}

.search-wrapper,
.search-wrapper-coa {
  position: relative;
}
.input-icon-wrapper {
  position: relative;
}
.icon-left {
  position: absolute;
  left: 16px;
  top: 16px;
  color: #94a3b8;
  font-size: 18px;
  z-index: 2;
}

.btn-clear {
  position: absolute;
  right: 12px;
  top: 10px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: 0.2s;
  z-index: 2;
}
.btn-clear:hover {
  background: #fecaca;
}

.btn-clear-coa {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.btn-clear-coa:hover {
  background: #fecaca;
}

.dropdown-results {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 50; /* Above card-body content but below footer if they overlap */
  max-height: 350px;
  overflow-y: auto;
}

.dropdown-coa {
  max-height: 300px;
  z-index: 500; /* Ensure coa dropdown is on top when active */
}

.result-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.result-item:hover,
.result-item.active {
  background: #f0fdf4;
  border-left: 4px solid var(--primary);
  padding-left: 16px;
}

.coa-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
}

.coa-code {
  font-weight: 700;
  color: #0f172a;
  font-size: 14px;
  font-family: 'Courier New', monospace;
}

.coa-name {
  font-size: 13px;
  color: #64748b;
}

.coa-item:hover .coa-code,
.coa-item.active .coa-code {
  color: var(--primary);
}

.selected-coa-info {
  margin-top: 8px;
}

.coa-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  border: 2px solid #6ee7b7;
}

.coa-badge i {
  font-size: 16px;
}

.ri-so {
  display: block;
  font-weight: 700;
  color: #0f172a;
  font-size: 15px;
}
.ri-cust {
  font-size: 13px;
  color: #64748b;
  display: block;
  margin-top: 4px;
}
.ri-right {
  text-align: right;
}
.ri-amount {
  font-weight: 700;
  color: var(--primary);
  font-size: 14px;
}
.ri-date {
  font-size: 12px;
  color: #94a3b8;
  display: block;
  margin-bottom: 4px;
}

.split-grid {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 24px;
  align-items: stretch;
  min-height: 0;
}

.left-col,
.right-col {
  min-width: 0;
  min-height: 0;
}

.left-col {
  display: flex;
  flex-direction: column;
}

.form-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.card-header-clean {
  padding: 20px 30px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-header-clean h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-card .card-body {
  padding: 30px;
}

form {
  display: block; /* Change from flex to block to avoid height issues */
}

.modern-input {
  width: 100%;
  max-width: 100%;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 15px;
  color: #334155;
  transition: all 0.2s;
  height: 50px;
  box-sizing: border-box;
}
.search-field {
  padding-left: 50px;
  height: 55px;
  font-size: 16px;
}

.modern-input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
.modern-input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  color: #94a3b8;
}

textarea.modern-input {
  height: auto;
  padding: 16px;
  resize: vertical;
  min-height: 80px;
}

.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.form-group {
  min-width: 0;
  position: relative;
}
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

select.modern-input {
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
  cursor: pointer;
}

select.modern-input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 24px 0;
}
.mt-3 {
  margin-top: 24px;
}

.input-currency-group {
  position: relative;
  width: 100%;
}
.curr-symbol {
  position: absolute;
  left: 16px;
  top: 14px;
  font-size: 15px;
  color: #64748b;
  font-weight: 700;
  z-index: 5;
  pointer-events: none;
}
.input-currency-group .modern-input {
  padding-left: 50px;
}
.modern-input.input-amount {
  padding-left: 55px;
  font-size: 18px;
  color: #0f172a;
}

.quick-actions {
  margin-top: 8px;
}
.badge-percent {
  display: inline-block;
  background: #ecfdf5;
  color: var(--primary);
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  margin-right: 8px;
  cursor: pointer;
  border: 1px solid #d1fae5;
  font-weight: 600;
  transition: 0.2s;
}
.badge-percent:hover {
  background: var(--primary);
  color: white;
}

.sticky-wrapper {
  position: sticky;
  top: 20px;
}
.summary-card {
  overflow: hidden;
  border: 1px solid #bfdbfe;
}
.summary-header {
  background: #eff6ff;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dbeafe;
}
.summary-header span {
  font-weight: 700;
  font-size: 13px;
  color: #1e40af;
}
.badge-so {
  background: white;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #93c5fd;
  font-size: 12px;
}

.summary-body {
  padding: 24px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}
.info-row label {
  color: #64748b;
}
.val {
  font-weight: 600;
  text-align: right;
}
.fw-bold {
  font-weight: 700;
}
.text-dark {
  color: #0f172a;
}
.text-primary {
  color: var(--primary);
}
.dashed-line {
  border-bottom: 1px dashed #cbd5e1;
  margin: 16px 0;
}
.text-danger {
  color: #ef4444;
}

.total-card {
  background: #0f172a;
  color: white;
  border: none;
  text-align: center;
  padding: 24px;
  margin-top: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.total-value {
  font-size: 26px;
  font-weight: 800;
  margin: 8px 0;
  color: #4ade80;
}
.total-label {
  font-size: 12px;
  letter-spacing: 1px;
  opacity: 0.8;
  font-weight: 600;
}
.total-note {
  font-size: 12px;
  opacity: 0.6;
  font-style: italic;
}

.card-footer {
  padding: 24px 30px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 12px 12px;
}

.btn-submit {
  width: 100%;
  background-color: #10b981 !important; /* Hijau Solid */
  color: #ffffff !important; /* Putih Solid */
  border: 1px solid #059669;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  transition: 0.2s;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 54px;
  position: relative;
  z-index: 1001;
}

.btn-submit span,
.btn-submit i {
  color: #ffffff !important;
}

.btn-submit:hover:not(:disabled) {
  background-color: #059669 !important;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #94a3b8 !important; /* Abu-abu Solid */
  color: rgba(255, 255, 255, 0.8) !important;
  border-color: #cbd5e1;
  box-shadow: none;
}

.helper-text {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
  display: block;
}

.spinner-small {
  position: absolute;
  right: 16px;
  top: 18px;
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  z-index: 2;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

@media (max-width: 900px) {
  .split-grid {
    grid-template-columns: 1fr;
  }
  .row-2 {
    grid-template-columns: 1fr;
  }
  .sticky-wrapper {
    position: static;
  }
}
</style>
