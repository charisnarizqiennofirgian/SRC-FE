<template>
  <DashboardLayout>
    <!-- PAGE HEADER -->
    <div class="page-header-modern">
      <div class="header-content-wrapper">
        <div class="header-left">
          <div class="icon-badge-shipping">
            <span class="icon">🚚</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Buat Pengiriman Barang</h1>
            <p class="page-subtitle">Kelola surat jalan dan packing list untuk pengiriman ekspor</p>
          </div>
        </div>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loadingMaster" class="loading-container-modern">
      <div class="loading-content">
        <div class="spinner-modern"></div>
        <p class="loading-text">Memuat data pesanan...</p>
      </div>
    </div>

    <!-- ERROR STATE -->
    <div v-else-if="errorState" class="error-container-modern">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Terjadi Kesalahan</h3>
        <p class="error-message">{{ errorState }}</p>
        <button @click="retryLoad" class="btn-retry">
          <span class="btn-icon">🔄</span>
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- FORM CONTENT -->
    <form v-else @submit.prevent="handleSubmit" class="form-container-modern">
      <!-- SECTION 1: PILIH SALES ORDER -->
      <div class="form-card">
        <div class="card-header">
          <span class="header-icon">📋</span>
          <h2 class="card-title">Pilih Pesanan Penjualan</h2>
        </div>
        <div class="card-body">
          <div class="form-group-modern">
            <label class="form-label-modern"> Sales Order <span class="required">*</span> </label>
            <div class="select-wrapper-modern">
              <select
                v-model="form.sales_order_id"
                @change="onSalesOrderSelect"
                class="form-select-modern"
                required
              >
                <option disabled value="">-- Pilih Pesanan Penjualan --</option>
                <option v-for="so in openSalesOrders" :key="so.id" :value="so.id">
                  {{ so.so_number }} - {{ so.buyer.name }}
                </option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>

          <!-- MODE PENGIRIMAN -->
          <div class="form-group-modern" style="margin-top: 1.5rem">
            <label class="form-label-modern">Mode Pengiriman</label>
            <div style="display: flex; gap: 1rem; align-items: center">
              <label style="display: flex; align-items: center; gap: 0.35rem">
                <input type="radio" value="SEA" v-model="form.shipment_mode" />
                <span>Sea Freight (Laut)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.35rem">
                <input type="radio" value="AIR" v-model="form.shipment_mode" />
                <span>Air Freight (Udara)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <template v-if="selectedSalesOrder">
        <!-- SECTION 2: SHIPPER INFO -->
        <div class="form-card">
          <div class="card-header">
            <span class="header-icon">🏢</span>
            <h2 class="card-title">Informasi Pengirim</h2>
          </div>
          <div class="card-body">
            <div class="form-group-modern">
              <label class="form-label-modern">Shipper (Pengirim)</label>
              <textarea class="form-textarea-modern readonly-field" readonly rows="4">
