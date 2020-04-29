/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, AppRegistry,View, Alert} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import AsyncStorage from '@react-native-community/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import {Colors} from './src/constants/iColors';
import { Request } from './src/utils/request';


type Props = {};
export default class App extends Component<Props> {

  constructor(props) { 
    super(props);
    
    this.logindate = '';
  
  }

  async componentWillMount() {
    await this.loginCall();
    setInterval(async() => {
      await this.loginCall();
    }, 60000); //每分钟去
   }

   loginCall = async() => {
    console.log(this.logindate)
    let date = new Date().getDate();
    if(date == this.logindate) {
      console.log('今日已经请求')
      return;
    }
    let user = await AsyncStorage.getItem('user');
    if(!!user) {
      let json = JSON.parse(user);
      try {
        const result = await Request.post('loginCall',{
          id:json.id
        });
        this.logindate = result.data;
      } catch (error) {
        console.log(error)
      }
    }
    
   }

  render() {
    return (
      <View style={{flex:1}}>
      <AppNavigator ref='appnav'
      uriPrefix="/app"
    />
     <TouchableOpacity onPress={()=> {Alert.alert(123)}} style={{backgroundColor:'red',zIndex:111111,width:30,height:30,position:"absolute",bottom:0,left:0}}>
          <MaterialIcons name='add-box' size={28} color={Colors.TextColor}/>
      </TouchableOpacity>
    </View>
    );
  }
}