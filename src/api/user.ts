import { http } from "@/utils/http";
import { getUserDataSource } from "@/utils/auth";
export type UserResult = {
  success: boolean;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export const baseUrlApi = (url: string) => {
  return `https://api.peidigroup.cn/srm${url}`;
};
const commonUrlApi = (url: string) =>
  `${"https://user.peidigroup.cn"}/user${url}`;

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", commonUrlApi("/login/password"), {
    data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
};

// 根据code拿到个人信息
export const getUserInfo = code => {
  return http.request(
    "get",
    `https://api.peidigroup.cn/oms/ding/userInfo?code=${code}`,
    {}
  );
};

// 注册
export const register = data => {
  return http.request(
    "post",
    `https://user.peidigroup.cn/user/email-register`,
    {
      data
    }
  );
};

// 发送验证码
export const sendCodeApi = data => {
  return http.request("post", `https://user.peidigroup.cn/user/validate-code`, {
    data,
    headers: {
      PLATFORM: "srm"
    }
  });
};

// 调用注册接口
export const registerApi = data => {
  return http.request("post", `https://user.peidigroup.cn/user/sms-register`, {
    data,
    headers: {
      PLATFORM: "srm"
    }
  });
};

// 获取用户dataSource字段
export const getUserDataSourceApi = params => {
  return http.request("get", `https://user.peidigroup.cn/user/user-check`, {
    params
  });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

// 获取所有分类
export const getAllCate = params => {
  return http.request("get", baseUrlApi("/category/list"), {
    params: {
      ...params
    }
  });
};

// 获取分页所有分类
export const getPageCate = params => {
  return http.request("get", baseUrlApi("/category/page"), {
    params: {
      ...params
    }
  });
};

// 添加新的分类
export const addCate = data => {
  return http.request("post", baseUrlApi("/category/new"), {
    data
  });
};

// 更改分类信息
export const updateCate = data => {
  return http.request("post", baseUrlApi("/category/update"), {
    data
  });
};

// 更改分类信息
export const deleteCate = data => {
  return http.request("post", baseUrlApi("/category/delete"), {
    data
  });
};

// 获取所有分类
export const getAllPd = params => {
  return http.request("get", baseUrlApi("/product/list"), {
    params
  });
};

// 获取分页所有分类
export const getPagePd = params => {
  return http.request("get", baseUrlApi("/product/page"), {
    params
  });
};

// 添加新的产品
export const addPd = data => {
  return http.request("post", baseUrlApi("/product/new"), {
    data
  });
};

// 更改产品
export const updatePd = data => {
  return http.request("post", baseUrlApi("/product/update"), {
    data
  });
};

// 更改产品
export const deletePd = data => {
  return http.request("post", baseUrlApi("/product/delete"), {
    data
  });
};

// 获取产品enum
export const getEnum = params => {
  return http.request("get", baseUrlApi("/common/enum"), {
    params
  });
};

// 添加新的报价
export const addQuota = data => {
  return http.request("post", baseUrlApi("/quotation/new"), {
    data
  });
};

// 更改报价
export const updateQuota = data => {
  return http.request("post", baseUrlApi("/quotation/update"), {
    data
  });
};

// 更改baojia
export const deleteQuota = data => {
  return http.request("post", baseUrlApi("/quotation/delete"), {
    data
  });
};

// 获取分页所有报价
export const getPageQuota = params => {
  return http.request("get", baseUrlApi("/quotation/page"), {
    params: {
      ...params
    }
  });
};
// 获取分类获取产品
export const getCatePd = params => {
  return http.request("get", baseUrlApi("/product/category"), {
    params
  });
};

// 获取服务商
export const addSupplier = data => {
  return http.request("post", baseUrlApi("/supplier/new"), {
    data
  });
};

// 获取分页所有报价
export const getPageSupplier = params => {
  return http.request("get", baseUrlApi("/supplier/page"), {
    params
  });
};

// 删除公司
export const deleteSupplier = data => {
  return http.request("post", baseUrlApi("/supplier/delete"), {
    data
  });
};

// 更新公司
export const updateSupplier = data => {
  return http.request("post", baseUrlApi("/supplier/update"), {
    data
  });
};

// 获取所有供应商
export const getAllSup = params => {
  return http.request("get", baseUrlApi("/supplier/all"), {
    params
  });
};

// 获取所有供应商
export const downLoadFile = params => {
  return http.request("get", baseUrlApi("/common/download"), {
    params
  });
};
// 获取文件下载链接
export const getFileDownLoadPath = params => {
  return http.request("get", baseUrlApi("/common/download-url"), {
    params
  });
};

// 获取年度采购列表
export const getYearList = params => {
  return http.request("get", baseUrlApi("/purchase/list"), {
    params
  });
};

// 更新年度采购列表
export const updateYearList = data => {
  return http.request("post", baseUrlApi("/purchase/update"), {
    data
  });
};

// 删除一项采购列表
export const deleteYearList = data => {
  return http.request("post", baseUrlApi("/purchase/delete"), {
    data
  });
};
