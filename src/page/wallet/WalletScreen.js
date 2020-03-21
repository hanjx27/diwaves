import React, { Component } from 'react';
import {NativeModules,StatusBar,Image,Dimensions,SafeAreaView,TouchableOpacity,View,StyleSheet,Platform,Text, ListView} from 'react-native';
const {width,height} =  Dimensions.get('window');
import {Colors} from '../../constants/iColors';

const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import {px, isIphoneX} from '../../utils/px';
export default class WalletScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      user:null
    }
  }

  

  componentWillMount = async() => {
    this._navListener = this.props.navigation.addListener("didFocus", async() => {
      if(this.state.user == null) {
        const user = await AsyncStorage.getItem('user');
        if(user != null && user != '') {
          const json = JSON.parse(user);
          this.setState({user:json})
          this.getUserInfo(this.state.user.id);
        }
      } else {
        this.getUserInfo(this.state.user.id);
      }
    });
    
  }

  getUserInfo = async(id) => {
    try {
      const result = await Request.post('getUserInfo',{
        id:id
      });
      const user = result.data;
      this.setState({user:user})
      AsyncStorage.setItem('user', JSON.stringify(user), function (error) {})
    } catch (error) {
      console.log(error)
    }
  }

  componentDidMount = async() => {
    
  }

  componentWillUnmount() {
    this._navListener.remove();
  }

  goTradelog = () => {
    this.props.navigation.navigate('TradeScreen');
  }
  
  render() {
    let gold = require('../../images/wallet/gold.png');
    let silver = require('../../images/wallet/silver.png');
    let arrow = require('../../images/center/arrow.png');
    return (

      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
        
        {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
        {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

        
        <View style={{height:40,alignItems:'center',backgroundColor:'white',justifyContent:'center'}}><Text style={{fontSize:17,color:'black',fontWeight:'bold'}}>钱包</Text></View>
        {!!this.state.user &&
          <View style={{flex:1,backgroundColor:'#f7f7f7'}}>
          <View style={{marginTop:10,backgroundColor:'white',borderRadius:3,paddingLeft:20}}>
          <View style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:20,height:20}} source={gold}></Image>
            <View style={{marginLeft:10,flex:1,height:50,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>金币   {this.state.user.gold}</Text>
                <TouchableOpacity onPress={() => {this.props.navigation.navigate('ChargeScreen')}} style={{marginRight:20,paddingVertical:5,paddingHorizontal:10,borderRadius:3,borderColor:Colors.TextColor,borderWidth:1}}><Text style={{color:Colors.TextColor,fontSize:14}}>充值</Text></TouchableOpacity>
            </View>
          </View>
          <View style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:20,height:20}} source={silver}></Image>
            <View style={{marginLeft:10,flex:1,height:50,flexDirection:'row',justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>银币   {this.state.user.silver}</Text>
            </View>
          </View>
          </View>


        <TouchableOpacity onPress={this.goTradelog} style={{paddingLeft:20,marginTop:10,backgroundColor:'white',height:40,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
            <Text style={{fontSize:15}}>交易记录</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
        </TouchableOpacity>
        </View>
        } 
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
})