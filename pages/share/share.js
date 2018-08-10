// pages/share/share.js
const goodslist = require('../../config').config.goodslist
var access_token = wx.getStorageSync('token').access_token
const common = require('../../common').common
Page({
  data: {
    state:0,
    id:'',
    share:''
  },
  look_more:function(){
    var state = this.data.state
    if (state == 0){
      this.setData({
        state: 1
      })
    }else{
      this.setData({
        state: 0
      })
    } 
  },

  //跳转到详情
  goto_goodsdetails:function(e){
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods-detail/goods-detail?id='+id,
    })
  },
  onLoad: function (options) {
    var that = this
    var id = options.id
    this.setData({
      id: id
    })
    wx.request({
      url: goodslist,
      method: 'POST',
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      data: {
        access_token: wx.getStorageSync('token').access_token,
        action: 'info',
        id: id,
        openid: wx.getStorageSync('token').openid,
        sign: wx.getStorageSync('sign')
      },
      success: function (res) {
        that.setData({
          goods_info: res.data.data,
          share:res.data.data.share
        })
        common.cutDownTime(res.data.data.ys_end_time, that)//倒计时
      },
    })
  },
  //分享
  onShareAppMessage: function (res) {
    var sign = wx.getStorageSync('sign')
    var share = this.data.share
    var id = this.data.id
    return {
      // desc: '健康菜，大口吃',
      title: share.title,
      path: '/pages/index/index?sign=' + sign + '&id=' + id,
      imageUrl: share.imageUrl,
      success: function (res) { }
    }
  },
})