// pages/mine/coupons/coupons.js
Page({
  data: {
    choosecolor: 1,
    title: [{
      'name': '未使用'
    },
    {
      'name': '已使用'
    },
    {
      'name': '已失效'
    }
    ],
  },
  //选择类型
  choosetype: function (e) {
    var that = this
    var id = e.currentTarget.dataset.id
    this.setData({
      choosecolor: id,
    })
  },
  onLoad: function (options) {

  },
})