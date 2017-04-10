var sha1=require('../../../utils/sha1.js');
var app=getApp();
var api = app.data.api;
Page({
  data: {
    remark:'',

  	orderToSend:new Array(),
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

  DisApproval:function(e){
    var that=this;
    wx.showModal({
        content: '审批通过用车申请？',
        success: function(res) {
          if(res.confirm){
              var formId = e.detail.formId;
              var approvalId=that.data.orderToSend[0].id;
              var remark=that.data.remark;
              var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              wx.request({
                  url: api + 'order/approval', //审批拒绝
                  data: {
                     token:wx.getStorageSync('token'),
                     t:timestamp,
                     s:sha1.hex_sha1(app.data.key+timestamp),

                     formId:formId,
                     approval:false,
                     approvalId:approvalId,
                     remark:remark
                  },
                  header: {
                      'content-type': 'application/json'
                  },
                  //method:'POST',
                  success: function(res) {
                    //return 0 indicates success
                    if(res.data==0){
                      wx.showToast({
                        title: '审批成功',
                        icon: 'success',
                        mask:'true',
                        duration: 1000
                      });
                      wx.navigateBack({
                      delta: 1
                      });
                    }else{
                      wx.showToast({
                        title: '审批失败',
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