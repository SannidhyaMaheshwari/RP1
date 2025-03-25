import io
import logging
from datetime import datetime

import pandas as pd
import requests
from db import (
    SessionLocal,
    engine,
    fees_paid_table,
    iteration_date_table,
    iteration_offer_table,
    logs_table,
    metadata,
    user_table,
)
import pandas as pd

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from fastapi.encoders import jsonable_encoder
from sqlalchemy import and_
from sqlalchemy import select
from sqlalchemy.dialects.mysql import insert
from starlette.responses import JSONResponse
from .auth_routes import validate_token
from fastapi import Request

router = APIRouter()
logger = logging.getLogger(__name__)

def clean_nan_values(row: dict):
    """Replaces NaN values with None (so they can be stored as NULL in MySQL)."""
    return {key: (None if pd.isna(value) else value) for key, value in row.items()}

@router.get("/data/{table_name}")
async def read_data(table_name: str):
    try:
        table_obj = metadata.tables.get(table_name)
        if table_obj is None:
            raise HTTPException(status_code=400, detail=f"Table {table_name} does not exist.")
        with engine.connect() as connection:
            result = connection.execute(table_obj.select())
            data = [jsonable_encoder(dict(row._mapping)) for row in result]

        return JSONResponse(content={"data": data}, status_code=200)
    except Exception as e:
        logger.exception("Error reading data from table %s", table_name)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update/{table_name}")