PT. SURYA BANGKIT CEMERLANG
JL.RAYA SEMARANG PURWODADI KM 18
KARANGAWEN DEMAK 59566
INDONESIA</textarea
              >
            </div>
          </div>
        </div>

        <!-- SECTION 3: DETAIL PENGIRIMAN & DOKUMEN (FULL DIPULIHKAN) -->
        <div class="form-card">
          <div class="card-header">
            <span class="header-icon">🌍</span>
            <h2 class="card-title">Detail Pengiriman & Dokumen</h2>
          </div>
          <div class="card-body">
            <!-- Pihak Terkait -->
            <div class="form-subsection">
              <h3 class="subsection-title">📬 Pihak Terkait</h3>
              <div class="form-grid-2col">
                <!-- Consignee -->
                <div class="form-group-modern">
                  <label class="form-label-modern">Consignee (Penerima Barang)</label>
                  <input
                    v-model="form.consignee_info.name"
                    type="text"
                    class="form-input-modern"
                    placeholder="Nama penerima"
                  />
                  <textarea
                    v-model="form.consignee_info.address"
                    rows="3"
                    class="form-textarea-modern input-spacing"
                    placeholder="Alamat lengkap penerima"
                  ></textarea>
                </div>

                <!-- Applicant -->
                <div class="form-group-modern">
                  <label class="form-label-modern">Applicant (Pemohon)</label>
                  <input
                    v-model="form.applicant_info.name"
                    type="text"
                    class="form-input-modern"
                    placeholder="Nama pemohon"
                  />
                  <textarea
                    v-model="form.applicant_info.address"
                    rows="3"
                    class="form-textarea-modern input-spacing"
                    placeholder="Alamat lengkap pemohon"
                  ></textarea>
                </div>
              </div>

              <!-- Notify -->
              <div class="form-group-modern notify-section">
                <label class="form-label-modern">Notify (Pihak yang Diberitahu)</label>
                <div class="form-grid-2col">
                  <input
                    v-model="form.notify_info.name"
                    type="text"
                    class="form-input-modern"
                    placeholder="Nama pihak notify"
                  />
                  <textarea
                    v-model="form.notify_info.address"
                    rows="3"
                    class="form-textarea-modern"
                    placeholder="Alamat lengkap notify"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Syarat Pengiriman -->
            <div class="form-subsection">
              <h3 class="subsection-title">📝 Syarat Pengiriman</h3>
              <div class="form-grid-3col">
                <div class="form-group-modern">
                  <label class="form-label-modern">Incoterm</label>
                  <input
                    v-model="form.incoterm"
                    type="text"
                    class="form-input-modern"
                    placeholder="FOB, CIF, dll"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">Freight Terms</label>
                  <input
                    v-model="form.freight_terms"
                    type="text"
                    class="form-input-modern"
                    placeholder="Prepaid/Collect"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">EU Factory Number</label>
                  <input
                    v-model="form.eu_factory_number"
                    type="text"
                    class="form-input-modern"
                    placeholder="No. pabrik EU"
                  />
                </div>
              </div>
            </div>

            <!-- Container & Seal -->
            <div class="form-subsection">
              <h3 class="subsection-title">📦 Container & Seal</h3>

              <div class="form-grid-3col">
                <div class="form-group-modern">
                  <label class="form-label-modern">Container Type (Tipe Container)</label>
                  <input
                    v-model="form.container_type"
                    type="text" n
                    class="form-input-modern"
                    placeholder="Contoh: 2x40HC, 1x20FT"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">Container Number</label>
                  <input
                    v-model="form.container_number"
                    type="text"
                    class="form-input-modern"
                    placeholder="ABCD1234567"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">Seal Number</label>
                  <input
                    v-model="form.seal_number"
                    type="text"
                    class="form-input-modern"
                    placeholder="SL123456"
                  />
                </div>
              </div>

              <div class="form-grid-3col bl-date-row">
                <div class="form-group-modern">
                  <label class="form-label-modern">PEB Number (Nomor PEB)</label>
                  <input
                    v-model="form.peb_number"
                    type="text"
                    class="form-input-modern"
                    placeholder="No. PEB"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">BL Number</label>
                  <input
                    v-model="form.bl_number"
                    type="text"
                    class="form-input-modern"
                    placeholder="Bill of Lading No"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">BL Date</label>
                  <input v-model="form.bl_date" type="date" class="form-input-modern" />
                </div>
              </div>
            </div>

            <!-- Forwarder (Messrs) -->
            <div class="form-subsection">
              <h3 class="subsection-title">📨 Forwarder Information (Messrs)</h3>
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Forwarder Name & Address (Nama & Alamat Forwarder)
                </label>
                <textarea
                  v-model="form.forwarder_name"
                  rows="5"
                  class="form-textarea-modern"
                  placeholder="Contoh:&#10;DHL Global Forwarding Indonesia&#10;Semarang Branch Office&#10;Jl. Pemuda No. 88A Semarang 50133&#10;Ibu Fetri Agustine&#10;Tlp: +62 816 0240 7878"
                ></textarea>
              </div>
            </div>

            <!-- Pelabuhan & Tujuan -->
            <div class="form-subsection">
              <h3 class="subsection-title">⚓ Pelabuhan & Tujuan</h3>
              <div class="form-grid-3col">
                <div class="form-group-modern">
                  <label class="form-label-modern">Port of Loading</label>
                  <input
                    v-model="form.port_of_loading"
                    type="text"
                    class="form-input-modern"
                    placeholder="Pelabuhan muat"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">Port of Discharge</label>
                  <input
                    v-model="form.port_of_discharge"
                    type="text"
                    class="form-input-modern"
                    placeholder="Pelabuhan bongkar"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">Final Destination</label>
                  <input
                    v-model="form.final_destination"
                    type="text"
                    class="form-input-modern"
                    placeholder="Tujuan akhir"
                  />
                </div>
              </div>
            </div>

            <!-- Kapal -->
            <div class="form-subsection">
              <h3 class="subsection-title">🚢 Informasi Kapal</h3>
              <div class="form-grid-2col">
                <div class="form-group-modern">
                  <label class="form-label-modern">Feeder Vessel</label>
                  <input
                    v-model="form.vessel_name"
                    type="text"
                    class="form-input-modern"
                    placeholder="Nama kapal feeder"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">Mother Vessel</label>
                  <input
                    v-model="form.mother_vessel"
                    type="text"
                    class="form-input-modern"
                    placeholder="Nama kapal induk"
                  />
                </div>
              </div>
            </div>

            <!-- REX & Goods -->
            <div class="form-subsection">
              <h3 class="subsection-title">📋 REX & Deskripsi Barang</h3>
              <div class="form-grid-3col">
                <div class="form-group-modern">
                  <label class="form-label-modern">REX Info</label>
                  <input
                    v-model="form.rex_info"
                    type="text"
                    class="form-input-modern"
                    placeholder="Keterangan REX"
                  />
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">REX Date</label>
                  <input v-model="form.rex_date" type="date" class="form-input-modern" />
                </div>

                <div class="form-group-modern span-full">
                  <label class="form-label-modern">Goods Description</label>
                  <input
                    v-model="form.goods_description"
                    type="text"
                    class="form-input-modern"
                    placeholder="TEAK GARDEN FURNITURE AND ACCESSORIES"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 4: BARCODE UPLOAD -->
        <div class="form-card">
          <div class="card-header">
            <span class="header-icon">📸</span>
            <h2 class="card-title">Barcode Kemendag</h2>
          </div>
          <div class="card-body">
            <div class="form-group-modern">
              <label class="form-label-modern">
                Upload Barcode (PNG/JPG) <span class="required">*</span>
              </label>
              <div class="file-upload-area">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  class="file-input-hidden"
                  id="barcodeInput"
                  @change="handleBarcodeImageUpload"
                  required
                />
                <label for="barcodeInput" class="file-upload-label">
                  <span class="upload-icon">📁</span>
                  <span class="upload-text">Pilih File Barcode</span>
                  <span class="upload-hint">PNG atau JPG, maksimal 1MB</span>
                </label>
              </div>
              <div v-if="barcodeImagePreview" class="barcode-preview">
                <img :src="barcodeImagePreview" alt="Preview Barcode" class="preview-image" />
                <p class="preview-success">✓ Gambar barcode siap digunakan</p>
              </div>
              <div v-if="barcodeImageError" class="error-text">{{ barcodeImageError }}</div>
            </div>
          </div>
        </div>

        <!-- SECTION 5: BARANG DIKIRIM -->
        <div class="form-card">
          <div class="card-header">
            <span class="header-icon">📦</span>
            <h2 class="card-title">Barang yang Dikirim</h2>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table-modern">
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th class="text-center">Qty Dipesan</th>
                    <th class="text-center">Qty Terkirim</th>
                    <th class="text-center">Stok Tersedia</th>
                    <th v-if="form.shipment_mode === 'AIR'" class="text-center">Kirim (Crate)</th>
                    <th class="text-center">Kirim (Pcs)</th>
                    <th class="text-center">Kirim (Box)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in form.details" :key="item.sales_order_detail_id">
                    <td class="item-name">{{ item.item_name }}</td>
                    <td class="text-center">{{ item.quantity_ordered }}</td>
                    <td class="text-center">{{ item.quantity_already_shipped }}</td>
                    <td class="text-center">
                      <span class="stock-badge">{{ item.current_stock }}</span>
                    </td>

                    <td v-if="form.shipment_mode === 'AIR'" class="text-center">
                      <input
                        v-model.number="item.quantity_crates"
                        type="number"
                        min="0"
                        class="form-input-table"
                        placeholder="0"
                      />
                    </td>

                    <td class="text-center">
                      <input
                        v-model.number="item.quantity_shipped"
                        type="number"
                        min="0"
                        :max="Math.min(item.quantity_sisa, item.current_stock)"
                        class="form-input-table"
                        placeholder="0"
                      />
                      <div v-if="item.error" class="error-text-small">{{ item.error }}</div>
                    </td>
                    <td class="text-center">
                      <input
                        v-model.number="item.quantity_boxes"
                        type="number"
                        min="0"
                        class="form-input-table"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- FORM ACTIONS -->
      <div class="form-actions-modern">
        <button @click.prevent="goBack" type="button" class="btn-secondary-modern">
          <span class="btn-icon">↩️</span>
          <span>Batal</span>
        </button>
        <button type="submit" class="btn-primary-modern" :disabled="isSaving || !isFormValid">
          <span v-if="isSaving" class="spinner-inline"></span>
          <span v-else class="btn-icon">💾</span>
          <span>{{ isSaving ? 'Menyimpan...' : 'Simpan & Potong Stok' }}</span>
        </button>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'
