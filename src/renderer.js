const games = [
  ["Minecraft","Sandbox","⛏"],["Roblox","Adventure","▣"],["Fortnite","Battle Royale","◆"],
  ["Grand Theft Auto V","Action","🚗"],["Counter-Strike 2","Shooter","◎"],["Valorant","Shooter","✦"],
  ["League of Legends","MOBA","⚔"],["Among Us","Party","◉"],["Stardew Valley","Simulation","🌱"],
  ["Terraria","Sandbox","🌳"],["Hollow Knight","Metroidvania","♞"],["Elden Ring","Action RPG","♜"],
  ["Cyberpunk 2077","RPG","▤"],["The Sims 4","Simulation","⌂"],["Rocket League","Sports","⚽"],
  ["Overwatch 2","Shooter","✚"],["Apex Legends","Battle Royale","△"],["Genshin Impact","Action RPG","✧"],
  ["Euro Truck Simulator 2","Simulation","▰"],["Fall Guys","Party","●"],["Phasmophobia","Horror","☾"],
  ["Lethal Company","Horror","☠"],["Team Fortress 2","Shooter","⚒"],["The Witcher 3","RPG","⚔"]
];
let selectedGame = null;
const $ = (id) => document.getElementById(id);

// Turkish characters, punctuation and spacing are normalized so searches are forgiving.
function normalize(value) {
  return value.toLocaleLowerCase("tr")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i").replace(/[^a-z0-9]+/g, " ").trim();
}
function matchesGame(game, query) {
  if (!query) return true;
  const haystack = normalize(game.join(" "));
  return query.split(" ").every(token => haystack.includes(token));
}
function renderGames() {
  const query = normalize($("search").value);
  const grid = $("gameGrid");
  const filtered = games.filter(game => matchesGame(game, query));
  grid.replaceChildren();
  $("resultCount").textContent = query
    ? filtered.length + " oyun bulundu"
    : games.length + " oyun listeleniyor";

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-results";
    empty.textContent = "Bu aramayla eşleşen oyun bulunamadı. Oyun adını farklı yazmayı dene.";
    grid.append(empty);
    return;
  }

  filtered.forEach(game => {
    const button = document.createElement("button");
    button.className = "game-card" + (selectedGame === game[0] ? " selected" : "");
    button.type = "button";
    const icon = document.createElement("span");
    icon.className = "game-icon";
    icon.textContent = game[2];
    const info = document.createElement("span");
    const name = document.createElement("div");
    name.className = "game-name";
    name.textContent = game[0];
    const genre = document.createElement("div");
    genre.className = "game-genre";
    genre.textContent = game[1];
    info.append(name, genre);
    button.append(icon, info);
    button.addEventListener("click", () => {
      selectedGame = game[0];
      $("selection").textContent = "Seçili oyun: " + selectedGame;
      renderGames();
    });
    grid.append(button);
  });
}
$("search").addEventListener("input", renderGames);
$("search").addEventListener("keydown", event => {
  if (event.key === "Escape") {
    $("search").value = "";
    renderGames();
  }
});
$("connectButton").addEventListener("click", async () => {
  const id = $("clientId").value.trim();
  $("connectButton").disabled = true;
  status("Discord bağlantısı deneniyor...");
  try {
    await window.questCord.connect(id);
    $("connectionState").textContent = "●  Discord bağlı";
    $("connectionState").style.color = "#69d69a";
    status("Discord bağlantısı kuruldu.");
  } catch (error) { status(error.message); }
  finally { $("connectButton").disabled = false; }
});
$("publishButton").addEventListener("click", async () => {
  if (!selectedGame) return status("Önce katalogdan bir oyun seç.");
  try {
    await window.questCord.publish(selectedGame);
    status(selectedGame + " Discord durumuna eklendi.");
  } catch (error) { status(error.message); }
});
$("clearButton").addEventListener("click", async () => {
  try {
    await window.questCord.clear();
    status("Discord durumu temizlendi.");
  } catch (error) { status(error.message); }
});
function status(message) { $("status").textContent = message; }
window.questCord.onStatus(status);
renderGames();
