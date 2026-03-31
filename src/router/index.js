import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StockAdjustmentView from '../views/manajemen-stok/StockAdjustmentView.vue'
import StockIndex from '../views/manajemen-stok/StockIndex.vue'
import LaporanMutasiView from '../views/manajemen-stok/LaporanMutasiView.vue'
// LAPORAN STOK LAMA DIHAPUS DARI ROUTER SESUAI ARAHAN PM
// import LaporanOperasional from '../views/manajemen-stok/LaporanOperasional.vue'
// import LaporanProdukJadi from '../views/manajemen-stok/LaporanProdukJadi.vue'
// import LaporanKayuLogs from '../views/manajemen-stok/LaporanKayuLogs.vue'
// import LaporanKayuRST from '../views/manajemen-stok/LaporanKayuRST.vue'
// import LaporanKartonBox from '../views/manajemen-stok/LaporanKartonBox.vue'
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
import LaporanHarga from '../views/pembelian/LaporanHarga.vue'

import MasterBarangView from '../views/master/MasterBarangView.vue'
import MasterBarangForm from '../views/master/MasterBarangForm.vue'
import DaftarSalesOrder from '../views/penjualan/DaftarSalesOrder.vue'
import FormSalesOrder from '../views/penjualan/FormSalesOrder.vue'
import SalesOrderCetak from '../views/penjualan/SalesOrderCetak.vue'
import DaftarPengiriman from '../views/penjualan/DaftarPengiriman.vue'
import FormPengiriman from '../views/penjualan/FormPengiriman.vue'
import CetakPengiriman from '../views/penjualan/CetakPengiriman.vue'
import InvoiceList from '../views/penjualan/invoices/InvoiceList.vue'
// import InvoiceCreate from '../views/penjualan/invoices/InvoiceCreate.vue' // Removed static import
import InvoiceDetail from '../views/penjualan/invoices/InvoiceDetail.vue'
import InvoicePayment from '../views/penjualan/invoices/InvoicePayment.vue'
import DownPaymentList from '../views/penjualan/downpayments/DownPaymentList.vue'
import DownPaymentCreate from '../views/penjualan/downpayments/DownPaymentCreate.vue'
import DownPaymentDetail from '../views/penjualan/downpayments/DownPaymentDetail.vue'
import BomIndex from '../views/produksi/BomIndex.vue'
import BomForm from '../views/produksi/BomForm.vue'
import SawmilReport from '../views/produksi/SawmilReport.vue'
import SandingView from '../views/produksi/SandingView.vue'
import RustikView from '../views/produksi/RustikView.vue'
import FinishingView from '../views/produksi/FinishingView.vue'
import PackingView from '../views/produksi/PackingView.vue'
import MaterialUsageView from '../views/produksi/MaterialUsageView.vue'
import ChartOfAccountView from '../views/master/ChartOfAccountView.vue'

