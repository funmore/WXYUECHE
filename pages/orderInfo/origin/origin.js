

Page({
  data: {

    array_departure:['8号楼','西院','仿真北楼','研发楼','南苑','首都机场','其他地点'],
    index_departure:[0],
    departure:[''],
    originArray:[
      {id: 0, unique: 'unique_0'},
    ],
    styleArray:new Array(6)
  },
  onShow:function(options){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    if(prevPage.data.origin.length!=0){
          this.setData({
              originArray:new Array(),
              index_departure:new Array(),
              departure:new Array()
          });
          var count=0;
        for(var item in prevPage.data.origin){
          this.data.originArray = this.data.originArray.concat([{id: count, unique: 'unique_' + count}]);
          count++;
          switch(prevPage.data.origin[item]){
              case '东院8号楼':
                this.data.departure=this.data.departure.concat('');
                this.data.index_departure=this.data.index_departure.concat([0]);
                break;
              case '东院研发楼':
                this.data.departure=this.data.departure.concat('');
                this.data.index_departure=this.data.index_departure.concat([1]);
                break;
              case '西院74号楼':
                this.data.departure=this.data.departure.concat('');
                this.data.index_departure=this.data.index_departure.concat([2]);
                break;
              default:
                this.data.departure=this.data.departure.concat(item);
                this.data.index_departure=this.data.index_departure.concat([3]);
                break;
          }
        } 
    }
    this.setData({
      originArray:this.data.originArray,
      index_departure:this.data.index_departure,
      departure:this.data.departure
    })

  },
  radioChange: function(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  bindPickerDeparture: function(e) {
    var id=e.target.dataset.itemId;
    this.data.index_departure[id]=e.detail.value;
    this.setData({
      index_departure: this.data.index_departure
    });
  },
  departInput:function(e){
    var id=e.target.dataset.itemId;
    this.data.departure[id]=e.detail.value;
    this.setData({
      departure:this.data.departure
    });
    if(this.data.departure[id]!=''){
      this.data.styleArray[id]='';
      this.setData({
        styleArray:this.data.styleArray
      })
    }
  },
  addOrigin:function(e){
    const length = this.data.originArray.length;
    if(length <= 5){
        this.data.originArray = this.data.originArray.concat([{id: length, unique: 'unique_' + length}]);
        this.data.index_departure=this.data.index_departure.concat([0]);
        this.data.departure=this.data.departure.concat('');
        this.setData({
          originArray: this.data.originArray,
          index_departure:this.data.index_departure
        });
        
      }else{
        wx.showModal({
          content: '最多6个出发地',
          showCancel:false,

        });
      } 
  },
  decOrigin:function(e){
    const length = this.data.originArray.length;
    if(length>=2){
        this.data.originArray.pop();
        this.data.index_departure.pop();
        this.setData({
          originArray: this.data.originArray,
          index_departure:this.data.index_departure
        })
    }else{
      wx.showModal({
          content: '最少1个出发地',
          showCancel:false,

        });
    }
  },

  onUnload:function(e){

    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    var origin=new Array();
    for(var item in this.data.index_departure){
      var value = this.data.index_departure[item];
      if(value<=this.data.array_departure.length-2){
        origin.push(this.data.array_departure[value]);
      }else{
        if(this.data.departure[item]!=''){
            dest.push(this.data.departure[item]);
            }
      }
    }
    prevPage.setData({
      origin: origin
    });
  },
   checkInput(){
    var ret=true;
    for(var item in this.data.index_departure){
      var value = this.data.index_departure[item];
      if(value>this.data.array_departure.length-2&&this.data.departure[item]==''){
          this.data.styleArray[item]='1rpx solid red';
          ret=false;
      }else{
          this.data.styleArray[item]='';
      }
    }
    this.setData({
      styleArray:this.data.styleArray
    });
    return ret;
  },
  saveAndBack:function(e){
    var check=this.checkInput();
    if(check){
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];  //上一个页面
        var origin=new Array();
        for(var item in this.data.index_departure){
          var value = this.data.index_departure[item];
          if(value<=this.data.array_departure.length-2){
            origin.push(this.data.array_departure[value]);
          }else{
            origin.push(this.data.departure[item]);
          }
        }
        prevPage.setData({
          origin: origin
        });
        wx.navigateBack({
            delta: 1
          });
      }else{
        wx.showModal({
            title: '填写信息',
            content: '标红的为必填项，请完整填写！',
            showCancel: false
          });
      }
  }
}) 



