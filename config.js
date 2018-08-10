var host = "https://shop.qingwajia.cn/shop/"   //域名配置
// var host = "http://gy.t.geekzj.cn/shop/"   //域名配置
var config = {
  // 下面的地址配合云端 Server 工作
  host,
  apiUrl: host,
  //微信授权登录
  login: `${host}common/wxidentity`, 
  //短信接口
  sendsmscode: `${host}common/sendsmscode`,
  //用户授权
  auth: `${host}common/auth`,
  //用户注册
  register: `${host}common/register`,

  //商品列表
  goodslist: `${host}apigoods/index`,
  

  //购物车
  shopcartadd: `${host}apicart/add`,
  shopcartinfo: `${host}apicart/info`,
  shopcartindex: `${host}apicart/index`,
  
  //个人中心
  mine: `${host}apicoustomer/index`,

  //订单
  order: `${host}apiorder/index`,

  //门店信息
  store: `${host}apistore/index`,

  //支付接口
  payment: `${host}payment/wxpay`,
  //支付返回
  check_weixin_order: `${host}payment/check_weixin_order`,


  //商品分类列表
  apicategory: `${host}apicategory/index`
  
  
  
};
module.exports = {
  host: host,
  config: config,
}
