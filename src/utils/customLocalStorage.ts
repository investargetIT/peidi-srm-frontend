export const expirableLocalStorage = {
  // 默认过期时间（24小时）
  _defaultExpiry: 24 * 60 * 60 * 1000,

  /**
   * 增强版 setItem (兼容原生签名，增加可选参数)
   * @param {string} key
   * @param {string} value
   * @param {object} [options] { expiry: 过期时间（毫秒） }
   */
  setItem(key, value, options = {}) {
    const data = {
      value: value, // 原始值
      expiry: Date.now() + (options.expiry || this._defaultExpiry)
    };
    localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * 增强版 getItem (自动清理过期数据)
   * @param {string} key
   * @returns {string|null} 原始字符串或null
   */
  getItem(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    // 尝试解析为带过期时间的数据结构
    try {
      const { value, expiry } = JSON.parse(item);
      if (Date.now() > expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return value; // 返回原始字符串
    } catch {
      return item; // 非本封装的数据直接返回
    }
  },

  // 保持其他原生方法不变
  removeItem: key => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
  key: index => localStorage.key(index),
  get length() {
    return localStorage.length;
  },

  //--------------- 扩展工具方法 ---------------
  /**
   * 存储JSON对象（快捷方法）
   * @param {string} key
   * @param {any} value
   * @param {object} [options]
   */
  setJSON(key, value, options) {
    this.setItem(key, JSON.stringify(value), options);
  },

  /**
   * 获取解析后的JSON对象（快捷方法）
   * @param {string} key
   * @returns {any|null}
   */
  getJSON(key) {
    const value = this.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  },

  /**
   * 清理所有过期数据（可手动调用）
   */
  cleanExpired() {
    Object.keys(localStorage).forEach(key => {
      this.getItem(key); // 通过getItem触发自动清理
    });
  }
};
