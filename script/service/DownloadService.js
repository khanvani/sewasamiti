class DownloadService {
  constructor(filterService) {
    this.filterService = filterService;
    this.download = this.download.bind(this);
    this.initFilters = this.initFilters.bind(this);
  }

  initFilters() {
    if (Object.keys(StorageService.currentRecord).length > 0) {
      const options = StorageService.currentRecord.headers.map((columnObj) => `<option value="${columnObj.data}">${columnObj.title}</option>`).join("");
      let selectHtml = `
    <div class="form-group">
      <label for="selectColumns">Select Columns to Display</label>
      <select id="selectColumns" class="form-control" multiple data-live-search="true">
      <option value="All" selected>All</option> 
      ${options}
      </select>
    </div>`;
      $("#selectColumnContainer").html(selectHtml);
      $("#selectColumns").selectpicker();

      selectHtml = `
    <div class="form-group">
      <label for="downloadType">Download Files Group By : </label>
      <select id="downloadType" class="form-control" data-live-search="true">
        ${options}
      </select>
    </div>`;
      $("#downloadTypeContainer").html(selectHtml);
      $("#downloadType").selectpicker();
      selectHtml = `
    <div class="form-group">
      <label for="parentFolder">Parent Folders : </label>
      <select id="parentFolder" class="form-control" data-live-search="true">
        ${options}
      </select>
    </div>`;
      $("#parentFolderContainer").html(selectHtml);
      $("#parentFolder").selectpicker();
    }
  }

  async download() {
    try {
      const type = $("#downloadType").val();
      const groupedByType = this.groupDataByType(type);
      await this.createAndPopulateExcelSheets(groupedByType,false);
    } catch (error) {
      console.error(error);
      alert("Failed to download files. See console for details.");
    }
  }

  groupDataByType(type) {
    return StorageService.currentRecord.data.reduce((acc, item) => {
      let key = "";
      key = key + item[type];
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  addTitleRow(worksheet, groupbyName, gender, parentFolder) {
    //const department = parentFolder ? parentFolder + " - " : "";
    const title = $("#titleValue").val() + ` : ${groupbyName}  ${gender}`;
    const titleRow = worksheet.getRow(1);
    titleRow.values = [title];
    titleRow.font = { size: 18, bold: true };
    titleRow.getCell(1).alignment = { horizontal: "center" };
    titleRow.commit();
    worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
  }

  addHeaderRow(worksheet, headers) {
    const headerRow = worksheet.addRow(headers.map((header) => header.title));

    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1];
      cell.font = header.font;
      cell.fill = header.fill;
      cell.alignment = header.alignment;
      cell.border = cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      if (header.numFmt) {
        cell.numFmt = header.numFmt;
      }
    });
  }

  async createAndPopulateExcelSheets(groupedByType, separateFiles) {
      const zip = new JSZip();
      let workbook;
      if (!separateFiles) {
          workbook = new ExcelJS.Workbook();
      }

      for (const [type, typeData] of Object.entries(groupedByType)) {
        if (separateFiles) {
            workbook = new ExcelJS.Workbook();
        }
        const parentFolderColumn = $("#parentFolder").val();
        const parentFolder = typeData && typeData[0] && typeData[0][parentFolderColumn];
        const worksheet = workbook.addWorksheet(type);  // Use 'type' as sheet name for clarity

        let headers = $("#selectColumns").val();
        let selectedValue = $("#selectColumns").val();
        const fileNameSelectValue = $("#downloadType").val();
        if (selectedValue.includes("All")) {
            headers = [];
            $("#selectColumns option:not([value='All'])").each(function () {
              if(this.value != fileNameSelectValue && this.value != parentFolderColumn)
                headers.push(this.value);
            });
        }
        headers = $.map(headers, function (key) {
            var obj = $.grep(StorageService.currentRecord.headers, function (o) {
                return o.data === key;
            })[0];
            return obj ? obj : null;
        });

        worksheet.columns = headers.map((header) => ({
            header: header.title,
            key: header.title.trim().replace(/[\s.]+/g, "_"),
            width: header.width,
        }));

        this.addHeaderRow(worksheet, headers);
        this.addTitleRow(worksheet, type, "", parentFolder);
        const dataFormat = StorageService.currentRecord.format;
        typeData.forEach((dataRow) => {
            const currentRow = worksheet.addRow(dataRow);
            currentRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const header = dataFormat[colNumber - 1];
                cell.font = header.font;
                cell.fill = header.fill;
                cell.alignment = header.alignment;
                cell.border = cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                          };
                if (header.numFmt) {
                    cell.numFmt = header.numFmt;
                }
            });
        });
        if (separateFiles) {
            const fileBuffer = await this.getExcelFileBuffer(workbook, type, parentFolder);
            const departmentFolder = zip.folder(parentFolder);
            departmentFolder.file(fileBuffer.filename, fileBuffer.buffer);
        }
      }

    if (!separateFiles) {
        const fileBuffer = await this.getExcelFileBuffer(workbook,  "", "");
        const blob = new Blob([fileBuffer.buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        saveAs(blob, fileBuffer.filename);
    } else {
        zip.generateAsync({ type: "blob" }).then(function (content) {
            const dateString = new Date().toISOString().split("T")[0].replace(/-/g, "");
            saveAs(content, `output-${dateString}.zip`);
        });
    }


  }

  async getExcelFileBuffer(workbook, type, parentFolder) {
      const buffer = await workbook.xlsx.writeBuffer();
      const dateString = new Date().toISOString().split("T")[0].replace(/-/g, "");
      let filename = "";
      filename += $("#fileNameValue").val() ? $("#fileNameValue").val().trim() + "-" : "";
      filename += type ? type.replace(/ /g, "-").trim() + "-" : "";
      filename += `${dateString}.xlsx`;
      return {
          filename,
          buffer,
      };
  }
  async downloadExcelFile(workbook, type) {
    const buffer = await workbook.xlsx.writeBuffer();
    const dateString = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    let filename = $("#fileNameValue").val() ? $("#fileNameValue").val().trim() + "-" : "";
    filename = filename + (type ? type.replace(" ", "-").trim() + "-" : "");
    filename = filename + `${dateString}.xlsx`;
    saveAs(blob, filename);
  }
}
