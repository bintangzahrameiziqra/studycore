import os
import math
import random
import numpy as np
import pandas as pd
from typing import Dict, Any, List

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error

# Path dataset (pastikan file ini ada)
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "cleaned_dataset.csv")


class MLService:
    def __init__(self) -> None:
        self.df = self._load_dataset()
        self.pipeline, self.X_cols = self._build_pipeline()
        self.r2, self.rmse = self._fit_and_score()

    # === Load + bersihkan dataset ===
    def _load_dataset(self) -> pd.DataFrame:
        print(f"[MLService] Using dataset: {DATA_PATH}")
        if not os.path.exists(DATA_PATH):
            print("[MLService] Dataset tidak ditemukan, pakai data fallback.")
            data = [
                {"name": "ASUS VivoBook", "brand": "ASUS", "cpu": "Intel i7", "ram_gb": 16, "storage_gb": 512, "gpu": "NVIDIA RTX 3050", "color_gamut": 100, "price": 15000000},
                {"name": "Lenovo Legion", "brand": "Lenovo", "cpu": "AMD Ryzen 7", "ram_gb": 16, "storage_gb": 512, "gpu": "NVIDIA RTX 3060", "color_gamut": 100, "price": 18000000},
                {"name": "Acer Aspire", "brand": "Acer", "cpu": "Intel i5", "ram_gb": 8, "storage_gb": 512, "gpu": "Integrated", "color_gamut": 72, "price": 9000000},
                {"name": "MSI Creator", "brand": "MSI", "cpu": "Intel i9", "ram_gb": 32, "storage_gb": 1000, "gpu": "NVIDIA RTX 4060", "color_gamut": 100, "price": 26000000},
                {"name": "MacBook Air M2", "brand": "Apple", "cpu": "Apple M1/M2", "ram_gb": 16, "storage_gb": 512, "gpu": "Integrated", "color_gamut": 100, "price": 19000000},
            ]
            df = pd.DataFrame(data)
        else:
            df = pd.read_csv(DATA_PATH)

        # Pastikan kolom utama ada
        expected = ["id", "name", "brand", "cpu", "ram_gb", "storage_gb", "gpu", "color_gamut", "price"]
        for c in expected:
            if c not in df.columns:
                df[c] = np.nan

        # Numerik -> angka
        for c in ["ram_gb", "storage_gb", "color_gamut", "price"]:
            df[c] = pd.to_numeric(df[c], errors="coerce")

        # Isi nilai kosong numerik (nilai wajar)
        df["ram_gb"] = df["ram_gb"].fillna(16)
        df["storage_gb"] = df["storage_gb"].fillna(512)
        df["color_gamut"] = df["color_gamut"].fillna(100)
        if df["price"].isna().all():
            df["price"] = 15_000_000
        else:
            df["price"] = df["price"].fillna(df["price"].median())

        # Normalisasi GPU ringan
        df["gpu"] = df["gpu"].astype(str).str.replace(r"\bGB\s+GB\b", "GB", regex=True)
        df.loc[df["gpu"].str.match(r"^\s*0\s*GB", case=False, na=False), "gpu"] = "Integrated"
        df["gpu"] = df["gpu"].str.replace(r"\s+", " ", regex=True).str.strip()

        # Bersihkan teks & fallback name
        df["brand"] = df["brand"].astype(str).str.strip()
        df["cpu"] = df["cpu"].astype(str).str.strip()
        df["name"] = df["name"].astype(str).str.strip()
        df.loc[df["name"].str.lower().isin(["", "nan", "none"]), "name"] = (
            df["brand"].fillna("") + " " + df["cpu"].fillna("")
        ).str.strip()

        # Drop baris tanpa brand/cpu/gpu
        df = df.dropna(subset=["brand", "cpu", "gpu"])

        # Tipe akhir agar JSON aman
        df["ram_gb"] = df["ram_gb"].round().astype(int)
        df["storage_gb"] = df["storage_gb"].round().astype(int)
        df["color_gamut"] = df["color_gamut"].round().astype(int)
        df["price"] = df["price"].round(0).astype(float)

        # Pastikan ada kolom id yang valid & unik
        if "id" not in df.columns:
            df.insert(0, "id", range(1, len(df) + 1))
        else:
            df["id"] = pd.to_numeric(df["id"], errors="coerce").fillna(0).astype(int)
            if (df["id"] <= 0).any():
                start = int(df["id"].max() or 0) + 1
                fix_idx = df["id"] <= 0
                n = fix_idx.sum()
                df.loc[fix_idx, "id"] = range(start, start + n)

        print(f"[MLService] Dataset loaded: {len(df)} rows after cleaning")
        return df

    # === Build pipeline model ===
    def _build_pipeline(self):
        cat_features = ["brand", "cpu", "gpu"]
        num_features = ["ram_gb", "storage_gb", "color_gamut"]
        X_cols = cat_features + num_features

        pre = ColumnTransformer(
            transformers=[
                ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features),
                ("num", "passthrough", num_features),
            ]
        )

        model = RandomForestRegressor(
            n_estimators=300,
            random_state=42,
            max_depth=None,
            n_jobs=-1,
        )

        pipe = Pipeline(steps=[("pre", pre), ("rf", model)])
        return pipe, X_cols

    # === Latih dan evaluasi model ===
    def _fit_and_score(self):
        X = self.df[self.X_cols]
        y = self.df["price"]

        test_size = 0.2 if len(self.df) > 50 else 0.5
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)

        self.pipeline.fit(X_train, y_train)

        preds = self.pipeline.predict(X_test)
        r2 = float(r2_score(y_test, preds)) if len(y_test) > 1 else 0.0
        rmse = float(math.sqrt(mean_squared_error(y_test, preds))) if len(y_test) > 1 else 0.0

        print(f"[MLService] Model trained. R² = {r2:.3f}, RMSE = {rmse:.2f}")
        return r2, rmse

    # === Endpoint Metrics ===
    def get_metrics(self) -> Dict[str, Any]:
        return {
            "dataset_count": int(len(self.df)),
            "model_r2": self.r2,
            "model_rmse": self.rmse,
        }

    # === Prediksi harga ===
    def predict_price(self, payload: Dict[str, Any]) -> float:
        x = {
            "brand": payload.get("brand", "ASUS"),
            "cpu": payload.get("cpu", "Intel i7"),
            "ram_gb": int(payload.get("ram_gb", 16)),
            "storage_gb": int(payload.get("storage_gb", 512)),
            "gpu": payload.get("gpu", "NVIDIA RTX 3050"),
            "color_gamut": int(payload.get("color_gamut", 100)),
        }
        arr = pd.DataFrame([x]).fillna({
            "brand":"", "cpu":"", "gpu":"Integrated",
            "ram_gb":16, "storage_gb":512, "color_gamut":100
        })
        pred = float(self.pipeline.predict(arr)[0])
        return pred

    # === Rekomendasi laptop ===
    def recommend(self, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        prefs = {
            "brand": payload.get("brand"),
            "cpu": payload.get("cpu"),
            "ram_gb": int(payload.get("ram_gb", 16)),
            "storage_gb": int(payload.get("storage_gb", 512)),
            "gpu": payload.get("gpu"),
            "color_gamut": int(payload.get("color_gamut", 100)),
            "budget": int(payload.get("budget", 15000000)),
        }
        weights = payload.get("weights", {"brand": 0.04, "cpu": 0.30, "ram": 0.22, "storage": 0.10, "gpu": 0.20, "color_gamut": 0.08, "price": 0.06})

        df = self.df.copy()

        # Prediksi harga tiap baris (fallback harga asli kalau gagal)
        try:
            df["_pred"] = self.pipeline.predict(df[self.X_cols])
        except Exception as e:
            print(f"[MLService] Warning: prediction failed: {e}")
            df["_pred"] = df["price"]

        def cat_score(a, b):
            return 1.0 if (a is not None and b is not None and a == b) else 0.0

        def rel_score(val, target):
            if target is None or target <= 0:
                return 0.0
            try:
                v = float(val)
                return max(0.0, 1.0 - abs(v - target) / target)
            except Exception:
                return 0.0

        results: List[Dict[str, Any]] = []
        for _, row in df.iterrows():
            s_brand = cat_score(row["brand"], prefs["brand"]) * weights.get("brand", 0.04)
            s_cpu   = cat_score(row["cpu"], prefs["cpu"])     * weights.get("cpu", 0.30)
            s_gpu   = cat_score(row["gpu"], prefs["gpu"])     * weights.get("gpu", 0.20)
            s_ram   = rel_score(row["ram_gb"], prefs["ram_gb"]) * weights.get("ram", 0.22)
            s_sto   = rel_score(row["storage_gb"], prefs["storage_gb"]) * weights.get("storage", 0.10)
            s_gamut = rel_score(row["color_gamut"], prefs["color_gamut"]) * weights.get("color_gamut", 0.08)
            s_price = rel_score(row["_pred"], prefs["budget"]) * weights.get("price", 0.06)

            total = s_brand + s_cpu + s_gpu + s_ram + s_sto + s_gamut + s_price
            trend = 0.5 * rel_score(row["_pred"], prefs["budget"]) + 0.5 * random.uniform(0.3, 0.9)

            # helper anti-NaN/inf sebelum dikirim ke JSON
            def sstr(x, default=""):
                return default if pd.isna(x) else str(x)
            def sint(x, default=0):
                try:
                    if pd.isna(x): return default
                    return int(x)
                except Exception:
                    return default
            def sfloat(x, default=0.0):
                try:
                    if pd.isna(x): return default
                    v = float(x)
                    return v if math.isfinite(v) else default
                except Exception:
                    return default

            safe_name = (row.get("name") if isinstance(row.get("name"), str) and row.get("name").strip() else f"{row['brand']} {row['cpu']}").strip()
            safe_gpu = sstr(row.get("gpu"), "Integrated")

            # bikin id stabil untuk FE (berdasar signature)
            sig = f"{safe_name}|{safe_gpu}|{int(row['ram_gb'])}|{int(row['storage_gb'])}|{int(round(float(row['price']) or 0))}"
            uid = abs(hash(sig))

            results.append({
                "id": uid,
                "name": safe_name,
                "brand": sstr(row["brand"]),
                "cpu": sstr(row["cpu"]),
                "ram_gb": sint(row["ram_gb"], 16),
                "storage_gb": sint(row["storage_gb"], 512),
                "gpu": safe_gpu,
                "color_gamut": sint(row["color_gamut"], 100),
                "price": sfloat(row["price"], 0.0),
                "trend_score": sfloat(trend, 0.0),
                "predicted_price": sfloat(row.get("_pred", row.get("price", 0.0)), 0.0),
                "score": sfloat(total, 0.0),
            })

        # Biar stabil: urutkan kandidat paling cocok
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:10]

    # =========================
    #            CRUD
    # =========================
    def _ensure_id_column(self):
        if "id" not in self.df.columns:
            self.df.insert(0, "id", range(1, len(self.df) + 1))
        else:
            self.df["id"] = pd.to_numeric(self.df["id"], errors="coerce").fillna(0).astype(int)
            if (self.df["id"] <= 0).any():
                start = int(self.df["id"].max() or 0) + 1
                fix_idx = self.df["id"] <= 0
                n = fix_idx.sum()
                self.df.loc[fix_idx, "id"] = range(start, start + n)

    def _next_id(self) -> int:
        self._ensure_id_column()
        return (int(self.df["id"].max()) + 1) if len(self.df) else 1

    def _save_csv(self):
        cols_order = ["id","name","brand","cpu","ram_gb","storage_gb","gpu","color_gamut","price"]
        for c in cols_order:
            if c not in self.df.columns:
                self.df[c] = np.nan
        self.df[cols_order].to_csv(DATA_PATH, index=False)
        print(f"[MLService] CSV saved: {DATA_PATH} ({len(self.df)} rows)")

    # READ list
    def list_laptops(self, limit: int = 50, offset: int = 0):
        self._ensure_id_column()
        sub = self.df.sort_values("id").iloc[offset:offset+limit]
        return sub.to_dict(orient="records")

    # READ one
    def get_laptop(self, item_id: int):
        self._ensure_id_column()
        row = self.df[self.df["id"] == int(item_id)]
        if row.empty:
            return None
        return row.iloc[0].to_dict()

    # CREATE
    def create_laptop(self, data: Dict[str, Any]):
        self._ensure_id_column()
        new_id = self._next_id()
        row = {
            "id": new_id,
            "name": (str(data.get("name", "")).strip() or f"{data.get('brand','')} {data.get('cpu','')}".strip()),
            "brand": str(data.get("brand","")).strip(),
            "cpu": str(data.get("cpu","")).strip(),
            "ram_gb": int(data.get("ram_gb", 16)),
            "storage_gb": int(data.get("storage_gb", 512)),
            "gpu": str(data.get("gpu","Integrated")).strip(),
            "color_gamut": int(data.get("color_gamut", 100)),
            "price": float(data.get("price", 0.0)),
        }
        self.df = pd.concat([self.df, pd.DataFrame([row])], ignore_index=True)
        self._save_csv()
        self.r2, self.rmse = self._fit_and_score()
        return row

    # UPDATE
    def update_laptop(self, item_id: int, data: Dict[str, Any]):
        self._ensure_id_column()
        idx = self.df.index[self.df["id"] == int(item_id)]
        if len(idx) == 0:
            return None
        i = idx[0]

        # update nilai
        for key in ["name","brand","cpu","gpu"]:
            if key in data and data[key] is not None:
                self.df.at[i, key] = str(data[key]).strip()
        for key in ["ram_gb","storage_gb","color_gamut"]:
            if key in data and data[key] is not None:
                self.df.at[i, key] = int(data[key])
        if "price" in data and data["price"] is not None:
            self.df.at[i, "price"] = float(data["price"])

        # fallback name
        nm = str(self.df.at[i,"name"]).strip()
        if nm in ["", "nan", "None"]:
            self.df.at[i,"name"] = (str(self.df.at[i,"brand"]) + " " + str(self.df.at[i,"cpu"])).strip()

        self._save_csv()
        self.r2, self.rmse = self._fit_and_score()
        return self.df.loc[i].to_dict()

    # DELETE
    def delete_laptop(self, item_id: int):
        self._ensure_id_column()
        before = len(self.df)
        self.df = self.df[self.df["id"] != int(item_id)].copy()
        after = len(self.df)
        if after == before:
            return False
        self._save_csv()
        self.r2, self.rmse = self._fit_and_score()
        return True
