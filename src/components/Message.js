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
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
class Message extends React.PureComponent {
  constructor(props) {
    super(props);
    this.message = this.props.message;
    
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
    console.log('render message')
    let content = this.message.messages[this.message.messages.length - 1].content;
    if(content.indexOf('$pic$_#_path=') == 0) {
      content = '图片';
    }
    if(this.message.type == 1) {
      return (
        <TouchableOpacity onPress={this._onPress} style={{flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,paddingHorizontal:15,paddingVertical:15,backgroundColor:'white'}}>
            <Image style={{width:40,height:40,borderRadius:5}} source={{uri:baseimgurl+this.message.avatar}}></Image>
            <View style={{marginLeft:15,flex:1}}>
              <Text style={{color:'#333',fontSize:15}}>{this.message.username}</Text>
              <View style={{marginTop:7}}><Text numberOfLines={1} ellipsizeMode={'tail'} style={[this.state.userread == 0 ? {color:'#017bd1'} : {color:Colors.sTextColor},{fontSize:13}]}>{content}</Text></View>
            </View>
            <Datetime style={{fontSize:12,color:Colors.GreyColor}} datetime={this.message.messages[this.message.messages.length - 1].createdatetime}></Datetime>
        </TouchableOpacity>
      )
    } else if(this.message.type == 3){
      return (
        <TouchableOpacity onPress={this._onPress} style={{flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,paddingHorizontal:15,paddingVertical:15,backgroundColor:'white'}}>
            <Image style={{width:40,height:40,borderRadius:5}} resizeMode='stretch' source={require('../images/logo.png')}></Image>
            <View style={{marginLeft:15,flex:1}}>
              <Text style={{color:'#333',fontSize:15}}>{'举报处理'}</Text>
              <View style={{marginTop:7}}><Text numberOfLines={1} ellipsizeMode={'tail'} style={[this.state.userread == 0 ? {color:'#017bd1'} : {color:Colors.sTextColor},{fontSize:13}]}>{this.message.messages[0].content}</Text></View>
            </View>
            <Datetime style={{fontSize:12,color:Colors.GreyColor}} datetime={this.message.messages[0].createdatetime}></Datetime>
        </TouchableOpacity>
      ) 
    } else if(this.message.type == 4){
      return (
        <TouchableOpacity onPress={this._onPress} style={{flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,paddingHorizontal:15,paddingVertical:15,backgroundColor:'white'}}>
            <View style={{width:40,height:40,borderRadius:5,backgroundColor:"#1fb922",justifyContent:"center",alignItems:"center"}}>
            <FontAwesome5 name='user-friends' size={21} color={'white'}/>
            
            </View>
            
            <View style={{marginLeft:15,flex:1}}>
              <Text style={{color:'#333',fontSize:15}}>{'添加好友'}</Text>
              <View style={{marginTop:7}}><Text numberOfLines={1} ellipsizeMode={'tail'} style={[this.state.userread == 0 ? {color:'#017bd1'} : {color:Colors.sTextColor},{fontSize:13}]}>{this.message.messages[0].content}</Text></View>
            </View>
            <Datetime style={{fontSize:12,color:Colors.GreyColor}} datetime={this.message.messages[0].createdatetime}></Datetime>
        </TouchableOpacity>
      ) 
    }
  }
}

export default withNavigation(Message);
