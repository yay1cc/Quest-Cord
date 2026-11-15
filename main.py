import threading
import tkinter as tk
from tkinter import messagebox
from pypresence import Presence

BG = "#211722"
PANEL = "#302132"
CARD = "#382638"
PINK = "#ec6ba9"
LIGHT = "#f9edf5"
MUTED = "#b59eaf"
APP_VERSION = "1.0.0"

GAMES = [
    ("Minecraft", "Sandbox", "⛏"), ("Roblox", "Adventure", "▣"),
    ("Fortnite", "Battle Royale", "◆"), ("Grand Theft Auto V", "Action", "🚗"),
    ("Counter-Strike 2", "Shooter", "◎"), ("Valorant", "Shooter", "✦"),
    ("League of Legends", "MOBA", "⚔"), ("Among Us", "Party", "◉"),
    ("Stardew Valley", "Simulation", "🌱"), ("Terraria", "Sandbox", "🌳"),
    ("Hollow Knight", "Metroidvania", "♞"), ("Elden Ring", "Action RPG", "♜"),
    ("Cyberpunk 2077", "RPG", "▤"), ("The Sims 4", "Simulation", "⌂"),
    ("Rocket League", "Sports", "⚽"), ("Overwatch 2", "Shooter", "✚"),
    ("Apex Legends", "Battle Royale", "△"), ("Genshin Impact", "Action RPG", "✧"),
    ("Euro Truck Simulator 2", "Simulation", "▰"), ("Fall Guys", "Party", "●"),
    ("Phasmophobia", "Horror", "☾"), ("Lethal Company", "Horror", "☠"),
    ("Team Fortress 2", "Shooter", "⚒"), ("The Witcher 3", "RPG", "⚔"),
]

