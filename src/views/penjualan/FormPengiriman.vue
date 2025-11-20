<template>
  <DashboardLayout>
    <div class="page-header-form"></div>
    <div v-if="loadingMaster" class="loading-container-form">
      <div class="loading-animation-form">
        <div class="spinner-form"></div>
        <p class="loading-text-form">Memuat data pesanan...</p>
      </div>
    </div>
    <div v-else-if="errorState" class="error-container-form">
      <div class="error-content-form">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Terjadi Kesalahan</h3>
        <p class="error-message">{{ errorState }}</p>
        <button @click="retryLoad" class="btn-retry">Coba Lagi</button>
      </div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="form-container-so">
      <div class="form-section-so">
        <div class="form-group-so">
          <label class="form-label-so">
            Pilih Pesanan (SO) Siap Kirim <span class="required-mark">*</span>
          </label>
          <select
            v-model="form.sales_order_id"
            @change="onSalesOrderSelect"
            class="form-input-so"
            required
          >
            <option disabled value="">Pilih Pesanan Penjualan...</option>
            <option v-for="so in openSalesOrders" :key="so.id" :value="so.id">
              {{ so.so_number }} - ({{ so.buyer.name }})
            </option>
          </select>
        </div>
      </div>

      <template v-if="selectedSalesOrder">
        <div class="form-section-so">
          <div class="section-content-so">
            <div class="form-grid-3">
              <!-- SHIPPER -->
              <div class="form-group-so">
                <label class="form-label-so">Shipper</label>
                <input v-model="form.shipper_name" type="text" class="form-input-so" />
                <textarea
                  v-model="form.shipper_address"
                  rows="2"
                  class="form-textarea-so"
                ></textarea>
              </div>
              <!-- CONSIGNEE -->
              <div class="form-group-so">
                <label class="form-label-so">Consignee (Penerima)</label>
                <input v-model="form.consignee_info.name" type="text" class="form-input-so" />
                <textarea
                  v-model="form.consignee_info.address"
                  rows="2"
                  class="form-textarea-so"
                ></textarea>
              </div>
              <!-- APPLICANT -->
              <div class="form-group-so">
                <label class="form-label-so">Applicant (Pemohon)</label>
                <input v-model="form.applicant_info.name" type="text" class="form-input-so" />
                <textarea
                  v-model="form.applicant_info.address"
                  rows="2"
                  class="form-textarea-so"
                ></textarea>
              </div>
              <!-- NOTIFY -->
              <div class="form-group-so">
                <label class="form-label-so">Notify</label>
                <input v-model="form.notify_info.name" type="text" class="form-input-so" />
                <textarea
                  v-model="form.notify_info.address"
                  rows="2"
                  class="form-textarea-so"
                ></textarea>
              </div>
              <!-- INCOTERM -->
              <div class="form-group-so">
                <label class="form-label-so">Incoterm</label>
                <input v-model="form.incoterm" type="text" class="form-input-so" />
              </div>
              <!-- FREIGHT -->
              <div class="form-group-so">
                <label class="form-label-so">Freight</label>
                <input v-model="form.freight_terms" type="text" class="form-input-so" />
              </div>
              <!-- CONTAINER -->
              <div class="form-group-so">
                <label class="form-label-so">Container</label>
                <input v-model="form.container_number" type="text" class="form-input-so" />
              </div>
              <!-- REX -->
              <div class="form-group-so">
                <label class="form-label-so">REX</label>
                <input v-model="form.rex_info" type="text" class="form-input-so" />
              </div>
              <!-- EU FACTORY NUMBER -->
              <div class="form-group-so">
                <label class="form-label-so">EU Factory Number</label>
                <input v-model="form.eu_factory_number" type="text" class="form-input-so" />
              </div>
              <!-- PORT OF LOADING -->
              <div class="form-group-so">
                <label class="form-label-so">Port of Loading</label>
                <input v-model="form.port_of_loading" type="text" class="form-input-so" />
              </div>
              <!-- PORT OF DISCHARGE -->
              <div class="form-group-so">
                <label class="form-label-so">Port of Discharge</label>
                <input v-model="form.port_of_discharge" type="text" class="form-input-so" />
              </div>
              <!-- FINAL DESTINATION -->
              <div class="form-group-so">
                <label class="form-label-so">Final Destination</label>
                <input v-model="form.final_destination" type="text" class="form-input-so" />
              </div>
              <!-- FEEDER VESSEL -->
              <div class="form-group-so">
                <label class="form-label-so">Feeder Vessel</label>
                <input v-model="form.vessel_name" type="text" class="form-input-so" />
              </div>
              <!-- MOTHER VESSEL -->
              <div class="form-group-so">
                <label class="form-label-so">Mother Vessel</label>
                <input v-model="form.mother_vessel" type="text" class="form-input-so" />
              </div>
              <!-- REX DATE -->
              <div class="form-group-so">
                <label class="form-label-so">REX DATE</label>
                <input v-model="form.rex_date" type="date" class="form-input-so" />
              </div>
              <!-- DESCRIPTION OF GOODS -->
              <div class="form-group-so">
                <label class="form-label-so">Description of Goods</label>
                <input v-model="form.goods_description" type="text" class="form-input-so" />
              </div>
              <!-- BL NUMBER -->
              <div class="form-group-so">
                <label class="form-label-so">BL Number</label>
                <input v-model="form.bl_number" type="text" class="form-input-so" />
              </div>
              <!-- BL DATE -->
              <div class="form-group-so">
                <label class="form-label-so">BL Date</label>
                <input v-model="form.bl_date" type="date" class="form-input-so" />
              </div>
              <!-- SEAL NUMBER -->
              <div class="form-group-so">
                <label class="form-label-so">Seal Number</label>
                <input v-model="form.seal_number" type="text" class="form-input-so" />
              </div>
              <!-- BARCODE -->
              <div class="form-group-so">
                <label class="form-label-so">
                  Barcode Kemendag (PNG/JPG) <span style="color: red">*</span>
                  <span style="font-weight: normal; font-size: 11px; display: block">
                    Konversi PDF barcode di
                    <a href="https://smallpdf.com/pdf-to-jpg" target="_blank" style="color: #007bff"
                      >smallpdf.com/pdf-to-jpg</a
                    >. Upload 1 barcode tiap transaksi ekspor!
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  class="form-input-so"
                  @change="handleBarcodeImageUpload"
                />
                <div v-if="barcodeImagePreview" style="margin-top: 7px">
                  <img
                    :src="barcodeImagePreview"
                    alt="Preview Barcode Kemendag"
                    style="
                      max-width: 210px;
                      max-height: 80px;
                      display: block;
                      border: 1px solid #bbb;
                    "
                  />
                  <div style="color: #008700; font-size: 11px">✓ Gambar barcode siap cetak.</div>
                </div>
                <div
                  v-if="barcodeImageError"
                  class="error-message"
                  style="color: red; font-size: 11px"
                >
                  {{ barcodeImageError }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section-so">
          <div class="section-header-so">
            <span class="section-title-so">Barang Dikirim</span>
          </div>
          <div class="section-content-so">
            <table class="data-table-so">
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th>Qty Dipesan</th>
                  <th>Qty Sudah Dikirim</th>
                  <th>Stok</th>
                  <th>Kirim (Pcs)</th>
                  <th>Kirim (Box)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in form.details" :key="item.sales_order_detail_id">
                  <td>{{ item.item_name }}</td>
                  <td>{{ item.quantity_ordered }}</td>
                  <td>{{ item.quantity_already_shipped }}</td>
                  <td>{{ item.current_stock }}</td>
                  <td>
                    <input
                      v-model.number="item.quantity_shipped"
                      type="number"
                      min="0"
                      :max="Math.min(item.quantity_sisa, item.current_stock)"
                      class="form-input-so form-input-sm"
                    />
                    <div v-if="item.error" class="error-message">{{ item.error }}</div>
                  </td>
                  <td>
                    <input
                      v-model.number="item.quantity_boxes"
                      type="number"
                      min="0"
                      class="form-input-so form-input-sm"
                      placeholder="Manual"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="form-actions-so">
          <button @click.prevent="goBack" type="button" class="btn-cancel-so">
            <span class="btn-icon">↩️</span>
            <span class="btn-text">Batal</span>
          </button>
          <button
            type="submit"
            class="btn-submit-so"
            :disabled="isSaving || !isFormValid"
            style="background-color: #007bff"
          >
            <span v-if="isSaving" class="loading-spinner-inline"></span>
            <span v-else class="btn-icon">💾</span>
            <span class="btn-text">Simpan & Potong Stok</span>
          </button>
        </div>
      </template>
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
  driver_name: '',
  vehicle_number: '',
  notes: '',
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
  shipper_name: '',
  shipper_address: '',
  consignee_info: { name: '', address: '' },
  applicant_info: { name: '', address: '' },
  notify_info: { name: '', address: '' },
  details: [],
  barcode_image: '',
})

