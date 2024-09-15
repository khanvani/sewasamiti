class Controller {
  constructor(excelService, tableService, storageService, filterService, downloadService, pivotService) {
    this.excelService = excelService;
    this.tableService = tableService;
    this.storageService = storageService;
    this.filterService = filterService;
    this.downloadService = downloadService;
    this.pivotService = pivotService;
    this.attachEventListeners = this.attachEventListeners.bind(this);
    this.uploadAndProcessFile = this.uploadAndProcessFile.bind(this);
    this.loadDataFromFiles = this.loadDataFromFiles.bind(this);
    this.loadDataFromSheet = this.loadDataFromSheet.bind(this);
    this.clearStorageAndReload = this.clearStorageAndReload.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.filter = this.filter.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.download = this.download.bind(this);
    this.pivotByMaleFemale = this.pivotByMaleFemale.bind(this);
    this.init = this.init.bind(this);
    this.attachEventListeners(this);
  }

  attachEventListeners(event) {
    $(document).ready(() => {
      $("#m-home").click(this.loadHomePage);
      $("#uploadTrigger").click(() => $("#inputExcel").trigger("click"));
      $("#inputExcel").change(this.uploadAndProcessFile);
      $("#fileNamesCombo").change(this.loadDataFromFiles);
      $("#sheetNamesCombo").change(this.loadDataFromSheet);
      $("#clearStorageModalYes").click(this.clearStorageAndReload);
      $("#sidebar-toggle-btn").click(this.toggleSidebar);
      $("#m-mf-pivot").click(this.pivotByMaleFemale);
      $("#filterTrigger").click(this.filter);
      $("#clearFilterTrigger").click(this.clearFilter);
      $("#downloadModalYes").click(this.download);
      //$(".display-flag").remove();
    });
    this.excelService.reloadFiles();
    this.init(event);
  }

  init(event) {
    this.loadHomePage();
    this.filterService.initFilters();
    this.downloadService.initFilters();
  }

  uploadAndProcessFile(event) {
    if (this.excelService) {
      this.excelService
        .uploadAndProcessFile(event)
        .then(() => $("#fileNamesCombo").val(StorageService.currentFile).change())
        .catch((error) => console.error("Error processing Excel file", error));
    }
  }

  loadHomePage() {
    $(".custom-card").removeClass("show");
    $("#c-home").addClass("show");
    if (StorageService.currentFile) {
      this.tableService.generateTable(StorageService.currentRecord);
    } else {
      $("#noDataModal").modal("show");
    }
  }

  clearStorageAndReload() {
    this.storageService.clear();
    $("#clearStorageModal").modal("hide");
    window.location.reload();
  }

  toggleSidebar() {
    $("#sidebarMenu, .container.main-content").toggleClass("expanded");
  }

  download() {
    if ($("#titleValue").val().trim() == "") {
      alert("Please provide the title name");
      return false;
    }
    this.downloadService.download();
  }
  filter() {
    StorageService.currentRecord.data = this.filterService.filter();
    this.loadHomePage();
  }
  clearFilter() {
    StorageService.currentRecord.data = this.filterService.clearFilter();
    this.loadHomePage();
  }
  pivotByMaleFemale() {
    $(".custom-card").removeClass("show");
    $("#c-mf-pivot").addClass("show");
    this.pivotService.pivotByMaleFemale();
  }
  loadDataFromFiles(event) {
    StorageService.currentFile = $("#fileNamesCombo").val();
    $("#sheetNamesCombo").empty();
    const file = StorageService.currentData[StorageService.currentFile];
    Object.keys(file).forEach((key, index) => {
      $("#sheetNamesCombo").append(
        $("<option>", {
          value: key,
          text: key,
        })
      );
    });
    $("#sheetNamesCombo").val($("#sheetNamesCombo option:first").val()).trigger("change");
    this.init(event);
  }
  loadDataFromSheet(event) {
    StorageService.currentFile = $("#fileNamesCombo").val();
    StorageService.currentSheet = $("#sheetNamesCombo").val();
    StorageService.currentRecord = jQuery.extend(true, {}, StorageService.currentData[StorageService.currentFile][StorageService.currentSheet]);
    this.init(event);
  }
}

const storageService = new StorageService();
const tableService = new TableService();
const excelService = new ExcelService(storageService);
const filterService = new FilterService(storageService);
const downloadService = new DownloadService(filterService);
const pivotService = new PivotService();
const controller = new Controller(excelService, tableService, storageService, filterService, downloadService, pivotService);
