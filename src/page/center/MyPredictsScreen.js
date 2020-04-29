import React, { Component } from 'react';
import {FlatList,StatusBar,NativeModules,PanResponder,ActivityIndicator,View,StyleSheet,Platform,Dimensions} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import MyPredict from '../../components/MyPredict';
export default class MyPredictsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    this.end = false;
    this.pagecount = 15;
    this.endid = 0;
    this.user = props.navigation.getParam('user');
    this.state = {
      predictsList:[],
      isLoading:true
    }
    this.flaglistloading = false;
  }
  

  

  componentWillMount = async() => {
    this.getUserPredicts();

  }

  componentDidMount= async() => {
    
  }

  getUserPredicts = async() => {
    try {
      const result = await Request.post('getMyPredicts',{
        pagecount:this.pagecount,
        endid:this.endid,
        userid:this.user.id
      });
      if(result.code == 1) {
          let predictsList = this.state.predictsList
          
          predictsList = predictsList.concat(result.data)
          this.setState({
            predictsList:predictsList,
            isLoading:false
          })
          if(result.data.length < this.pagecount) {
              this.end = true
          } else {
            this.endid = result.data[result.data.length - 1].id
          }
      }
    } catch (error) {
      console.log(error)
    }
  }

  _onEndReached =() => {
    console.log('reach end')
    if(this.flaglistloading) {
      return;
    }
    if(this.end) {
      return;
    }
    this.flaglistloading = true;
    this.getUserPredicts();
    this.flaglistloading = false;
  }

  componentWillUnmount() {
  }

  
  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
      
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title={'预测记录'} />
      {
          this.state.isLoading && (
            <View style={{ flex: 1, padding: 50 }}>
              <ActivityIndicator />
            </View>
          )
        }
      <FlatList
              style={{ marginTop: 0 }}
              data={this.state.predictsList}
              onEndReachedThreshold={1}
              onEndReached={this._onEndReached}
              renderItem={
                ({ item }) => {
                  return (<MyPredict mypredict={item}></MyPredict>)
                }
              }
              
              ItemSeparatorComponent={this._separator}
              keyExtractor={(item, index) => item.userpredictid} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
      />
      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}
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
