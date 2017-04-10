var sha1=require('../../../utils/sha1.js');
var app=getApp();
var api = app.data.api;
Page({
  data: {
    cars:new Array(),
    array_car:new Array(),
    index_car:0,
    new_car_name:'',
    new_car_license:'',

    drivers:new Array(),
    array_driver:new Array(),
    index_driver:0,
    new_driver_name:'',
    new_driver_mobilephone:'',

  	orderToSend:new Array(),
    loadingHidden:false,

    carNameStyle:'',
    carLicenseStyle:'',
    driverNameStyle:'',
    driverMobilephoneStyle:''
  },

  onShow:function(e){
        this.setData({
        loadingHidden:false
      })
      var loadingFlag=0;
      var that =this;
      var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              wx.request({
                  url: api + 'company/carShow', //正吉url 获取订单
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
                      cars: res.data
                    });
                    wx.request({
                        url: api + 'company/driverShow', //正吉url 获取订单
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
                            drivers: res.data
                          });
                          //处理订单codd end 
                          var cars=that.data.cars;
                          var drivers=that.data.drivers;
                          var array_car=new Array();
                          var array_driver=new Array();
                          for(var item in cars){
                            array_car.push(cars[item].license+" "+cars[item].name);
                          }
                          array_car.push(['新建车辆信息']);
                          for(var item in drivers){
                            array_driver.push(drivers[item].name+" "+drivers[item].mobilephone);
                          }
                          array_driver.push(['新建司机信息']);
                          that.setData({
                            array_driver:array_driver,
                            array_car:array_car,
                            loadingHidden:true
                          })

                        }
                      })
                    
                  }
                });
  },
  onLoad:function(query){
  	var orderToSend=JSON.parse(query.orderToSend);
  	this.setData({
  		orderToSend:orderToSend
  	});
  	var a =1;
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
  bindCarNameInput:function(e){
    this.setData({
      new_car_name:e.detail.value
    });
    if(this.data.new_car_name!=''){
      this.setData({
        carNameStyle:''
      })
    }
  },
   bindCarLicenseInput:function(e){
    this.setData({
      new_car_license:e.detail.value
    })
    if(this.data.new_car_license!=''){
      this.setData({
        carLicenseStyle:''
      })
    }
  },
  bindDriverNameInput:function(e){
    this.setData({
      new_driver_name:e.detail.value
    })
    if(this.data.new_driver_name!=''){
      driverNameStyle:''
    }
  },
  bindDriverMobilephoneInput:function(e){
    this.setData({
      new_driver_mobilephone:e.detail.value
    })
    if(this.data.new_driver_mobilephone!=''){
      this.setData({
        driverMobilephoneStyle:''
      })
    }
  },
  checkInput(carId,driverId){
    if(carId==0&&this.data.new_car_name==''){
      this.setData({
        carNameStyle:'1rpx solid red'
      })
    }else{
      this.setData({
        carNameStyle:''
      })
    }
    if(carId==0&&this.data.new_car_license==''){
      this.setData({
        carLicenseStyle:'1rpx solid red'
      })
    }else{
      this.setData({
        carLicenseStyle:''
      })
    }
    if(driverId==0&&this.data.new_driver_name==''){
      this.setData({
        driverNameStyle:'1rpx solid red'
      })
    }else{
      this.setData({
        driverNameStyle:''
      })
    }
    if(driverId==0&&this.data.new_driver_mobilephone==''){
      this.setData({
        driverMobilephoneStyle:'1rpx solid red'
      })
    }else{
      this.setData({
        driverMobilephoneStyle:''
      })
    }
    if((carId==0&&(this.data.new_car_name==''||this.data.new_car_license==''))||(driverId==0&&(this.data.new_driver_mobilephone==''||this.data.new_driver_name==''))){
        wx.showModal({
              title: '填写信息',
              content: '标红的为必填项，请完整填写！',
              showCancel: false
            });
        return false;
    }else{
      return true;
    }
  },
  Accept:function(e){
      var formId = e.detail.formId;
      var carId=this.data.array_car[this.data.index_car]!='新建车辆信息' ? this.data.cars[this.data.index_car].id : 0;
      var driverId=this.data.array_driver[this.data.index_driver]!='新建司机信息' ? this.data.drivers[this.data.index_driver].id : 0;
      var that=this;
    wx.showModal({
        content: '提交？',
        success: function(res) {
            if(res.confirm&&that.checkInput(carId,driverId)){
              var timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              wx.request({
                  url: api + 'company/companyAccept', //待确认待评价待结算（已匹配车型司机）
                  data: {
                     token:wx.getStorageSync('token'),
                     t:timestamp,
                     s:sha1.hex_sha1(app.data.key+timestamp),

                     carId:carId,
                     driverId:driverId,
                     id:that.data.orderToSend[0].id,

                     new_car_name:that.data.new_car_name,
                     new_car_license:that.data.new_car_license,
                     new_driver_name:that.data.new_driver_name,
                     new_driver_mobilephone:that.data.new_driver_mobilephone,
                     formId:formId

                  },
                  header: {
                      'content-type': 'application/json'
                  },
                  //method:'POST',
                  success: function(res) {
                    wx.switchTab({
                      url: '../../company/company'
                    })
                  }
                })
            }
        }
    });   
  }
})