import DashboardLayout from '../../components/DashboardLayout.vue'

const router = useRouter()
const toast = useToast()

const loadingMaster = ref(true)
const isSaving = ref(false)
const errorState = ref(null)

const openSalesOrders = ref([])
const selectedSalesOrder = ref(null)

const barcodeImageFile = ref(null)
const barcodeImagePreview = ref(null)
const barcodeImageError = ref('')

const form = reactive({
  sales_order_id: '',
  buyer_id: '',
  delivery_date: new Date().toISOString().split('T')[0],
  incoterm: '',
  bl_date: null,
  vessel_name: '',
  mother_vessel: '',
  eu_factory_number: '',
  port_of_loading: '',
  port_of_discharge: '',
  final_destination: '',
  bl_number: '',
  rex_info: '',
  freight_terms: '',
  container_number: '',
  seal_number: '',
  rex_date: null,
  goods_description: '',
  rex_certificate_file: null,
  consignee_info: { name: '', address: '' },
  applicant_info: { name: '', address: '' },
  notify_info: { name: '', address: '' },
  details: [],
  barcode_image: '',

  forwarder_name: '',
  peb_number: '',
  container_type: '',

  shipment_mode: 'SEA',
})

onMounted(async () => {
  await fetchOpenSalesOrders()
})

