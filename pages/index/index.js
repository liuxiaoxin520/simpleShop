//index.js
const common = require('../../common').common
const shopcartadd = require('../../config').config.shopcartadd
const login = require('../../config').config.login
const sendsmscode = require('../../config').config.sendsmscode
const register = require('../../config').config.register
const auth = require('../../config').config.auth
const store = require('../../config').config.store
const goodslist = require('../../config').config.goodslist
//获取应用实例
const app = getApp()
Page({
  data: {
    no_more: false,
    isclick: true,
    choose_shop: false,
    formBg: false,
    showcuttime: true,
    cuttime: 60,
    phoneNumber: '',

    isUserInfo: false,
    showdelect: false,
    searchcontent: '',
    totlenum: '',
    goods_list: '',
    pageIndex: 1,
    share:''

  },
  //选择门店
  choose_shop: function() {
    this.choose_shop_list()
  },

  //更换门店
  change_shop: function(e) {
    var that = this
    var sign = e.currentTarget.dataset.sign
    common.setStor('sign', sign)
    var token = wx.getStorageSync('token')
    wx.request({
      url: store,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        access_token: token.access_token,
        openid: token.openid,
        action: 'info',
        sign: sign,
      },
      success: function(res) {
        that.setData({
          shopInfo: res.data.data,
          choose_shop: false,
        })
        that.goodsList()
      },
    })
  },

  //取消更换门店
  cancle_choose_shop: function() {
    if (wx.getStorageSync('sign')) {
      this.setData({
        choose_shop: false,
      })
    } else {
      wx.showModal({
        title: '请选择一个门店',
        content: '您当前没有任何门店信息，请选择一个合适的门店',
        showCancel: false,
      })
    }
  },
  //输入样式
  act: function(e) {
    var id = e.currentTarget.dataset.id
    this.setData({
      current: id
    })
  },
  // 监听输入
  watchPassWord: function(event) {
    var phoneNumber = event.detail.value;
    this.setData({
      phoneNumber: phoneNumber
    })
  },
  // 关闭弹框
  close: function() {
    this.setData({
      formBg: false
    })
  },
  //获取验证码
  getCode: function(e) {
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
        success: function(res) {
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
  Countdown: function(that) {
    var cuttime = that.data.cuttime
    if (cuttime == 0) {
      that.setData({
        showcuttime: true,
        cuttime: 60
      })
    } else {
      var timer = setTimeout(function() {
        cuttime--
        that.setData({
          cuttime: cuttime
        })
        that.Countdown(that)
      }, 1000)
    }
  },
  // 点击提交
  formSubmit: function(e) {
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
        success: function(res) {
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
  //搜索绑定
  searchcontent: function(event) {
    if (event.detail.value) {
      this.setData({
        showdelect: true,
        searchcontent: event.detail.value
      })
    } else {
      this.setData({
        showdelect: false,
        pageIndex: 1
      })
      this.goodsList()
    }
  },
  //删除搜索
  delect: function() {
    this.setData({
      showdelect: false,
      searchcontent: '',
      pageIndex: 1
    })
    this.goodsList()
  },
  //开始搜索
  searchstart: function() {
    var that = this
    var searchcontent = this.data.searchcontent
    if (searchcontent == '') {
      common.tip('请输入搜索内容', 'none')
    } else {
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
          list_rows: 5,
          search_data: searchcontent,
          sign: wx.getStorageSync('sign'),
          openid: wx.getStorageSync('token').openid,
          type: 1
        },
        success: function (res) {
          if (res.data.data) {
            that.setData({
              pageIndex: 1
            })
            that.projectallway(res.data.data)
          }else{
            common.tip('没有您要找的商品', 'none')
          }
        },
      })
    }
  },

  // 跳转到下一页
  goto_next: function(e) {
    var url = e.currentTarget.dataset.url
    var user_token = wx.getStorageSync('token').user_token
    if (user_token) {
      wx.redirectTo({
        url: url,
      }) 
    } else {
      this.setData({
        formBg: true,
      })
    }
  },

  //跳转到商品详情
  goto_goodsdetail: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods-detail/goods-detail?id=' + id,
    })
  },
  //跳转到小商品详情
  goto_goodsdetail1: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/share/share?id=' + id,
    })
  },

  //添加到购物车
  add_shopcart: function(e) {
    var that = this
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
          success: function(res) {
            that.goodsList()
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
      }
    }
  },
  //商品已售罄
  is_sellout: function() {
    common.tip('该商品已售完，请选择其他商品', 'none')
  },

  onShow() {
    this.goodsList()
  },
  onLoad: function(options) { 
    var that = this
    if (options.q){
      var q = decodeURIComponent(options.q)
      console.log(q)
    }else{
      var q = ''
    }
    var sign = options.sign
    if (sign) {
      if (options.id){
        wx.navigateTo({
          url: '/pages/goods-detail/goods-detail?sign=' + sign + '&id=' + options.id,
        })
      } 
      common.setStor('sign', sign)
    } else {
      var sign = ''
    }
    //验证授权
    wx.login({
      success: function(res) {
        //发起网络请求
        wx.request({
          url: login,
          method: 'POST',
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: {
            appid: 'wx3dcd06a59742ce6d',
            jscode: res.code,
            sign: sign,
            q: q
          },
          success: function(res) {
            var openid = res.data.data.openid
            var access_token = res.data.data.access_token
            common.setStor('token', res.data.data)
            if (res.data.data.user_token == '') {
              that.setData({
                isUserInfo: true
              })
            }
            if (res.data.data.sign) {
              common.setStor('sign', res.data.data.sign)
              wx.showLoading({
                title: '正在获取位置',
              })
              //上传位置信息获取门店列表
              wx.getLocation({
                type: 'gcj02', //返回可以用于wx.openLocation的经纬度
                success: function(res) {
                  wx.request({
                    url: store,
                    method: 'POST',
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    data: {
                      access_token: wx.getStorageSync('token').access_token,
                      openid: wx.getStorageSync('token').openid,
                      action: 'info',
                      sign: wx.getStorageSync('sign'),
                      lat: res.latitude,
                      lng: res.longitude
                    },
                    success: function(res) {
                      wx.hideLoading()
                      that.setData({
                        shopInfo: res.data.data,
                        share: res.data.data.share
                      })
                      that.goodsList()
                    }
                  })
                }, fail: function () {
                  //判断是否获得了用户地理位置授权
                  wx.hideLoading()
                  wx.getSetting({
                    success: (res) => {
                      if (!res.authSetting['scope.userLocation'])
                        that.openConfirm()
                    }
                  })
                }
              })
            } else {
              that.choose_shop_list()
            }
          },
        })
      }
    })
  },

  //商品列表
  goodsList: function() {
    var that = this
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
        list_rows: 5,
        sign: wx.getStorageSync('sign'),
        openid: wx.getStorageSync('token').openid,
        type: 1
      },
      success: function(res) {
        if (res.data.data) {
          that.projectallway(res.data.data)
        }
      },
    })
  },
  // 列表渲染
  projectallway: function(listData) {
    var that = this
    that.setData({
      goods_list: listData,
      cart_total: listData[0].cart_total,
    })
  },

  //下滑到下一页效果
  onReachBottom: function() {
    var that = this
    var datas = this.data.goods_list
    // var searchResult = this.data.searchResult
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
        list_rows: 5,
        sign: wx.getStorageSync('sign'),
        openid: wx.getStorageSync('token').openid,
        type: 1
      },
      success: function(res) {
        if (res.data.data) {
          var listData = datas.concat(res.data.data)
          that.projectallway(listData)
        } else {
          that.setData({
            no_more: true
          })
        }
      },
    })
  },

  //选择门店
  choose_shop_list: function() {
    var that = this
    wx.showLoading({
      title: '正在获取位置',
    })
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        wx.request({
          url: store,
          method: 'POST',
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: {
            access_token: wx.getStorageSync('token').access_token,
            openid: wx.getStorageSync('token').openid,
            action: 'list',
            lat: res.latitude,
            lng: res.longitude
          },
          success: function(res) {
            wx.hideLoading()
            that.setData({
              choose_shop: true,
              shoplist: res.data.data,
              pageIndex: 1
            })
          },
        })
      }, fail: function () {
        //判断是否获得了用户地理位置授权
        wx.hideLoading()
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation'])
              that.openConfirm()
          }
        })
      }
    })
  },

  //获取用户信息
  getUserInfo: function(e) {
    var token = wx.getStorageSync('token')
    var userInfo = e.detail.userInfo
    console.log(e)
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
          iv:iv 
        },
        success: function(res) {

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
        isUserInfo: false,
        formBg: true,
      })
    }
  },


  //分享
  onShareAppMessage: function(res) {
    var sign = wx.getStorageSync('sign')
    var share = this.data.share
    return {
      desc: '健康菜，大口吃',
      title: share.title,
      path: '/pages/index/index?sign=' + sign,
      imageUrl: share.imageUrl,
      success: function(res) {}
    }
  },

  openConfirm: function () {
    var that = this
    wx.showModal({
      content: '检测到您没打开青蛙家的定位权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        //点击“确认”时打开设置页面
        if (res.confirm) {
          console.log('用户点击确认')
          wx.openSetting({
            success: (res) => {
              // that.onLoad()
            }
          })
        }
        else{
          wx.request({
            url: store,
            method: 'POST',
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
              access_token: wx.getStorageSync('token').access_token,
              openid: wx.getStorageSync('token').openid,
              action: 'info',
              sign: wx.getStorageSync('sign'),
              lat: '114.288776',
              lng: '30.595042'
            },
            success: function (res) {
              wx.hideLoading()
              that.setData({
                shopInfo: res.data.data,
                share: res.data.data.share
              })
              that.goodsList()
            }
          })
        }
      }
    })
  }
})