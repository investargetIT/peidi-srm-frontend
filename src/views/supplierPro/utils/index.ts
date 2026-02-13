import { STATUS_COLOR_CONFIG } from "@/constants/color";
import dayjs from "dayjs";

/**
 * 服务状态计算
 * @param row 供应商数据行
 * @returns 服务状态对象
 */
// 注意：逻辑有调整，以@/views/supplierPro/components/tipDialogs/index.vue 说明为准
// 注意：判断逻辑已经放到了服务端 此函数理论上不再使用
export const formatSupplierStatus = (row: any) => {
  // 格式化返回的服务状态
  function formatSupplierStatus(
    text: string,
    type: "primary" | "success" | "info" | "warning" | "danger"
  ) {
    return {
      text,
      type,
      color: STATUS_COLOR_CONFIG[type]
    };
  }
  /**
   * 灰色 -未签年框：没勾选年框 或 没上传年框文件 *后面备注里统一称为年框已传
   * 绿色 -有效期内：年框已传，且年框起始 < 当前时间 < 年框结束
   * 黄色 -临近到期：年框已传，且年框起始 < 当前时间 < 年框结束 且(年框结束 - 30天) < 当前时间
   * 红色 -已过期：年框已传，且年框结束 < 当前时间
   */
  // 是否签订年框协议
  const hasSignAgreement = row?.hasSignAgreement;
  // 年框协议文件
  const signAgreement = row?.signAgreement || [];
  if (!hasSignAgreement || signAgreement.length === 0) {
    return formatSupplierStatus("未签年框", "info");
  }

  // 年框起始时间
  const agreementExpiryStart = row?.agreementExpiryStart
    ? dayjs(row?.agreementExpiryStart)
    : null;
  // 年框结束时间
  const agreementExpiryEnd = row?.agreementExpiryEnd
    ? dayjs(row?.agreementExpiryEnd)
    : null;
  if (!agreementExpiryStart || !agreementExpiryEnd) {
    return formatSupplierStatus("年框日期不完整", "info");
  }
  // 当前时间
  const currentTime = dayjs();

  // 已过期
  if (agreementExpiryEnd.isBefore(currentTime)) {
    return formatSupplierStatus("过期", "danger");
  }
  // 有效期内 & 临近到期
  if (
    agreementExpiryStart.isBefore(currentTime) &&
    currentTime.isBefore(agreementExpiryEnd)
  ) {
    if (agreementExpiryEnd.subtract(30, "day").isBefore(currentTime)) {
      return formatSupplierStatus("临期", "warning");
    }
    return formatSupplierStatus("有效", "success");
  }

  // 特例: 年框起始时间 > 当前时间
  if (agreementExpiryStart.isAfter(currentTime)) {
    return formatSupplierStatus("未签年框", "info");
  }
};

// 新的服务状态计算 逻辑放到了服务端 这里只负责展示
export const formatSupplierStatusClient = (row: any) => {
  function formatSupplierStatus(
    text: string,
    type: "primary" | "success" | "info" | "warning" | "danger"
  ) {
    return {
      text,
      type,
      color: STATUS_COLOR_CONFIG[type]
    };
  }

  /**
   * serviceStatus 字段表示
   * 灰色 -未签年框：3
   * 绿色 -有效期内：2
   * 黄色 -临近到期：1
   * 红色 -已过期：4
   */

  const serviceStatus = row?.serviceStatus;
  if (!serviceStatus) {
    return formatSupplierStatus("信息未知", "danger");
  }
  if (serviceStatus === 1) {
    return formatSupplierStatus("临期", "warning");
  }
  if (serviceStatus === 2) {
    return formatSupplierStatus("有效", "success");
  }
  if (serviceStatus === 3) {
    return formatSupplierStatus("未签年框", "info");
  }
  if (serviceStatus === 4) {
    return formatSupplierStatus("过期", "danger");
  }
  return formatSupplierStatus("信息未知", "danger");
};

export const getPdSvg = (name: string) => {
  const loading = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;
  if (name === "loading") {
    return loading;
  }
  return "";
};

// 判断是否是开发环境 返回true代表是开发环境
export function isDevEnv() {
  return process.env.NODE_ENV === "development";
}