const fetchOpenSalesOrders = async () => {
  loadingMaster.value = true
  try {
    const response = await apiClient.get('/sales-orders-open')
    openSalesOrders.value = response.data.data.data
  } catch (error) {
    console.error('Error fetching open sales orders:', error)
    toast.error('Gagal memuat daftar pesanan yang siap kirim.')
    errorState.value = 'Gagal mengambil data pesanan'
  } finally {
    loadingMaster.value = false
  }
}

const onSalesOrderSelect = () => {
  const soId = form.sales_order_id
  const found = openSalesOrders.value.find((so) => so.id == soId)
  if (found) {
    selectedSalesOrder.value = found
    form.buyer_id = found.buyer_id
    form.details = found.details
      .map((detail) => {
        const qtySisa = parseFloat(detail.quantity) - parseFloat(detail.quantity_shipped)
        return {
          sales_order_detail_id: detail.id,
          item_id: detail.item_id,
          item_name: detail.item_name,
          quantity_ordered: parseFloat(detail.quantity),
          quantity_already_shipped: parseFloat(detail.quantity_shipped),
          quantity_sisa: qtySisa,
          current_stock: parseFloat(detail.item.stock),
          delivery_date_promise: detail.delivery_date,
          quantity_shipped: 0,
          quantity_boxes: null,
          quantity_crates: null,
          error: null,
        }
      })
      .filter((detail) => detail.quantity_sisa > 0)
  } else {
    selectedSalesOrder.value = null
    form.details = []
  }
}

const handleBarcodeImageUpload = (event) => {
  const file = event.target.files[0]
  barcodeImageError.value = ''
  barcodeImageFile.value = null
  barcodeImagePreview.value = null

  if (!file) return
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    barcodeImageError.value = 'Hanya file PNG/JPG yang diperbolehkan.'
    event.target.value = ''
    return
  }
  if (file.size > 1024 * 1024) {
    barcodeImageError.value = 'Ukuran gambar maksimal 1MB.'
    event.target.value = ''
    return
  }
  barcodeImageFile.value = file
  barcodeImagePreview.value = URL.createObjectURL(file)
}

