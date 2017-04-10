var sha1=require('../../utils/sha1.js');
var app=getApp();
var api = app.data.api;
// var origin=require('../orderInfo/origin/origin.js');
Page({
  data: {
    date: '',
    time: '',
    array_yongCheLeiXing:['管理','型号','横向'],
    index_yongCheLeiXing: 0,
    index_isOffWorkTime:0,
    // array_dest:['东院8号楼','东院研发楼','西院74号楼','其他地点'],
    // index_dest:0,
    
    index_oneOrTwoWay: 0,

    array_manager:new Array(),
    index_manager:0,

    reason:'',
    workers:'',
    origin:new Array(),
    dest:new Array(),

    applyer:wx.getStorageSync('name'),
    passenger:'',
    passengerTel:'',
    notes:'',
    originStyle:'',
    destStyle:'',
    reasonStyle:'',
    passengerStyle:'',
    passengerTelStyle:'',

    passengerNum:0

  },
  onLoad:function(e) {
    // Do some initialize when page load.

  },
  onShow:function(e){
      if(wx.getStorageSync('role')=='company'){
              wx.showModal({
                        title: '无信息',
                        content: '您尚不具有员工权限',
                        showCancel: false,
                        success:function(e){
                          wx.switchTab({
                            url: '../company/company'
                          })
                        }
                      });
      }
      if(this.data.origin.length!=0){
              this.setData({
                originStyle:''
              })
            }
      if(this.data.dest.length!=0){
        this.setData({
          destStyle:''
        })
      }

  },
  getManager(){
      var that =this;
      var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              wx.request({
                  url: api + 'employee/getManager', //正吉url 获取订单
                  data: {
                     token:wx.getStorageSync('token'),
                     t:timestamp,
                     s:sha1.hex_sha1(app.data.key+timestamp)                   
                  },
                  header: {
                      'content-type': 'application/json'
                  },
                  //method:'GET',
                  success: function(res) {
                    //处理订单code
                    that.setData({
                      array_manager: res.data
                    });
                  }
                });
  },
  onLoad:function(e){
    this.getManager();
    var current_time=new Date();
    var yyyy_mm_dd=current_time.getFullYear().toString()+'-'+(current_time.getMonth()+1).toString()+'-'+current_time.getDate().toString();
    var hh_mm=current_time.getHours().toString()+':'+current_time.getMinutes();
    this.setData({
      date:yyyy_mm_dd,
      time:hh_mm
    });
    this.setData({
      applyer:wx.getStorageSync('name')
    })

  },
  applyerInput:function(e){
    this.setData({
      applyer:e.detail.value
    })
  },
  reasonInput:function(e){
    this.setData({
      reason:e.detail.value
    })
    if(this.data.reasonStyle!=''){
      this.setData({
        reasonStyle:''
      })
    }
  },
  bindPickerManagerChange:function(e){
    this.setData({
      index_manager:e.detail.value
    });
  },

  passengerInput:function(e){
    this.setData({
      passenger:e.detail.value
    })
    if(this.data.passengerInput!=''){
      this.setData({
        passengerStyle:''
      })
    }
  },
  minus:function(e){
    var passengerNum=this.data.passengerNum;
    if(!passengerNum){

    }else{
    this.setData({
      passengerNum:passengerNum-1
    })
    }
  },
  plus:function(e){
    var passengerNum=this.data.passengerNum;
    this.setData({
      passengerNum:passengerNum+1
    })
  },
  passengerTelInput:function(e){
    this.setData({
      passengerTel:e.detail.value
    })
    if(this.data.passengerTelInput!=''){
      this.setData({
        passengerTelStyle:''
      })
    }
  },

  notesInput:function(e){
    this.setData({
      notes:e.detail.value
    })
  },

  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function(e) {
    this.setData({
      time: e.detail.value
    })
  },

  bindPickerYongcheleixingChange: function(e) {
    this.setData({
      index_yongCheLeiXing: e.detail.value
    })
  },

  switchOneOrTwoWayChange: function(e) {
    var index=0;
    if(e.detail.value){
      index=1;
    }else{
      index=0;
    }
    this.setData({
      index_oneOrTwoWay: index
    })
  },
  switchIsOffWorkTimeChange:function(e){
    var index=0;
    if(e.detail.value){
      index=1;
    }else{
      index=0;
    }
    this.setData({
      index_isOffWorkTime:index
    })
  },
  bindWorkerNeedsInput: function(e) {
    this.setData({
      workers: e.detail.value
    })
  },
  checkInput(){
    if(!this.data.origin.length){
      this.setData({
        originStyle:'1rpx solid red'
      })
    }else{
      this.setData({
        originStyle:''
      })
    }
    if(!this.data.dest.length){
        this.setData({
        destStyle:'1rpx solid red'
      })
    }else{
      this.setData({
        destStyle:''
      })
    }
    if(this.data.reason==''){
        this.setData({
          reasonStyle:'1rpx solid red'
        })
    }else{
      this.setData({
        reasonStyle:''
      })
    }
    if(this.data.passenger==''){
        this.setData({
          passengerStyle:'1rpx solid red'
        })
    }else{
      this.setData({
          passengerStyle:''
        })
    }
    if(this.data.passengerTel==''){
        this.setData({
          passengerTelStyle:'1rpx solid red'
        })
    }else{
      this.setData({
          passengerTelStyle:''
        })
    }
    if(this.data.origin.length&&this.data.dest.length&&this.data.reason!=''&&this.data.passenger!=''&&this.data.passengerTel!=''){
      return true;
    }else{
      wx.showModal({
            title: '填写信息',
            content: '标红的为必填项，请完整填写！',
            showCancel: false
          });
      return false;
    }
  },
  applyForCar:function(e){
    var formId = e.detail.formId;
    var data=this.data;
    var that=this;
    if(data.passengerNum>=2){
        var passenger=data.passenger+'等'+String(data.passengerNum)+'人';
    }else{
        var passenger=data.passenger;
    }

    wx.showModal({
        content: '确定提交用车申请？',
        success: function(res) {
            if(res.confirm&&that.checkInput()){

              var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              var originStr=JSON.stringify(data.origin);
              var destStr=JSON.stringify(data.dest);
              if(data.index_yongCheLeiXing!=1){
                that.setData({
                  index_manager:2000
                })
              }
              wx.request({
                  url: api + 'order/create', //正吉url
                  data: {
                     token:wx.getStorageSync('token'),
                     t:timestamp,
                     s:sha1.hex_sha1(app.data.key+timestamp),
                     
                     usetime:data.date+' '+data.time+':00',
                     type:data.index_yongCheLeiXing,
                     manager:data.array_manager[data.index_manager].id,
                     reason: data.reason,   //补全
                     passenger:passenger,
                     mobilephone:data.passengerTel,
                     isweekend:data.index_isOffWorkTime,
                     isreturn:data.index_oneOrTwoWay,
                     workers:data.workers,

                     origin:originStr,
                     dest:destStr,
                     remark:data.notes,
                     formId:formId
                  },
                  header: {
                      'content-type': 'application/json'
                  },
                  //method:'POST',
                  success: function(res) {
                    if(res.data.state==10){
                      
                      wx.redirectTo({
                            url: '../orderInfo/orderSuccess/orderSuccess',
                            fail:function(e){
                              wx.redirectTo({
                                url:'../orderInfo/orderFail/orderFail'
                              })
                            }
                          })
                    }else{
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


          
          
