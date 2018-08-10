// pages/shoppingcart/shoppingcart.js
const shopcartindex = require('../../config').config.shopcartindex
const shopcartadd = require('../../config').config.shopcartadd
const order = require('../../config').config.order
// var user_token = wx.getStorageSync('token').user_token
const common = require('../../common').common
Page({
  data: {
    pageIndex:1,
    datalist:'',
    isclick: true,
    can_calc: 1,

    chooseall: true,
    showicon: [],
    totleprice: 0,
    // youhuiprice: 0,
    cutprice: 0,
    goodsnum: 0,

    num: [],
    money: [],
    goods_id:[],
  },
  //改变购买状态计算总价
  changestate: function(e) {
    var id = e.currentTarget.dataset.id
    var showicon = this.data.showicon
    var num = this.data.num
    var money = this.data.money
    var totleprice = 0
    var goodsnum = 0
    var i
    var state = 1 //判断全选的状态值
   
    //点击列表选择按钮切换为相反状态
    showicon[id] = !showicon[id]
    this.setData({
      can_calc: 0,
      showicon: showicon
    })
    //判断列表有一个为未选择时全选状态为不点亮且state状态为0
    for (i = 0; i < showicon.length; i++) {
      if (showicon[i] == true) {
        state = 0;
        this.setData({
          chooseall: false
        })
      } else if (showicon[i] == false) {
        goodsnum += num[i]
        totleprice += parseFloat(money[i]) * parseInt(num[i])
        this.setData({
          can_calc: 1,
        })
      }
    }
    this.setData({
      totleprice: totleprice.toFixed(2),
      goodsnum: goodsnum
    })
    //如果state状态为1则全选图标点亮
    if (state == 1) {
      this.setData({
        chooseall: true,
      })
    }
  },

  // 跳转到下一页
  goto_next: function (e) {
    var url = e.currentTarget.dataset.url
    wx.redirectTo({
      url: url,
    })
  },

  //删除商品列表
  nomore_cut: function(e) {
    var that = this
    var goods_id = e.currentTarget.dataset.goods_id
    var cansale = e.currentTarget.dataset.cansale
    var md_goods_id = e.currentTarget.dataset.md_goods_id
    var unit_id = e.currentTarget.dataset.unit_id
    var goods_price = e.currentTarget.dataset.goods_price
    var num = 0
    wx.showModal({
      title: '提示信息',
      content: '没有可减少数量，是否删除该项！',
      success: function(res) {
        if (res.confirm) {
          that.change_goodsnum(num, goods_id, md_goods_id, unit_id, goods_price)
        }
      }
    })
  },

  //商品购买上限提醒
  nomore_add:function(){
    common.tip('已达到购买上限', 'none')
  },

  //全部选择 
  chooseall: function() {
    var chooseall = this.data.chooseall
    var showicon = this.data.showicon
    var money = this.data.money
    var num = this.data.num
    var i
    var totleprice = 0
    var goodsnum = 0
    for (i = 0; i < showicon.length; i++) {
      if (chooseall == false) {
        var can_calc = 1
        goodsnum += num[i]
        totleprice += parseFloat(money[i]) * parseInt(num[i])
        showicon[i] = false
      } else {
        var can_calc = 0
        goodsnum = 0
        totleprice = 0
        showicon[i] = true
      }
    }
    var chooseall = !chooseall
    this.setData({
      can_calc: can_calc,
      chooseall: chooseall,
      showicon: showicon,
      totleprice: totleprice.toFixed(2),
      goodsnum: goodsnum
    })
  },

  //跳转到确认订单
  goto_ordersure: function() {
    var can_calc = this.data.can_calc
    if (can_calc == 1){
    var showicon = this.data.showicon
    var num = this.data.num
    var money = this.data.money
    var goods_id = this.data.goods_id
    var j

    var arr = []
    var arr1 = []

    arr1['num'] = num
    arr1['price'] = money
    arr1['goods_id'] = goods_id
    for (j = 0; j < showicon.length; j++) {
      if (showicon[j] == false){
      var obj = {}
      obj['num'] = arr1['num'][j]
      obj['price'] = arr1['price'][j]
      obj['goods_id'] = arr1['goods_id'][j]
      arr.push(obj)
      }
    }
      wx.request({ 
        url: order,
        method: 'POST',
        data: {
          user_token: wx.getStorageSync('token').user_token,
          access_token: wx.getStorageSync('token').access_token,
          sign: wx.getStorageSync('sign'),
          openid: wx.getStorageSync('token').openid,
          action: 'add',
          goods: arr
        },
        success: function (res) {
          var orderid = res.data.data.orderid
          if(res.data.code == 1){
            wx.navigateTo({
              url: '/pages/ordersure/ordersure?orderid=' + orderid,
            })
          }
        }
      })
    }else{
      wx.showModal({
        title: '提示信息',
        content: '请选择您需要购买的商品',
        showCancel: false,
      })
    }
  },


  // 增加商品数量
  add_num: function(e) {
    var that = this
    var isclick = this.data.isclick
    if (isclick == true) {
      var goods_id = e.currentTarget.dataset.goods_id
      var cansale = e.currentTarget.dataset.cansale
      var md_goods_id = e.currentTarget.dataset.md_goods_id
      var unit_id = e.currentTarget.dataset.unit_id
      var goods_price = e.currentTarget.dataset.goods_price
      var num = e.currentTarget.dataset.num
      if (num >= cansale) {
        common.tip('已达到购买上限,每人限购' + cansale + '份', 'none')
      } else {
        num++
        that.change_goodsnum(num, goods_id, md_goods_id, unit_id, goods_price)
      }
    }
  },
  //减少商品
  cut_num: function(e) {
    var that = this
    var isclick = this.data.isclick
    if (isclick == true) {
      var goods_id = e.currentTarget.dataset.goods_id
      var cansale = e.currentTarget.dataset.cansale
      var md_goods_id = e.currentTarget.dataset.md_goods_id
      var unit_id = e.currentTarget.dataset.unit_id
      var goods_price = e.currentTarget.dataset.goods_price
      var num = e.currentTarget.dataset.num
      if (num <= 1) {
        common.tip('没有可减少的商品了！', 'none')
      } else {
        num--
        that.change_goodsnum(num, goods_id, md_goods_id, unit_id, goods_price)
      }
    } 
  },


  //继续购物
  goto_buy: function () {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },


  //删除单个售罄商品
  sale_out_delect:function(e){
    var that = this
    var goods_id = e.currentTarget.dataset.goods_id
    var cansale = e.currentTarget.dataset.cansale
    var md_goods_id = e.currentTarget.dataset.md_goods_id
    var unit_id = e.currentTarget.dataset.unit_id
    var goods_price = e.currentTarget.dataset.goods_price
    var num = 0
    that.change_goodsnum(num, goods_id, md_goods_id, unit_id, goods_price)
  },

  //删除所有售罄商品
  sale_out: function (e) {
    var that = this
    wx.showModal({
      title: '提示信息',
      content: '该商品已售罄，点击确定可删除所有售罄商品',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: shopcartindex,
            method: 'POST',
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
              user_token: wx.getStorageSync('token').user_token,
              action: 'del',
              sign: wx.getStorageSync('sign'),
              openid: wx.getStorageSync('token').openid,
            },
            success: function (res) {
              that.shopcrat_list()
            },
          })
        }
      }
    })
  },

  onShow: function (options) {
    var that = this
    that.shopcrat_list()
  },
  // onLoad: function(options) {
  //   var that = this
  //   that.shopcrat_list()
  // },

  //加减商品数量
  change_goodsnum: function(num, goods_id, md_goods_id, unit_id, goods_price) {
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
      success: function(res) {
        that.shopcrat_list()
        that.setData({
          isclick: false
        })
        setTimeout(function() {
          that.setData({
            isclick: true
          })
        }, 300)
      },
    })
  },

  //购物车列表
  shopcrat_list: function() {
    var that = this
    wx.request({
      url: shopcartindex,
      method: 'POST',
      data: {
        user_token: wx.getStorageSync('token').user_token,
        action: 'list',
        page: 1,
        list_rows: 100,
        sign: wx.getStorageSync('sign'),
        openid: wx.getStorageSync('token').openid
      },
      success: function(res) {
        if(res.data.data){
          that.projectallway(res.data.data)
          that.setData({
            datalist:res.data.data
          })
        }else{
          that.setData({
            sale_out: '',
            shopcart_list: '',
          })
        }
      }
    })
  },

    // 列表渲染
  projectallway: function (listData) {
    var that = this
    if (listData.sell_out_list) {
      that.setData({
        sale_out: listData.sell_out_list
      })
    } else {
      that.setData({
        sale_out: ''
      })
    }
    if (listData.list) {
      var i
      var totleprice = 0
      // var youhuiprice = that.data.youhuiprice
      var goodsnum = 0
      var showicon = []
      var num = []
      var money = []
      var goods_id = []
      for (i = 0; i < listData.list.length; i++) {
        showicon.push(showicon[i] == false)
        totleprice += parseFloat(listData.list[i].goods_price) * parseInt(listData.list[i].num)
        // youhuiprice += parseFloat(listData[i].market_price) * parseInt(listData[i].num)
        goodsnum += listData.list[i].num
        num.push(listData.list[i].num)
        money.push(listData.list[i].goods_price)
        goods_id.push(listData.list[i].goods_id)
      }
      that.setData({
        can_calc: 1,
        chooseall: true,
        showicon: showicon,
        shopcart_list: listData.list,
        totleprice: totleprice.toFixed(2),
        // youhuiprice: youhuiprice,
        goodsnum: goodsnum,
        num: num,
        money: money,
        goods_id: goods_id
      })
    } else {
      that.setData({
        chooseall: false,
        showicon: [],
        shopcart_list: '',
        totleprice: 0,
        youhuiprice: 0,
        goodsnum: 0
      })
    }
  },

  //下滑到下一页效果
  // onReachBottom: function () {
  //   var that = this
  //   var datalist = this.data.datalist
  //   // var searchResult = this.data.searchResult
  //   var newPage = that.data.pageIndex + 1
  //   that.setData({
  //     pageIndex: newPage
  //   })
  //   wx.request({
  //     url: shopcartindex,
  //     method: 'POST',
  //     data: {
  //       user_token: user_token,
  //       action: 'list',
  //       page: newPage,
  //       list_rows: 2,
  //       sign: wx.getStorageSync('sign'),
  //       openid: wx.getStorageSync('token').openid
  //     },
  //     success: function (res) {
  //       // console.log(res.data.data)
  //       var listData = []
  //       if (res.data.data) {
  //         if (res.data.data.list){
  //           listData.list = datalist.list.concat(res.data.data.list)
  //         }
  //         if (res.data.data.sell_out_list) {
  //           listData.sell_out_list = datalist.list.concat(res.data.data.sell_out_list)
  //         }
  //         that.projectallway(listData)
  //       } else {
  //         wx.showToast({
  //           title: '没有更多',
  //           icon: 'loading',
  //         })
  //       }
  //     },
  //   })
  // },
})