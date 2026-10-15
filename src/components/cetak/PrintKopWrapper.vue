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
