import React, { Component } from 'react';
import {NativeModules,StatusBar,Image,Dimensions,TouchableNativeFeedback,TouchableOpacity,View,StyleSheet,Platform,Text, ListView} from 'react-native';
const {width,height} =  Dimensions.get('window');
import {Colors} from '../../constants/iColors';
import Header from '../../components/Header';
const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {px, isIphoneX} from '../../utils/px';
import MoneyBtn from '../../components/MoneyBtn';

import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';

export default class ChargeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      user:null,
      chooses:[{
        title:'5金币',
        value:5,
        selected:true
      },{
        title:'10金币',
        value:10,
        selected:false
      },{
        title:'20金币',
        value:20,
        selected:false
      },{
        title:'30金币',
        value:30,
        selected:false
      },{
        title:'50金币',
        value:50,
        selected:false
      },{
        title:'100金币',
        value:100,
        selected:false
      }]
    }
  }

  

  componentWillMount = async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
    }
  }
  choose = (value) => {
    let chooses = this.state.chooses;
    for(let i = 0; i < chooses.length;i++) {
      chooses[i].selected = false;
      if(chooses[i].value == value) {
        chooses[i].selected = true;
      }
    }
    this.setState({
      chooses:chooses
    })
  }

  componentDidMount = () => {
    
  }

  componentWillUnmount() {
    
  }

  
  
  render() {
   
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: '#f7f7f7'}}>
      
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}
      <Header title='充值' isLeftTitle={true}/>
      <View style={{backgroundColor:'white',paddingHorizontal:15,marginTop:10,flex:1}}>
        <View style={{flexDirection:"row",alignItems:"center",height:50,borderBottomWidth:0.5,borderColor:'#eee'}}>
          <Text style={{fontSize:15}}>账户余额</Text>
          <Text style={{marginLeft:30,color:'#D9001B',fontSize:16}}>{this.state.user?this.state.user.gold:""}金币</Text>
        </View>
        <View style={{flexDirection:"row",alignItems:"center",height:50}}>
          <Text style={{fontSize:15}}>请选择充值金币</Text>
          <Text style={{marginLeft:30,color:Colors.sTextColor}}>1元人民币=1金币</Text>
        </View>

        <View style={{flexDirection:"row",flexWrap:'wrap',justifyContent:'space-evenly'}}>
            {this.state.chooses.map(item => {
              return (
                <MoneyBtn selected={item.selected} onPressed={() => this.choose(item.value)} title={item.title}></MoneyBtn>
              )
            })}
        </View>

        <TouchableOpacity style={{width:width-40,marginTop:30,marginLeft:5,borderRadius:3,backgroundColor:'#017bd1',paddingVertical:12,alignItems:'center'}}>
              <Text style={{color:'white',fontWeight:'bold'}}>立即充值</Text>
        </TouchableOpacity>

        <View style={{marginTop:30,color:Colors.sTextColor}}>
            <Text style={{color:Colors.sTextColor}}>温馨提示：</Text>
            <Text style={{marginTop:10,color:Colors.sTextColor,lineHeight:20}}>1、1元人民币=1金币</Text>
            <Text style={{color:Colors.sTextColor,lineHeight:20}}>2、金币为本平台向您提供的用于在本平台上进行相关消费的虚拟货币，充值成功后不支持兑换人民币、转让，不支持退款，充值前请慎重选择。</Text>
            <Text style={{lineHeight:20,color:Colors.sTextColor}}>3、金币可用于推送服务。</Text>
            <Text style={{lineHeight:20,color:Colors.sTextColor}}>4、数字海平台不鼓励未成年人实用充值服务。</Text>
        </View>
      </View>
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
