import * as React from "react";
import {Cache} from '../services/common';

interface UserListProps{
    className:string;
    id:string;
    selectedUser?:any;
    onUserClick?:Function;
}
interface UserListState{
    users:any;
    userFetched:boolean;
}
export class UserList extends React.Component<UserListProps,UserListState>{
    constructor(props:UserListProps){
        super(props);
        this.state={
            users:{},
            userFetched:false
        };
    }
    registerUpdateGames(){
        let user_id=this.props.id;
        Cache.getGamesRef().orderByChild(user_id).on('value',(snap)=>{
            let data=snap.val();
            if(!data) return;
            //console.log('my games',data);
            let {users}=this.state;
            let change='';
            for(let key in data){
                let game=data[key];
                if(game.challenger_id===user_id){//I created this
                    if(users[game.player_id]){
                        change=game.player_id;
                        users[game.player_id].playing='own';
                        users[game.player_id].game_id=key;
                        users[game.player_id].game_data=game;
                    }
                }else if(game.player_id===user_id){//I didn't create this
                    if(users[game.challenger_id]){
                        change=game.challenger_id;
                        users[game.challenger_id].playing='other';
                        users[game.challenger_id].game_id=key;
                        users[game.challenger_id].game_data=game;
                    }
                }
            }
            if(change) this.setState({users});
            if(this.props.selectedUser){
                this.onClick(users[change]);
            }
        })
        
    }
    componentDidMount(){
        let user_id=this.props.id;
        Cache.getUsersRef().on('value',(snap)=>{
            let users=snap.val();
            //console.log('users',users);
            let {userFetched}=this.state;
            if(users){
                delete users[user_id];
                this.setState({users});
                if(!userFetched){
                    userFetched=true;
                    this.registerUpdateGames();
                    this.setState({userFetched});
                }
            }
        });
    }
    componentWillUnmount(){
        console.log('user list unmount');
        Cache.getUsersRef().off();
        Cache.getGamesRef().off();
    }
    onClick(data:any){
        try{this.props.onUserClick && this.props.onUserClick(data);}catch(e){}
    }
    render() {
        let {users}=this.state;
        let user_list=Object.keys(users).map(m=>({...users[m],id:m}));
        let {selectedUser}=this.props;
        return <div className={"UserList "+this.props.className}>
            <div className="list-group">
                {
                    user_list.map((m:any,i:number)=><button onClick={()=>this.onClick(m)} type="button" key={i} className={"list-group-item list-group-item-action "+(selectedUser && selectedUser.id===m.id?"selected":"")} >
                        <span className={"game-mode game-mode-running-"+m.playing}></span>
                        <img className="photo-item" src={m.photo} />
                    </button>)
                }
            </div>
        </div>;
    }
}