class QuestCord:
    def __init__(self, root):
        self.root = root
        self.rpc = None
        self.connected = False
        self.selected = None
        root.title(f"Quest-Cord v{APP_VERSION}")
        root.geometry("1000x720")
        root.minsize(780, 600)
        root.configure(bg=BG)
        self.build_ui()
        self.render_games()

    def label(self, parent, text, size=11, color=LIGHT, bold=False):
        return tk.Label(parent, text=text, bg=parent.cget("bg"), fg=color,
                        font=("Segoe UI", size, "bold" if bold else "normal"))

    def button(self, parent, text, command, primary=False):
        return tk.Button(parent, text=text, command=command,
                         bg=PINK if primary else "#493247",
                         fg="#251724" if primary else LIGHT,
                         activebackground="#f58abd" if primary else "#60445b",
                         activeforeground=LIGHT if not primary else "#251724",
                         relief="flat", bd=0, padx=16, pady=9,
                         font=("Segoe UI", 10, "bold"), cursor="hand2")

    def build_ui(self):
        sidebar = tk.Frame(self.root, bg="#1b141d", width=220)
        sidebar.pack(side="left", fill="y")
        sidebar.pack_propagate(False)
        brand = tk.Frame(sidebar, bg="#1b141d")
        brand.pack(fill="x", padx=20, pady=(28, 48))
        tk.Label(brand, text="Q", bg=PINK, fg=BG, font=("Segoe UI", 22, "bold"),
                 width=2, height=1).pack(side="left")
        names = tk.Frame(brand, bg="#1b141d")
        names.pack(side="left", padx=10)
        self.label(names, "Quest-Cord", 16, LIGHT, True).pack(anchor="w")
        self.label(names, "GAME COMPANION", 8, MUTED).pack(anchor="w")
        self.label(sidebar, "KÜTÜPHANE", 9, MUTED, True).pack(anchor="w", padx=20)
        tk.Label(sidebar, text="▦   Oyun kataloğu", bg="#392337", fg=LIGHT,
                 anchor="w", padx=14, pady=13, font=("Segoe UI", 10, "bold")
                 ).pack(fill="x", padx=12, pady=12)
        self.connection_label = self.label(sidebar, "●  Discord bağlı değil", 10, MUTED, True)
        self.connection_label.pack(side="bottom", anchor="w", padx=20, pady=22)

        content = tk.Frame(self.root, bg=BG)
        content.pack(side="left", fill="both", expand=True, padx=34, pady=30)
        self.label(content, "KÜTÜPHANEN", 9, MUTED, True).pack(anchor="w")
        title = tk.Frame(content, bg=BG)
        title.pack(fill="x", pady=(5, 2))
        self.label(title, "Oyunlarını keşfet", 27, LIGHT, True).pack(side="left")
        self.label(title, ".", 27, PINK, True).pack(side="left")
        self.label(content, "Bir oyun seçerek Discord Rich Presence durumunu paylaş.",
                   10, MUTED).pack(anchor="w", pady=(0, 20))

        connect = tk.Frame(content, bg=PANEL, padx=14, pady=14)
        connect.pack(fill="x", pady=(0, 24))
        left = tk.Frame(connect, bg=PANEL)
        left.pack(side="left", fill="x", expand=True)
        self.label(left, "Discord bağlantısı", 11, LIGHT, True).pack(anchor="w")
        self.label(left, "Developer Portal'dan aldığın Application ID'yi gir.",
                   9, MUTED).pack(anchor="w", pady=(4, 0))
        self.client_id = tk.Entry(connect, bg=BG, fg=LIGHT, insertbackground=LIGHT,
                                  relief="flat", width=23, font=("Segoe UI", 10))
        self.client_id.pack(side="left", padx=10, ipady=8)
        self.button(connect, "Bağlan", self.connect_discord, True).pack(side="left")

        toolbar = tk.Frame(content, bg=BG)
        toolbar.pack(fill="x", pady=(0, 12))
        self.label(toolbar, "Oyun kataloğu", 15, LIGHT, True).pack(side="left")
        self.search = tk.Entry(toolbar, bg=PANEL, fg=LIGHT, insertbackground=LIGHT,
                               relief="flat", width=25, font=("Segoe UI", 10))
        self.search.pack(side="right", ipady=8)
        self.search.insert(0, "Oyun ara...")
        self.search.bind("<FocusIn>", self.clear_placeholder)
        self.search.bind("<KeyRelease>", lambda _e: self.render_games())

        self.game_area = tk.Frame(content, bg=BG)
        self.game_area.pack(fill="both", expand=True)
        self.selected_label = self.label(content, "Seçili oyun: Henüz seçilmedi", 10, MUTED, True)
        self.selected_label.pack(anchor="w", pady=(15, 8))
        actions = tk.Frame(content, bg=BG)
        actions.pack(fill="x")
        self.publish_btn = self.button(actions, "Discord'da göster", self.publish, True)
        self.publish_btn.pack(side="left")
        self.button(actions, "Durumu temizle", self.clear_activity).pack(side="left", padx=8)
        self.status = self.label(content, "Başlamak için Discord Application ID'ni bağla.", 9, MUTED)
        self.status.pack(anchor="w", pady=(12, 0))
        self.label(content, "Quest-Cord  •  Discord Rich Presence  •  Oyunları başlatmaz.",
                   8, MUTED).pack(anchor="w", pady=(18, 0))

    def clear_placeholder(self, _event):
        if self.search.get() == "Oyun ara...":
            self.search.delete(0, "end")

    def render_games(self):
        for child in self.game_area.winfo_children():
            child.destroy()
        query = self.search.get().strip().lower()
        if query == "oyun ara...":
            query = ""
        filtered = [g for g in GAMES if query in g[0].lower() or query in g[1].lower()]
        for index, game in enumerate(filtered):
            row, col = divmod(index, 3)
            selected = self.selected == game[0]
            card = tk.Frame(self.game_area, bg="#493047" if selected else CARD,
                            highlightthickness=1,
                            highlightbackground=PINK if selected else "#493247")
            card.grid(row=row, column=col, sticky="nsew", padx=5, pady=5)
            card.configure(cursor="hand2")
            icon = tk.Label(card, text=game[2], bg=card.cget("bg"), fg=PINK,
                            font=("Segoe UI Emoji", 17), width=3)
            icon.pack(side="left", padx=(8, 2), pady=9)
            texts = tk.Frame(card, bg=card.cget("bg"))
            texts.pack(side="left", fill="both", expand=True, pady=9)
            name = self.label(texts, game[0], 9, LIGHT, True)
            name.pack(anchor="w")
            genre = self.label(texts, game[1], 8, MUTED)
            genre.pack(anchor="w")
            for widget in (card, icon, texts, name, genre):
                widget.bind("<Button-1>", lambda _e, g=game: self.select_game(g))
        for col in range(3):
            self.game_area.grid_columnconfigure(col, weight=1, uniform="games")

    def select_game(self, game):
        self.selected = game[0]
        self.selected_label.config(text="Seçili oyun: " + self.selected)
        self.render_games()

    def set_status(self, text):
        self.status.config(text=text)

    def connect_discord(self):
        client_id = self.client_id.get().strip()
        if not client_id.isdigit() or not (17 <= len(client_id) <= 20):
            messagebox.showwarning("Application ID", "17-20 haneli Discord Application ID gir.")
            return
        self.set_status("Discord bağlantısı deneniyor...")
        def worker():
            try:
                rpc = Presence(client_id)
                rpc.connect()
                self.rpc = rpc
                self.connected = True
                self.root.after(0, lambda: self.connection_label.config(
                    text="●  Discord bağlı", fg="#69d69a"))
                self.root.after(0, lambda: self.set_status("Discord bağlantısı kuruldu."))
            except Exception as exc:
                self.connected = False
                msg = str(exc)
                self.root.after(0, lambda m=msg: self.set_status(
                    "Bağlantı kurulamadı. Discord masaüstü uygulaması açık mı? " + m[:110]))
        threading.Thread(target=worker, daemon=True).start()

    def publish(self):
        if not self.selected:
            self.set_status("Önce katalogdan bir oyun seç.")
            return
        if not self.connected or not self.rpc:
            self.set_status("Önce Discord bağlantısı kur.")
            return
        game = self.selected
        def worker():
            try:
                self.rpc.update(details="Playing " + game[:128],
                                state="discord:@enhij", large_text="Quest-Cord")
                self.root.after(0, lambda: self.set_status(game + " Discord durumuna eklendi."))
            except Exception as exc:
                msg = str(exc)
                self.root.after(0, lambda m=msg: self.set_status("Durum gönderilemedi: " + m[:120]))
        threading.Thread(target=worker, daemon=True).start()

    def clear_activity(self):
        if not self.connected or not self.rpc:
            self.set_status("Discord bağlantısı yok.")
            return
        def worker():
            try:
                self.rpc.clear()
                self.root.after(0, lambda: self.set_status("Discord durumu temizlendi."))
            except Exception as exc:
                msg = str(exc)
                self.root.after(0, lambda m=msg: self.set_status("Temizlenemedi: " + m[:100]))
        threading.Thread(target=worker, daemon=True).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = QuestCord(root)
    root.mainloop()
