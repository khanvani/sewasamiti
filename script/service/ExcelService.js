class ExcelService {
  constructor(storageService) {
    this.storageService = storageService;
    this.uploadAndProcessFile = this.uploadAndProcessFile.bind(this);
    this.getSheetData = this.getSheetData.bind(this);
    this.getHeaders = this.getHeaders.bind(this);
    this.getFormat = this.getFormat.bind(this);
    this.reloadFiles = this.reloadFiles.bind(this);
  }

  async uploadAndProcessFile(event) {
    let files = event.target.files;
    let startingRow = prompt("Enter the starting row number for the table (headers row):", "1");
    startingRow = parseInt(startingRow);
    if (isNaN(startingRow) || startingRow < 1) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      const currentFile = file.name;

      if (!file) {
        console.error("No file selected.");
        return;
      }
      try {
        let sheets = {};

        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        workbook.eachSheet((sheet, sheetId) => {
          const data = this.getSheetData(sheet, startingRow);

          if (data.length > 0) {
            const headers = this.getHeaders(sheet, startingRow);
            const format = this.getFormat(sheet, startingRow);
            sheets[sheet.name] = {
              data: data,
              headers: headers,
              format: format,
            };
          }
        });
        if (Object.keys(sheets).length > 0) {
          if ($("#fileNamesCombo").length > 0) {
            StorageService.currentFile = currentFile;
            StorageService.currentSheet = Object.keys(sheets)[0];
            StorageService.currentData[currentFile] = sheets;
            StorageService.currentRecord = jQuery.extend(true, {}, StorageService.currentData[StorageService.currentFile][StorageService.currentSheet]);
            try {
              this.storageService.setCurrentData(StorageService.currentData);
            } catch {
              console.log(
                "Data could not be saved to Storage. Nevertheless, you can continue to use the application, as the data will be loaded from the cache."
              );
            }
            this.reloadFiles();
          } else {
            try {
              StorageService.formMetadata = sheets[Object.keys(sheets)[0]].data;
              this.storageService.setFormMetadata(StorageService.formMetadata);
            } catch {
              console.log(
                "Data could not be saved to Storage. Nevertheless, you can continue to use the application, as the data will be loaded from the cache."
              );
            }
          }
        }
      } catch (err) {
        alert("Error processing Excel file:" + currentFile, err);
      }
    }
  }

  getSheetData(sheet, startingRow) {
    const jsonData = sheet.getSheetValues().slice(startingRow - 1);
    const headers = sheet.getRow(startingRow).values.map((header) => (typeof header === "string" ? header.trim() : header));
    const data = jsonData.slice(2).map((row) => {
      return headers.reduce((obj, header, index) => {
        let cellValue = row.length > index ? row[index] : "";
        cellValue = typeof cellValue === "number" || (cellValue && typeof cellValue !== "object") ? cellValue : "";
        cellValue = typeof cellValue === "string" ? cellValue.trim() : cellValue;
        obj[header.replace(/[\s.]+/g, "_")] = cellValue;
        return obj;
      }, {});
    });
    return data;
  }

  getHeaders(sheet, startingRow) {
    const headerRow = sheet.getRow(startingRow);
    const headers = headerRow.values
      .map((value, colIndex) => {
        const cell = headerRow.getCell(colIndex);
        return {
          data: typeof value === "string" ? value.trim().replace(/[\s.]+/g, "_") : value,
          title: value,
          numFmt: cell.numFmt,
          font: cell.font,
          fill: cell.fill,
          alignment: cell.alignment,
          border: cell.border,
          width: sheet.getColumn(colIndex).width,
        };
      })
      .filter((header) => header.title !== null && header.title !== undefined);
    return headers;
  }

  getFormat(sheet, startingRow) {
    const headerRow = sheet.getRow(startingRow);
    const row = sheet.getRow(startingRow + 1);
    const format = headerRow.values
      .map((value, colIndex) => {
        const cell = row.getCell(colIndex);
        return {
          data: typeof value === "string" ? value.trim().replace(/[\s.]+/g, "_") : value,
          title: value,
          numFmt: cell.numFmt,
          font: cell.font,
          fill: cell.fill,
          alignment: cell.alignment,
          border: cell.border,
          width: sheet.getColumn(colIndex).width,
        };
      })
      .filter((column) => column.title !== null && column.title !== undefined);
    return format;
  }

  reloadFiles() {
    if (Object.keys(StorageService.currentRecord).length > 0) {
      $("#fileNamesCombo").empty();
      $("#sheetNamesCombo").empty();
      const file = StorageService.currentData[Object.keys(StorageService.currentData)[0]];
      Object.keys(StorageService.currentData).forEach((key, index) => {
        $("#fileNamesCombo").append(
          $("<option>", {
            value: key,
            text: key,
          })
        );
      });

      Object.keys(file).forEach((key, index) => {
        $("#sheetNamesCombo").append(
          $("<option>", {
            value: key,
            text: key,
          })
        );
      });
    }
  }
}
