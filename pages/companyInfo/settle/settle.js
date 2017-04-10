var sha1=require('../../../utils/sha1.js');
var app=getApp();
var api = app.data.api;
Page({
  data: {
    start_date: '2016-09-01',
    start_time: '12:01',


    end_date: '2016-09-01',
    end_time: '12:01',

    mileage:0.0,

    gq_fee:0.0,
    pause_fee:0.0,
    gs_fee:0.0,
    account:0.0,

    array_car:new Array(),
    index_car:0,

    array_driver:new Array(),
    index_driver:0,

  	orderToSend:new Array(),
    companyRole:wx.getStorageSync('name')
  },
  onLoad:function(query){
  	var orderToSend=JSON.parse(query.orderToSend);
  	this.setData({
  		orderToSend:orderToSend,
      companyRole:wx.getStorageSync('name')
  	});
  },

  bindStartDateChange: function(e) {
    this.setData({
      start_date: e.detail.value
    })
  },
  bindStartTimeChange: function(e) {
    this.setData({
      start_time: e.detail.value
    })
  },

  bindEndDateChange: function(e) {
    this.setData({
      end_date: e.detail.value
    })
  },
  bindEndTimeChange: function(e) {
    this.setData({
      end_time: e.detail.value
    })
  },




  actualMilesInput:function(e){
    this.setData({
        mileage:e.detail.value
    })
  },

  gqFeeInput:function(e){
    this.data.account-=this.data.gq_fee;
    this.data.account+=parseInt(e.detail.value);
    this.setData({
        gq_fee:parseInt(e.detail.value),
        account:this.data.account
    })
  },
  pauseFeeInput:function(e){
    this.data.account-=this.data.pause_fee;
    this.data.account+=parseInt(e.detail.value);
    this.setData({
        pause_fee:parseInt(e.detail.value),
        account:this.data.account
    })
  },
  gsFeeInput:function(e){
    this.data.account-=this.data.gs_fee;
    this.data.account+=parseInt(e.detail.value);
    this.setData({
        gs_fee:parseInt(e.detail.value),
        account:this.data.account
    })
  },

  totalInput:function(e){
    this.setData({
      account:parseInt(e.detail.value),
      gs_fee:0,
      gq_fee:0,
      pause_fee:0
    })
  },
  bindPickerCar:function(e){
    this.setData({
      index_car:e.detail.value
    })
  },
  bindPickerDriver:function(e){
    this.setData({
      index_driver:e.detail.value
    })
  },

  Settle:function(e){
      var formId     = e.detail.formId;
      var order_id   = this.data.orderToSend[0].id;
      var start_time = this.data.start_date+' '+this.data.start_time+':00';
      var end_time   = this.data.end_date+' '+this.data.end_time+':00';
      var mileage    = this.data.mileage;
      var gq_fee     = this.data.gq_fee;
      var pause_fee  = this.data.pause_fee;
      var gs_fee     = this.data.gs_fee;
      var account    = this.data.account;


      var that=this;
    wx.showModal({
        content: '确定结算订单？',
        success: function(res) {
            if(res.confirm){
              var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              wx.request({
                  url: api + 'company/orderSettle', //正吉url
                  data: {
                     token:wx.getStorageSync('token'),
                     t:timestamp,
                     s:sha1.hex_sha1(app.data.key+timestamp),

                     order_id:order_id,
                     start_time:start_time,
                     end_time:end_time,
                     mileage:mileage,
                     gq_fee:gq_fee,
                     pause_fee:pause_fee,
                     gs_fee:gs_fee,
                     account:account,
                     formId:formId

                  },
                  header: {
                      'content-type': 'application/json'
                  },
                  //method:'POST',
                  success: function(res) {
                    if(!res.data){
                      wx.switchTab({
                      url: '../../company/company'
                    })
                    }else{
                      wx.showModal({
                          title: '结算失败',
                          content: '请重试！',
                          showCancel: false,
                          success:function(res){
                            if(res.confirm){
                              wx.navigateTo({
                                url: '../settle/settle?orderToSend='+JSON.stringify(that.data.orderToSend)
                              });
                            }
                          }

                        });
                    }
                    
                  }
                })
            }
        }
    });   
  }
})