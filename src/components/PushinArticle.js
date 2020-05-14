import React from 'react';
import {px, isIphoneX} from '../utils/px';
import {
  Alert,
  DeviceEventEmitter,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';
import { baseimgurl } from '../utils/Global';
import {Colors} from '../constants/iColors';
import AutoSizeImage from './AutoSizeImage';
const {width,height} =  Dimensions.get('window');
import { Request } from "../utils/request";
import Datetime from '../components/Datetime';
import { withNavigation } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
class PushinArticle extends React.PureComponent {
  constructor(props) {
    super(props);
    this.push = this.props.push
  }
  static defaultProps = {
    
  }
  
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  }
  goPerson = () => {
    this.props.navigation.navigate('PersonScreen',{personid:this.push.userid})
  }

  render() {

    return (
      <View style={{flexDirection:'row',paddingVertical:12,backgroundColor:'white',marginTop:5,alignItems:"center",justifyContent:"space-between",borderBottomColor:"#eee",borderBottomWidth:0.5}}>
        <TouchableOpacity onPress={this.goPerson} style={{flexDirection:"row",alignItems:"center"}}>
          <Image style={{width:38,height:38,borderRadius:19,marginRight:10}} source={{uri:(baseimgurl + this.push.avatarUrl)}}></Image>
          <Text style={{fontSize:14,color:Colors.TextColor}}>{this.push.username}</Text>
        </TouchableOpacity>
        <View>
          <Text style={{color:'#333',fontSize:14}}>推{this.push.peoplecount}人</Text>
        </View>
      </View>
    )
  }
}

export default withNavigation(PushinArticle);
