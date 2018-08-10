// pages/mine/mymoney/mymoney.js
Page({
  data: {
    money: [
      { 'money': '50'},
      { 'money': '100'},
      { 'money': '300'},
      { 'money': '500'},
      { 'money': '800'},
      { 'money': '1000'},
    ],
  },
  //点击获取支付金额
  paynum:function(e){
    var paynum = e.currentTarget.dataset.paynum
    console.log(paynum)
  },

  choose:function(e){
    let choosed_id = e.currentTarget.dataset.choosed_id
    this.setData({
      choosed_id: choosed_id
    })
  },

  sure_button:function(){
    console.log("确认充值")
  },
  onLoad: function (options) {
  
  },
})