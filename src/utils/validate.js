/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * 判断一个路径是否为外部链接
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 判断输入的字符串是否是有效的用户名
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {

  // 临时使用常量数组进行判断，应改为直接在服务端进行判断
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}
