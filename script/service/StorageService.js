class StorageService {
  static currentFile = "";
  static currentSheet = "";
  static currentData = {};
  static currentRecord = {};
  static formMetadata = {};

  constructor() {
    this.currentDataKey = "currentData";
    this.formMetadataKey = "formMetadata";
    this.getCurrentData = this.getCurrentData.bind(this);
    this.setCurrentData = this.setCurrentData.bind(this);
    this.setFormMetadata = this.setFormMetadata.bind(this);
    this.getFormMetadata = this.getFormMetadata.bind(this);
    this.clear = this.clear.bind(this);
    this.getCurrentData();
  }

  setCurrentData(data) {
    localStorage.setItem(this.currentDataKey, JSON.stringify(data));
  }
  setFormMetadata(data) {
    localStorage.setItem(this.formMetadataKey, JSON.stringify(data));
  }

  getFormMetadata() {
    if (formMetadata) return formMetadata;
    let dataJSON = localStorage.getItem(this.formMetadataKey);
    dataJSON = dataJSON ? JSON.parse(dataJSON) : [];
    return dataJSON;
  }

  getCurrentData() {
    try {
      let dataJSON = localStorage.getItem(this.currentDataKey);
      dataJSON = dataJSON ? JSON.parse(dataJSON) : [];
      if (Object.keys(StorageService.currentData).length <= 0) {
        StorageService.currentFile = Object.keys(dataJSON)[0];
        StorageService.currentSheet = Object.keys(dataJSON[StorageService.currentFile])[0];
        StorageService.currentData = dataJSON;
        StorageService.currentRecord = jQuery.extend(true, {}, StorageService.currentData[StorageService.currentFile][StorageService.currentSheet]);
      }
    } catch {
      $("#noDataModal").modal("show");
    }
  }

  clear() {
    localStorage.clear();
  }
}
