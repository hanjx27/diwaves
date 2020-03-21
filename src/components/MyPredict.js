import React from 'react';
import {px, isIphoneX} from '../utils/px';
import {
  DeviceEventEmitter,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';

import {Colors} from '../constants/iColors';
const {width,height} =  Dimensions.get('window');
import { baseimgurl } from '../utils/Global';
import Datetime from '../components/Datetime';

import { withNavigation } from 'react-navigation';

class MyPredict extends React.PureComponent {
  constructor(props) {
    super(props);
    this.mypredict = this.props.mypredict; 
    this.state= {
      
    }
  }
  static defaultProps = {
    
  }
  
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  } 
 
  render() {
    console.log("render my predict")
    let userpredicttext = "";
      if(this.mypredict.option == 1) {
        userpredicttext = this.mypredict.option1;
      } else if(this.mypredict.option == 2) {
        userpredicttext = this.mypredict.option2;
      } else if(this.mypredict.option == 3) {
        userpredicttext = this.mypredict.option3;
      } else if(this.mypredict.option == 4) {
        userpredicttext = this.mypredict.option4;
      } else if(this.mypredict.option == 5) {
        userpredicttext = this.mypredict.option5;
      }
    userpredicttext = userpredicttext.split('（')[0]

    let result = '';
    if(this.mypredict.state == 1) {
      result = '待公布'
    } else if(this.mypredict.state == 2) {
      result = "+" +(this.mypredict.silver + this.mypredict.silverwin) + '银币 成功';
    } else if(this.mypredict.state == 3) {
      result = '未中'
    }
    return (
      <View style={{flexDirection:'row',paddingHorizontal:15,paddingVertical:13,backgroundColor:'white',marginTop:5,borderBottomColor:'#eee',borderBottomWidth:0.4}}>
        <View style={{flex:1,flexDirection:'column'}}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15}}>{this.mypredict.title}</Text>
          <Text style={{marginTop:10,fontSize:13,color:Colors.sTextColor}}>{this.mypredict.silver + '银币 预测' + userpredicttext}</Text>
        </View>
        <View>
          <Text style={{fontSize:13,color:Colors.sTextColor}}>{result}</Text>
        </View>
      </View>
    )
  }
}

export default withNavigation(MyPredict);
