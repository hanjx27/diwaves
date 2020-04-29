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
import MyDraft from '../../components/MyDraft';
export default class MyDraftsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    
    this.user = props.navigation.getParam('user');
    this.state = {
      draftsList:[]
    }
  }
  

  

  componentWillMount = async() => {

    //AsyncStorage.removeItem('drafts');
    this.getMyDrafts();
    /*const drafts = await AsyncStorage.getItem('drafts_' + this.user.id);
    
    if(drafts != null) {
      this.setState({
        draftsList:JSON.parse(drafts)
      })
    } else {
      this.getMyDrafts();
    }*/

  }

  getMyDrafts = async() => {
    try {
      const result = await Request.post('getDrafts',{
        userid:this.user.id
      });
      if(result.code == 1) {
        this.setState({
          draftsList:result.data
        })
      }
    } catch (error) {
      
    }
  }

  deleteDraft = async(draft) => {
    console.log(draft)
    try {
      let draftsList = this.state.draftsList;
      for(let i = 0;i < draftsList.length;i++) {
        if(draftsList[i].id = draft.id) {
          draftsList.splice(i,1);
          break;
        }
      }
      console.log(draftsList);
      this.setState({
        draftsList:draftsList
      })
      AsyncStorage.setItem('drafts_' + this.user.id,JSON.stringify(draftsList));
      const result = await Request.post('deleteDraft',{
        draftid:draft.id,
        userid:this.user.id
      });
    } catch (error) {
      
    }
  }

  componentDidMount= async() => {
    
  }

  componentWillUnmount() {
  }

  
  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
      
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title={'草稿箱'}/>
      <FlatList
              style={{ marginTop: 0 }}
              data={this.state.draftsList}
              renderItem={
                ({ item }) => {
                  return (<MyDraft deleteDraft={this.deleteDraft} mydraft={item}></MyDraft>)
                }
              }
              
              ItemSeparatorComponent={this._separator}
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
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
