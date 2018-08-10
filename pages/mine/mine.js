// pages/mine/mine.js
const mine = require('../../config').config.mine
// var token = wx.getStorageSync('token')
Page({
  data: {
    order_list: [{
        'icon': '/images/payment.png',
        'name': '待付款'
      },
      {
        'icon': '/images/shipping.png',
        'name': '待取货'
      },
      {
        'icon': '/images/complete.png',
        'name': '已取货'
      },
    ],

    showinfo: [
      { 'shownumber': '0.00', 'showname': '余额/充值', 'color': '#F97A42' },
      { 'shownumber': '0', 'showname': '优惠券' },
      { 'shownumber': '0', 'showname': '积分/记录' },
      { 'shownumber': '0', 'showname': '付款码' },
    ],
    avatarUrl: wx.getStorageSync('userInfo').avatarUrl,
    nickName: wx.getStorageSync('userInfo').nickName
  },


  //跳转到下一页
  gotoNext: function (e) {
    var id = e.currentTarget.dataset.id
    if (id == 0) {
      var url = '/pages/myaccount/myaccount'
    } else if(id == 1){
      var url = '/pages/coupons/coupons'
    }else {
      console.log("无法跳转")
    }
    if (url) {
      wx.navigateTo({
        url: url,
      })
    }
  },

  //跳转到我的订单
  gotoOrder: function(e) {
    var id = e.currentTarget.dataset.id
    if (id == 100) {
      var url = '../order/order?id=' + 1
    } else if (id == 0) {
      var url = '../order/order?id=' + 2
    } else if (id == 1) {
      var url = '../order/order?id=' + 3
    } else if (id == 2) {
      var url = '../order/order?id=' + 4
    }
    if (url) {
      wx.navigateTo({
        url: url,
      })
    }
  },

  // 跳转到下一页
  goto_next: function(e) {
    var url = e.currentTarget.dataset.url
    wx.redirectTo({
      url: url,
    })
  },
  

  onShow: function (options) {
    this.info_list()
  },
  // onLoad: function(options) {
  //   this.info_list()
  // },

  info_list:function(){
    var that = this
    wx.request({
      url: mine,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        user_token: wx.getStorageSync('token').user_token,
        action: 'info',
      },
      success: (res => {
        if (res.data.data) {
          that.setData({
            user_info: res.data.data,

          })
        }
      })
    })
  }
})