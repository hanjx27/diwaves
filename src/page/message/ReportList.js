import React, { Component } from 'react';
import {Alert,Switch,Modal,Image,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView, TextInput } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

import {Colors} from '../../constants/iColors';
export default class TemplatePage extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.state = {
       user:null,
       reports:[],
       detailVisible:false,
       report:null,
       data:null,
       delVisible:false,
       delreport:null,
       forbid:false,
       forbidforever:false,
       forbidtime:0,
       decreasesilver:0
    }
  }

  componentWillMount() {
  }


  getReports = async(ids)=> {
    try {
      const result = await Request.post('getReports',{
        ids:ids
      });
      if(result.code == 1) {
        this.setState({
          reports:result.data
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
      const messageListstr = await AsyncStorage.getItem('messageList_' + json.id);
    
      if(messageListstr != null && messageListstr != '') {
        const messagelist = JSON.parse(messageListstr);
        this.messageList = messagelist;
        for(let i = 0;i < this.messageList.length;i++) {
          if(this.messageList[i].touserid == 'report') {
            let messages = this.messageList[i].messages
            let ids = [];
            for(let i = 0;i < messages.length;i++) {
              ids.push(messages[i].userid);
            }
            this.getReports(ids);
            if(this.messageList[i].userread == 0) {
              this.messageList[i].userread = 1;
              await AsyncStorage.setItem('messageList_' + json.id, JSON.stringify(this.messageList));
            }
            break;
          }
        }
      }
    }
  }

  componentWillUnmount() {
    
  }

  getDetail = async(item) => {
    try {
      const result = await Request.post('getForbidDetail',{
        reportid:item.id
      });
      if(result.code == 1) {
        this.setState({
          detailVisible:true,
          report:item,
          data:result.data
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  delConent = async(item) => {
    this.setState({
      delVisible:true,
      delreport:item,
      forbid:false,
      forbidforever:false,
      forbidtime:0,
      decreasesilver:0

    })
  }

  delconfirm = async() => {
    let decreasesilver = this.state.decreasesilver;
    decreasesilver = parseInt(decreasesilver);
    if(!decreasesilver) {
      decreasesilver = 0;
    }
    let forbidtime = this.state.forbidtime;
    forbidtime = parseInt(forbidtime);
    if(!forbidtime) {
      forbidtime = 0;
    }
    if(this.state.forbid) {
      if(!this.state.forbidforever) {
        if(forbidtime <= 0) {
          Alert.alert('请输入正确的封禁天数')
          return;
        }
      }
      if(decreasesilver < 0) {
        Alert.alert('请输入正确的扣减银币')
        return;
      }
    }

    const data = {
      delreportid:this.state.delreport.id,
      delid:this.state.delreport.objid,
      deltype:this.state.delreport.type,
      forbid:this.state.forbid?1:0,
      forbidtime:forbidtime,
      forbidforever:this.state.forbidforever?1:0,
      decreasesilver:decreasesilver,
      publishuserid:this.state.delreport.publishuserid,
      title:this.state.delreport.title,
      opuserid:this.state.user.id
    }
   
    try {
      const result = await Request.post('delContent',data);
      if(result.code == 1) {
        this.setState({
          delVisible:false,
          delreport:null,
          forbid:false,
          forbidforever:false,
          forbidtime:0,
          decreasesilver:0
        })
        let reports = this.state.reports;
          for(let i = 0;i < reports.length;i++) {
            if(reports[i].id == this.state.delreport.id) {
              reports[i].state = 3;
              break;
            }
          }
          this.setState({
            reports:reports
          })
      } else if(result.code == -2) {
        let reports = this.state.reports;
        for(let i = 0;i < reports.length;i++) {
          if(reports[i].id == this.state.delreport.id) {
            reports[i].state = 6;
            break;
          }
        }
        this.setState({
          delVisible:false,
          delreport:null,
          forbid:false,
          forbidforever:false,
          forbidtime:0,
          decreasesilver:0,
          reports:reports
        })
        Alert.alert('操作失败，此举报其他管理员已处理');
      }
    } catch (error) {
      console.log(error)
    }
  }

  ignore = async(item) => {
    Alert.alert(
      '确认要忽略此举报信息？',
      '',
      [
        {text: '确定', onPress: async() => {
          try {
            const result = await Request.post('ignoreReport',{
              reportid:item.id,
              opuserid:this.state.user.id
            });
            if(result.code == 1) {
             let reports = this.state.reports;
             for(let i = 0;i < reports.length;i++) {
               if(reports[i].id == item.id) {
                 reports[i].state = 2;
                 break;
               }
             }
             this.setState({
               reports:reports
             })
            }
          } catch (error) {
            console.log(error)
          }
        }},
        {text: '取消', onPress: () => {}}
      ],
      { cancelable: true }
      )
  }

  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: '#f5f5f5'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title='举报处理' isLeftTitle={true} />
      <FlatList
              style={{ marginTop: 0,paddingHorizontal:15 }}
              data={this.state.reports}
              renderItem={
                ({ item,index }) => { //增加了index 就失去了purecomponent的效果
                  let type = '';
                  if(item.type == 1) {
                    type = '帖子'
                  } else if(item.type == 2) {
                    type = '评论'
                  } else if(item.type == 3) {
                    type = '回复'
                  } 
                  return(
                    <View style={styles.reportTab}>
                      <View style={{paddingHorizontal:15,marginTop:15}}>
                      <Text style={[styles.reportcontent,{lineHeight:20}]}>{'举报内容：' + item.title}</Text>
                      <Text style={{marginTop:5,color:'#666',fontSize:12}}>{item.datetime}</Text>
                      </View>
                      <View style={styles.reportview}>
                      <Text style={styles.reportitle}>内容类型</Text>
                      <Text style={styles.reportcontent}>{type}</Text>
                      </View> 
                      <View style={styles.reportview}>
                      <Text style={styles.reportitle}>内容发布人</Text>
                      <Text style={styles.reportcontent}>{item.publishusername}</Text>
                     </View>
                     <View style={styles.reportview}>
                      <Text style={styles.reportitle}>举报原因</Text>
                      <Text style={styles.reportcontent}>{item.text}</Text>
                     </View>
                     <View style={styles.reportview}>
                      <Text style={styles.reportitle}>举报人</Text>
                      <Text style={styles.reportcontent}>{item.username}</Text>
                     </View>
                     <View style={styles.reportview}>
                      <Text style={styles.reportitle}>状态</Text>
                       {item.state == 1 &&
                       <Text style={[styles.reportcontent]}>未处理</Text>
                        }
                        {item.state == 2 &&
                       <Text style={[styles.reportcontent]}>已忽略</Text>
                        }
                        {item.state == 3 &&
                        <Text style={[styles.reportcontent]}>封禁用户</Text>
                        }
                        {item.state == 4 &&
                        <Text style={[styles.reportcontent]}>封禁用户<Text style={{color:'red'}}>（已撤销）</Text></Text>
                        }
                        {item.state == 5 &&
                        <Text style={[styles.reportcontent]}>已删除内容</Text>
                        }
                        {item.state == 6 && // app前端处理失败，把state修改为6
                        <Text style={[styles.reportcontent]}>已处理</Text>
                        }
                     </View>

                     <View style={{marginTop:15,paddingHorizontal:15,borderTopColor:"#eee",borderTopWidth:0.5,paddingTop:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                        {item.state == 1 &&
                        <View style={{flexDirection:'row'}}>
                          <TouchableOpacity onPress={()=>{this.ignore(item)}} style={{paddingVertical:5,paddingHorizontal:10,borderColor:'#17a2b8',borderRadius:3,borderWidth:1}}><Text style={{color: '#17a2b8',fontSize:13}}>忽略</Text></TouchableOpacity>
                          <TouchableOpacity onPress={()=>{this.delConent(item)}} style={{marginLeft:10,paddingVertical:5,paddingHorizontal:10,borderColor:'red',borderRadius:3,borderWidth:1,}}><Text style={{color: 'red',fontSize:13}}>删除内容</Text></TouchableOpacity>
                          
                        </View>
                        }
                        {item.state != 1 &&
                        <TouchableOpacity onPress={()=>{this.getDetail(item)}} style={{paddingVertical:5,paddingHorizontal:10,borderColor:'#17a2b8',borderRadius:3,borderWidth:1}}><Text style={{color: '#17a2b8',fontSize:13}}>查看处理详情</Text></TouchableOpacity>                 
                        }
                     </View>

                    </View>
                  )
                }
              }
              keyExtractor={(item, index) => index} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              ItemSeparatorComponent={this._separator}
      />

      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}




      <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.detailVisible}
        >
       <TouchableWithoutFeedback onPress={() => {this.setState({detailVisible:false,report:null,data:null})}}>
          <View style={[this.props.style,{top:0,left:0,backgroundColor:'rgba(0,0,0,0.4)',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}]}>
            <View style={{width:width - 80,borderRadius:5,backgroundColor:"white"}}>
            {
              !!this.state.report && (this.state.report.state == 2 || this.state.report.state == 5) &&
              <TouchableWithoutFeedback>
                <View>
                <View style={{paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                 
                <Text style={{marginLeft:5,color:'black',fontSize:15,fontWeight:'bold',textAlign:'center'}}>处理详情</Text>
                </View>

                <View style={{paddingVertical:30,paddingHorizontal:15}}>
                <Text>处理人：{this.state.data.id == 1 ? '系统管理员':this.state.data.name}</Text>
                <Text style={{marginTop:15}}>处理类型：{this.state.report.state == 2?'忽略举报':'删除内容'}</Text>
              </View>
              </View>
            </TouchableWithoutFeedback>  
            }
            {
              !!this.state.report && (this.state.report.state == 3 || this.state.report.state == 4) &&
              <TouchableWithoutFeedback>
                <View>
                <View style={{paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                <Text style={{marginLeft:5,color:'black',fontSize:15,fontWeight:'bold',textAlign:'center'}}>处理详情</Text>
                </View>
                <View style={{paddingVertical:30,paddingHorizontal:15}}>
                  <Text>处理人：{this.state.data.opuserid == 1 ? '系统管理员':this.state.data.opusername}</Text>
                  {this.state.report.state == 3 &&
                  <Text style={{marginTop:15}}>处理类型：封禁用户</Text>
                  }
                 {this.state.report.state == 4 &&
                  <Text style={{marginTop:15}}>处理类型：封禁用户<Text style={{color:'red'}}>（已撤销）</Text></Text>
                  }
                  <Text style={{marginTop:15}}>封禁时长：{this.state.data.forbidforever == 1?'永久封禁':this.state.data.forbidtime+'天'}</Text>
                  <Text style={{marginTop:15}}>扣除银币：{this.state.data.decreasesivler}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>  
            }
            </View>
          </View>
        </TouchableWithoutFeedback>
        </Modal>





        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.delVisible}
        >
       <TouchableWithoutFeedback onPress={() => {this.setState({delVisible:false})}}>
          <View style={[this.props.style,{top:0,left:0,backgroundColor:'rgba(0,0,0,0.4)',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}]}>
            <View style={{width:width - 40,borderRadius:5,backgroundColor:"white"}}>
            {
              !!this.state.delreport &&
              <TouchableWithoutFeedback>
                <View>
                  <View style={{paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                    <Text style={{marginLeft:5,color:'black',fontSize:15,fontWeight:'bold',textAlign:'center'}}>删除举报内容</Text>
                  </View>
                  <View style={{paddingHorizontal:15,paddingTop:15}}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Switch style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7}], marginRight: 10 }}
                   value={this.state.forbid} disabled={false} onValueChange={(forbid) => this.setState({forbid:forbid})}></Switch>
                    <Text>封禁用户：{this.state.delreport.publishusername}</Text>
                  </View>
                  {this.state.forbid &&
                    <View>
                      <View style={{marginTop:15,flexDirection:'row',alignItems:'center'}}>
                        <Text>封禁：</Text>
                        <TextInput value={this.state.forbidtime} onChangeText = {(forbidtime) => this.setState({forbidtime:forbidtime.replace(/[^0-9]*/g,'')})} 
                        keyboardType='numeric' style={{padding:0,paddingBottom:5,width:60,borderBottomColor:"#e1e1e1",borderBottomWidth:0.5,fontSize:16}}></TextInput>
                        <Text> / 天   </Text>

                        <Switch style={{transform: [{ scaleX: 0.7 }, { scaleY: 0.7}], marginHorizontal: 10 }}
                    value={this.state.forbidforever} disabled={false} onValueChange={(forbidforever) => this.setState({forbidforever:forbidforever})}></Switch>
                        <Text>永久封禁</Text>
                      </View>

                      <View style={{marginTop:15,flexDirection:'row',alignItems:'center'}}>
                        <Text>扣除银币：</Text>
                        <TextInput value={this.state.decreasesilver} onChangeText = {(decreasesilver) => this.setState({decreasesilver:decreasesilver.replace(/[^0-9]*/g,'')})} 
                        keyboardType='numeric' style={{padding:0,paddingBottom:5,width:60,borderBottomColor:"#e1e1e1",borderBottomWidth:0.5,fontSize:16}}></TextInput>
                        <Text> / 个</Text>
                      </View>
                    </View>
                  }
                  </View>

                  
                  <View style={{flexDirection:'row'}}>
                  <TouchableOpacity style={{borderBottomLeftRadius:5,marginTop:20,flex:1,backgroundColor:"white",alignItems:"center",justifyContent:"center",paddingVertical:12,borderTopColor:'#eee',borderTopWidth:0.5}} onPress={()=>{this.setState({delVisible:false})}} >
                      <Text style={{color:'black',fontSize:15}}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{borderBottomRightRadius:5,marginTop:20,flex:1,backgroundColor:"#3ca7f8",alignItems:"center",justifyContent:"center",paddingVertical:12}} onPress={()=>{this.delconfirm()}} >
                      <Text style={{color:'white',fontSize:15}}>确定</Text>
                  </TouchableOpacity>
                  </View>
                  
                </View>
                
            </TouchableWithoutFeedback>  
            }
            </View>
          </View>
        </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  reportTab:{
    backgroundColor:"white",
    borderRadius:5,
    marginTop:15,
    paddingBottom:15,
    paddingTop:5
  },
  reportview:{
    marginTop:10,
    flexDirection:'row',
    alignItems:"center",
    paddingHorizontal:15
  },
  reportitle:{
    width:80,
    color:'#666',
    fontSize:13,
    marginRight:20
  },
  reportcontent:{
    flex:1,
    color:'black',
    fontSize:14
  }
})

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
