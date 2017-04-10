var sha1=require('../../utils/sha1.js');
var app=getApp();
var api = app.data.api;
Page({
  data:{
    tabs: ['待审批', '待派车','待确认','全部'],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,
    //state: 0：待审批； 1：待派车 2：待确认  3：待评价  4：已完成 5:已取消  6:审批被拒绝
    // state: 10:待审批    20：待派车到司机接单  21：所内派车 22-34:所外派车  35：抢单  39:接单未匹配车型司机
    //         40：待确认待评价待结算（已匹配车型司机）   41：已确认已评价未结算   50：已完成（已确认，已评价，已结算） 0：已取消  51：审批被拒绝  
    stateLength:new Array(4),
    stateLengthFlag:false,
    orderArray:new Array(),
    loadingHidden:false
  },
  countLength() {
    var stateLength=new Array(0,0,0,0);
    var orderArray=this.data.orderArray;
    for(var item in orderArray){
      var state=orderArray[item].state;
      if(state==10){
        stateLength[0]++;
      }else if(state>=20&&state<40){
        stateLength[1]++;
      }else if(state==40){
        stateLength[2]++;
      }else if(state>=41||state==0){
        stateLength[3]++;
      }else{
      }
    }
    this.setData({
        stateLength:stateLength,
        stateLengthFlag:true
      });

  },
  showOrders(){
    this.setData({
        loadingHidden:false
      })
      var that =this;
      var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              wx.request({
                  url: api + 'order/show', //正吉url 获取订单
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
            },
  onPullDownRefresh: function() {
    // Do something when pull down.
    this.showOrders();
  },
  onShow:function(options){
    if(wx.getStorageSync('role')!='company'){
         this.showOrders(); 
            }else{
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
  // reviewOrder:function(e){
  //   var orderToSend=new Array();
  //   var item=e.currentTarget.dataset.item;
  //   orderToSend.push(item);
  //   wx.showModal({
  //       content: '评价此次行程？',
  //       success: function(res) {
  //           if(res.confirm){
  //             wx.navigateTo({
  //                         url: '../orderInfo/reviewOrder/reviewOrder?orderToSend='+JSON.stringify(orderToSend)
  //                       });
  //           }
  //       }
  //   });

  // },
  cancelOrder:function(e){

    var item=e.currentTarget.dataset.item;
    var that =this;
    var orderIdToCancel=new Array();
    orderIdToCancel.push(item.id);


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
  },
  confirmOrder:function(e){
    //选中item,保持代码的延续性，将要操作的订单定制为array
    var item=e.currentTarget.dataset.item;
    var that =this;
    var orderIdToConfirm=new Array();
    orderIdToConfirm.push(item.id);
    wx.showModal({
        content: '确定乘车？',
        success: function(res) {
            if(res.confirm){
              that.setData({
                  loadingHidden:false
                });
              var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              var orderIdToConfirmStr=JSON.stringify(orderIdToConfirm);
              wx.request({
                  url: api + 'order/confirm', //确认
                  data: {
                     token:wx.getStorageSync('token'),
                     t:timestamp,
                     s:sha1.hex_sha1(app.data.key+timestamp),
                     
                     confirmId:orderIdToConfirmStr
                  },
                  header: {
                      'content-type': 'application/json'
                  },
                  //method:'POST',
                  success: function(res) {
                    //return 0 indicates success
                    if(res.data==0){
                          var orderToSend=new Array();
                          orderToSend.push(item);
                          wx.navigateTo({
                                                url: '../orderInfo/reviewOrder/reviewOrder?orderToSend='+JSON.stringify(orderToSend)
                                              });
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