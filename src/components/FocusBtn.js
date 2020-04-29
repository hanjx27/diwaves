import React from 'react';
import {
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { withNavigation } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import {Colors} from '../constants/iColors'
import { Request } from '../utils/request';

class FocusBtn extends React.PureComponent {

    constructor(props) {
        super(props);
        this.user = props.user;
        this.focususerid = props.focususerid
        this.focuslist = props.focuslist;
        this.state= {
          focused:false
        }

      }

    componentDidMount = async() =>{
      if(this.user != null) {

      } else {
        const user = await AsyncStorage.getItem('user');
        if(user != null && user != '') {
          const json = JSON.parse(user);
          this.user = json;
        }
      }

      if(this.user != null) {
        if(this.focuslist == null) {
          const focuslist = await AsyncStorage.getItem('focuslist_' + this.user.id);
          if(focuslist != null) {
              const json = JSON.parse(focuslist);
              this.focuslist = json;
              for(let i = 0;i < json.length;i++) {
                  if(json[i] == this.focususerid) {
                      this.setState({
                          focused:true,
                      })
                      break;
                  }
              }
          } else {
            this.focuslist = []
          }
        } else {
          for(let i = 0;i < this.focuslist.length;i++) {
            if(this.focuslist[i] == this.focususerid) {
                this.setState({
                    focused:true
                })
                break;
            }
          }
        }
      }
    }

    focusPress = async() => {
        if(this.user == null) {
          Alert.alert('您尚未登录')
          return;
        }
        if(!this.state.focused) {
          const result = await Request.post('addFocus',{
            userid:this.user.id,
            focususerid:this.focususerid,
          });
          //if(result.code == 1) {
            this.setState({
              focused:true
            })
            if(this.props.focusChange) {
              this.props.focusChange(true)
            }
            this.focuslist.push(this.focususerid)
            AsyncStorage.setItem('focuslist_' + this.user.id,JSON.stringify(this.focuslist))
          //}
        } else { //取消关注
            const result = await Request.post('deleteFocus',{
                userid:this.user.id,
                focususerid:this.focususerid,
              });
            //if(result.code == 1) {
                this.setState({
                    focused:false
                })
                if(this.props.focusChange) {
                  this.props.focusChange(false)
                }
                  
                for(let i = 0;i < this.focuslist.length;i++) {
                    if(this.focuslist[i] == this.focususerid) {
                        this.focuslist.splice(i,1)
                        break; 
                    }
                }
                AsyncStorage.setItem('focuslist_' + this.user.id,JSON.stringify(this.focuslist))
            //}
        }
      }
      
  render() {
    return (
        <TouchableOpacity onPress={this.focusPress} style={[!this.state.focused?{backgroundColor:'#f7f7f7'}:{backgroundColor:'#017bd1'},{borderRadius:5,paddingVertical:7,width:70,alignItems:'center'}]}>
            <Text style={[!this.state.focused?{color:Colors.TextColor}:{color:'white'},{fontWeight:'bold'}]}>{this.state.focused ? '已关注' : '+ 关注'}</Text>
      </TouchableOpacity>
    )
  }
}

export default withNavigation(FocusBtn);
