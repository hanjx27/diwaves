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
import AntDesign from 'react-native-vector-icons/AntDesign';
import { withNavigation } from 'react-navigation';

class ComentinPredict extends React.PureComponent {
  constructor(props) {
    super(props);
    this.userpredict = this.props.userpredict
    this.predict = this.props.predict
    this.state= {
      
    }
  }
  static defaultProps = {
    
  }
  
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  } 

  goPerson = () => {
    if(this.props.userpredict.userid == 1 || this.props.userpredict.username == 'admin') {
      return;
    }
    this.props.navigation.navigate('PersonScreen',{personid:this.props.userpredict.userid})
  }
 
  render() {
    console.log("render comment in predict")
    let userpredicttext = "";
    if(this.userpredict != null) {
      if(this.userpredict.option == 1) {
        userpredicttext = this.predict.option1;
      } else if(this.userpredict.option == 2) {
        userpredicttext = this.predict.option2;
      } else if(this.userpredict.option == 3) {
        userpredicttext = this.predict.option3;
      } else if(this.userpredict.option == 4) {
        userpredicttext = this.predict.option4;
      } else if(this.userpredict.option == 5) {
        userpredicttext = this.predict.option5;
      }
    }
    userpredicttext = userpredicttext.split('（')[0]

    return (
      <View style={{flexDirection:'row',paddingVertical:15,backgroundColor:'white',marginTop:5,borderBottomColor:'#f1f1f1',borderBottomWidth:0.5}}>
        <TouchableOpacity onPress={this.goPerson}>
          <Image style={{width:38,height:38,borderRadius:19,marginRight:10}} source={{uri:baseimgurl + this.userpredict.avatarUrl}}></Image>
        </TouchableOpacity>
        <View style={{flex:1,flexDirection:'column'}}>
        <View style={{display:'flex',flexDirection:'row',alignItems:"center"}}>
          <TouchableOpacity onPress={this.goPerson} style={{flex:1}}>
            <Text style={{fontSize:14,color:Colors.TextColor}}>{this.userpredict.username}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{marginTop:10}}>预测：{userpredicttext}</Text>
        <Text style={{marginTop:5,lineHeight:18}}>{this.userpredict.comment}</Text>
        <View style={{flexDirection:'row',marginTop:10,alignItems:"center"}}>
          <Datetime style={{fontSize:13,color:Colors.GreyColor}} datetime={this.userpredict.createdatetime}></Datetime>
          {this.userpredict.hide == 1 &&
            <View style={{flexDirection:'row',alignItems:'center',marginLeft:10,backgroundColor:'#e6f2fd',paddingHorizontal:7,paddingVertical:5,borderRadius:5}}>
              <AntDesign name='pushpino' size={11} color={'#1787fb'}/>
              <Text style={{marginLeft:2,color:'#1787fb',fontSize:11}}>隐藏预测记录</Text>
            </View>
          }
        </View>
      </View>
      </View>
    )
  }
}

export default withNavigation(ComentinPredict);
