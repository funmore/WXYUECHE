var sha1=require('../../utils/sha1.js');
var app=getApp();
var api = app.data.api;
//state: 10:待审批    20：待派车到司机接单  21：所内派车 22-28:所外派车 29：所外抢单 23：所外指派  
//       30：待确认(未确认车型和司机)  31:待确认（已确认车型和司机）   40：待评价待结算   41：已评价未结算 42:已结算未评价 
//       50：已完成 0：已取消  51：审批被拒绝  
Page({
  data:{
    tabs: ['待调度', '调度中','已调度'],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,
    selectedAllStatus:false,
    selectedAllStatusRetreat:false,
    stateLength:new Array(3),
    stateLengthFlag:false,
    orderArray:new Array(),
    loadingHidden:false
    
  },
    countLength() {
    var stateLength=new Array(0,0,0);
    var orderArray=this.data.orderArray;
    for(var item in orderArray){
      var state=orderArray[item].state;
      if(state==20){
        stateLength[0]++;
      }else if(state>20&&state<39){
        stateLength[1]++;
      }else if(state>=39||state==0){
        stateLength[2]++;
      }
    }
    this.setData({
        stateLength:stateLength,
        stateLengthFlag:true
      });
  },
  adminShow(){
    this.setData({
                    loadingHidden:false
                  })
    var that =this;
    var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            wx.request({
                url: api + 'order/adminShow', //正吉url 获取订单
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
                    orderArray: res.data,
                    loadingHidden:true,
                    selectedAllStatusRetreat:false,
                    selectedAllStatus:false  
                  });
                  that.countLength();
                }
              })
  },
  onPullDownRefresh: function() {
    // Do something when pull down.
    this.adminShow();
  },
  onShow:function(options){
        if(wx.getStorageSync('role')=='admin')
            {
                this.adminShow();
            }else{
              wx.showModal({
                        title: '无信息',
                        content: '您尚不具有调度权限',
                        showCancel: false,
                        success:function(e){
                          wx.switchTab({
                            url: '../order/order'
                          })
                        }
                      });
            }
  },
  
  onLoad:function(options){
    //联调使用
   //this.getBasicInfo();
   try {
      let {tabs} = this.data; 
      var res = wx.getSystemInfoSync()
      this.windowWidth = res.windowWidth;
      this.data.stv.lineWidth = this.windowWidth / this.data.tabs.length;
      this.data.stv.windowWidth = res.windowWidth;
      this.setData({stv: this.data.stv})
      this.tabsCount = tabs.length;
    } catch (e) {
    }     

  },
  
  _updateSelectedPage(page) {
    let {tabs, stv, activeTab} = this.data;
    activeTab = page;
    this.setData({activeTab: activeTab})
    stv.offset = stv.windowWidth*activeTab;
    this.setData({stv: this.data.stv});
  },
  handlerTabTap(e) {
    this._updateSelectedPage(e.currentTarget.dataset.index);
  },
  checkOrder:function(e){
    var item=e.currentTarget.dataset.item;
       wx.navigateTo({
         url: '../indexInfo/checkOrder/checkOrder?id='+item.id
       })
  },
  bindCheckbox:function(e){
      var index =  parseInt(e.currentTarget.dataset.index);
      var selected =this.data.orderArray[index].selected;
      var orderArray=this.data.orderArray;
      orderArray[index].selected=!selected;
      this.setData({
        orderArray:orderArray
      });
    },
  bindSelectAll:function(e){
    var selectedAllStatus = this.data.selectedAllStatus;
    selectedAllStatus=!selectedAllStatus;
    var orderArray = this.data.orderArray;
          for (var i = 0; i < orderArray.length; i++) {
            if(orderArray[i].state==20){
              orderArray[i].selected = selectedAllStatus;
            }       
    }
    this.setData({
                  orderArray:orderArray,
                  selectedAllStatus:selectedAllStatus
              });
  },
  bindSelectAllRetreat:function(e){
    var selectedAllStatusRetreat = this.data.selectedAllStatusRetreat;
    selectedAllStatusRetreat=!selectedAllStatusRetreat;
    var orderArray = this.data.orderArray;
          for (var i = 0; i < orderArray.length; i++) {
            if(orderArray[i].state>20&&orderArray[i].state<36){
              orderArray[i].selected = selectedAllStatusRetreat;
            }       
    }
    this.setData({
                  orderArray:orderArray,
                  selectedAllStatusRetreat:selectedAllStatusRetreat
              });
  },
  goRetreat:function(e){
    var orderToSend = new Array();
      for(var item in this.data.orderArray){
        if(this.data.orderArray[item].state >20&&this.data.orderArray[item].state <36&& this.data.orderArray[item].selected == true){
              orderToSend.push(this.data.orderArray[item].id);
        }
      }
      var that =this;
      that.setData({
                  loadingHidden:false
                });
       var timestamp = Date.parse(new Date());
          timestamp = timestamp / 1000;
          wx.request({
              url: api + 'order/adminRetreat',
              data: {
                 token:wx.getStorageSync('token'),
                 t:timestamp,
                 s:sha1.hex_sha1(app.data.key+timestamp),
                
                 orderIdToSendStr:JSON.stringify(orderToSend)
                 
              },
              header: {
                  'content-type': 'application/json'
              },
              success: function(res) {
                      if(res.data==0){
                        that.adminShow();
                      // var timestamp = Date.parse(new Date());
                      //         timestamp = timestamp / 1000;
                      //         wx.request({
                      //             url: api + 'order/adminShow', //获取订单
                      //             data: {
                      //                token:wx.getStorageSync('token'),
                      //                t:timestamp,
                      //                s:sha1.hex_sha1(app.data.key+timestamp)
                      //             },
                      //             header: {
                      //                 'content-type': 'application/json'
                      //             },
                      //             //method:'GET',
                      //             success: function(res) {
                      //               //处理订单code
                      //               that.setData({
                      //                 orderArray: res.data,
                      //                 loadingHidden:true
                      //               });
                      //               that.countLength();
                      //               //处理订单codd end 
                      //             }
                      //           })
                    }else{
                      wx.redirectTo({
                        url:'../orderInfo/orderFail/orderFail'
                      })
                    }
              }
            })
  },
  goAppoint:function(e){
      var orderToSend = new Array();
      for(var item in this.data.orderArray){
        if(this.data.orderArray[item].state == 20&& this.data.orderArray[item].selected == true){
              orderToSend.push(this.data.orderArray[item]);
        }
      }
      var orderToSendStr=JSON.stringify(orderToSend);
      wx.navigateTo({
          url: '../adminInfo/appoint/appoint?orderToSendStr='+orderToSendStr
        })
  },
  goCompete:function(e){
      var orderToSend = new Array();
      for(var item in this.data.orderArray){
        if(this.data.orderArray[item].state == 20&& this.data.orderArray[item].selected == true){
              orderToSend.push(this.data.orderArray[item].id);
        }
      }
      var that =this;
      that.setData({
                  loadingHidden:false
                });
      var timestamp = Date.parse(new Date());
          timestamp = timestamp / 1000;
          wx.request({
              url: api + 'order/adminCompete',
              data: {
                 token:wx.getStorageSync('token'),
                 t:timestamp,
                 s:sha1.hex_sha1(app.data.key+timestamp),
                
                 orderIdToSendStr:JSON.stringify(orderToSend)
                 
              },
              header: {
                  'content-type': 'application/json'
              },
              success: function(res) {
                      if(res.data==0){
                        that.adminShow();
                      // var timestamp = Date.parse(new Date());
                      //         timestamp = timestamp / 1000;
                      //         wx.request({
                      //             url: api + 'order/adminShow', //获取订单
                      //             data: {
                      //                token:wx.getStorageSync('token'),
                      //                t:timestamp,
                      //                s:sha1.hex_sha1(app.data.key+timestamp)
                      //             },
                      //             header: {
                      //                 'content-type': 'application/json'
                      //             },
                      //             //method:'GET',
                      //             success: function(res) {
                      //               //处理订单code
                      //               that.setData({
                      //                 orderArray: res.data,
                      //                 loadingHidden:true
                      //               });
                      //               that.countLength();
                      //               //处理订单codd end 
                      //             }
                      //           })
                    }else{
                      wx.redirectTo({
                        url:'../orderInfo/orderFail/orderFail'
                      })
                    }
              }
            })
  },
  cancelOrder:function(e){
    var tabIndex=parseInt(e.currentTarget.dataset.tabIndex);    
    var orderIdToCancel=new Array();
    var orderArray=this.data.orderArray;
    for (var i = 0; i < orderArray.length; i++) {
      if(orderArray[i].state==20&&orderArray[i].selected==true){
          orderIdToCancel.push(orderArray[i].id);
        }
      }
    var that =this;
    wx.showModal({
        content: '确定取消所选用车申请？',
        success: function(res) {
            if(res.confirm){
              that.setData({
                  loadingHidden:false
                });
              var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              var orderIdToCancelStr=JSON.stringify(orderIdToCancel);
              wx.request({
                  url: api + 'order/cancel', //取消
                  data: {
                     token:wx.getStorageSync('token'),
                     t:timestamp,
                     s:sha1.hex_sha1(app.data.key+timestamp),
                     
                     cancelId:orderIdToCancelStr
                  },
                  header: {
                      'content-type': 'application/json'
                  },
                  //method:'POST',
                  success: function(res) {
                    //return 0 indicates success
                    if(res.data==0){
                      var timestamp = Date.parse(new Date());
                              timestamp = timestamp / 1000;
                              wx.request({
                                  url: api + 'order/show', //获取订单
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
                                      orderArray: res.data,
                                      loadingHidden:true
                                    });
                                    that.countLength();
                                    //处理订单codd end 
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

  //022-23300900
})