const handleSubmit = async () => {
  isSaving.value = true
  const payloadDetails = form.details
    .filter((d) => d.quantity_shipped > 0)
    .map((d) => ({
      sales_order_detail_id: d.sales_order_detail_id,
      item_id: d.item_id,
      quantity_shipped: d.quantity_shipped,
      quantity_boxes: d.quantity_boxes || null,
      quantity_crates: form.shipment_mode === 'AIR' ? d.quantity_crates || null : null,
    }))

  if (payloadDetails.length === 0) {
    toast.error('Tidak ada barang yang dikirim. Isi "Qty Kirim (Pcs)" minimal 1 barang.')
    isSaving.value = false
    return
  }

  const formData = new FormData()
  formData.append('sales_order_id', form.sales_order_id)
  formData.append('buyer_id', form.buyer_id)
  formData.append('delivery_date', form.delivery_date)
  formData.append('incoterm', form.incoterm)
  formData.append('bl_date', form.bl_date || '')
  formData.append('vessel_name', form.vessel_name)
  formData.append('mother_vessel', form.mother_vessel)
  formData.append('eu_factory_number', form.eu_factory_number)
  formData.append('port_of_loading', form.port_of_loading)
  formData.append('port_of_discharge', form.port_of_discharge)
  formData.append('final_destination', form.final_destination)
  formData.append('bl_number', form.bl_number)
  formData.append('rex_info', form.rex_info)
  formData.append('freight_terms', form.freight_terms)
  formData.append('container_number', form.container_number)
  formData.append('seal_number', form.seal_number)
  formData.append('rex_date', form.rex_date || '')
  formData.append('goods_description', form.goods_description)
  formData.append('consignee_info', JSON.stringify(form.consignee_info))
  formData.append('applicant_info', JSON.stringify(form.applicant_info))
  formData.append('notify_info', JSON.stringify(form.notify_info))
  formData.append('details', JSON.stringify(payloadDetails))

  formData.append('forwarder_name', form.forwarder_name)
  formData.append('peb_number', form.peb_number)
  formData.append('container_type', form.container_type)

  formData.append('shipment_mode', form.shipment_mode)

  if (form.rex_certificate_file) {
    formData.append('rex_certificate_file', form.rex_certificate_file)
  }

  if (barcodeImageFile.value) {
    formData.append('barcode_image', barcodeImageFile.value)
  }

  try {
    const response = await apiClient.post('/delivery-orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (response.data.success) {
      toast.success(response.data.message)
      barcodeImageFile.value = null
      barcodeImagePreview.value = null
      barcodeImageError.value = ''
      router.push({ name: 'DaftarPengiriman' })
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan pengiriman.')
  } finally {
    isSaving.value = false
  }
}

const isFormValid = computed(() => {
  if (!form.sales_order_id || form.details.length === 0) return false
  return !form.details.some((d) => d.error)
})

const retryLoad = async () => {
  errorState.value = null
  await fetchOpenSalesOrders()
}

const goBack = () => {
  router.push({ name: 'DaftarPengiriman' })
}
</script>

<style scoped>
/* ========================================
   MODERN PAGE HEADER
   ======================================== */
.page-header-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2.5rem;
  border-radius: 20px;
  margin-bottom: 2.5rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.header-content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.icon-badge-shipping {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-text .page-title {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.5px;
}

.header-text .page-subtitle {
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-weight: 500;
}

/* ========================================
   LOADING & ERROR STATES
   ======================================== */
.loading-container-modern,
.error-container-modern {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.loading-content,
.error-content {
  text-align: center;
  background: white;
  padding: 3.5rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  max-width: 450px;
}

.spinner-modern {
  width: 60px;
  height: 60px;
  border: 6px solid #f0f2f5;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.75rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.0625rem;
  color: #666;
  font-weight: 600;
}

.error-icon {
  font-size: 4.5rem;
  margin-bottom: 1.25rem;
}

.error-title {
  font-size: 1.625rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 800;
}

.error-message {
  color: #666;
  margin-bottom: 1.75rem;
  line-height: 1.7;
  font-size: 1rem;
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.0625rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-retry:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.4);
}

/* ========================================
   FORM CONTAINER
   ======================================== */
.form-container-modern {
  max-width: 1200px;
  margin: 0 auto 3rem;
}

/* ========================================
   FORM CARD
   ======================================== */
.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  overflow: hidden;
  transition:
    box-shadow 0.3s,
    transform 0.3s;
  border: 1px solid #f0f2f5;
}

.form-card:hover {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 3px solid #e9ecef;
}

.header-icon {
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border-radius: 12px;
}

.card-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.25px;
}

