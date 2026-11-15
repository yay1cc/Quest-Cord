const catalogue = [
  ['Minecraft','Sandbox','⛏️'],['Roblox','Adventure','🧱'],['Fortnite','Battle Royale','🚌'],
  ['Grand Theft Auto V','Action','🚗'],['Counter-Strike 2','Shooter','🎯'],['Valorant','Shooter','💥'],
  ['League of Legends','MOBA','⚔️'],['Minecraft Dungeons','Action RPG','🛡️'],['Among Us','Party','🚀'],
  ['Stardew Valley','Simulation','🌱'],['Terraria','Sandbox','🌳'],['Hollow Knight','Metroidvania','🪲'],
  ['Elden Ring','Action RPG','🐉'],['Cyberpunk 2077','RPG','🌃'],['The Sims 4','Simulation','🏡'],
  ['Rocket League','Sports','⚽'],['Overwatch 2','Shooter','🦾'],['Apex Legends','Battle Royale','🛰️'],
  ['Genshin Impact','Action RPG','✨'],['Euro Truck Simulator 2','Simulation','🚚'],['Fall Guys','Party','🍬'],
  ['Phasmophobia','Horror','👻'],['Lethal Company','Horror','🛸'],['Team Fortress 2','Shooter','🎩']
];
const gamesEl=document.getElementById('games');
const searchEl=document.getElementById('search');
const selectedName=document.getElementById('selectedName');
const publishBtn=document.getElementById('publishBtn');
const statusEl=document.getElementById('status');
let selected=null;
let connected=false;
function render(){
  const q=searchEl.value.trim().toLocaleLowerCase('tr');
  const filtered=catalogue.filter(g=>g[0].toLocaleLowerCase('tr').includes(q)||g[1].toLocaleLowerCase('tr').includes(q));
  document.getElementById('count').textContent=filtered.length+' oyun';
  gamesEl.replaceChildren();
  filtered.forEach(g=>{
    const button=document.createElement('button');
    button.className='game'+(selected===g[0]?' chosen':'');
    const icon=document.createElement('span');icon.className='game-icon';icon.textContent=g[2];
    const copy=document.createElement('span');
    const name=document.createElement('b');name.textContent=g[0];
    const genre=document.createElement('small');genre.textContent=g[1];
    copy.append(name,genre);button.append(icon,copy);
    button.addEventListener('click',()=>{selected=g[0];selectedName.textContent=selected;publishBtn.disabled=false;render();});
    gamesEl.append(button);
  });
}
searchEl.addEventListener('input',render);
document.getElementById('connectBtn').addEventListener('click',async()=>{
  const id=document.getElementById('clientId').value.trim();
  statusEl.textContent='Discord bağlantısı deneniyor...';
  const result=await window.questCord.connect(id);
  connected=result.ok;
  document.getElementById('dot').style.background=connected?'#69d69a':'#888';
  document.getElementById('connectionText').textContent=connected?'Discord bağlı':'Discord bağlı değil';
  statusEl.textContent=result.message;
});
publishBtn.addEventListener('click',async()=>{
  if(!selected)return;
  const result=await window.questCord.setActivity(selected);
  statusEl.textContent=result.message;
});
document.getElementById('clearBtn').addEventListener('click',async()=>{
  const result=await window.questCord.clearActivity();
  statusEl.textContent=result.message;
});
render();
