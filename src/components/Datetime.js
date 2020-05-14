import React from 'react';
import {
  Text, Alert,
} from 'react-native';
import { withNavigation } from 'react-navigation';
class Datetime extends React.PureComponent {

  render() {
    Date.prototype.Format = function (fmt) {
      var o = {
          "M+": this.getMonth() + 1, //月份 
          "d+": this.getDate(), //日 
          "h+": this.getHours(), //小时 
          "m+": this.getMinutes(), //分 
          "s+": this.getSeconds(), //秒 
          "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
          "S": this.getMilliseconds() //毫秒 
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
    }

    let datetime = this.props.datetime;
    //let date = new Date(datetime); 非debug模式下会报错！
    let datenow = new Date();

    let regEx = new RegExp("\\-","gi");
    let validDateStr=datetime.replace(regEx,"/");
    let milliseconds=Date.parse(validDateStr);
    let date = new Date(milliseconds);
    
    let datetimetext = '';
    try {
      if(datenow.getFullYear() != date.getFullYear()) {
        datetimetext = date.Format("yyyy-MM-dd");
      } else if(datenow.getMonth() != date.getMonth()) {
        datetimetext = date.Format("MM-dd hh:mm");
      } else if(datenow.getDate() != date.getDate()) {
        datetimetext = date.Format("MM-dd hh:mm");
      } else if(datenow.getHours() != date.getHours()) {
        datetimetext = datenow.getHours() - date.getHours() + '小时前'
      } else if(datenow.getMinutes() != date.getMinutes()) {
        datetimetext = datenow.getMinutes() - date.getMinutes() + '分钟前'
      } else {
        datetimetext = '刚刚';
      }
    }catch(e) {
      Alert.alert(e)
    }
    

    return (
      <Text style={this.props.style}>{datetimetext}</Text>
    )
  }
}

export default withNavigation(Datetime);
