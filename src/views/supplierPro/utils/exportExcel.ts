import { getPageSupplier } from "@/api/user";
import { ElMessage } from "element-plus";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * 导出全部供应商数据
 * 使用 ExcelJS 进行样式美化
 */
export const exportAllSupplier = async () => {
  const loadingMessage = ElMessage.info({
    message: "正在导出全部数据，请稍候...",
    duration: 0
  });

  try {
    // ============================
    // 1. 构建搜索条件
    // ============================
    const searchStr: any = [];

    // ============================
    // 2. 获取总数据量
    // ============================
    const totalCountResponse: any = await getPageSupplier({
      pageNo: 1,
      pageSize: 1,
      searchStr: JSON.stringify(searchStr)
    });

    const totalRecords = totalCountResponse?.data?.total || 0;
    if (totalRecords === 0) {
      loadingMessage.close();
      ElMessage({ message: "没有数据可以导出", type: "warning" });
      return;
    }

    // ============================
    // 3. 分批获取所有数据
    // ============================
    const allData = [];
    const batchSize = 1000; // 每次获取1000条数据
    const totalPages = Math.ceil(totalRecords / batchSize);

    for (let page = 1; page <= totalPages; page++) {
      const response: any = await getPageSupplier({
        pageNo: page,
        pageSize: batchSize,
        searchStr: JSON.stringify(searchStr)
      });

      if (response?.data?.records) {
        allData.push(...response.data.records);
      }
    }

    // ============================
    // 4. 处理数据格式
    // ============================
    const processedData = allData.map(item => {
      // 处理联系人和联系方式
      let contactInfo_Person: string = "";
      let contactInfo_Info: string = "";
      try {
        const contactInfo = JSON.parse(item.contactInfo);
        if (Array.isArray(contactInfo)) {
          contactInfo_Person = contactInfo?.[0]?.person || "";
          contactInfo_Info = contactInfo?.[0]?.info || "";
        }
      } catch (e) {
        console.warn("解析联系信息失败:", e);
      }

      return {
        companyName: item.companyName || "",
        companyAddress: item.companyAddress || "",
        contactInfo_Person: contactInfo_Person || "",
        contactInfo_Info: contactInfo_Info || "",
        supplierGradeName: item.supplierGradeName || "",
        supplierProductName: (item.supplierProductName || []).join(",")
      };
    });

    // ============================
    // 5. 配置 Excel 列定义
    // ============================
    const columns = [
      { prop: "companyName", label: "公司名称", width: 25 },
      { prop: "companyAddress", label: "地址", width: 30 },
      { prop: "contactInfo_Person", label: "联系人", width: 15 },
      { prop: "contactInfo_Info", label: "联系方式", width: 20 },
      { prop: "supplierGradeName", label: "供应商类型", width: 15 },
      { prop: "supplierProductName", label: "供应产品", width: 40 }
    ];

    // ============================
    // 6. 创建 Workbook 并应用样式
    // ============================
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "system";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("供应商数据", {
      views: [{ state: "frozen", xSplit: 0, ySplit: 1 }] // 冻结首行
    });

    // 定义样式
    const headerStyle = {
      font: {
        name: "微软雅黑",
        size: 11,
        bold: true,
        color: { argb: "FFFFFFFF" }
      },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2D5B8E" } // 深蓝色背景
      },
      border: {
        top: { style: "thin", color: { argb: "FF2D5B8E" } },
        left: { style: "thin", color: { argb: "FF2D5B8E" } },
        bottom: { style: "thin", color: { argb: "FF2D5B8E" } },
        right: { style: "thin", color: { argb: "FF2D5B8E" } }
      },
      alignment: { vertical: "middle", horizontal: "center", wrapText: true }
    };

    const dataStyle = {
      font: { name: "微软雅黑", size: 10, color: { argb: "FF333333" } },
      border: {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } }
      },
      alignment: { vertical: "middle", horizontal: "left", wrapText: true }
    };

    const alternateRowStyle = {
      ...dataStyle,
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F5" } // 浅灰色背景
      }
    };
    // 设置每一列的宽度和key
    worksheet.columns = columns.map(col => ({
      key: col.prop,
      width: col.width,
      header: col.label
    }));

    // 设置每一列的宽度和key
    worksheet.columns = columns.map(col => ({
      key: col.prop,
      width: col.width,
      header: col.label
    }));

    // 添加表头并应用样式
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell: any) => {
      cell.style = headerStyle;
    });

    // 添加数据行
    processedData.forEach((row, rowIndex) => {
      const dataRow = worksheet.addRow(row);
      dataRow.height = 22; // 设置行高

      // 应用样式 (隔行变色)
      const isEven = rowIndex % 2 === 0;
      const styleToApply = isEven ? dataStyle : alternateRowStyle;

      dataRow.eachCell((cell: any) => {
        cell.style = styleToApply;
      });
    });

    // 设置自动筛选
    worksheet.autoFilter = {
      from: "A1",
      to: `${String.fromCharCode(64 + columns.length)}1`
    };

    // ============================
    // 7. 导出文件
    // ============================
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const fileName = `供应商数据_${timestamp}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(blob, fileName);

    loadingMessage.close();
    ElMessage({
      message: `导出完成！共导出 ${processedData.length} 条记录`,
      type: "success"
    });
  } catch (error) {
    console.error("导出失败:", error);
    loadingMessage.close();
    ElMessage({
      message: "导出失败: " + (error as Error).message,
      type: "error"
    });
  }
};
