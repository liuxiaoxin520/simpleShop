// pages/goods-detail/goods-detail.js
const goodslist = require('../../config').config.goodslist
const shopcartadd = require('../../config').config.shopcartadd
const order = require('../../config').config.order
const auth = require('../../config').config.auth
const register = require('../../config').config.register
const sendsmscode = require('../../config').config.sendsmscode
const common = require('../../common').common
Page({
  
  data: {
    id:'',
    goods_id:'',
    chooselistData: ['基本信息', '购买记录'],
    currentid: 0,
    goods_info: '',
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    
    hourtime: 0,
    mintime: 0,
    sectime: 0,


    isclick:true,
    share:'',

    formBg: false,
    isUserInfo:false,
    showcuttime: true,
    cuttime: 60,
    phoneNumber: '',
  },
  //选项卡列表类型切换
  ChooseList: function (e) {
    var listid = e.currentTarget.dataset.listid
    this.setData({
      currentid: listid
    })
    if (listid == 1){
      //商品详情
      var that = this
      var id = this.data.goods_id
      wx.request({
        url: goodslist,
        method: 'POST',
        header: { "Content-Type": "application/x-www-form-urlencoded" },
        data: {
          access_token: wx.getStorageSync('token').access_token,
          action: 'customerlist',
          id: id,
          openid: wx.getStorageSync('token').openid,
          sign: wx.getStorageSync('sign')
        },
        success: function (res) {
          if(res.data.data){
            that.setData({
              num:res.data.data,
              listname:res.data.data.list
            })
          }
          
        },
      })
    }else{
      this.goods_info(this.data.id)
    }
  },
  // 预览图片
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.goods_info.imgs // 需要预览的图片http链接列表
    })
  },

  //立即购买
  buynow:function(e){
    var num = e.currentTarget.dataset.num
    var money = e.currentTarget.dataset.goods_price
    var goods_id = e.currentTarget.dataset.goods_id
    var md_goods_id = e.currentTarget.dataset.md_goods_id
    var unit_id = e.currentTarget.dataset.unit_id
      var obj = {}
      var arr = []
    if (num == 0) {
      obj['num'] = 1
      //加入购物车
      wx.request({
        url: shopcartadd,
        method: 'POST',
        header: { "Content-Type": "application/x-www-form-urlencoded" },
        data: {
          access_token: wx.getStorageSync('token').access_token,
          goods_id: goods_id,
          md_goods_id: md_goods_id,
          unit_id: unit_id,
          num: 1,
          sign: wx.getStorageSync('sign'),
          openid: wx.getStorageSync('token').openid,
          goods_price: money
        },
        success: function (res) {

        },
      })
    } else {
      obj['num'] = num
    }
      obj['price'] = money
      obj['goods_id'] = goods_id
      arr.push(obj)
      wx.request({
        url: order,
        method: 'POST',
        data: {
          type:1,
          user_token: wx.getStorageSync('token').user_token,
          access_token: wx.getStorageSync('token').access_token,
          sign: wx.getStorageSync('sign'),
          openid: wx.getStorageSync('token').openid,
          action: 'add',
          goods: arr
        },
        success: function (res) {
          if (res.data.code == 1) {
            var orderid = res.data.data.orderid
            wx.navigateTo({
              url: '/pages/ordersure/ordersure?orderid=' + orderid,
            })
          }
        }
      })
  },

  // 增加商品数量
  add_num: function (e) {
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
  cut_num:function(e){
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
  //售罄
  sail_out:function(){
    common.tip('此商品已售罄', 'none')
  },

  //进入购物车
  goto_shopcart:function(){
    wx.navigateTo({
      url: '/pages/shoppingcart/shoppingcart',
    })
  },
  onShow: function (options) {
    var that = this;
    var id = this.data.id
    that.goods_info(id,1)
    if (wx.getStorageSync('token').user_token) {
      that.setData({
        isUserInfo: false
      })
    }else{
      that.setData({
        isUserInfo: true
      })
    }
  },
  onLoad: function (options) {
    var that = this;
    var id = options.id
    // var sign = options.sign
    that.setData({
      id:id
    })
    that.goods_info(id,'')
    if (wx.getStorageSync('token').user_token) {
      that.setData({
        isUserInfo: false
      })
    }else{
      that.setData({
        isUserInfo: true
      })
    }
  }, 


//商品详情
  goods_info:function(id,t){
    var that = this
    wx.request({
      url: goodslist,
      method: 'POST',
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      data: {
        access_token: wx.getStorageSync('token').access_token,
        action: 'info',
        id: id,
        t:t,
        openid: wx.getStorageSync('token').openid,
        sign: wx.getStorageSync('sign')
      },
      success: function (res) {
        that.setData({
          goods_info: res.data.data,
          goods_id: res.data.data.goods_id,
          share: res.data.data.share
        })
        common.cutDownTime(res.data.data.ys_end_time, that)//倒计时
      },
    })
  },

//加减商品数量
  change_goodsnum: function (num, goods_id, md_goods_id, unit_id, goods_price){
    var that = this
    var id = this.data.id
    wx.request({
      url: shopcartadd,
      method: 'POST',
      header: { "Content-Type": "application/x-www-form-urlencoded" },
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
        that.goods_info(id)
        that.setData({
          isclick: false
        })
        setTimeout(function () {
          that.setData({
            isclick: true
          })
        }, 500)
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
      success: function (res) {}
    }
  },



  //输入样式
  act: function (e) {
    var id = e.currentTarget.dataset.id
    this.setData({
      current: id
    })
  },
  // 监听输入
  watchPassWord: function (event) {
    var phoneNumber = event.detail.value;
    this.setData({
      phoneNumber: phoneNumber
    })
  },
  // 关闭弹框
  close: function () {
    this.setData({
      formBg: false,
      isUserInfo: true
    })
  },
  //获取验证码
  getCode: function (e) {
    var access_token = wx.getStorageSync('token').access_token
    var that = this
    var phoneNumber = this.data.phoneNumber
    var phonereg = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
    if (phoneNumber == '' || phoneNumber.length != 11) {
      common.tip('手机号有误', 'loading')
    } else if (!phonereg.test(phoneNumber)) {
      common.tip('手机号格式错误', 'loading')
    } else {
      wx.request({
        url: sendsmscode,
        method: 'POST',
        data: {
          access_token: access_token,
          mobile: phoneNumber,
        },
        success: function (res) {
          if (res.data.code != 1) {
            common.tip(res.data.msg, 'none')
          } else {
            common.tip('验证码已发送至您的手机', 'none')
            that.setData({
              showcuttime: false
            })
            that.Countdown(that)
          }
        }
      })
    }
  },
  // 倒计时
  Countdown: function (that) {
    var cuttime = that.data.cuttime
    if (cuttime == 0) {
      that.setData({
        showcuttime: true,
        cuttime: 60
      })
    } else {
      var timer = setTimeout(function () {
        cuttime--
        that.setData({
          cuttime: cuttime
        })
        that.Countdown(that)
      }, 1000)
    }
  },
  // 点击提交
  formSubmit: function (e) {
    var that = this
    var token = wx.getStorageSync('token')
    var phonereg = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
    if (e.detail.value.phoneNumber == '' || e.detail.value.phoneNumber.length != 11) {
      common.tip('手机号有误', 'loading')
    } else if (!phonereg.test(e.detail.value.phoneNumber)) {
      common.tip('手机号格式错误', 'loading')
    } else if (e.detail.value.verificationCode == '' || e.detail.value.verificationCode.length != 6) {
      common.tip('验证码无效', 'loading')
    } else {
      // 上传身份信息
      wx.request({
        url: register,
        method: 'POST',
        data: {
          access_token: token.access_token,
          openid: token.openid,
          mobile: e.detail.value.phoneNumber,
          code: e.detail.value.verificationCode
        },
        success: function (res) {
          if (res.data.code != 1) {
            common.tip('验证码有误', 'none')
          } else {
            common.tip('登陆成功', '')
            token.user_token = res.data.data.user_token
            common.setStor('token', token)
            that.setData({
              formBg: false,
              isUserInfo: false
            })
          }
        },
      });
    }
  },


  //获取用户信息
  getUserInfo: function (e) {
    var token = wx.getStorageSync('token')
    var userInfo = e.detail.userInfo
    var iv = e.detail.iv
    var encryptedData = e.detail.encryptedData
    if (userInfo) {
      wx.request({
        url: auth,
        method: 'POST',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          access_token: token.access_token,
          action: 'add',
          type_id: 1,
          appid: 'wx3dcd06a59742ce6d',
          openid: token.openid,
          nickname: userInfo.nickName,
          headimgurl: userInfo.avatarUrl,
          sex: userInfo.gender,
          language: userInfo.language,
          country: userInfo.country,
          province: userInfo.province,
          city: userInfo.city,
          encryptedData: encryptedData,
          iv: iv
        },
        success: function (res) {

        },
      })
      var userInfo = {}
      userInfo["nickName"] = e.detail.userInfo.nickName
      userInfo["avatarUrl"] = e.detail.userInfo.avatarUrl
      wx.setStorage({
        key: 'userInfo',
        data: userInfo,
      })
      this.setData({
        formBg: true,
      })
    }
  },
})
