import {database} from 'firebase/app';
import { TicTacToe } from './tictactoe';
export interface GameStruct{
    challenger_id:string;
    player_id:string;
    next:string;
    turn:number;
    board:string;
    won:string;
    want_restart:string;
    lastx:number;
    lasty:number;
}
interface CacheStruct {
    user:string;
    dbRef?:database.Reference;
    getDBRef(key?:string):database.Reference;
    getUsersRef():database.Reference;
    getGamesRef():database.Reference;
    addUser(id:string,name:string|null,photo:string|null):Promise<any>;
    addGame(challenger_id:string,player_id:string):Promise<any>;
    restartGame(game_id:string,challenger_id:string,player_id:string):Promise<any>;
};
export const Cache:CacheStruct={
    user:"",
    getDBRef:(key?:string)=>{
        if(!Cache.dbRef) Cache.dbRef=database().ref();
        return key?Cache.dbRef.child(key):Cache.dbRef;
    },
    getUsersRef:()=>{
        return Cache.getDBRef("users/");
    },
    getGamesRef:()=>{
        return Cache.getDBRef("games/")
    },
    addUser:(id,name,photo)=>{
        return new Promise((res,rej)=>{
            Cache.getUsersRef().child(id).once('value').then((snap)=>{
                let val=snap.val();
                if(!val){
                    res(Cache.getUsersRef().child(id).set({
                        name,
                        photo,
                        online:true
                    }));
                }else{
                    Cache.getUsersRef().child(id+'/online').set(true);
                    res(val);
                }
            }).catch((e)=>{
                rej(e);
            })
        })
    },
    addGame:(challenger_id,player_id)=>{
        return new Promise((res,rej)=>{
            let game=new TicTacToe(10,10,5);
            let game_id=Cache.getGamesRef().push({
                [challenger_id]:true,
                [player_id]:true,
                challenger_id,
                player_id,
                ['val-'+challenger_id]:0,
                ['val-'+player_id]:0,
                next:challenger_id,
                turn:0,
                board:game.toString(),
                lastx:-1,
                lasty:-1,
                won:'none',
                want_restart:'none'
            });
            res(game_id);
        })
    },
    restartGame:(game_id,challenger_id,player_id)=>{
        return new Promise((res,rej)=>{
            let game=new TicTacToe(10,10,5);
            res(Cache.getGamesRef().child(game_id).update({
                challenger_id,
                player_id,
                next:challenger_id,
                turn:0,
                board:game.toString(),
                lastx:-1,
                lasty:-1,
                won:'none',
                want_restart:'none'
            }));
        })
    }
};