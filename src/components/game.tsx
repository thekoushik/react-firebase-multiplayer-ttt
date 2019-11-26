import * as React from 'react';
import {GameStruct,Cache} from '../services/common';
import { TicTacToe } from '../services/tictactoe';

interface IProp{
    gamedata: GameStruct;
    playing: string;
    game_id: string;
}
interface IState{
    turn: number;
    next: string;
    myTurn: boolean;
    imChallenger: boolean;
    board: TicTacToe;
    lastx: number;
    lasty: number;
    won: string;
    want_restart:string;
    restarted:boolean;
    my_score:number;
    his_score:number;
}

export class Game extends React.Component<IProp,IState> {
    constructor(props:IProp) {
        super(props);
        this.state={
            ...this.createGameState(props.gamedata)
        }
    }
    createGameState(gamedata:GameStruct){
        let board=new TicTacToe(10,10,5);
        board.fromString(gamedata.board);
        let won='none';
        if(gamedata.won!=='none'){
            if(gamedata.won==='draw') won='draw';
            else if(gamedata.won===Cache.user) won='win';
            else won='lost';
        }
        let imChallenger=(gamedata.challenger_id===Cache.user);
        return {
            imChallenger,
            next: gamedata.next,
            turn: gamedata.turn,
            myTurn: gamedata.next === Cache.user,
            board,
            lastx: gamedata.lastx,
            lasty: gamedata.lasty,
            won,
            want_restart:gamedata.want_restart,
            restarted:false,
            my_score:imChallenger?(gamedata as any)['val-'+gamedata.challenger_id]:(gamedata as any)['val-'+gamedata.player_id],
            his_score:!imChallenger?(gamedata as any)['val-'+gamedata.challenger_id]:(gamedata as any)['val-'+gamedata.player_id]
        }
    }
    componentDidMount(){
        Cache.getGamesRef().child(this.props.game_id).on('value',(snap)=>{
            let data=snap.val();
            this.setState({
                ...this.createGameState(data)
            })
        })
    }
    componentWillUnmount(){
        //console.log('game unmount',this.props.game_id);
        Cache.getGamesRef().child(this.props.game_id).off();
    }
    onPlay(i:number,j:number){
        let {imChallenger, turn,myTurn,next,board, won,my_score,restarted}=this.state;
        if(!myTurn || won!=='none' || board.array[i][j]!=='b' || restarted) return;
        let {game_id,gamedata}=this.props;
        let win=board.put(imChallenger?'x':'o',i,j);
        let nextturn=turn+1;
        let whowon=win?Cache.user:(nextturn===100?'draw':'none');
        let want_restart='none';
        if(won!=='none') want_restart=Cache.user;
        let updatedData:any={
            next:gamedata.challenger_id===next?gamedata.player_id:gamedata.challenger_id,
            turn:nextturn,
            board:board.toString(),
            lastx:i,
            lasty:j,
            won:whowon,
            want_restart
        };
        if(win) updatedData['val-'+Cache.user]=my_score+1;
        this.setState({
            myTurn:false
        });
        Cache.getGamesRef().child(game_id).update(updatedData);
    }
    onRestart(){
        let {want_restart,restarted} = this.state;
        let {game_id,gamedata}=this.props;
        if(restarted) return;
        if(want_restart==='none'){
            Cache.getGamesRef().child(game_id).update({want_restart:Cache.user});
        }else if(want_restart===Cache.user){
            Cache.getGamesRef().child(game_id).update({want_restart:'none'});
        }else{
            Cache.restartGame(game_id,gamedata.player_id,gamedata.challenger_id)
            .then((_)=>{console.log('restarted')})
            .catch((e)=>{console.log('cant restart',e)})
        }
        this.setState({restarted:true});
    }
    render(){
        let {imChallenger,myTurn,turn,board,lastx,lasty,won,want_restart,my_score,his_score}=this.state;
        return <div className="Game">
            {
                won!=='none'?<h4 className="card-title text-primary text-center mb-1">{
                    won==='win'?'You Won':( won==='draw'?'Draw':'You Lost')
                }</h4>:<p className="text-right mb-1">{
                    myTurn?('My Turn ('+(imChallenger?' X )':' O )')):("Opponent's Turn ("+(imChallenger?' O )':' X )'))
                }</p>
            }
            <h4 className="text-right mb-1">{my_score} - {his_score}</h4>
            <table className="tactable">
            <tbody className="tactablebody">
            {
                board.array.map((m,i)=>{
                    return <tr className="tacrow" key={i}>
                        {
                            m.map((n,j)=>{
                                return <td onClick={()=>this.onPlay(i,j)} key={j} className={"tac "+((i===lastx && j===lasty)?'text-danger':(n=='b'?'text-dark':'text-white'))+(n==='b'?'':' bg-secondary')} >{n=='b'?'#':n}</td>
                            })
                        }
                    </tr>
                })
            }
            </tbody>
            </table>
            <div className="progress mt20">
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={ {width: turn+'%'} }></div>
            </div>
            <div className="text-center">
                <button onClick={()=>this.onRestart()} className={"btn mt20 "+(want_restart==='none'?'btn-secondary':'btn-primary')}>Restart</button>
            </div>
        </div>
    }
}