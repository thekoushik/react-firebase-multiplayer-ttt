export class TicTacToe{
    private _array:Array<Array<string>>;
    private row:number;
    private col:number;
    private _winlength:number;
    constructor(row:number,col:number,winlength:number){
        this.row=row;
        this.col=col;
        this._array=Array.from({length:row},_=>Array.from({length:col},_=>'b'))
        this._winlength=winlength;
    }
    fromString(str:string){
        this._array=str.split(',').map(m=>Array.from(m));
    }
    toString(){
        return this._array.map(m=>m.toString().replace(/,/g,'')).join(',');
    }
    put(val:'x'|'o',x:number,y:number){
        this._array[x][y]=val;
        return ((1+this.traverse(x,y,-1,-1)+this.traverse(x,y,1,1))>=this._winlength ||
             (1+this.traverse(x,y,0,-1)+this.traverse(x,y,0,1))>=this._winlength ||
             (1+this.traverse(x,y,1,-1)+this.traverse(x,y,-1,1))>=this._winlength ||
             (1+this.traverse(x,y,1,0)+this.traverse(x,y,-1,0))>=this._winlength );
    }
    get array(){
        return this._array;
    }
    private traverse(x:number,y:number,xinc:number,yinc:number){
        let val=this._array[x][y];
        let dx=x+xinc;
        let dy=y+yinc;
        let count=0;
        while(dx>=0 && dy>=0 && dx<this.row && dy<this.col && this._array[dx][dy]===val){
            count++;
            dx+=xinc;
            dy+=yinc;
        }
        return count;
    }
}