var sha1=require('../../../utils/sha1.js');
var app=getApp();
var api = app.data.api;
Page({
  data: {
    remark:'',
  	orderToSend:new Array(),
    reviewScore:0
  },

  onLoad:function(query){
  	var orderToSend=JSON.parse(query.orderToSend);
  	this.setData({
  		orderToSend:orderToSend
  	});
  },
  bindRemarkInput:function(e){
    this.setData({
      remark:e.detail.value
    })
  },
  tap1:function(e){
    this.setData({
      reviewScore:1
    })
  },
  tap2:function(e){
    this.setData({
      reviewScore:2
    })
  },
  tap3:function(e){
    this.setData({
      reviewScore:3
    })
  },
  tap4:function(e){
    this.setData({
      reviewScore:4
    })
  },
  tap5:function(e){
    this.setData({
      reviewScore:5
    })
  },
  reviewOrder:function(e){
    var that=this;
    wx.showModal({
        content: '提交？',
        success: function(res) {
          if(res.confirm){
              var formId = e.detail.formId;
              var itemId=that.data.orderToSend[0].id;
              var remark=that.data.remark;
              var reviewScore=that.data.reviewScore;
              var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              wx.request({
                  url: api + 'order/review', //审批拒绝
                  data: {
                     token:wx.getStorageSync('token'),
                     t:timestamp,
                     s:sha1.hex_sha1(app.data.key+timestamp),

                     formId:formId,
                     itemId:itemId,
                     remark:remark,
                     reviewScore:reviewScore
                  },
                  header: {
                      'content-type': 'application/json'
                  },
                  //method:'POST',
                  success: function(res) {
                    //return 0 indicates success
                    if(res.data==0){
                      wx.showToast({
                        title: '评价成功',
                        icon: 'success',
                        mask:'true',
                        duration: 1000
                      });
                      wx.navigateBack({
                      delta: 1
                      });
                    }else{
                      wx.showToast({
                        title: '评价失败',
                        icon: 'loading',
                        mask:'true',
                        duration: 1000
                      });
                      wx.redirectTo({
                        url:'../orderInfo/orderFail/orderFail'
                      })
                    }
                  }
                })
          }
        }
      });
      
  }
})