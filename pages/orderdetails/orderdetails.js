// pages/mine/orderdetails/orderdetails.js
const order = require('../../config').config.order
const payment = require('../../config').config.payment
const paymentback = require('../../config').config.check_weixin_order
var user_token = wx.getStorageSync('token').user_token
const common = require('../../common').common
Page({
  data: {
    qcode:'',
    type_choose:true,
    content:1,
    daytime:[
      '今天',
      '明天',
      '后天'
    ],
    dayIndex:1,
    hourtime: [
      '10:00-12:00',
      '14:00-16:00',
      '18:00-20:00'
    ],
    dayIndex: 1,
    hourIndex: 0,
    qr_code_bg:false
  },
  qr_code: function () {
    var qcode = this.data.qcode
    this.setData({
      qcode: qcode,
      qr_code_bg: true
    })
  },
  qr_code_bg:function(){
    this.setData({
      qr_code_bg:false
    })
  },

  goto_buy:function(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  

  //调起支付
  pay: function (e) {
    var orderid = e.currentTarget.dataset.orderid
    var sn = e.currentTarget.dataset.sn
    wx.request({
      url: payment,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        user_token: wx.getStorageSync('token').user_token,
        access_token: wx.getStorageSync('token').access_token,
        openid: wx.getStorageSync('token').openid,
        orderid: orderid,
        appid: 'wx3dcd06a59742ce6d'
      },
      success: function (res) {
        if (res.data.data.package){
          wx.requestPayment({
            'package': res.data.data.package,
            'timeStamp': res.data.data.timeStamp,
            'nonceStr': res.data.data.nonceStr,
            'signType': res.data.data.signType,
            'paySign': res.data.data.paySign,
            success: function (res) {
              wx.request({
                url: paymentback,
                method: 'POST',
                data: {
                  sn: sn,
                  appid: 'wx3dcd06a59742ce6d'
                },
                success: function (res) {
                  if (res.data.code == 1) {
                    wx.navigateTo({
                      url: '/pages/orderdetails/orderdetails?orderstatus=' + 3 + '&id=' + res.data.id,
                    })
                  }
                }
              })
            },
          })
        }else if(res.data.data.sn){
          wx.showModal({
            title: '提示信息',
            content: '此商品已支付成功，返回首页继续购买',
            showCancel: true,
            success: function(res) {
              if(res.confirm){
                wx.redirectTo({
                  url: '/pages/index/index',
                })
              }
            },
          })
        }      
      },
    })
  },
  onLoad: function (options) {
    var that = this
    var id = options.id
    var orderstatus = options.orderstatus
    this.setData({
      isshow: orderstatus
    })
    wx.request({
      url: order,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        user_token: wx.getStorageSync('token').user_token,
        access_token: wx.getStorageSync('token').access_token,
        sign: wx.getStorageSync('sign'),
        openid: wx.getStorageSync('token').openid,
        action: 'info',
        id: id
      },
      success: function (res) {
        if(res.data.data){
          that.setData({
            info_list: res.data.data,
            goods: res.data.data.goods,
            store: res.data.data.store,
            customer: res.data.data.customer
          })
        }
        if(res.data.data.qcode){
          that.setData({
            qcode: res.data.data.qcode
          })
        }
      },
    })
  },
})