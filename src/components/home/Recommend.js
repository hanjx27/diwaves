import React from 'react';
import {DeviceEventEmitter,FlatList,Dimensions,Text,View,ActivityIndicator,Modal,TouchableWithoutFeedback} from 'react-native';

import Article from '../Article'
import Article_comment from '../Article_comment';
import PredictArticle from '../PredictArticle';
import { withNavigation } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import {px, isIphoneX} from '../../utils/px';
const {width,height} =  Dimensions.get('window');

import AntDesign from 'react-native-vector-icons/AntDesign';
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
import {Colors} from '../../constants/iColors';
class Recommend extends React.Component {

    constructor(props) {
        super(props);
        this.user = null
        this.myUpedcomments = {}
        this.state= {
          commentlist:[],
          isLoading:true,
          reportVisible:false
        }

        this.reportcommentid = -1;
        this.reportarticleid = -1;
        this.reportList = {}

      }

      componentWillUnmount = () => {
        this.loginHandler.remove();
        this.logoutHandler.remove();
      }
      componentDidMount = async() =>{
         
      this.loginHandler = DeviceEventEmitter.addListener("login", async(data) => {
        this.setState({
          commentlist:[],
          isLoading:true
        })

        const user = await AsyncStorage.getItem('user');
        if(user != null && user != '') {
            const json = JSON.parse(user);
            this.user = json;
        }
        this.getUped();
      })
      
      this.logoutHandler = DeviceEventEmitter.addListener('logout', (data) => {
        this.user = null;
        this.myUpedcomments = {}
        this.setState({
          commentlist:[],
          isLoading:true
        })
        this.loadComment();
      });


      const reportListstr = await AsyncStorage.getItem('reportList');

      if(reportListstr) {
        this.reportList = JSON.parse(reportListstr)
      }

        const user = await AsyncStorage.getItem('user');
        if(user != null && user != '') {
            const json = JSON.parse(user);
            this.user = json;
        }
        this.getUped();
    }

    getUped = async() => {
      if(this.user == null) {
        this.loadComment();
        return;
      }
      const myUpedcommentsstr = await AsyncStorage.getItem('myUpedcomments_' + this.user.id);
      if(myUpedcommentsstr != null) {
        this.myUpedcomments = JSON.parse(myUpedcommentsstr);
        this.loadComment();
      } else {
        //初始化点赞数据
        try {
          const result = await Request.post('getUpedObjects',{
            userid:this.state.user.id,
          });
          if(result.code == 1) {
            const myUpedarticles = result.data.myUpedarticles
            const myUpedcomments = result.data.myUpedcomments
            const myUpedreplys = result.data.myUpedreplys
            AsyncStorage.setItem('myUpedarticles_' + this.user.id, JSON.stringify(myUpedarticles), function (error) {})
            AsyncStorage.setItem('myUpedcomments_' + this.user.id, JSON.stringify(myUpedcomments), function (error) {})
            AsyncStorage.setItem('myUpedreplys_' + this.user.id, JSON.stringify(myUpedreplys), function (error) {})
            this.myUpedcomments = myUpedcomments;
          }
        } catch (error) {
        }
        this.loadComment();
      }
    }
    
    clear = () => {
      this.setState({
        commentlist:[]
      })
    }

    loadComment = async() => {
      try {
        const result = await Request.post('recommend',{
          userid:this.state.user ? this.state.user.id : -1,
        });
        let list = this.state.commentlist;
        for(let i = 0;i < result.data.length;i++) {
          if(this.reportList[result.data[i].article.id] == 1) {
            continue;
          }
          list.push(result.data[i])
        }
        this.setState({
          commentlist:list,
          isLoading:false
        })
      } catch (error) {
        console.log(error)
      }
    }
    

    report = (articleid,commentid) => {
      this.reportarticleid = articleid;
      this.reportcommentid = commentid;
      this.setState({
        reportVisible:true
      })
    }
  
    reportArticle = async(text) => {
      if(this.reportarticleid == -1) {
        return;
      }
      this.reportList[this.reportarticleid] = 1;
      AsyncStorage.setItem('reportList', JSON.stringify(this.reportList), function (error) {})
  
      
      try {
        const result = await Request.post('addReport',{
          userid:!!this.user?this.user.id:'',
          articleid:this.reportarticleid,
          text:text,
          commentid:this.reportcommentid
        });
        if(result.code == 1) {
          let commentlist = this.state.commentlist;
          for(let i = 0;i < commentlist.length;i++) {
            if(commentlist[i].id == this.reportcommentid) {
              commentlist.splice(i,1);
              break;
            }
          }
          this.setState({
            reportVisible:false,
            commentlist:commentlist
          },()=> {
            const toastOpts = {
              data: '感谢您的举报,我们会尽快处理',
              textColor: '#ffffff',
              backgroundColor: Colors.TextColor,
              duration: 700, //1.SHORT 2.LONG
              position: WToast.position.TOP, // 1.TOP 2.CENTER 3.BOTTOM
            }
            WToast.show(toastOpts)
          })
          
        }
      } catch (error) {
        console.log(error)
      }
    }

  render() {
    return (
      <View>
      {
        this.state.isLoading && (
          <View style={{ flex: 1, padding: 50 }}>
            <ActivityIndicator />
          </View>
        )
      }
      <FlatList
      style={{ }}
      data={this.state.commentlist}
      renderItem={
        ({ item }) => {
            return (<Article_comment report={this.report} myUpedcomments={this.myUpedcomments} user={this.user} commenthome={item}></Article_comment>)
        }
      }
      ItemSeparatorComponent={this._separator}
      keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
    />



<Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.reportVisible}
        >
       <TouchableWithoutFeedback onPress={() => {this.setState({reportVisible:false})}}>
          <View style={[this.props.style,{top:0,left:0,backgroundColor:'rgba(0,0,0,0.4)',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}]}>
            <View style={{width:width - 80,borderRadius:5,backgroundColor:"white"}}>
            <TouchableWithoutFeedback>
            <View style={{paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
              <AntDesign name='warning' size={16} color={'black'}/>
              <Text style={{marginLeft:5,color:'black',fontSize:15,fontWeight:'bold',textAlign:'center'}}>举报</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportArticle('低俗色情')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>低俗色情</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportArticle('虚假欺诈')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>虚假欺诈</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportArticle('暴恐涉政')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>暴恐涉政</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportArticle('涉及违禁品')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>涉及违禁品</Text>
            </View>
            </TouchableWithoutFeedback>

            </View>
          </View>
        </TouchableWithoutFeedback>
        </Modal>

    </View>
    )
  }
}

export default withNavigation(Recommend);
