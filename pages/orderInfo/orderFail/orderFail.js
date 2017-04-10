Page({
  data: {

  },
  backHome:function(e){
      wx.redirectTo({
          url: '../../index/index'
        });
    },
  reOrder:function(e){
    wx.switchTab({
      url:'../../add/add'
    });
  }
})



