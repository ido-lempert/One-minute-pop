// Reversi: dark opens, bracket in any of eight directions; no wrapping.
const dirs=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
const inside=(x,y)=>x>=0&&x<8&&y>=0&&y<8;
export function initial(){const board=Array(64).fill(0);board[27]=board[36]=2;board[28]=board[35]=1;return {board,turn:1};}
export function flips(s,index,side=s.turn){
 if(!Number.isInteger(index)||index<0||index>=64||s.board[index])return [];
 const result=[],x=index%8,y=index>>3;
 for(const [dx,dy] of dirs){let c=x+dx,r=y+dy,line=[];while(inside(c,r)&&s.board[r*8+c]===3-side){line.push(r*8+c);c+=dx;r+=dy;}if(line.length&&inside(c,r)&&s.board[r*8+c]===side)result.push(...line);}
 return result;
}
export function legal(s,side=s.turn){return s.board.flatMap((p,i)=>!p&&flips(s,i,side).length?[i]:[]);}
export function score(s){return [s.board.filter(x=>x===1).length,s.board.filter(x=>x===2).length];}
export function over(s){return !legal(s,1).length&&!legal(s,2).length;}
export function apply(s,index){const f=flips(s,index);if(!f.length)throw Error('Illegal Reversi move');const board=s.board.slice();board[index]=s.turn;f.forEach(i=>board[i]=s.turn);let next={board,turn:3-s.turn};const passed=!legal(next).length&&!over(next);if(passed)next.turn=s.turn;return {...next,last:index,flipped:f,passed};}
// One-ply positional choice with corner preference and opponent mobility penalty.
export function bestMove(s){const moves=legal(s);if(!moves.length)return null;const weights=[100,-25,10,5,5,10,-25,100,-25,-45,-2,-2,-2,-2,-45,-25,10,-2,4,2,2,4,-2,10,5,-2,2,1,1,2,-2,5,5,-2,2,1,1,2,-2,5,10,-2,4,2,2,4,-2,10,-25,-45,-2,-2,-2,-2,-45,-25,100,-25,10,5,5,10,-25,100];return moves.reduce((a,i)=>{const n=apply(s,i),v=weights[i]+flips(s,i).length-legal(n,3-s.turn).length*2+(over(n)?(score(n)[s.turn-1]>score(n)[2-s.turn]?1000:-1000):0);return v>a.v?{i,v}:a;},{i:moves[0],v:-Infinity}).i;}
