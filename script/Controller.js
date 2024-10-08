class Controller {
  constructor( tableService, storageService, filterService) {
    this.tableService = tableService;
    this.storageService = storageService;
    this.filterService = filterService;
    this.attachEventListeners = this.attachEventListeners.bind(this);
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
      $(".selectpicker").on('changed.bs.select', () => this.filter());
      $("#clearFilterTrigger").click(this.clearFilter);
      this.clearStorageAndReload();
    });
    this.init(event);
  }

  init(event) {
    this.loadHomePage();
    this.filterService.initFilters();
  }

  loadHomePage() {
    $(".custom-card").removeClass("show");
    $("#c-home").addClass("show");
    if (StorageService.currentRecord) {
      this.tableService.generateTable(StorageService.currentRecord);
    } else {
      $("#noDataModal").modal("show");
    }
  }

  clearStorageAndReload() {
    this.storageService.clear();
    $("#clearStorageModal").modal("hide");
    this.tableService.generateTable(this.storageService.getCurrentData());
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
    this.filterService.filter()
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
}

const storageService = new StorageService();
const tableService = new TableService();
const filterService = new FilterService(storageService);
const controller = new Controller(tableService, storageService, filterService);
