# db.py
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, and_
from sqlalchemy.dialects.mysql import insert
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "mysql+pymysql://root:userpassword@localhost:3306/rp"  # Update with your DB details

engine = create_engine(DATABASE_URL) 
metadata = MetaData()


# MASTER_TABLE
master_table = Table(
    "MASTER_TABLE",
    metadata,
    Column("app_no", String(255), primary_key=True),
    Column("name", String(255), nullable=False),
    Column("gender", String(255), nullable=False),
)

# ITERATION_OFFER table
iteration_offer_table = Table(
    "ITERATION_OFFER",
    metadata,
    Column("app_no", String(255), primary_key=True, nullable=False),
    Column("itr_no", Integer, primary_key=True, nullable=False),
    Column("offer", String(255), nullable=False),
    Column("scholarship", Integer),
    Column("uploaded_by", String(255), nullable=False),
    Column("upload_datetime", DateTime),
    Column("status", String(255)),  # Initially null or "nill"
)

# FEES_PAID table
fees_paid_table = Table(
    "FEES_PAID",
    metadata,
    Column("app_no", String(255), primary_key=True),
    Column("admission_fees_amount", Integer),
    Column("admission_fees_status", Integer),
    Column("admission_fees_paid_date", DateTime, nullable=False),
    Column("admission_fees_uploaded_by", String(255), nullable=False),
    Column("admission_fees_upload_date_time", DateTime),
    Column("tution_fees_amount", Integer),
    Column("tution_fees_status", Integer),
    Column("tution_fees_paid_date", DateTime, nullable=False),
    Column("tution_fees_uploaded_by", String(255), nullable=False),
    Column("tution_fees_upload_date_time", DateTime),
)

# ITERATION_DATE table
iteration_date_table = Table(
    "ITERATION_DATE",
    metadata,
    Column("iteration", Integer, primary_key=True),
    Column("date", DateTime, nullable=False),
)

# WITHDRAWS table
withdraws_table = Table(
    "WITHDRAWS",
    metadata,
    Column("app_no", String(255), primary_key=True),
    Column("date", DateTime, nullable=False),
    Column("uploaded_by", String(255), nullable=False),
    Column("upload_date_time", DateTime),
)

# LOGS_T table
logs_table = Table(
    "LOGS_TABLE",
    metadata,
    Column("file_name", String(255), nullable=False),
    Column("category", String(255), nullable=False),
    Column("upload_date", DateTime, nullable=False),
    Column("uploaded_by", String(255), nullable=False),
    Column("remark", String(255), nullable=False),
    Column("ip_address", String(255), nullable=False),
)

# USERS table for login/registration
user_table = Table(
    "USERS",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("name", String(255), nullable=False),
    Column("contact", String(255), nullable=False),
    Column("campus", String(255), nullable=False),
    Column("email", String(255), unique=True, nullable=False),
    Column("hashed_password", String(255), nullable=False),
    Column("role", String(255), nullable=False, default="view")
)

metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
