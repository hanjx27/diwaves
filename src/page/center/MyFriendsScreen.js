import React, { Component } from 'react';
import {Image,FlatList,StatusBar,TextInput,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated, Alert} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import { baseimgurl, baseurl } from '../../utils/Global';
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import PersonSearch from '../../components/PersonSearch';
import {Colors} from '../../constants/iColors';
import Feather from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
export default class MyFriendsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    
    this.state = {
       user:null,
       friendsList:[],
       searchtext:''
    }
  }
  

  

  componentWillMount() {
    
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
      this.getFriendsList(json.id)
    }
  }

  getFriendsList = async(id) => {
    try {
      const result = await Request.post('getFriendsList',{
        userid:id
      });
      this.setState({
        friendsList:result.data
      })
    } catch (error) {
      console.log(error)
    }
  }

  componentWillUnmount() {
    
  }

  search = async()=> {
    try {
      const result = await Request.post('searchUserByPhoneOrSzh',{
        searchtext:this.state.searchtext
      });
      if(result.code == -1) {
        Alert.alert('不存在该用户')
      } else {
        this.props.navigation.navigate('PersonScreen',{personid:result.code})
      }
    } catch (error) {
      console.log(error)
    }
  }

  goPhoneContact = () => {
    this.props.navigation.navigate('PhoneContact',{friendsList:this.state.friendsList})
  }

  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}
      <Header title='我的朋友'/>

      <ScrollView>
      <View style={{position:'relative',marginHorizontal:15,marginTop:15}}>
      <TextInput value={this.state.searchtext} onChangeText = {(searchtext) => this.setState({searchtext:searchtext})} placeholder="数字号/手机号" onSubmitEditing={this.search}  
      style={{color:'black',fontSize:15,width:width - 30,backgroundColor:"#f5f5f5",height:40,borderRadius:5,paddingLeft:40}}></TextInput>
      <View style={{width:40,height:40,position:'absolute',top:0,left:0,alignItems:'center',justifyContent:'center'}}>
        <Feather name='search' size={20} color={'#333'}/>
      </View>
      </View>

      <TouchableOpacity onPress={()=>{this.goPhoneContact()}} style={{flexDirection:'row',alignItems:"center",marginTop:15,paddingHorizontal:15,paddingVertical:15,borderTopColor:"#eee",borderTopWidth:0.5,borderBottomColor:"#eee",borderBottomWidth:0.5}}>
        <MaterialCommunityIcons name='phone' size={20} color={'#1fb922'}/>
        <Text style={{flex:1,marginLeft:10,color:'#333',fontSize:16}}>添加手机联系人</Text>
        <Ionicons name='ios-arrow-forward' size={20} color={'#666'}/>
      </TouchableOpacity>

      <View style={{paddingVertical:15,paddingLeft:15,backgroundColor:'#f5f5f5'}}> 
        <Text style={{fontSize:14,color:"#333"}}>朋友列表</Text>
      </View>
      <View style={{flex:1}}>
      {this.state.friendsList.map(item => {
            return (
              <TouchableOpacity onPress={()=>{this.props.navigation.navigate('PersonScreen',{personid:item.id})}} style={{alignItems:'center',flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,paddingHorizontal:15,paddingVertical:10,backgroundColor:'white'}}>
              <Image style={{width:40,height:40,borderRadius:20}} source={{uri:baseimgurl+item.avatar}}></Image>
              <View style={{marginLeft:15,flex:1,flexDirection:"column"}}>
                <Text style={{color:'#333',fontSize:16}}>{item.name}</Text>
              </View>
            </TouchableOpacity>
            )
      })}
      </View>
      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}
      </ScrollView>
      </View>
    );
  }
}

const topStyles = StyleSheet.create({
  androidTop: {
    width: px(750),
    height: STATUSBAR_HEIGHT,
  },  
  topBox: {
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 44 : 20
  },
  footerBox:{
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 34 : 0
  }
})
