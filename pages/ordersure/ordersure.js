// pages/mine/orderdetails/orderdetails.js
const order = require('../../config').config.order
const payment = require('../../config').config.payment
const paymentback = require('../../config').config.check_weixin_order
const common = require('../../common').common
Page({
  data: {
    makesure:false,
    daytime: [
      '今天',
      '明天',
      '后天'
    ],
    hourtime: [
      '10:00-12:00',
      '14:00-16:00',
      '18:00-20:00'
    ],
    dayIndex: 1,
    hourIndex: 0
  },
  //点击拨号
  calling: function (e) {
    var phoneNumber = e.currentTarget.dataset.calling
    if (phoneNumber != null) {
      wx.makePhoneCall({
        phoneNumber: phoneNumber, //此号码并非真实电话号码，仅用于测试  
        success: function () {
        },
        fail: function () {
          wx.showToast({
            title: '拨号失败',
            icon: 'loading',
          })
        }
      })
    } else {
      wx.showToast({
        title: '号码为空',
        icon: 'loading',
      })
    }
  },

  //点击确认支付
  makesure:function(){
    this.setData({
      makesure: true 
    })
  },

//吊起支付
  pay:function(e){
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
        appid:'wx3dcd06a59742ce6d'
      },
      success: function (res) {
        console.log(res.data.package)
        if (res.data.data.package) { 
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
        } else if (res.data.data.sn) {
          wx.showModal({
            title: '提示信息',
            content: '此商品已支付成功，返回购物车继续购买',
            showCancel: true,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/shoppingcart/shoppingcart',
                })
              }
            },
          })
        } 
      },
    })
  },

  //取消支付
  cancel:function(){
    this.setData({
      makesure: false
    })
  },

  // 时间选择  
  bindDateChange: function (e) {
    var daytime = this.data.daytime //获取选择的名字
    var id = daytime[e.detail.value].id //获取选择项对应的的id
    this.setData({
      daytime: daytime,
      dayIndex: e.detail.value,
    })
  },

  // 时间段选择  
  bindDateChange1: function (e) {
    var hourtime = this.data.hourtime //获取选择的名字
    var id = hourtime[e.detail.value].id //获取选择项对应的的id
    this.setData({
      hourtime: hourtime,
      hourIndex: e.detail.value,
    })
  },
  onLoad: function (options) {
    var that = this
    var id = options.orderid
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
        if (res.data.data) {
          that.setData({
            info_list:res.data.data,
            goods:res.data.data.goods,
            store: res.data.data.store,
            customer: res.data.data.customer
          })
        } 
      },
    })
  },
})