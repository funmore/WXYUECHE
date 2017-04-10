var sha1=require('../../utils/sha1.js');
var app=getApp();
var api = app.data.api;
Page({
  data:{
    tabs: ['指派订单', '争抢订单','待出行','待结算','已完成'],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,
    stateLength:new Array(5),
    stateLengthFlag:false,
    orderArray:new Array(),
    loadingHidden:false
  },
  countLength() {
    var stateLength=new Array(0,0,0,0,0);
    var orderArray=this.data.orderArray;
    for(var item in orderArray){
      if(orderArray[item]!=null){
      var state=orderArray[item].state;
      if(state>20&&state<35){
        stateLength[0]++;
      }else if(state==35){
        stateLength[1]++;
      }else if(state==39||state==40){
        stateLength[2]++;
      }else if(state==41){
        stateLength[3]++;
      }else if(state>=42&&state!=51){
        stateLength[4]++;
      }else{
      }
    }
    }
    this.setData({
        stateLength:stateLength,
        stateLengthFlag:true
      });
  },
  companyShow(){
    this.setData({
                loadingHidden:false
              })
              var that =this;
              var timestamp = Date.parse(new Date());
                      timestamp = timestamp / 1000;
                      wx.request({
                          url: api + 'order/companyShow', //正吉url 获取订单
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
    this.companyShow();
  },
  onShow:function(options){
    if(wx.getStorageSync('role')=='company'){
                    this.companyShow();
                    }else{
                      wx.showModal({
                        title: '无信息',
                        content: '您尚不具有公司权限',
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
  acceptOrder:function(e){
    var orderToSend = new Array();
    var idx=e.currentTarget.dataset.idx;
    var item=e.currentTarget.dataset.item;
    //modal
    var that=this;
    orderToSend.push(item);
        wx.showModal({
        content: '确定接单？',
        success: function(res) {
            that.setData({
              loadingHidden:false
            })
            if(res.confirm){
              var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              wx.request({
                  url: api + 'company/companyAccept39', //39:接单未匹配车型司机
                  data: {
                     token:wx.getStorageSync('token'),
                     t:timestamp,
                     s:sha1.hex_sha1(app.data.key+timestamp),

                     itemId:item.id

                  },
                  header: {
                      'content-type': 'application/json'
                  },
                  //method:'POST',
                  success: function(res) {
                    that.setData({
                      loadingHidden:true
                    })
                    if(res.data==0){   //单子被别人抢了
                        wx.showModal({
                        title: '此单已被抢',
                        content: '请选择其他订单！',
                        showCancel: false
                      });
                      that.data.orderArray[idx].selected=!that.data.orderArray[idx].selected;
                      that.setData({
                        orderArray:that.data.orderArray
                      })

                    }else if(res.data==1){  //单子是自己的 先把state 置为30 成功！
                        wx.navigateTo({
                          url: '../companyInfo/accept/accept?orderToSend='+JSON.stringify(orderToSend)
                        });
                    }else{

                    }
                  }
                })
            }
        }
          });//show modal end 
  },
  matchOrder:function(e){
    var orderToSend = new Array();
    var item=e.currentTarget.dataset.item;
    orderToSend.push(item);
    wx.navigateTo({
      url: '../companyInfo/accept/accept?orderToSend='+JSON.stringify(orderToSend)
    });
  },
  settleOrder:function(e){
    var orderToSend = new Array();
    var item=e.currentTarget.dataset.item;
    orderToSend.push(item);
    wx.navigateTo({
      url: '../companyInfo/settle/settle?orderToSend='+JSON.stringify(orderToSend)
    });
  }
})