onMounted(async () => {
  await fetchOpenSalesOrders()
})

const fetchOpenSalesOrders = async () => {
  loadingMaster.value = true
  try {
    const response = await apiClient.get('/sales-orders-open')
    openSalesOrders.value = response.data.data
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
    form.goods_description = ''
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
          error: null,
        }
      })
      .filter((detail) => detail.quantity_sisa > 0)
    // (Jika mau, dapat auto-isi data dari SO, contoh:)
    // form.incoterm = found.incoterm || ''
    // dst.
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
  formData.append('driver_name', form.driver_name)
  formData.append('vehicle_number', form.vehicle_number)
  formData.append('notes', form.notes)
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
  formData.append('shipper_name', form.shipper_name)
  formData.append('shipper_address', form.shipper_address)
  formData.append('consignee_info', JSON.stringify(form.consignee_info))
  formData.append('applicant_info', JSON.stringify(form.applicant_info))
  formData.append('notify_info', JSON.stringify(form.notify_info))
  formData.append('details', JSON.stringify(payloadDetails))
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
/* (Anda bisa menggunakan style CSS dari file FormSalesOrder.vue Anda) */
.form-container-so {
  max-width: 900px;
  margin: 0 auto 2rem auto;
}

/* Error Container */
.error-container-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.error-content-form {
  text-align: center;
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #dc3545;
}

