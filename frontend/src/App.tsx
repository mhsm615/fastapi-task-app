import React, { useEffect, useState } from "react";
import axios from "axios"; // ← 事前に npm install axios 済みであればOK

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

   const handleAddTask = async () => {
    if (newTitle.trim() === "") return;

    try {
      const res = await axios.post("http://localhost:8000/tasks", {
        title: newTitle,
        completed: false,
      });
      // 新しく追加されたタスクをステートに加える
      setTasks((prev) => [...prev, res.data]);
      setNewTitle(""); // 入力欄をクリア
    } catch (err) {
      console.error("POST error:", err);
    }
  };

  const toggleTaskCompleted = async (task: Task) => {
  try {
    const res = await axios.put(`http://localhost:8000/tasks/${task.id}`, {
      title: task.title,
      completed: !task.completed, // ← 反転
    });
    const updated = res.data;

    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  } catch (err) {
    console.error("更新エラー:", err);
  }
};

const deleteTask = async (id: number) => {
  try {
    await axios.delete(`http://localhost:8000/tasks/${id}`);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  } catch (err) {
    console.error("削除エラー:", err);
  }
};

  return (
    <div>
      <h1>タスクリスト</h1>

      <input
        type="text"
        placeholder="新しいタスクを入力"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <button onClick={handleAddTask}>追加</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.completed ? "✅ 完了" : "未完了"}
            <button onClick={() => toggleTaskCompleted(task)}>
              {task.completed ? "未完了に戻す" : "完了にする"}
            </button>
            <button onClick={() => deleteTask(task.id)} style={{ marginLeft: "8px" }}>
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;