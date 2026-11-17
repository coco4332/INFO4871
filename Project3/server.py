from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import (
    create_engine, 
    MetaData, 
    Table, 
    Column, 
    Integer, 
    String, 
    Float, 
    insert, 
    select, 
    delete,
    event
)

degree_seed = [
    {"degree": "Business Management",    "early": 56000, "mid": 82000},
    {"degree": "Nursing",                "early": 70000, "mid": 87000},
    {"degree": "Psychology",             "early": 45000, "mid": 72000},
    {"degree": "Biology",                "early": 45000, "mid": 83000},
    {"degree": "Computer Science",       "early": 87000, "mid": 120000},
    {"degree": "Mechanical Engineering", "early": 80000, "mid": 120000},
    {"degree": "Communications",         "early": 52000, "mid": 88000},
    {"degree": "Elementary Education",   "early": 45000, "mid": 55000},
    {"degree": "Economics",              "early": 72000, "mid": 115000},
    {"degree": "Accounting",             "early": 68000, "mid": 97000},
    {"degree": "Marketing",              "early": 60000, "mid": 100000},
    {"degree": "Criminal Justice",       "early": 50000, "mid": 80000},
    {"degree": "All Majors (Overall)",   "early": 58000, "mid": 87000},
]

class BudgetItem(BaseModel):
    name: str
    amount: float
    kind: str

class BudgetDB:
    def __init__(self):
        self.engine = create_engine("sqlite:///budget.db")
        self.metadata_obj = MetaData()

        self.items = Table(
            "budget_items",
            self.metadata_obj,
            Column("id", Integer, primary_key=True),
            Column("username", String),
            Column("name", String),
            Column("amount", Float),
            Column("kind", String),
        )

        self.degrees = Table(
            "degrees",
            self.metadata_obj,
            Column("degree", String, primary_key=True),
            Column("early", Integer),
            Column("mid", Integer),
        )

        @event.listens_for(self.degrees, "after_create")
        def seed_degrees(target, connection, **kwargs):
            connection.execute(insert(target), degree_seed)

        self.metadata_obj.create_all(self.engine)

    def get_items(self, username):
        statement = select(self.items).where(self.items.c.username == username)
        with self.engine.connect() as conn:
            rows = conn.execute(statement).all()
        data = []
        for row in rows:
            data.append({"id": row.id, "name": row.name, "amount": row.amount, "kind": row.kind})
        return data

    def add_item(self, username, item):
        statement = insert(self.items).values(
            username=username, name=item.name, amount=item.amount, kind=item.kind
        )
        with self.engine.connect() as conn:
            conn.execute(statement)
            conn.commit()

    def delete_item(self, username, item_id):
        statement = delete(self.items).where(self.items.c.username == username).where(self.items.c.id == item_id)
        
        with self.engine.connect() as conn:
            conn.execute(statement)
            conn.commit()

    def get_degrees(self):
        statement = select(self.degrees)
        with self.engine.connect() as conn:
            rows = conn.execute(statement).all()
        data = []
        for row in rows:
            data.append({"degree": row.degree, "early": row.early, "mid": row.mid})
        return data

app = FastAPI()
db = BudgetDB()

@app.get("/budget/{username}")
def read_budget(username: str):
    return db.get_items(username)

@app.post("/budget/{username}")
def add_budget_item(username: str, item: BudgetItem):
    db.add_item(username, item)
    return db.get_items(username)

@app.delete("/budget/{username}/{item_id}")
def delete_budget_item(username: str, item_id: int):
    db.delete_item(username, item_id)
    return db.get_items(username)

@app.get("/degrees")
def read_degrees():
    return db.get_degrees()

app.mount("/", StaticFiles(directory="static", html=True), name="static")