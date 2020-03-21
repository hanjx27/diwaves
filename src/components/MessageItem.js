import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Image,
  Dimensions
} from 'react-native';
import { withNavigation } from 'react-navigation';
import {Colors} from '../constants/iColors';
import { baseimgurl } from '../utils/Global';
import {px} from '../utils/px';
const { width, height } = Dimensions.get('window');
class MessageItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.message = this.props.message;
    this.person = this.props.person;
    this.user = this.props.user;
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
    
    return (
      <View style={{width:width - 30,paddingHorizontal:15,marginTop:20}}>
        {this.message.touserid == this.person.id && // 当前用户发送给person的信息
        <View style={{width:width - 30,flexDirection:'row',justifyContent:'flex-end'}}>
            <View style={{borderRadius:5,backgroundColor:'#1187fb',paddingVertical:8,paddingHorizontal:10,maxWidth:width - 150}}>
              <Text style={{color:'white',lineHeight:20}}>{this.message.content}</Text>
            </View>
            <View
              style={{ 
         
              marginTop: 12,
              width: 0,
              height: 0,
              borderColor: 'transparent',
              borderTopWidth: px(10),
              borderLeftWidth: px(20),
              borderBottomWidth: px(10),
              borderLeftColor: '#1187fb',
              }}
          />
          <Image style={{width:36,height:36,borderRadius:5}} source={{uri:baseimgurl+this.user.avatar}}></Image>
          </View>
        }

        {this.message.touserid == this.user.id && // person发送给当前用户的信息
        <View style={{width:width - 30,flexDirection:'row',justifyContent:'flex-start'}}>
          <Image style={{width:36,height:36,borderRadius:5}} source={{uri:baseimgurl+this.person.avatar}}></Image>
            <View
              style={{
              marginTop: 12,
              width: 0,
              height: 0,
              borderColor: 'transparent',
              borderTopWidth: px(10),
              borderRightWidth: px(20),
              borderBottomWidth: px(10),
              borderRightColor: 'white',
              }}
          />
          <View style={{borderRadius:5,backgroundColor:'white',paddingVertical:8,paddingHorizontal:10,maxWidth:width - 150}}>
              <Text style={{color:'black',lineHeight:20}}>{this.message.content}</Text>
          </View>
          </View>
        }
      </View>
    ) 
  }
}

export default withNavigation(MessageItem);
