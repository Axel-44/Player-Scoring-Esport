"""
database/scripts/seed_kaggle_players.py
Skrip ingesti 2.500 baris data pemain PUBG Mobile (Kaggle) ke database Supabase PostgreSQL.
Menggunakan data dari ml/data/processed_pubg.csv yang telah memiliki Player_Score dan Score_Category.
"""

import os
import sys
from pathlib import Path
import pandas as pd
from typing import List, Dict, Any

# Tambahkan project root ke sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))

try:
    from supabase import create_client, Client
except ImportError:
    print("Paket 'supabase' belum terinstall. Install dengan: pip install supabase")
    sys.exit(1)


def seed_database():
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_key:
        print("[ERROR] Variabel SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum disetel!")
        print("Setel variabel environment terlebih dahulu atau buat file .env di direktori root.")
        sys.exit(1)

    csv_path = PROJECT_ROOT / "ml" / "data" / "processed_pubg.csv"
    if not csv_path.exists():
        print(f"[ERROR] File dataset terproses tidak ditemukan di {csv_path}")
        print("Jalankan pipeline training terlebih dahulu: python ml/train.py")
        sys.exit(1)

    print(f"Membaca dataset dari: {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"Total baris yang akan diimpor: {len(df)}")

    supabase: Client = create_client(supabase_url, supabase_key)

    # Format record sesuai dengan skema tabel public.players
    records: List[Dict[str, Any]] = []
    for _, row in df.iterrows():
        records.append({
            "ign": f"P{row['Player_ID']}",
            "tier": str(row["Tier"]),
            "map": str(row["Map"]),
            "favorite_weapon": str(row.get("Favorite_Weapon", "M416")),
            "kills": int(row["Kills"]),
            "damage_dealt": float(row["Damage_Dealt"]),
            "survival_time_minutes": float(row["Survival_Time_Minutes"]),
            "headshot_percentage": float(row["Headshot_Percentage"]),
            "assists": int(row["Assists"]),
            "revives": int(row["Revives"]),
            "distance_travelled_km": float(row.get("Distance_Travelled_km", 0)),
            "longest_kill_meters": float(row.get("Longest_Kill_meters", 0)),
            "heals_used": int(row.get("Heals_Used", 0)),
            "boosts_used": int(row.get("Boosts_Used", 0)),
            "match_rank": int(row["Match_Rank"]),
            "player_score": float(row["Player_Score"]),
            "score_category": str(row["Score_Category"]),
            "user_id": None,  # Data publik referensi scouting
        })

    # Lakukan batch insert per 200 baris untuk efisiensi transfer data
    batch_size = 200
    total_inserted = 0

    print("Memulai proses batch insert ke tabel 'players' Supabase...")
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        response = supabase.table("players").insert(batch).execute()
        total_inserted += len(batch)
        print(f" -> Berhasil mengunggah baris {total_inserted} / {len(records)}...")

    print("\n[SUKSES] Seluruh 2.500 baris dataset Kaggle berhasil diimpor ke Supabase!")


if __name__ == "__main__":
    seed_database()
