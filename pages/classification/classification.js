// pages/text/text.js
const common = require('../../common').common
const apicategory = require('../../config').config.apicategory
const goodslist = require('../../config').config.goodslist
const shopcartadd = require('../../config').config.shopcartadd
Page({
  data: {
    isclick:true,
    active: '',
    active1: 0,
    firststate: [],
    classify:'',
    id:'',


    goods_list: '',
    pageIndex: 1,
  },
  //选择主分类
  choosedclassify: function (e) {
    var id = e.currentTarget.dataset.id
    // 状态变量
    this.goods_list(id)
    var firststate = this.data.firststate
    if (firststate[id] == undefined) {
      firststate = []
      firststate[id] = true
      this.setData({
        choosedclassify: id,
        active: id,
        id:id,
        pageIndex:1,
        active1: 0,
        firststate: firststate
      })
    } else {
      firststate = []
      this.setData({
        choosedclassify: 10000,
        active: id,
        id:id,
        pageIndex: 1,
        active1: 0,
        firststate: firststate
      })
    }
  },
  //选择次分类
  choosedsecond: function (e) {
    var id = e.currentTarget.dataset.id
    this.setData({
      active1: id,
      id:id,
      pageIndex:1
    })
    this.goods_list(id)
  },

  // 跳转到下一页
  goto_next: function (e) {
    var url = e.currentTarget.dataset.url
    wx.redirectTo({
      url: url,
    }) 
  },

  //跳转到商品详情
  gotodetails:function(e){
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods-detail/goods-detail?id=' + id,
    })
  },
  nomore_add:function(){
    common.tip('该商品已售罄，请选择其他商品', 'none')
  },



  //删除商品列表
  nomore_cut: function (e) {
    var that = this
    var goods_id = e.currentTarget.dataset.goods_id
    var cansale = e.currentTarget.dataset.cansale
    var md_goods_id = e.currentTarget.dataset.md_goods_id
    var unit_id = e.currentTarget.dataset.unit_id
    var goods_price = e.currentTarget.dataset.goods_price
    var num = 0
    wx.showModal({
      title: '提示信息',
      content: '是否删除该项商品！',
      success: function (res) {
        if (res.confirm) {
          that.change_goodsnum(num, goods_id, md_goods_id, unit_id, goods_price)
        }
      }
    })
  },
  onShow: function (options) {
    var that = this
    wx.request({
      url: apicategory,
      method: 'POST',
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      data: {
        access_token: wx.getStorageSync('token').access_token,
        action: 'list',
        sign: wx.getStorageSync('sign')
      },
      success: function (res) {
        that.setData({
          classify:res.data.data,
          active:res.data.data[0].id,
          id:0
        })
        that.goods_list(0)
      },
    })
  },

  goods_list:function(id){
    var that = this
    //商品列表
    wx.request({
      url: goodslist,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        access_token: wx.getStorageSync('token').access_token,
        action: 'list',
        page: 1,
        list_rows: 2,
        search_data: '',
        sign: wx.getStorageSync('sign'),
        openid: wx.getStorageSync('token').openid,
        type: 1,
        category_id: id
      },
      success: function (res) {
        if (res.data.data) {
          that.projectallway(res.data.data)
        } else {
          common.tip('没有您要找的商品', 'none')
          that.setData({
            goods_list: '',
          })
        }
      },
    })
  },



  // 列表渲染
  projectallway: function (listData) {
    var that = this
    that.setData({
      goods_list: listData,
      cart_total: listData[0].cart_total
    })
  },


  //下滑到下一页效果
  onReachBottom: function () {
    var that = this
    let id = this.data.id
    var datas = this.data.goods_list
    var newPage = that.data.pageIndex + 1
    that.setData({
      pageIndex: newPage
    })
    wx.request({
      url: goodslist,
      method: 'POST',
      data: {
        access_token: wx.getStorageSync('token').access_token,
        action: 'list',
        page: newPage,
        list_rows: 2,
        sign: wx.getStorageSync('sign'),
        openid: wx.getStorageSync('token').openid,
        type: 1
      },
      success: function (res) {
        if (res.data.data) {
          var listData = datas.concat(res.data.data)
          that.projectallway(listData)
        } else {
          common.tip('没有更多','none')
        }
      },
    })
  },



  //添加到购物车
  add_shopcart: function (e) {
    var that = this
    var id = this.data.id
    var isclick = this.data.isclick
    if (isclick == true) {
      var goods_id = e.currentTarget.dataset.goods_id
      var cansale = e.currentTarget.dataset.cansale
      var md_goods_id = e.currentTarget.dataset.md_goods_id
      var unit_id = e.currentTarget.dataset.unit_id
      var goods_price = e.currentTarget.dataset.goods_price
      var num = e.currentTarget.dataset.num
      if (num == cansale) {
        common.tip('已达到购买上限,每人限购' + cansale + '份', 'none')
      } else {
        num++
        wx.request({
          url: shopcartadd,
          method: 'POST',
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: {
            access_token: wx.getStorageSync('token').access_token,
            action: 'add',
            goods_id: goods_id,
            md_goods_id: md_goods_id,
            unit_id: unit_id,
            num: num,
            sign: wx.getStorageSync('sign'),
            openid: wx.getStorageSync('token').openid,
            goods_price: goods_price
          },
          success: function (res) {
            that.setData({
              isclick: false
            })
            that.goods_list(id)
            setTimeout(function () {
              that.setData({
                isclick: true
              })
            }, 300)
          },
        })
      }
    }
  },

// 减少商品
  cut_shopcart:function(e){
    var that = this
    var isclick = this.data.isclick
    if (isclick == true) {
      var goods_id = e.currentTarget.dataset.goods_id
      var cansale = e.currentTarget.dataset.cansale
      var md_goods_id = e.currentTarget.dataset.md_goods_id
      var unit_id = e.currentTarget.dataset.unit_id
      var goods_price = e.currentTarget.dataset.goods_price
      var num = e.currentTarget.dataset.num
      num--
      that.change_goodsnum(num, goods_id, md_goods_id, unit_id, goods_price)
    } 
  },

  //加减商品数量
  change_goodsnum: function (num, goods_id, md_goods_id, unit_id, goods_price) {
    var that = this
    var id = this.data.id
    wx.request({
      url: shopcartadd,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        access_token: wx.getStorageSync('token').access_token,
        goods_id: goods_id,
        md_goods_id: md_goods_id,
        unit_id: unit_id,
        num: num,
        sign: wx.getStorageSync('sign'),
        openid: wx.getStorageSync('token').openid,
        goods_price: goods_price
      },
      success: function (res) {
        that.goods_list()
        that.setData({
          isclick: false
        })
        setTimeout(function () {
          that.setData({
            isclick: true
          })
        }, 300)
      },
    })
  },
})