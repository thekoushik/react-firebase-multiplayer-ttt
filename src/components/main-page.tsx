import * as React from "react";
import { UserList } from "./user-list";
import {Cache} from '../services/common';
import { Game } from "./game";

interface IProps { user: any; signOut:Function }

interface IState{
    selectedUser:any;
    inGame:boolean;
    ownScore:number;
    opponentScore:number;
}

export class MainPage extends React.Component<IProps, IState>{
    constructor(props:IProps){
        super(props);
        this.state={
            selectedUser:null,
            inGame:false,
            ownScore:0,
            opponentScore:0
        };
    }
    userClick(data:any){
        //console.log('user',data);
        if(data.game_data){
            let imChallenger=(Cache.user===data.game_data.challenger_id);
            let ownScore= imChallenger?data.game_data['val-'+data.game_data.challenger_id]:data.game_data['val-'+data.game_data.player_id];
            let opponentScore= imChallenger?data.game_data['val-'+data.game_data.player_id]:data.game_data['val-'+data.game_data.challenger_id];
            if(this.state.inGame){
                this.setState({ownScore,opponentScore});
            }else
                this.setState({selectedUser:{...data},ownScore,opponentScore});
        }else
            this.setState({selectedUser:{...data},ownScore:0,opponentScore:0});
    }
    onCreate(){
        //console.log('Creating a game with',this.props.user.uid,'and',this.state.selectedUser.id);
        Cache.addGame(this.props.user.uid,this.state.selectedUser.id)
        .then((add)=>{console.log('game added',add.key);})
        .catch((e)=>{console.log('game add error',e)})
    }
    onPlay(playing:boolean=true){
        //console.log('Play',this.state.selectedUser.game_data)
        this.setState({inGame:playing});
    }
    render() {
        let {selectedUser,inGame,ownScore,opponentScore}=this.state;
        let {user}=this.props;
        return <div className="MainPage">
            <p></p>
            {
                inGame?<Game playing={selectedUser.playing} game_id={selectedUser.game_id} gamedata={selectedUser.game_data} />:(
                <div className="row right-pad">
                    <div className="col-12">
                        {
                            selectedUser?<div className="card border-primary h-100">
                                <div className="card-body d-flex flex-column align-items-start">
                                    <h4 className="card-title text-primary">{selectedUser.name}</h4>
                                    {
                                        selectedUser.game_data?<>
                                            <p className="card-text">Score: {ownScore} - {opponentScore}</p>
                                            <button type="button" onClick={()=>this.onPlay()} className="btn btn-warning mt-auto">Play</button>
                                        </>:<>
                                            <p className="card-text">No game found. Create one now.</p>
                                            <button type="button" onClick={this.onCreate.bind(this)} className="btn btn-primary mt-auto">Create</button>
                                        </>
                                    }
                                    
                                </div>
                            </div>:<div className="jumbotron jumbotron-fluid pb-1">
                                <div className="container">
                                    <img className="userphoto" src={user.photoURL} />
                                    <h1>Welcome</h1>
                                    <p className="lead text-danger">{user.displayName}</p>
                                    <p className="">Select a user </p>
                                </div>
                            </div>
                        }
                    </div>
                    <div className={"col-12 "+(selectedUser?'mt-4':'')}>
                        <div className="jumbotron jumbotron-fluid p-4 pb-1 bg-success">
                            <p className="lead mb-0 text-justify">This is a 10x10 tic tac toe game where players should make 5 consecutive pieces anywhere in the board to win.</p>
                        </div>
                    </div>
                </div>)
            }
            {
                inGame?<button className="btn btn-outline-info back-btn" onClick={()=>this.onPlay(false)}>Back</button>:<button className="btn btn-outline-danger signout" onClick={()=>this.props.signOut()}>Sign out</button>
            }
            <UserList className={inGame?'hidden':''} id={user.uid} selectedUser={selectedUser} onUserClick={this.userClick.bind(this)}></UserList>
        </div>;
    }
}