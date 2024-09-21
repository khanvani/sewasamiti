class TableService {
  static MAIN_CONTENT_HEIGHT_OFFSET = 300;
  static DEFAULT_PAGE_LENGTH = 25;

  constructor() {
    this.generateTable = this.generateTable.bind(this);
  }

  generateTable(currentRecord) {
    if (!currentRecord.data || currentRecord.data.length === 0) {
      console.log("No data available to display.");
      return;
    }

    let mainContentHeight = document.documentElement.scrollHeight - TableService.MAIN_CONTENT_HEIGHT_OFFSET;

    $("#c-home").html("<table id='h-dataTable' class='table table-striped table-bordered' width='100%'></table>");

    $("#h-dataTable").DataTable({
      destroy: true,
      data: currentRecord.data,
      columns: currentRecord.headers,
      searching: true,
      paging: true,
      scrollX: true,
      autoWidth: true,
      responsive: true,
      scrollY: mainContentHeight + "px",
      scrollCollapse: true,
      pageLength: TableService.DEFAULT_PAGE_LENGTH,
    });
  }
}
