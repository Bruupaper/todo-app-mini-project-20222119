import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentTab, setCurrentTab] = useState('all');

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  });

  const API_URL = 'http://localhost:5000/api/todos';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!title) return;
    if (currentTab === 'planned' && !selectedDate) {
      alert("날짜를 선택해 주세요!");
      return;
    }
    const newTodo = {
      title,
      // ★ 컨셉 변경: isToday가 'today' 탭을 의미하더라도 아이콘은 🎯로 표시됩니다.
      isToday: currentTab === 'today',
      isImportant: currentTab === 'important',
      dueDate: currentTab === 'planned' ? selectedDate : null
    };
    try {
      await axios.post(API_URL, newTodo);
      setTitle('');
      setSelectedDate('');
      fetchTodos();
    } catch (err) {
      console.error("추가 실패:", err);
    }
  };

  const toggleComplete = async (id, completed) => {
    await axios.put(`${API_URL}/${id}`, { completed: !completed });
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchTodos();
  };

  const filteredTodos = todos.filter(todo => {
    if (currentTab === 'today') return todo.isToday;
    if (currentTab === 'important') return todo.isImportant;
    if (currentTab === 'planned') return todo.dueDate;
    return true;
  });

  return (
    <div className="flex h-screen bg-slate-50 text-slate-700 font-sans transition-all duration-300 dark:bg-slate-950 dark:text-slate-200 relative overflow-hidden">

      {/* ★ [수정 사항 #2] 모드 변경 아이콘 로직 반전: 현재 모드 표시 */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-10 text-3xl p-3 rounded-full bg-white shadow-lg border hover:scale-110 transition-all dark:bg-slate-800 dark:border-slate-700 z-50"
        title={darkMode ? "다크 모드 활성화 중 (라이트로 전환)" : "라이트 모드 활성화 중 (다크로 전환)"}
      >
        {/* 기존과 반대로, 다크 모드일 때 달(🌙), 라이트 모드일 때 해(☀️)를 보여줍니다. */}
        {darkMode ? '🌙' : '☀️'}
      </button>

      <div className="w-72 bg-white border-r flex flex-col p-6 shadow-sm transition-all duration-300 dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-10 px-2">
          <h2 className="text-xl font-bold text-indigo-600 tracking-tight dark:text-indigo-400">To Do List</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold dark:text-slate-500">Workspace</p>
        </div>

        <nav className="flex-1 space-y-2">
          {/* ★ [수정 사항 #1] 오늘 할 일 문양 변경: ☀️ -> 🎯 */}
          <TabButton active={currentTab === 'today'} icon="🎯" label="오늘 할 일" onClick={() => setCurrentTab('today')} />
          <TabButton active={currentTab === 'important'} icon="⭐" label="중요" onClick={() => setCurrentTab('important')} />
          <TabButton active={currentTab === 'planned'} icon="📅" label="계획된 일정" onClick={() => setCurrentTab('planned')} />
          <TabButton active={currentTab === 'all'} icon="🏠" label="전체 작업" onClick={() => setCurrentTab('all')} />
        </nav>
      </div>

      <div className="flex-1 flex flex-col p-10 overflow-y-auto relative transition-all duration-300">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            {/* ★ 메인 타이틀 아이콘도 변경: 🎯 오늘 할 일 */}
            {currentTab === 'today' && "🎯 오늘 할 일"}
            {currentTab === 'important' && "⭐ 중요 항목"}
            {currentTab === 'planned' && "📅 계획된 일정"}
            {currentTab === 'all' && "🏠 모든 작업"}
          </h1>
          <p className="text-slate-400 mt-2 font-medium dark:text-slate-500">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            })}
          </p>
        </header>

        {currentTab !== 'all' && (
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2 mb-8 focus-within:ring-2 focus-within:ring-indigo-100 transition-all dark:bg-slate-800 dark:border-slate-700 dark:focus-within:ring-indigo-900">
            <div className="flex gap-2">
              <input
                className="flex-1 p-3 px-4 outline-none bg-transparent text-lg dark:text-white dark:placeholder:text-slate-600"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                // ★ 플레이스홀더 텍스트도 컨셉에 맞춰 변경
                placeholder={`${currentTab === 'today' ? '오늘의 목표' : currentTab === 'important' ? '중요 항목' : '계획된 일정'} 추가...`}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
              {currentTab === 'planned' && (
                <input
                  type="date"
                  className="p-2 border-l border-slate-100 outline-none text-slate-500 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              )}
              <button
                onClick={addTodo}
                className="bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-600 active:scale-95 transition-all shadow-md dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                추가
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 pb-20">
          {filteredTodos.map(todo => (
            <div key={todo._id} className="group bg-white p-4 rounded-xl shadow-sm border border-slate-50 flex items-center justify-between hover:border-indigo-100 transition-all dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-500">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo._id, todo.completed)}
                  className="w-6 h-6 cursor-pointer accent-indigo-500 rounded-full dark:accent-indigo-400"
                />
                <div className="flex flex-col">
                  <span className={`text-lg transition-all ${todo.completed ? "line-through text-slate-300 dark:text-slate-600" : "text-slate-600 font-medium dark:text-slate-200"}`}>
                    {todo.title}
                  </span>
                  {todo.dueDate && (
                    <span className="text-xs text-indigo-400 font-semibold dark:text-indigo-400">
                      📅 {new Date(todo.dueDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {/* ★ 리스트 우측 속성 아이콘도 변경: ☀️ -> 🎯 */}
                  {todo.isToday && <span title="오늘 할 일" className="text-lg">🎯</span>}
                  {todo.isImportant && <span title="중요 항목" className="text-lg">⭐</span>}
                  {todo.dueDate && <span title="계획된 일정" className="text-lg">📅</span>}
                </div>

                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all font-bold px-2 dark:text-slate-600 dark:hover:text-rose-400"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}

          {filteredTodos.length === 0 && (
            <div className="text-center py-24 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200 dark:bg-slate-900/40 dark:border-slate-700">
              <p className="text-slate-400 text-lg font-medium dark:text-slate-500">현재 등록된 할 일이 없습니다.</p>
              <p className="text-slate-300 text-sm mt-1 dark:text-slate-600">오늘의 목표를 추가해 보세요!</p>
            </div>
          )}
        </div>

        <a
          href="https://github.com/Bruupaper/todo-app-mini-project-20222119"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 flex items-center justify-center p-3 bg-white text-slate-800 font-semibold rounded-full shadow-lg border hover:bg-slate-100 hover:scale-105 transition-all dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700 z-50"
          title="GitHub 저장소"
        >
          <img
            src="./25231.png"
            alt="GitHub Logo"
            className="w-7 h-7 dark:invert transition-all duration-300"
          />
        </a>

      </div>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-3 px-4 rounded-xl transition-all font-semibold ${active ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default App;