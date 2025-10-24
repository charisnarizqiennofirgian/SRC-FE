import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StockAdjustmentView from '../views/manajemen-stok/StockAdjustmentView.vue'
import LaporanOperasional from '../views/manajemen-stok/LaporanOperasional.vue'
import LaporanProdukJadi from '../views/manajemen-stok/LaporanProdukJadi.vue'
import LaporanKayuLogs from '../views/manajemen-stok/LaporanKayuLogs.vue'
import LaporanKayuRST from '../views/manajemen-stok/LaporanKayuRST.vue'
import LaporanKartonBox from '../views/manajemen-stok/LaporanKartonBox.vue'
import DaftarPesananPembelian from '../views/pembelian/DaftarPesananPembelian.vue'

import AdminView from '../views/AdminView.vue'
import FakturPembelianForm from '../views/pembelian/FakturPembelianForm.vue'
import FakturPembelianIndex from '../views/pembelian/FakturPembelianIndex.vue'
import PesananPembelianCetak from '../views/pembelian/PesananPembelianCetak.vue'
import FakturPembelianCetak from '../views/pembelian/FakturPembelianCetak.vue'
import DetailFakturPembelian from '../views/pembelian/DetailFakturPembelian.vue'
import PembelianOperasionalIndex from '../views/pembelian/PembelianOperasionalIndex.vue'
import PembelianKartonIndex from '../views/pembelian/PembelianKartonIndex.vue'
import PembelianKayuIndex from '../views/pembelian/PembelianKayuindex.vue'
import FormOperasional from '../views/pembelian/FormOperasional.vue'
import FormKarton from '../views/pembelian/FormKarton.vue'
import FormKayu from '../views/pembelian/FormKayu.vue'
import MasterBarangView from '../views/master/MasterBarangView.vue'
import MasterBarangForm from '../views/master/MasterBarangForm.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'router-link-exact-active',
  routes: [
    {
      path: '/',
      name: 'login',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardHome.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: AdminView,
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('../views/CategoryView.vue'),
        },
        {
          path: 'units',
          name: 'admin-units',
          component: () => import('../views/UnitView.vue'),
        },
        {
          path: 'suppliers',
          name: 'admin-suppliers',
          component: () => import('../views/SupplierView.vue'),
        },
        {
          path: 'buyers',
          name: 'admin-buyers',
          component: () => import('../views/BuyerView.vue'),
        },
        {
          path: 'master-barang',
          name: 'MasterBarang',
          component: MasterBarangView,
          meta: { title: 'Master Data Barang' },
        },
        {
          path: 'master-barang/tambah',
          name: 'TambahMasterBarang',
          component: MasterBarangForm,
          meta: { title: 'Tambah Master Barang' },
        },
        {
          path: 'master-barang/:id/edit',
          name: 'EditMasterBarang',
          component: MasterBarangForm,
          meta: { title: 'Edit Master Barang' },
          props: true,
        },
        {
          path: '/admin/pembelian',
          name: 'DaftarPesananPembelian',
          component: DaftarPesananPembelian,
          meta: { title: 'Daftar Pesanan Pembelian' },
        },
        {
          path: '/admin/pembelian/buat',
          name: 'BuatPembelian',
          component: () => import('../views/pembelian/BuatPesananPembelian.vue'),
          meta: { title: 'Buat Pesanan Pembelian' },
        },
        {
          path: '/admin/pembelian/operasional',
          name: 'PembelianOperasional',
          component: PembelianOperasionalIndex,
          meta: { title: 'Pembelian Operasional' },
        },
        {
          path: '/admin/pembelian/karton',
          name: 'PembelianKarton',
          component: PembelianKartonIndex,
          meta: { title: 'Pembelian Karton Box' },
        },
        {
          path: '/admin/pembelian/kayu',
          name: 'PembelianKayu',
          component: PembelianKayuIndex,
          meta: { title: 'Pembelian Kayu' },
        },

        {
          path: '/admin/pembelian/operasional/buat',
          name: 'BuatPembelianOperasional',
          component: FormOperasional,
          meta: { title: 'Buat PO Operasional' },
        },
        {
          path: '/admin/pembelian/operasional/edit/:id',
          name: 'EditPembelianOperasional',
          component: FormOperasional,
          meta: { title: 'Edit PO Operasional' },
        },
        // Rute untuk Pembelian Karton Box
        {
          path: '/admin/pembelian/karton/buat',
          name: 'BuatPembelianKarton',
          component: FormKarton,
          meta: { title: 'Buat PO Karton' },
        },
        {
          path: '/admin/pembelian/karton/edit/:id',
          name: 'EditPembelianKarton',
          component: FormKarton,
          meta: { title: 'Edit PO Karton' },
        },
        // Rute untuk Pembelian Kayu
        {
          path: '/admin/pembelian/kayu/buat',
          name: 'BuatPembelianKayu',
          component: FormKayu,
          meta: { title: 'Buat PO Kayu' },
        },
        {
          path: '/admin/pembelian/kayu/edit/:id',
          name: 'EditPembelianKayu',
          component: FormKayu,
          meta: { title: 'Edit PO Kayu' },
        },
        {
          path: '/admin/pembelian/:id/edit',
          name: 'EditPesananPembelian',
          component: () => import('../views/admin/pembelian/EditPesananPembelian.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/admin/pembelian/:id/detail',
          name: 'detail-po',
          component: () => import('../views/admin/pembelian/DetailPesananPembelian.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'penerimaan-barang/tambah/:po_id',
          name: 'tambah-penerimaan-barang',
          component: () => import('../views/pembelian/PenerimaanBarangForm.vue'),
          meta: { requiresAuth: true, title: 'Tambah Penerimaan Barang' },
        },
        {
          path: '/admin/pembelian/faktur/buat',
          name: 'BuatFakturPembelian',
          component: FakturPembelianForm,
          meta: {
            title: 'Buat Faktur Pembelian',
          },
        },
        {
          path: '/admin/pembelian/faktur',
          name: 'DaftarFakturPembelian',
          component: FakturPembelianIndex,
          meta: {
            title: 'Daftar Faktur Pembelian',
          },
        },
        {
          path: '/admin/pembelian/cetak/:id',
          name: 'CetakPesananPembelian',
          component: PesananPembelianCetak,
          meta: {
            title: 'Cetak Pesanan Pembelian',
          },
        },
        {
          path: 'faktur-pembelian/cetak/:id',
          name: 'CetakFakturPembelian',
          component: FakturPembelianCetak,
          meta: { title: 'Cetak Faktur Pembelian' },
        },
        {
          path: 'faktur-pembelian/detail/:id',
          name: 'DetailFakturPembelian',
          component: DetailFakturPembelian,
          meta: { title: 'Detail Faktur Pembelian' },
        },
      ],
    },
    {
      path: '/stock-report-operational',
      name: 'StockReportOperational',
      component: LaporanOperasional,
      meta: { requiresAuth: true },
    },
    {
      path: '/stock-report-finished',
      name: 'StockReportFinished',
      component: LaporanProdukJadi,
      meta: { requiresAuth: true },
    },
    {
      path: '/stock-report-logs',
      name: 'StockReportLogs',
      component: LaporanKayuLogs,
      meta: { requiresAuth: true },
    },
    {
      path: '/stock-report-rst',
      name: 'StockReportRST',
      component: LaporanKayuRST,
      meta: { requiresAuth: true },
    },
    {
      path: '/stock-adjustment',
      name: 'StockAdjustment',
      component: StockAdjustmentView,
      meta: { requiresAuth: true },
    },
    {
      path: '/laporan/karton-box',
      name: 'LaporanKartonBox',
      component: LaporanKartonBox,
      meta: { title: 'Laporan Karton Box' },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