async def update_data(request: Request ,table_name: str, file: UploadFile, payload: dict = Depends(validate_token) ):
    session = SessionLocal()
    try:

        user_email = payload.get("sub")
        user_role = payload.get("role")

        if not user_email or not user_role:
            raise HTTPException(status_code=401, detail="Invalid token payload.")

        # Fetch user details from the database
        stmt = select(user_table.c.name, user_table.c.role).where(user_table.c.email == user_email)
        user = session.execute(stmt).mappings().fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        user_name = user["name"]
        user_role = user["role"]

        # Print or log the user's name and role

        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        table_obj = metadata.tables.get(table_name)
        if table_obj is None:
            raise HTTPException(status_code=400, detail=f"Table {table_name} does not exist.")
        table_columns = set(table_obj.columns.keys())
        if not table_columns.issubset(set(df.columns)):
            raise HTTPException(
                status_code=400, detail=f"CSV must contain columns: {table_columns}"
            )

        with engine.begin() as connection:

            primary_keys = [col.name for col in table_obj.primary_key]
            for _, row in df.iterrows():
                row = clean_nan_values(dict(row))

                stmt = insert(table_obj).values(row)
                stmt = stmt.on_duplicate_key_update(
                    {key: row_key for (key, row_key) in row.items() if key not in primary_keys}
                )
                connection.execute(stmt)

            upper_table = table_name.upper()
            if upper_table == "ITERATION_OFFER":
                if not df.empty:
                    iteration_value = df.at[0, "itr_no"]

                    current_time = datetime.now()
                    stmt = insert(iteration_date_table).values(
                        iteration=iteration_value, date=current_time
                    )
                    stmt = stmt.on_duplicate_key_update(date=current_time)
                    connection.execute(stmt)



                """if "uploaded_by" not in df.columns or "upload_datetime" not in df.columns:
                    raise HTTPException(status_code=400, detail="Missing required columns in CSV.")

                # Modify the "uploaded_by" and "upload_datetime" columns
                df["uploaded_by"] = f"{user_name} ({user_role})"
                df["upload_datetime"] = datetime.now().isoformat()
                """


                result = connection.execute(
                    iteration_date_table.select()
                    .order_by(iteration_date_table.c.date.desc())
                    .limit(1)
                )
                latest_iteration_record = result.fetchone()
                if latest_iteration_record is not None:
                    latest_iteration = latest_iteration_record[0]

                    fees_records = connection.execute(fees_paid_table.select()).mappings().all()

                    for row in fees_records:
                        app_no = row["app_no"]
                        admission_paid = bool(row["admission_fees_status"])
                        tuition_paid = bool(row["tution_fees_status"])

                        new_status = None

                        if admission_paid and tuition_paid:
                            iteration_result = (
                                connection.execute(
                                    iteration_offer_table.select()
                                    .where(iteration_offer_table.c.app_no == app_no)
                                    .order_by(iteration_offer_table.c.itr_no.desc())
                                    .limit(2)
                                )
                                .mappings()
                                .all()
                            )  # This ensures you get dictionaries instead of tuples

                            iterations = iteration_result

                            if (
                                len(iterations) == 2
                                and iterations[0]["offer"] != iterations[1]["offer"]
                                and "accept" in iterations[1]["status"]
                            ):
                                new_status = "accept & upgraded"

                        if new_status is not None:
                            update_stmt = (
                                iteration_offer_table.update()
                                .where(
                                    and_(
                                        iteration_offer_table.c.app_no == app_no,
                                        iteration_offer_table.c.itr_no == latest_iteration,
                                ))
                                .values(status=new_status)
                            )
                            connection.execute(update_stmt)

            elif upper_table == "FEES_PAID":



                uploaded_by_value = f"{user_name} {user_role}"
                upload_datetime_value = datetime.now().isoformat()  # Convert to string for CSV

            # Update columns based on status conditions
                df.loc[df["admission_fees_status"] == 1, "admission_fees_uploaded_by"] = uploaded_by_value
                df.loc[df["admission_fees_status"] == 1, "admission_fees_upload_date_time"] = upload_datetime_value

                df.loc[df["tution_fees_status"] == 1, "tution_fees_uploaded_by"] = uploaded_by_value
                df.loc[df["tution_fees_status"] == 1, "tution_fees_upload_date_time"] = upload_datetime_value
                result = connection.execute(
                    iteration_date_table.select()
                    .order_by(iteration_date_table.c.date.desc())
                    .limit(1)
                )
                latest_iteration_record = result.fetchone()
                if latest_iteration_record is not None:
                    latest_iteration = latest_iteration_record[0]
                    for row in df.itertuples():
                        app_no = row.app_no
                        admission_paid = bool(row.admission_fees_status)
                        tuition_paid = bool(row.tution_fees_status)

                        if admission_paid and tuition_paid:
                            iteration_result = (
                                connection.execute(
                                    iteration_offer_table.select()
                                    .where(iteration_offer_table.c.app_no == app_no)
                                    .order_by(iteration_offer_table.c.itr_no.desc())
                                    .limit(2)
                                )
                                .mappings()
                                .all()
                            )
                            iterations = iteration_result
                            if (
                                len(iterations) == 2
                                and iterations[0]["offer"] != iterations[1]["offer"]
                                and "accept" in iterations[1]["status"]
                            ):
                                new_status = "accept & upgraded"
                            else:
                                new_status = "accept"
                        elif not admission_paid and not tuition_paid:
                            new_status = "withdraw"
                        elif admission_paid and not tuition_paid:
                            latest_offer_result = connection.execute(
                                iteration_offer_table.select().where(
                                    and_(
                                        iteration_offer_table.c.app_no == app_no,
                                        iteration_offer_table.c.itr_no == latest_iteration,
                                ))
                            ).fetchone()
                            latest_offer = latest_offer_result[2] if latest_offer_result else None

                            if latest_offer == "WL":
                                new_status = "upgrade"
                            else:
                                new_status = "withdraw"
                        else:
                            # both not paid
                            # waitlist -> both not paid
                            new_status = "withdraw"

                        update_stmt = (
                            iteration_offer_table.update()
                            .where(
                                and_(
                                    iteration_offer_table.c.app_no == app_no,
                                    iteration_offer_table.c.itr_no == latest_iteration,
                            ))
                            .values(status=new_status)
                        )
                        connection.execute(update_stmt)

        print("now updating logtable")

        data = {
            "file_name": file.filename,
            "category": upper_table,
            "uploaded_by": f"{user_name} {user_role}",
            "remark": "Initial upload",
            "ip_address" : request.client.host

        }
        print("now updating logtable")
        response = update_log_table(data)
        print(response)

        return JSONResponse(
            content={"message": f"Data updated successfully in {table_name}!"}, status_code=200
        )
    except Exception as e:
        logger.exception("Error updating data for table %s", table_name)
        raise HTTPException(status_code=500, detail=str(e))


def update_log_table(data):
    try:
        print("Received request to update logs")  # Debug log

        
        user_ip = data.get("ip_address")
        upload_date = datetime.now().isoformat()

        file_name = data.get("file_name")
        category = data.get("category")
        uploaded_by = data.get("uploaded_by")
        remark = data.get("remark")

        if not all([file_name, category, uploaded_by, remark]):
            print("Missing required fields")
            raise HTTPException(status_code=400, detail="Missing required fields.")

        stmt = insert(logs_table).values(
            file_name=file_name,
            category=category,
            upload_date=upload_date,
            uploaded_by=uploaded_by,
            remark=remark,
            ip_address=user_ip,
        )

        with engine.begin() as connection:
            print("Inserting into logs_table...")  # Debug log
            connection.execute(stmt)

        print("Log entry added successfully!")  # Debug log
        return JSONResponse(content={"message": "Log entry added successfully!"}, status_code=201)

    except Exception as e:
        print(f"Exception occurred: {e}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))
