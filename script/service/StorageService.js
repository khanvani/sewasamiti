class StorageService {
  static currentRecord = {};

  constructor() {
    this.getCurrentData = this.getCurrentData.bind(this);
    this.setCurrentData = this.setCurrentData.bind(this);
    this.clear = this.clear.bind(this);
    this.call = this.call.bind(this);
    this.currentDataKey = "data";
    this.getCurrentData();
  }

  setCurrentData(data) {
    localStorage.setItem(this.currentDataKey, JSON.stringify(data));
  }
 getCurrentData() {
    try {
      let dataJSON = localStorage.getItem(this.currentDataKey);
      dataJSON = dataJSON ? JSON.parse(dataJSON) : [];
      StorageService.currentRecord = dataJSON;
      if (Object.keys(dataJSON).length <= 0) {
        return this.call().then((response) => {
          StorageService.currentRecord = response;
          return StorageService.currentRecord;
        });
      }

      return StorageService.currentRecord;
    } catch (error) {
      $("#noDataModal").modal("show");
      return Promise.reject(error);
    }
  }

  clear() {
    localStorage.clear();
  }
 call() {
    return new Promise((resolve, reject) => {
      const apiKey = localStorage.getItem('apiKey');
      $.ajax({
        url: "https://ahujaenterprise.com/sewasamiti/query-desk.php",
        type: "POST",
        async: false, // Set async to false for synchronous request
        dataType: "json",
        headers: {
          "api_key": apiKey // Add API key header with an empty value
        },
        success: (response) => {
          StorageService.currentRecord = response;
          this.setCurrentData(response);
          resolve(response); // Resolve the promise with the response data
        },
        error: (xhr, status, error) => {
          console.error("Error in fetching data:", error);
          reject(error); // Reject the promise in case of error
        }
      });
    });
  }
}