// MODULE PERBAIKAN
import JurnalUmumIndex from '../views/perbaikan/JurnalUmumIndex.vue'
import JurnalUmumDetail from '../views/perbaikan/JurnalUmumDetail.vue'
import JurnalUmumEdit from '../views/perbaikan/JurnalUmumEdit.vue'

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
          path: 'chart-of-account',
          name: 'admin-coa',
          component: ChartOfAccountView,
          meta: { title: 'Chart of Account' },
        },
        {
          path: 'payment-methods',
          name: 'admin-payment-methods',
          component: () => import('../views/master/PaymentMethodView.vue'),
          meta: { title: 'Metode Pembayaran' },
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
          path: '/admin/boms',
          name: 'BomIndex',
          component: BomIndex,
          meta: { title: 'Daftar BOM' },
        },
        {
          path: '/admin/boms/tambah',
          name: 'BomCreate',
          component: BomForm,
          meta: { title: 'Tambah BOM' },
        },
        {
          path: '/admin/boms/edit/:id',
          name: 'BomEdit',
          component: BomForm,
          meta: { title: 'Edit BOM' },
        },
        {
          path: '/admin/pembelian',
          name: 'DaftarPesananPembelian',
          component: DaftarPesananPembelian,
          meta: { title: 'Daftar Pesanan Pembelian' },
        },
        {
          path: '/admin/penjualan/sales-order',
          name: 'DaftarSalesOrder',
          component: DaftarSalesOrder,
          meta: { title: 'Daftar Sales Order' },
        },
        {
          path: '/admin/penjualan/sales-order/tambah',
          name: 'BuatSalesOrder',
          component: FormSalesOrder,
          meta: { title: 'Buat Sales Order Baru' },
        },
        {
          path: '/admin/penjualan/sales-order/:id/edit',
          name: 'EditSalesOrder',
          component: FormSalesOrder,
          meta: { title: 'Edit Sales Order' },
          props: true,
        },
        {
          path: '/admin/penjualan/sales-order/cetak/:id',
          name: 'CetakSalesOrder',
          component: SalesOrderCetak,
          meta: { title: 'Cetak Pesanan Penjualan' },
          props: true,
        },
        {
          path: '/admin/penjualan/pengiriman-barang',
          name: 'DaftarPengiriman',
          component: DaftarPengiriman,
          meta: { title: 'Daftar Pengiriman Barang' },
        },
        {
          path: '/admin/penjualan/pengiriman-barang/tambah',
          name: 'BuatPengiriman',
          component: FormPengiriman,
          meta: { title: 'Buat Pengiriman Barang' },
        },
        {
          path: '/admin/penjualan/pengiriman-barang/:id/edit',
          name: 'EditPengiriman',
          component: FormPengiriman,
          meta: { title: 'Edit Pengiriman Barang' },
          props: true,
        },
        {
          path: '/admin/penjualan/pengiriman-barang/cetak/:id',
          name: 'CetakPengiriman',
          component: CetakPengiriman,
          meta: { title: 'Cetak Pengiriman Barang' },
          props: true,
        },
        {
          path: '/admin/penjualan/invoices',
          name: 'InvoiceList',
          component: InvoiceList,
          meta: { title: 'Daftar Sales Invoice', requiresAuth: true },
        },
        {
          path: '/admin/penjualan/invoices/create',
          name: 'BuatInvoice',
          component: () => import('../views/penjualan/invoices/InvoiceCreate.vue'),
          meta: { title: 'Buat Sales Invoice', requiresAuth: true },
        },
        {
          path: '/admin/penjualan/invoices/:id',
          name: 'InvoiceDetail',
          component: InvoiceDetail,
          meta: { title: 'Detail Invoice', requiresAuth: true },
          props: true,
        },
        {
          path: '/admin/penjualan/invoices/:id/payment',
          name: 'InvoicePayment',
          component: InvoicePayment,
          meta: { title: 'Pembayaran Invoice', requiresAuth: true },
          props: true,
        },
        {
          path: '/admin/penjualan/down-payments',
          name: 'DownPaymentList',
          component: DownPaymentList,
          meta: { title: 'Daftar Uang Muka', requiresAuth: true },
        },
        {
          path: '/admin/penjualan/down-payments/create',
          name: 'DownPaymentCreate',
          component: DownPaymentCreate,
          meta: { title: 'Buat Uang Muka', requiresAuth: true },
        },
        {
          path: '/admin/penjualan/down-payments/:id',
          name: 'DownPaymentDetail',
          component: DownPaymentDetail,
          meta: { title: 'Detail Uang Muka', requiresAuth: true },
          props: true,
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
          path: '/admin/pembelian/laporan-harga',
          name: 'LaporanHarga',
          component: LaporanHarga,
          meta: { title: 'Laporan Harga Pembelian', requiresAuth: true },
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
        // PERBAIKAN JURNAL MANUAL
        {
          path: '/admin/perbaikan/jurnal-manual',
          name: 'JurnalPerbaikan',
          component: JurnalUmumIndex,
          meta: { title: 'Daftar Jurnal Perbaikan', requiresAuth: true },
        },
        {
          path: '/admin/perbaikan/jurnal-manual/:id',
          name: 'DetailJurnalPerbaikan',
          component: JurnalUmumDetail,
          meta: { title: 'Detail Jurnal Perbaikan', requiresAuth: true },
          props: true,
        },
        {
          path: '/admin/perbaikan/jurnal-manual/:id/edit',
          name: 'EditJurnalPerbaikan',
          component: JurnalUmumEdit,
          meta: { title: 'Edit Jurnal Perbaikan', requiresAuth: true },
          props: true,
        },
      ],
    },
    {
      path: '/admin/produksi/sawmill',
      name: 'ProduksiSawmill',
      component: () => import('../views/produksi/ProduksiSawmill.vue'),
      meta: { title: 'Produksi Sawmill' },
    },
    {
      path: '/admin/produksi/bom',
      name: 'MasterBom',
      component: () => import('../views/produksi/MasterBom.vue'),
      meta: { title: 'Master BOM', requiresAuth: true },
    },
    {
      path: '/admin/produksi/candy',
      name: 'ProduksiCandy',
      component: () => import('../views/produksi/ProduksiCandy.vue'),
      meta: { title: 'Produksi Candy', requiresAuth: true },
    },
    {
      path: '/admin/produksi/pembahanan',
      name: 'ProduksiPembahanan',
      component: () => import('../views/produksi/ProduksiPembahanan.vue'),
      meta: { title: 'Produksi Pembahanan', requiresAuth: true },
    },
    {
      path: '/admin/produksi/moulding',
      name: 'ProduksiMoulding',
      component: () => import('../views/produksi/ProduksiMoulding.vue'),
      meta: { title: 'Produksi Moulding', requiresAuth: true },
    },
    {
      path: '/admin/produksi/mesin',
      name: 'ProduksiMesin',
      component: () => import('../views/produksi/ProduksiMesin.vue'),
      meta: { title: 'Produksi Mesin', requiresAuth: true },
    },
    {
      path: '/admin/produksi/rustik-komponen',
      name: 'RustikKomponenView',
      component: () => import('../views/produksi/RustikKomponenView.vue'),
      meta: { title: 'Rustik Komponen', requiresAuth: true },
    },
    {
      path: '/admin/produksi/assembling',
      name: 'AssemblingView',
      component: () => import('../views/produksi/AssemblingView.vue'),
      meta: { title: 'Assembling', requiresAuth: true },
    },
    {
      path: '/admin/produksi/sanding',
      name: 'SandingView',
      component: SandingView,
      meta: { title: 'Sanding', requiresAuth: true },
    },
    {
      path: '/admin/produksi/rustik',
      name: 'RustikView',
      component: RustikView,
      meta: { title: 'Rustik', requiresAuth: true },
    },
    {
      path: '/admin/produksi/finishing',
      name: 'FinishingView',
      component: FinishingView,
      meta: { title: 'Finishing', requiresAuth: true },
    },
    {
      path: '/admin/produksi/qc-final',
      name: 'QcFinalView',
      component: () => import('../views/produksi/QcFinalView.vue'),
      meta: { title: 'QC Final', requiresAuth: true },
    },
    {
      path: '/admin/produksi/packing',
      name: 'PackingView',
      component: PackingView,
      meta: { title: 'Packing', requiresAuth: true },
    },
    {
      path: '/admin/produksi/material-usage',
      name: 'MaterialUsageView',
      component: MaterialUsageView,
      meta: { title: 'Pemakaian Bahan', requiresAuth: true },
    },
    {
      path: '/admin/produksi/monitoring',
      name: 'ProductionMonitoring',
      component: () => import('../views/produksi/ProductionMonitoringView.vue'),
      meta: { title: 'Monitoring Produksi', requiresAuth: true },
    },

    {
      path: '/reports/sawmill',
      name: 'SawmillReport',
      component: SawmilReport,
      meta: { title: 'Laporan Produksi Sawmill', requiresAuth: true },
    },
    {
      path: '/admin/keuangan/jurnal-umum',
      name: 'JurnalUmum',
      component: () => import('../views/keuangan/JurnalUmum.vue'),
      meta: { title: 'Jurnal Umum', requiresAuth: true },
    },
    {
      path: '/admin/keuangan/pembayaran-hutang',
      name: 'PembayaranHutang',
      component: () => import('../views/keuangan/PembayaranHutangView.vue'),
      meta: { title: 'Pembayaran Hutang', requiresAuth: true },
    },
    {
      path: '/admin/keuangan/riwayat-pembayaran',
      name: 'RiwayatPembayaranHutang',
      component: () => import('../views/keuangan/RiwayatPembayaranView.vue'),
      meta: { title: 'Riwayat Pembayaran Hutang', requiresAuth: true },
    },
    {
      path: '/admin/keuangan/jurnal-umum/tambah',
      name: 'TambahJurnalManual',
      component: () => import('../views/keuangan/JurnalManualForm.vue'),
      meta: { title: 'Buat Jurnal Manual', requiresAuth: true },
    },
    {
      path: '/admin/keuangan/buku-besar',
      name: 'BukuBesar',
      component: () => import('../views/keuangan/GeneralLedgerView.vue'),
      meta: { title: 'Buku Besar', requiresAuth: true },
    },
    {
      path: '/admin/keuangan/laba-rugi',
      name: 'LabaRugi',
      component: () => import('../views/keuangan/IncomeStatementView.vue'),
      meta: { title: 'Laporan Laba Rugi', requiresAuth: true },
    },
    {
      path: '/admin/keuangan/neraca',
      name: 'Neraca',
      component: () => import('../views/keuangan/BalanceSheetView.vue'),
      meta: { title: 'Neraca', requiresAuth: true },
    },

    // ROUTE STOK YANG MASIH DIPAKAI
    {
      path: '/stock-index',
      name: 'StockIndex',
      component: StockIndex,
      meta: { requiresAuth: true },
    },
    {
      path: '/stock-adjustment',
      name: 'StockAdjustment',
      component: StockAdjustmentView,
      meta: { requiresAuth: true },
    },
    {
      path: '/laporan-mutasi',
      name: 'LaporanMutasi',
      component: LaporanMutasiView,
      meta: { title: 'Laporan Mutasi', requiresAuth: true },
    },

    // ROUTE LAPORAN STOK LAMA DIHAPUS DARI NAVIGASI, BISA DIHAPUS TOTAL JIKA SUDAH YAKIN
    // {
    //   path: '/stock-report-operational',
    //   name: 'StockReportOperational',
    //   component: LaporanOperasional,
    //   meta: { requiresAuth: true },
    // },
    // {
    //   path: '/stock-report-finished',
    //   name: 'StockReportFinished',
    //   component: LaporanProdukJadi,
    //   meta: { requiresAuth: true },
    // },
    // {
    //   path: '/stock-report-logs',
    //   name: 'StockReportLogs',
    //   component: LaporanKayuLogs,
    //   meta: { requiresAuth: true },
    // },
    // {
    //   path: '/stock-report-rst',
    //   name: 'StockReportRST',
    //   component: LaporanKayuRST,
    //   meta: { requiresAuth: true },
    // },
    // {
    //   path: '/laporan/karton-box',
    //   name: 'LaporanKartonBox',
    //   component: LaporanKartonBox,
    //   meta: { title: 'Laporan Karton Box' },
    // },
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
