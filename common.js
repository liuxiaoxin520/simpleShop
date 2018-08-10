const common = {
  //提示信息
  tip: function (tip, statue) {
    wx.showToast({
      title: tip,
      icon: statue,
    })
  },
  //存缓存
  setStor: function (key, data) {
    wx.setStorage({
      key: key,
      data: data,
    })
  },

  //秒杀函数
  cutDownTime: function (time, that) {
    var interval = setInterval(function () {
      var a = Date.parse(time)//获取结束时间戳的总毫秒数
      var b = Date.parse(new Date())//获取当前时间戳的总毫秒数
      var second = (a - b) / 1000//获取时间戳的差值，并换成相应的秒数

      // 小时位  
      var hr = Math.floor((second) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位  
      var min = Math.floor((second - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位  
      var sec = second - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      //格式拼接
      //var showTime = hrStr + ":" + minStr + ":" + secStr + "";//时分秒拼接在一起

      if (second < 0) {//当秒数小于0时
        clearInterval(interval);//定时器停止
        wx.showToast({
          title: '活动已结束',
        });
        var hourtime = '00'
        var mintime = '00'
        var sectime = '00'
      } else {
        var hourtime = hrStr
        var mintime = minStr
        var sectime = secStr
      }

      //渲染倒计时
      that.setData({
        hourtime: hourtime,
        mintime: mintime,
        sectime: sectime,
      });
      second--;
    }.bind(this), 1000)
  },
}


module.exports = {
  common: common,
}