.card-body {
  padding: 2.5rem;
}

/* ========================================
   SUBSECTION
   ======================================== */
.form-subsection {
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.form-subsection:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 1.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

/* ========================================
   FORM GRID
   ======================================== */
.form-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem;
}

.form-grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
}

.span-full {
  grid-column: 1 / -1;
}

/* ✅ JARAK KHUSUS UNTUK NOTIFY */
.notify-section {
  margin-top: 1.75rem;
}

/* ✅ JARAK KHUSUS UNTUK BL DATE */
.bl-date-row {
  margin-top: 1.75rem;
}

@media (max-width: 1024px) {
  .form-grid-3col {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .form-grid-2col,
  .form-grid-3col {
    grid-template-columns: 1fr;
  }

  .card-body {
    padding: 1.5rem;
  }
}

/* ========================================
   FORM ELEMENTS
   ======================================== */
.form-group-modern {
  margin-bottom: 0;
}

.form-label-modern {
  display: block;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  letter-spacing: 0.015em;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.form-input-modern,
.form-select-modern,
.form-textarea-modern {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
  color: #1f2937;
  font-weight: 500;
}

.form-input-modern::placeholder,
.form-select-modern::placeholder,
.form-textarea-modern::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.form-input-modern:focus,
.form-select-modern:focus,
.form-textarea-modern:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 5px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.form-textarea-modern {
  resize: vertical;
  min-height: 90px;
  line-height: 1.6;
}

/* ✅ JARAK VERTIKAL ANTARA INPUT DAN TEXTAREA */
.input-spacing {
  margin-top: 1rem !important;
}

.readonly-field {
  background: #f9fafb;
  color: #374151;
  font-weight: 700;
  cursor: not-allowed;
  border-color: #d1d5db;
}

.select-wrapper-modern {
  position: relative;
}

.select-arrow {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  font-size: 0.875rem;
}

/* ========================================
   FILE UPLOAD
   ======================================== */
.file-upload-area {
  margin-bottom: 1.5rem;
}

.file-input-hidden {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  border: 3px dashed #d1d5db;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #fafbfc, #f9fafb);
  min-height: 180px;
}

.file-upload-label:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f8f9ff, #f0f2ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.upload-text {
  font-size: 1.0625rem;
  color: #1f2937;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.barcode-preview {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 3px solid #86efac;
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
}

.preview-image {
  max-width: 320px;
  max-height: 140px;
  display: block;
  margin: 0 auto 1rem;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.preview-success {
  color: #16a34a;
  font-size: 0.9375rem;
  font-weight: 700;
  margin: 0;
}

.error-text {
  color: #ef4444;
  font-size: 0.9375rem;
  margin-top: 0.75rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 4px solid #ef4444;
}

/* ========================================
   TABLE
   ======================================== */
.table-responsive {
  overflow-x: auto;
  margin: -0.5rem;
  padding: 0.5rem;
}

.table-modern {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-modern thead {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.table-modern th {
  padding: 1.25rem 1rem;
  font-size: 0.875rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #374151;
  border-bottom: 3px solid #d1d5db;
  text-align: left;
  white-space: nowrap;
  letter-spacing: 0.025em;
}

.table-modern td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
  font-size: 0.9375rem;
}

.table-modern tbody tr {
  transition: all 0.2s ease;
}

.table-modern tbody tr:hover {
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.item-name {
  font-weight: 700;
  color: #1f2937;
}

.text-center {
  text-align: center;
}

.stock-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9375rem;
  box-shadow: 0 2px 4px rgba(30, 64, 175, 0.15);
}

.form-input-table {
  width: 110px;
  padding: 0.75rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  text-align: center;
  transition: all 0.2s;
  font-weight: 600;
}

.form-input-table:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.error-text-small {
  color: #ef4444;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
  font-weight: 600;
}

/* ========================================
   FORM ACTIONS
   ======================================== */
.form-actions-modern {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  padding: 2rem 2.5rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
}

.btn-secondary-modern,
.btn-primary-modern {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.125rem 2.25rem;
  border: none;
  border-radius: 14px;
  font-size: 1.0625rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.btn-secondary-modern {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  border: 2.5px solid #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-secondary-modern:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-primary-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
}

.btn-primary-modern:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.45);
}

.btn-primary-modern:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-primary-modern:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner-inline {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn-icon {
  font-size: 1.25rem;
}
</style>
