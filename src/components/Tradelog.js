import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Image
} from 'react-native';
import { withNavigation } from 'react-navigation';
import {Colors} from '../constants/iColors';

class Tradelog extends React.PureComponent {
  constructor(props) {
    super(props);
    this.tradelog = this.props.tradelog;
    this.state = {

    }
  }
  static defaultProps = {
  }
  
  
  componentDidMount() {
   
  }
  componentWillUnmount() {
    
  }



  render() {
    //1:预测消耗 2:预测结果收益 3:打赏别人 4:被打赏 5:推送消耗 6:推送被其他人阅读，获得银币消息
    let gold = require('../images/wallet/gold.png');
    let silver = require('../images/wallet/silver.png');
    
    return (
        <View style={{borderBottomColor:'#eee',borderBottomWidth:0.4,paddingHorizontal:15,paddingVertical:13,backgroundColor:'white'}}>
            <View style={{flexDirection:"row",justifyContent:'space-between'}}>
              <Text style={[{fontSize:15,marginBottom:10}]}>{this.tradelog.content}</Text>
              <View style={{flexDirection:'row'}}>
              <Text style={[this.tradelog.up==1?{color:'orange'}:{},{fontSize:15}]}>
                {this.tradelog.up==1?'+':'-'}{this.tradelog.coincount}</Text>
              <Image style={{width:20,height:20,marginLeft:5}} source={this.tradelog.cointype == 1?silver:gold}></Image>
              </View>
            </View>
            <View><Text style={{color:Colors.sTextColor,fontSize:12}}>{this.tradelog.createdatetime}</Text></View>
        </View>
    ) 
  }
}

export default withNavigation(Tradelog);
