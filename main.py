from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware

# モデルのテーブル作成
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 👇 React からのアクセスを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Reactの開発URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DBセッション取得用
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 一覧取得
@app.get("/tasks", response_model=list[schemas.Task])
def read_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).all()

# 追加
@app.post("/tasks", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(title=task.title, completed=task.completed)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# 🔍 個別取得
@app.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# ✏ タスク更新
@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, updated_task: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    task.title = updated_task.title
    task.completed = updated_task.completed
    db.commit()
    db.refresh(task)
    return task

# 🗑 タスク削除
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": f"Task {task_id} deleted successfully"}