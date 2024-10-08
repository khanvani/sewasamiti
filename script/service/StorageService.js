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
      var response = { "headers" : [ { "data": "Gr_No", "title": "Gr No" }, { "data": "Full_Name", "title": "Full Name" }, { "data": "Mobile", "title": "Mobile" }, { "data": "Gender", "title": "Gender" }, { "data": "Statuson13Sept", "title": "Statuson13Sept" }, { "data": "Department", "title": "Department" }, { "data": "Sub_Dept", "title": "Sub Dept" }, { "data": "OS", "title": "OS" }, { "data": "BirthDate", "title": "BirthDate" }, { "data": "Age", "title": "Age" }, { "data": "Satsang_Center", "title": "Satsang Center" }, { "data": "Annotation_Status", "title": "Annotation Status" }, { "data": "Attendance_Till_12th_Sept", "title": "Attendance Till 12th Sept" } ], "data" : [ { "Gr_No": "GN231452", "Full_Name": "Prinsaraj Jashubhai Sangada", "Mobile": "78618 83541", "Gender": "Male", "Statuson13Sept": "General", "Department": "Traffic", "Sub_Dept": "Group P02", "OS": "Yes", "BirthDate": "7/21/2008", "Age": 16, "Satsang_Center": "Dungari", "Annotation_Status": "New form Filled in 2024", "Attendance_Till_12th_Sept": "" }, { "Gr_No": "GN231453", "Full_Name": "Agrim Yogeshkumar Sachdeva", "Mobile": 7802970000, "Gender": "Male", "Statuson13Sept": "General", "Department": "Canteen", "Sub_Dept": "", "OS": "Yes", "BirthDate": "9/19/2008", "Age": 16, "Satsang_Center": "Surat", "Annotation_Status": "New form Filled in 2024", "Attendance_Till_12th_Sept": "" } ]};
      StorageService.currentRecord = response;
      this.setCurrentData(response);
      resolve(response); // Resolve the promise with the response data
      const apiKey = localStorage.getItem('apiKey');

      $.ajax({
        url: "https://ahujaenterprise.com/rssba/query-desk.php",
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
