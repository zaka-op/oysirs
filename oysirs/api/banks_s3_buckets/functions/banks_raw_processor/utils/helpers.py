import pandas as pd
from datetime import datetime


def parse_nan(value) -> str | None:
    if pd.isna(value):
        return None
    return str(value)

def parse_email(value) -> list[str]:
    if pd.isna(value):
        return []
    return [e.strip() for e in str(value).lower().split(',') if e.strip() and '@' in e]

def parse_mobile_no(value) -> list[str]:
    if pd.isna(value):
        return []
    return [m.strip() for m in str(value).lower().split(',') if m.strip() and m.strip().strip("+").isdigit()]

def parse_name(value) -> list[str]:
    if pd.isna(value):
        return []
    return [n.strip() for n in str(value).lower().split(',') if n.strip()]

def parse_address(value) -> str | None:
    if pd.isna(value):
        return None
    return str(value).strip().lower()

def calc_time_diff_mins(start_time: datetime, end_time: datetime) -> float:
    # return (end_time - start_time).total_seconds() / 60.0
    return f"{(end_time - start_time).total_seconds() / 60.0:.2f} mins"
