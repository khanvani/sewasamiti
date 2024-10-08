class FilterService {
  filterFields = ["Department", "SubDept", "Gender", "Status", "Center", "Area", "OutStation", "Annotation_ASP_2024", "New_Status"];

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
        this.renderSelectBoxes("#filterModal");
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
              <select id="filter-${field}" class="selectpicker form-control filterTrigger" multiple data-live-search="true" title="${field}">
                ${options}
              </select>
            </div>
          `;

        filterModalBody.append(selectHtml);
      }
    });
  }

  filter() {
    const data = this.storageService.getCurrentData().data;
    this.filters = {
      Department: $("#filter-Department").val(),
      SubDept: $("#filter-SubDept").val(),
      Gender: $("#filter-Gender").val(),
      Status: $("#filter-Status").val(),
      Center: $("#filter-Center").val(),
      Area: $("#filter-Area").val(),
      OutSide: $("#filter-OutStation").val(),
      Annotation_ASP_2024: $("#filter-Annotation_ASP_2024").val(),
      New_Status: $("#filter-New_Status").val(),
    };
    StorageService.currentRecord.data = data.filter((item) => Object.entries(this.filters).every(([key, values]) => !values || !values.length || values.includes(item[key])));
    return data;
  }
  clearFilter() {
    $("#filter-Department").val([]).selectpicker("refresh");
    $("#filter-SubDept").val([]).selectpicker("refresh");
    $("#filter-Gender").val([]).selectpicker("refresh");
    $("#filter-Status").val([]).selectpicker("refresh");
    $("#filter-Center").val([]).selectpicker("refresh");
    $("#filter-Center").val([]).selectpicker("refresh");
    $("#filter-OutStation").val([]).selectpicker("refresh");
    $("#filter-Annotation_ASP_2024").val([]).selectpicker("refresh");
    $("#filter-New_Status").val([]).selectpicker("refresh");
    return this.storageService.getCurrentData();
  }
}
