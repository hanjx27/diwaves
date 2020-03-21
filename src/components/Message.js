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
import { baseimgurl } from '../utils/Global';
import Datetime from './Datetime';
class Message extends React.PureComponent {
  constructor(props) {
    super(props);
    this.message = this.props.message;
    this.messageList = this.props.messageList;
    
    this.state = {
        userread:this.props.message.userread

    }
  }
  static defaultProps = {
  }
  
  
  componentDidMount() {
   
  }
  componentWillUnmount() {
    
  }
  _onPress = () => {
    this.setState({
      userread:1
    })
    this.props.onPress();
  }


  render() {
    this.state.userread = this.props.message.userread
    this.message = this.props.message
    return (
        <TouchableOpacity onPress={this._onPress} style={{flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,paddingHorizontal:15,paddingVertical:15,backgroundColor:'white'}}>
            <Image style={{width:36,height:36,borderRadius:5}} source={{uri:baseimgurl+this.message.avatar}}></Image>
            <View style={{marginLeft:15,flex:1}}>
              <Text style={{colo:'#333',fontSize:15}}>{this.message.username}</Text>
              <View style={{marginTop:7}}><Text numberOfLines={1} ellipsizeMode={'tail'} style={[this.state.userread == 0 ? {color:'#017bd1'} : {color:Colors.sTextColor},{fontSize:13}]}>{this.message.messages[this.message.messages.length - 1].content}</Text></View>
            </View>
            <Datetime style={{fontSize:12,color:Colors.GreyColor}} datetime={this.message.messages[this.message.messages.length - 1].createdatetime}></Datetime>
        </TouchableOpacity>
    ) 
  }
}

export default withNavigation(Message);
