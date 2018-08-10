// pages/mine/order/order.js
const order = require('../../config').config.order
const common = require('../../common').common
Page({
  data: {
    no_order: false,
    choosecolor: '',
    title: [{
        'name': '全部'
      },
      {
        'name': '待付款'
      },
      {
        'name': '待取货'
      },
      {
        'name': '已取货'
      }
    ],
    list_info:'',
    pageIndex:1
  },
  //选择类型
  choosetype: function(e) {
    var that = this
    var id = e.currentTarget.dataset.id
    this.setData({
      choosecolor: id,
      pageIndex:1,
    })
    that.choose_order(id)
  },

  // 订单详情
  goto_orderdetails: function(e) {
    var orderstatus = e.currentTarget.dataset.orderstatus
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/orderdetails/orderdetails?id=' + id + '&orderstatus=' + orderstatus,
    })
  },

  goto_buy:function(){
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  onLoad: function(options) {
    var choosecolor = options.id
    this.setData({
      choosecolor: choosecolor
    })
    var that = this
    that.choose_order(choosecolor)
  },

  choose_order: function (choosecolor){
    var that = this
    wx.request({
      url: order,
      method: 'POST',
      data: {
        user_token: wx.getStorageSync('token').user_token,
        access_token: wx.getStorageSync('token').access_token,
        action: 'list',
        order_status: choosecolor,
        page: 1,
        list_rows: 10,
      },
      success: (res => {
        if (res.data.data) {
          that.projectallway(res.data.data)
          that.setData({
            no_order: false,
          })
        } else {
          that.setData({
            no_order: true,
            list_info: ''
          })
        }
      }) 
    })
  },

    // 列表渲染
  projectallway: function (listData) {
    var that = this
    that.setData({
      list_info: listData
    })
  },

  //下滑到下一页效果
  onReachBottom: function () {
    var that = this
    var datas = this.data.list_info
    var choosecolor = this.data.choosecolor
    var newPage = that.data.pageIndex + 1
    that.setData({
      pageIndex: newPage
    })
    wx.request({
      url: order,
      method: 'POST',
      data: {
        user_token: wx.getStorageSync('token').user_token,
        access_token: wx.getStorageSync('token').access_token,
        action: 'list',
        order_status: choosecolor,
        page: newPage,
        list_rows: 10,
      },
      success: function (res) {
        if (res.data.data) {
          var listData = datas.concat(res.data.data)
          that.projectallway(listData)
        } else {
          wx.showToast({
            title: '没有更多',
            icon: 'none',
          })
          that.setData({
            no_more: true
          })
        }
      },
    })
  },
})