.error-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.btn-retry {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-retry:hover {
  background-color: #0056b3;
}
.form-section-so {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
}
.section-header-so {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #fcfcfd;
  border-bottom: 1px solid #eef2f7;
}
.section-icon-so {
  font-size: 1.25rem;
}
.section-title-so {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}
.section-content-so {
  padding: 1.5rem;
}
.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
.form-group-so {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.form-label-so {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}
.form-input-so,
.form-textarea-so {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.form-input-so:focus,
.form-textarea-so:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
.form-textarea-so {
  resize: vertical;
  min-height: 80px;
}
.form-input-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}
.required-mark {
  color: #d90000;
}
.text-center {
  text-align: center;
}
.th-qty-kirim {
  width: 150px;
}

/* Table */
.table-wrapper-so {
  overflow-x: auto;
}
.data-table-so {
  width: 100%;
  border-collapse: collapse;
}
.data-table-so th,
.data-table-so td {
  padding: 0.75rem 1rem;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid #eef2f7;
}
.data-table-so th {
  font-size: 0.8rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
  background-color: #fcfcfd;
}
.error-message {
  color: #d90000;
  font-size: 0.8rem;
}

/* Actions */
.form-actions-so {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #fcfcfd;
  border-top: 1px solid #eef2f7;
  border-radius: 0 0 12px 12px;
}
.btn-cancel-so,
.btn-submit-so {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-cancel-so {
  background-color: #f1f1f1;
  color: #555;
  border: 1px solid #ddd;
}
.btn-submit-so {
  background-color: #ff6a00;
  color: white;
}
.btn-submit-so:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading */
.loading-container-form {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 12px;
}
.spinner-form {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f2f5;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}
.loading-spinner-inline {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
