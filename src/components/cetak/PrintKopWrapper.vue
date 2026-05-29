<template>
  <table class="print-kop-table">
    <thead>
      <tr>
        <td class="print-kop-head">
          <KopSuratCetak />
        </td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="print-kop-body">
          <slot />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import KopSuratCetak from './KopSuratCetak.vue'
</script>

<style scoped>
/*
  Teknik: thead di dalam table diulang otomatis oleh browser
  di setiap halaman saat cetak — tanpa perlu JavaScript.
  Ini standar CSS2 Table Model dan didukung semua browser modern.
*/

.print-kop-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.print-kop-head {
  padding: 0;
  border: none;
}

.print-kop-body {
  padding: 0;
  border: none;
  vertical-align: top;
}

@media screen {
  /* Di layar: tidak ada efek khusus, tampil normal */
  .print-kop-table {
    display: block;
  }
}

@media print {
  .print-kop-table {
    display: table;
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    /* display: table-header-group adalah nilai default thead,
       tapi kita eksplisit agar tidak di-override CSS lain */
    display: table-header-group;
  }

  tbody {
    display: table-row-group;
  }

  .print-kop-head {
    padding: 0 0 3mm 0;
  }

  .print-kop-body {
    padding-top: 4mm;
    vertical-align: top;
  }
}
</style>
