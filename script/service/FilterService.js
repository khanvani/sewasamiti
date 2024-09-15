class FilterService {
  filterFields = ["Department", "SubDept", "Gender", "Status", "Center", "Area", "OutSide"];

  constructor(storageService) {
    this.storageService = storageService;
    this.filters = {};
    this.initFilters = this.initFilters.bind(this);
    this.filter = this.filter.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.getFilters = this.getFilters.bind(this);
  }

  initFilters() {
    if (Object.keys(StorageService.currentRecord).length > 0) {
      this.filterFields.forEach((field) => {
        this.filters[field] = new Set();
      });
      if (this.fillFilters(StorageService.currentRecord.data)) {
        this.renderSelectBoxes("#filterModal .modal-body");
        $(".selectpicker").selectpicker();
      }
    }
  }

  getFilters() {
    return this.filters;
  }

  fillFilters(data) {
    try {
      if (!data || !Array.isArray(data)) {
        console.error("Invalid or empty dataset.");
        return;
      }

      data.forEach((item) => {
        this.filterFields.forEach((field) => {
          if (item.hasOwnProperty(field)) {
            this.filters[field].add(item[field]);
          }
        });
      });
    } catch {
      console.log("Error while generating Filters");
    }
    return true;
  }

  renderSelectBoxes(filterModalBodySelector) {
    const filterModalBody = $(filterModalBodySelector);
    filterModalBody.empty();
    this.filterFields.forEach((field) => {
      if (this.filters[field].size) {
        const options = Array.from(this.filters[field])
          .map((val) => `<option value="${val}">${val}</option>`)
          .join("");

        const selectHtml = `
            <div class="form-group">
              <label for="filter-${field}">${field}</label>
              <select id="filter-${field}" class="selectpicker form-control" multiple data-live-search="true">
                ${options}
              </select>
            </div>
          `;

        filterModalBody.append(selectHtml);
      }
    });
  }

  filter() {
    const data = StorageService.currentData[StorageService.currentFile][StorageService.currentSheet].data;
    this.filters = {
      Department: $("#filter-Department").val(),
      SubDept: $("#filter-SubDept").val(),
      Gender: $("#filter-Gender").val(),
      Status: $("#filter-Status").val(),
      Center: $("#filter-Center").val(),
      Area: $("#filter-Area").val(),
      OutSide: $("#filter-OutSide").val(),
    };
    $("#filterModal").modal("hide");
    return data.filter((item) => Object.entries(this.filters).every(([key, values]) => !values || !values.length || values.includes(item[key])));
  }
  clearFilter() {
    $("#filter-Department").val([]).selectpicker("refresh");
    $("#filter-SubDept").val([]).selectpicker("refresh");
    $("#filter-Gender").val([]).selectpicker("refresh");
    $("#filter-Status").val([]).selectpicker("refresh");
    $("#filter-Center").val([]).selectpicker("refresh");
    $("#filter-Center").val([]).selectpicker("refresh");
    $("#filter-OutSide").val([]).selectpicker("refresh");
    return StorageService.currentData[StorageService.currentFile][StorageService.currentSheet].data;
  }
}
